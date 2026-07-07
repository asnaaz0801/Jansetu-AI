import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { type } = body

    let prompt = "";

    if (type === 'support-chat') {
      const { message } = body;
      prompt = `You are JanSetu AI Assistant.
You are NOT a general chatbot.
You ONLY help users use the JanSetu AI platform.
You can answer ONLY about:
• Complaint Submission
• Complaint Tracking
• MP Public Notices
• GPS
• Images
• Voice Complaint
• Languages
• Categories
• Dashboard
• Platform Features

If a user asks unrelated questions, politely reply:
'I can only assist with JanSetu AI and its features.'

Keep responses concise.
Always recommend the next best action whenever possible.

Analyze the user's message and reply in the following structured JSON format:
{
  "message": "Your text response to the user. Keep it concise, professional, and friendly.",
  "detectedCategory": "Water Supply | Roads | Street Lighting | Electricity | Sanitation | null",
  "suggestedPriority": "High | null",
  "actions": ["submit_complaint", "track_complaint", "view_notices", "mp_login", "detect_location"]
}

Guidelines for actions and metadata:
- If the user indicates they want to submit a complaint or mentions an issue like "water is not coming", "leakage", "there is no water", "water supply issue", set "detectedCategory" to "Water Supply", "suggestedPriority" to "High", and include "submit_complaint" and "detect_location" in "actions".
- If the user mentions "pothole", "broken road", set "detectedCategory" to "Roads" and include "submit_complaint" in "actions".
- If the user mentions "street light", "dark street", set "detectedCategory" to "Street Lighting" and include "submit_complaint" in "actions".
- If the user mentions "electricity", "power outage", "no electricity", set "detectedCategory" to "Electricity", "suggestedPriority" to "High", and include "submit_complaint" in "actions".
- If the user mentions "garbage", "trash", "waste", "dirty street", set "detectedCategory" to "Sanitation" and include "submit_complaint" in "actions".
- If the user asks how to submit a complaint, list the steps: 1. Select category 2. Add description 3. Upload image (optional) 4. Detect GPS 5. Submit. Include "submit_complaint" in "actions".
- If the user asks about tracking a complaint or finding their issue status, explain that they can track it using a Complaint ID and include "track_complaint" in "actions".
- If the user asks about MP notices or public notices, include "view_notices" in "actions".
- If the user asks about logging in as MP, include "mp_login" in "actions".
- If the user asks about languages, show that JanSetu AI supports 22 Indian languages.
- For general unrelated questions, set "message" to "I can only assist with JanSetu AI and its features." and "actions" to an empty array.

User Message: "${message || ''}"`;
    } else if (type === 'analytics') {
      const { totalCount, pendingCount, resolvedCount, categoryStats, districtStats, stateStats } = body;
      prompt = `You are an expert Government Public Grievance Analyst assisting Members of Parliament.
Analyze the following aggregate grievance dashboard metrics and provide a structured JSON analysis.

Summary Metrics:
- Total Complaints in Constituency: ${totalCount}
- Pending Grievances: ${pendingCount}
- Resolved Grievances: ${resolvedCount}
- Categories: ${JSON.stringify(categoryStats)}
- Districts: ${JSON.stringify(districtStats)}
- States: ${JSON.stringify(stateStats)}

You MUST return a JSON object with the following keys. Do not include any markdown formatting, headers, or text outside the JSON object. The keys and formatting should be:
{
  "emergingIssues": [
    "Top emerging issue description 1",
    "Top emerging issue description 2",
    "Top emerging issue description 3",
    "Top emerging issue description 4",
    "Top emerging issue description 5"
  ],
  "policyRecommendations": [
    "Policy recommendation 1",
    "Policy recommendation 2",
    "Policy recommendation 3"
  ],
  "developmentPriorities": [
    "Development priority 1",
    "Development priority 2"
  ],
  "infrastructureGaps": [
    "Infrastructure gap 1",
    "Infrastructure gap 2"
  ],
  "affectedDepartments": [
    "Most affected department 1 (with brief rationale)",
    "Most affected department 2 (with brief rationale)"
  ],
  "schemeRecommendations": [
    "Government scheme recommendation 1",
    "Government scheme recommendation 2"
  ],
  "budgetSuggestions": [
    "Budget priority suggestion 1",
    "Budget priority suggestion 2"
  ],
  "futureRisks": [
    "Future risk prediction 1 if ignored",
    "Future risk prediction 2 if ignored"
  ]
}`;
    } else {
      // Single complaint mode
      const { title, description, category, area, district, state, severity, language } = body
      prompt = `You are an expert Government Public Grievance Analyst assisting Members of Parliament.
Analyze the following citizen complaint and provide a structured JSON analysis.

Complaint Title: ${title || 'N/A'}
Complaint Description: ${description || 'No description provided.'}
Category: ${category || 'General'}
Area: ${area || 'N/A'}
District: ${district || 'N/A'}
State: ${state || 'N/A'}
Severity Level: ${severity || 3}/5
Citizen Language: ${language || 'English'}

You MUST return a JSON object with the following keys. Do not include any markdown formatting, headers, or text outside the JSON object. The keys and formatting should be:
{
  "executiveSummary": "A 2-3 sentence executive summary of the issue.",
  "priorityLevel": {
    "level": "Low" | "Medium" | "High" | "Critical",
    "explanation": "Brief explanation of why this priority level was chosen."
  },
  "suggestedDepartment": "The suggested government department (e.g., Municipal Corporation, PWD, Water Department, Electricity Board, Health Department, Police, Rural Development, Smart City Mission, Education Department).",
  "suggestedGovScheme": "The name of a suggested government scheme (e.g., PMAY, Jal Jeevan Mission, Swachh Bharat, PMGSY, Smart Cities Mission, Ayushman Bharat) or 'No obvious government scheme.' if none fits.",
  "suggestedActionPlan": [
    "Practical implementation step 1",
    "Practical implementation step 2",
    "Practical implementation step 3",
    "Practical implementation step 4",
    "Practical implementation step 5"
  ],
  "estimatedResolutionTime": "Expected timeline (e.g., 3 days, 2 weeks, 1 month, Depends on budget approval, etc.)",
  "estimatedPublicImpact": {
    "level": "Low" | "Medium" | "High" | "Very High",
    "explanation": "Brief explanation of public impact."
  },
  "similarComplaintPattern": "Likely root cause classification (e.g., Poor drainage, Garbage collection delay, Road maintenance backlog, Water pipeline leakage, Illegal dumping, etc.)",
  "riskAssessment": "Consequences if this issue is ignored.",
  "mpRecommendation": "A professional recommendation statement that the MP can use when addressing officials."
}`;
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY is not set in your Supabase project secrets.')
    }

    // Call Gemini 2.5 Flash model
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`

    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    })

    const geminiData = await geminiResponse.json()
    
    if (!geminiResponse.ok) {
      throw new Error(`Gemini API error (Status ${geminiResponse.status}): ${geminiData.error?.message || JSON.stringify(geminiData)}`)
    }

    if (!geminiData.candidates || geminiData.candidates.length === 0 || !geminiData.candidates[0].content?.parts?.[0]?.text) {
      throw new Error(`Unexpected Gemini response format: ${JSON.stringify(geminiData)}`)
    }

    const aiText = geminiData.candidates[0].content.parts[0].text
    
    // Parse to ensure it's valid JSON
    let parsedResult;
    try {
      parsedResult = JSON.parse(aiText);
    } catch {
      // Fallback clean if there is any wrapping formatting
      const cleanJsonStr = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedResult = JSON.parse(cleanJsonStr);
    }

    return new Response(
      JSON.stringify(parsedResult), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(
      JSON.stringify({ error: err.message }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
