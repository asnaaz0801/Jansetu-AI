import { createClient } from '@supabase/supabase-js';

// ==========================================
// JANSETU-AI: Supabase Database Client Setup
// ==========================================

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL or Anon Key is missing! Check your .env.local file.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
