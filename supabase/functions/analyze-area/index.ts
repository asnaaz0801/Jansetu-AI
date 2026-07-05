import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

// Standard CORS headers so your React app is allowed to communicate with this function
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests from the browser
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Get the location and cascading geographic filters requested by your React frontend
    const { location, state, district, city, area } = await req.json()

    // 2. Initialize the Supabase client using built-in environment variables
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // 3. Fetch complaints. Since there is no 'location' column in the issues table,
    // we query using the available geographic columns (state, district, city, area).
    let query = supabaseClient
      .from('issues')
      .select('description, category, area, constituency, city, district, state')

    // If cascading report parameters are provided, apply them strictly (avoiding PostgREST comma parsing errors)
    if (state && state !== 'All') {
      query = query.eq('state', state)
    }
    if (district && district !== 'All') {
      query = query.eq('district', district)
    }
    if (city && city !== 'All') {
      query = query.eq('city', city)
    }
    if (area && area !== 'All') {
      query = query.eq('area', area)
    }

    // Fallback if structured location parameters are not passed (or are 'All') but a location string is provided
    if ((!state || state === 'All') && (!district || district === 'All') && (!city || city === 'All') && (!area || area === 'All') && location && location !== 'All Regions') {
      query = query.or(`area.eq.${location},constituency.eq.${location},city.eq.${location},district.eq.${location},state.eq.${location}`)
    }

    const { data: issues, error } = await query

    if (error) throw error

    if (!issues || issues.length === 0) {
      return new Response(
        JSON.stringify({ summary: `No complaints found for "${location}" yet.` }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // 4. Format the complaints into a single text block, including the area/village info
    const complaintsText = issues
      .map((issue, index) => `Complaint ${index + 1} (Village/Area: ${issue.area || 'Unknown'}, Category: ${issue.category}): ${issue.description}`)
      .join('\n')

    const prompt = `You are an expert urban planner and advisor to a Member of Parliament.
Read these citizen complaints from ${location}:

${complaintsText}

Based on these complaints, provide 3 brief, actionable, and prioritized recommendations. Do not include any summary, intro/outro, count of complaints, or reporting headers. Just list the 3 recommendations directly and concisely.`

    // 5. Call the Google Gemini API securely using the key we saved earlier.
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY is not set in your Supabase project secrets. Please run: supabase secrets set GEMINI_API_KEY=your_key')
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`

    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    })

    const geminiData = await geminiResponse.json()
    
    if (!geminiResponse.ok) {
      throw new Error(`Gemini API error (Status ${geminiResponse.status}): ${geminiData.error?.message || JSON.stringify(geminiData)}`)
    }

    if (!geminiData.candidates || geminiData.candidates.length === 0 || !geminiData.candidates[0].content?.parts?.[0]?.text) {
      throw new Error(`Unexpected Gemini response format: ${JSON.stringify(geminiData)}`)
    }

    const aiSummary = geminiData.candidates[0].content.parts[0].text

    // 6. Send the AI's response back to your React website
    return new Response(
      JSON.stringify({ summary: aiSummary }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})