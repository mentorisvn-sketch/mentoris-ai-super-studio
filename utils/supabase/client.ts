import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Khởi tạo Singleton
let supabaseInstance: ReturnType<typeof createSupabaseClient> | null = null;

// 🔥 1. TẠO CƠ CHẾ KHÓA ẢO (QUAN TRỌNG NHẤT)
// Giúp bỏ qua lỗi "Acquiring Lock failed" trên Chrome/Edge
const customLock = {
  // Hàm này sẽ giả vờ lấy khóa và chạy callback ngay lập tức
  request: async (_name: string, _options: any, callback: any) => {
    try {
      // Nếu callback cần signal, ta tạo signal giả
      return await callback({ signal: new AbortController().signal });
    } catch (e) {
      console.warn("Supabase Lock Warning (Ignored):", e);
    }
  }
};

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
      
      // 🔥 2. ÁP DỤNG KHÓA ẢO VÀO ĐÂY
      lock: customLock as any, 
      
      // Tắt debug để log sạch sẽ hơn
      debug: false 
    }
  });

  return supabaseInstance;
};
