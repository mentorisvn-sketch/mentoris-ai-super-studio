import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Khởi tạo Singleton
let supabaseInstance: ReturnType<typeof createSupabaseClient> | null = null;

export const createClient = () => {
  if (supabaseInstance) return supabaseInstance;

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("⚠️ CẢNH BÁO: Thiếu biến môi trường Supabase!");
    // Trả về client giả để tránh crash app
    return createSupabaseClient('https://placeholder.supabase.co', 'placeholder-key');
  }

  supabaseInstance = createSupabaseClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      // ❌ ĐÃ XÓA: Cấu hình 'lock' gây lỗi TypeError
      // ✅ CƠ CHẾ MỚI: AppContext sẽ tự động bắt lỗi và bỏ qua nếu có xung đột lock
    }
  });

  return supabaseInstance;
};
