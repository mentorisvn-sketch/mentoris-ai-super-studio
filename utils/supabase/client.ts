import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // ⚠️ QUAN TRỌNG: Phải gọi trực tiếp import.meta.env để Vite nhận diện được
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️ Đang thiếu biến môi trường Supabase! Web sẽ chạy lỗi.');
  }

  // Nếu không có biến thật thì dùng chuỗi rỗng để tránh lỗi crash ban đầu, 
  // nhưng chắc chắn login sẽ không được nếu thiếu biến.
  return createBrowserClient(
    supabaseUrl || 'https://placeholder-project.supabase.co',
    supabaseKey || 'placeholder-anon-key'
  )
}
