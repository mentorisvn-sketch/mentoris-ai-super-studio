import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Khởi tạo Singleton
let supabaseInstance: ReturnType<typeof createSupabaseClient> | null = null;

// 🔥 1. TẠO CƠ CHẾ KHÓA ẢO (QUAN TRỌNG NHẤT)
// Giúp bỏ qua lỗi "Acquiring Lock failed" trên Chrome/Edge gây trắng trang
const customLock = {
  request: async (_name: string, _options: any, callback: any) => {
    // Xử lý tham số linh hoạt (vì tham số thứ 2 là optional)
    const cb = typeof _options === 'function' ? _options : callback;
    
    if (typeof cb === 'function') {
      // Gọi callback ngay lập tức với signal giả
      // Giúp Supabase tiếp tục chạy mà không bị kẹt
      return await cb({ signal: new AbortController().signal });
    }
    return Promise.resolve();
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
      // Ép buộc Supabase dùng khóa này thay vì khóa của trình duyệt
      lock: customLock as any, 
      
      // Tắt debug để log sạch sẽ hơn
      debug: false 
    }
  });

  return supabaseInstance;
};
