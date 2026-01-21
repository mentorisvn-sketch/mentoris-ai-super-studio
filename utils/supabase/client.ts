import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Khởi tạo Singleton (Chỉ tạo 1 lần duy nhất để tối ưu hiệu năng)
let supabaseInstance: ReturnType<typeof createSupabaseClient> | null = null;

export const createClient = () => {
  // Nếu đã có client rồi thì dùng lại, không tạo mới (Singleton)
  if (supabaseInstance) return supabaseInstance;

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  // 🔥 Bắt lỗi chặt chẽ: Thiếu key là báo lỗi đỏ lòm ngay console để biết đường sửa
  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ LỖI NGHIÊM TRỌNG: Thiếu biến môi trường Supabase!");
    console.error("👉 Vui lòng kiểm tra file .env hoặc cấu hình Vercel.");
    throw new Error("Missing Supabase Environment Variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)");
  }

  supabaseInstance = createSupabaseClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true, // Tự động lưu đăng nhập
      autoRefreshToken: true,
    }
  });

  return supabaseInstance;
};
