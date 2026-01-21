import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Khởi tạo Singleton (Chỉ tạo 1 lần duy nhất để tối ưu hiệu năng)
let supabaseInstance: ReturnType<typeof createSupabaseClient> | null = null;

export const createClient = () => {
  // Nếu đã có client rồi thì dùng lại
  if (supabaseInstance) return supabaseInstance;

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  // 🔥 THAY ĐỔI QUAN TRỌNG: 
  // Thay vì "throw Error" làm sập web, chúng ta chỉ báo lỗi console và trả về Client giả.
  // Điều này giúp Web vẫn hiện giao diện (để bạn debug) thay vì trắng xóa.
  if (!supabaseUrl || !supabaseKey) {
    console.error("⚠️ CẢNH BÁO: Thiếu biến môi trường Supabase! (VITE_SUPABASE_URL hoặc VITE_SUPABASE_ANON_KEY)");
    console.error("👉 Vui lòng kiểm tra file .env hoặc cấu hình Environment Variables trên Vercel.");
    
    // Trả về client giả để App không bị Crash
    return createSupabaseClient(
        'https://placeholder.supabase.co', 
        'placeholder-key'
    );
  }

  supabaseInstance = createSupabaseClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true, // Tự động lưu đăng nhập
      autoRefreshToken: true,
    }
  });

  return supabaseInstance;
};
