import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const meta = import.meta as any;
  // Safety check: ensure env object exists before accessing properties
  const env = meta.env || {};

  // Provide placeholders to prevent createBrowserClient from throwing error on init
  const supabaseUrl = env.VITE_SUPABASE_URL || "https://placeholder-project.supabase.co";
  const supabaseKey = env.VITE_SUPABASE_ANON_KEY || "placeholder-anon-key";

  return createBrowserClient(
    supabaseUrl,
    supabaseKey
  )
}