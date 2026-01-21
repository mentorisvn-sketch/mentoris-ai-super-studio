import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Khởi tạo Singleton
let supabaseInstance: ReturnType<typeof createSupabaseClient> | null = null;

// 🔥 CUSTOM LOCK: Cơ chế khóa giả lập (Chạy ngay lập tức, không chờ trình duyệt)
// Giúp khắc phục lỗi "Acquiring lock failed" và "AbortError"
const debugLock = {
  request: async (name: string, options: any, callback: any) => {
    // Xử lý overloading của hàm request
    const cb = typeof options === 'function' ? options : callback;
    
    if (typeof cb === 'function') {
      // Gọi callback ngay lập tức mà không cần chờ lock thật sự
      // Truyền vào một signal giả để code không bị lỗi
      return cb({ signal: new AbortController().signal });
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
    return createSupabaseClient('https://placeholder.supabase.co', 'placeholder-key');
  }

  supabaseInstance = createSupabaseClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      
      // 🔥 CẤU HÌNH QUAN TRỌNG NHẤT:
      // Ép buộc sử dụng debugLock thay vì navigator.locks của trình duyệt
      // Điều này giúp tránh hoàn toàn lỗi kẹt khóa (LockManager error)
      lock: debugLock as any, 
      
      // Tắt debug log để Console sạch hơn
      debug: false
    }
  });

  return supabaseInstance;
};
