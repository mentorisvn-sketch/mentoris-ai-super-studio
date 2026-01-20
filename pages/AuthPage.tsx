import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext'; // Lấy supabase từ đây
import { toast } from 'sonner';
import { Mail, Lock, Loader2, ArrowLeft, Github, Chrome } from 'lucide-react';

export const AuthPage = ({ onBackToHome }: { onBackToHome: () => void }) => {
  const { supabase, refreshUser, setViewMode } = useApp(); // ✅ Lấy supabase từ Context
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState(''); // Cho đăng ký

  // Xử lý Đăng nhập / Đăng ký Email
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        // ĐĂNG NHẬP
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success('Đăng nhập thành công!');
        await refreshUser();
        setViewMode('studio'); // Chuyển thẳng vào Studio
      } else {
        // ĐĂNG KÝ
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });
        if (error) throw error;
        toast.success('Đăng ký thành công! Hãy kiểm tra email để xác nhận.');
        setIsLogin(true);
      }
    } catch (error: any) {
      toast.error(error.message || 'Có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Xử lý Đăng nhập GOOGLE
  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // Sau khi login xong sẽ quay về trang này
          redirectTo: window.location.origin 
        }
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error('Lỗi đăng nhập Google: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effect */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-[#66E91E] opacity-10 blur-[120px] rounded-full"></div>

      <div className="w-full max-w-md bg-[#111] border border-[#333] rounded-2xl p-8 shadow-2xl relative z-10">
        <button onClick={onBackToHome} className="absolute top-4 left-4 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center mb-8 mt-2">
          <h1 className="text-3xl font-black tracking-tighter mb-2">MENTORIS<span className="text-[#66E91E]">.AI</span></h1>
          <p className="text-gray-400 text-sm">Design Lab & Fashion Studio</p>
        </div>

        {/* Form */}
        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Tên hiển thị</label>
                <input 
                    type="text" 
                    required 
                    className="w-full bg-[#222] border border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#66E91E] transition-colors"
                    placeholder="VD: Nguyen Van A"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Email</label>
            <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-4 h-4 text-gray-500" />
                <input 
                    type="email" 
                    required 
                    className="w-full bg-[#222] border border-[#333] rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-[#66E91E] transition-colors"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Mật khẩu</label>
            <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-4 h-4 text-gray-500" />
                <input 
                    type="password" 
                    required 
                    className="w-full bg-[#222] border border-[#333] rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-[#66E91E] transition-colors"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-[#66E91E] hover:bg-[#5cd41b] text-black font-bold py-3.5 rounded-xl transition-all transform active:scale-95 flex items-center justify-center gap-2 mt-2"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? 'Đăng Nhập' : 'Đăng Ký Tài Khoản')}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
            <div className="h-px bg-[#333] flex-1"></div>
            <span className="text-xs text-gray-500 font-medium">HOẶC TIẾP TỤC VỚI</span>
            <div className="h-px bg-[#333] flex-1"></div>
        </div>

        {/* SOCIAL LOGIN */}
        <button 
            onClick={handleGoogleLogin}
            className="w-full bg-white text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors mb-4"
        >
            <Chrome className="w-5 h-5" /> 
            Đăng nhập với Google
        </button>

        <p className="text-center text-sm text-gray-400 mt-6">
            {isLogin ? "Chưa có tài khoản? " : "Đã có tài khoản? "}
            <button 
                onClick={() => setIsLogin(!isLogin)} 
                className="text-[#66E91E] font-bold hover:underline"
            >
                {isLogin ? 'Đăng ký ngay' : 'Đăng nhập'}
            </button>
        </p>
      </div>
    </div>
  );
};
