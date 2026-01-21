import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Singleton
let supabaseInstance: ReturnType<typeof createSupabaseClient> | null = null;

export const createClient = () => {
  if (supabaseInstance) return supabaseInstance;

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("⚠️ CẢNH BÁO: Thiếu biến môi trường Supabase!");
    return createSupabaseClient('https://placeholder.supabase.co', 'placeholder-key');
  }

  // Cấu hình chuẩn (Không dùng custom lock)
  supabaseInstance = createSupabaseClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    }
  });

  return supabaseInstance;
};
