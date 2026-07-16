/**
 * Supabase client setup
 */
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env")
}

export const supabase = (() => {
  try {
    return createClient(supabaseUrl, supabaseKey)
  } catch (error) {
    console.error("Failed to initialize Supabase client:", error)
    throw error
  }
})()
