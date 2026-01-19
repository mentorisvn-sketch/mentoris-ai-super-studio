
import React, { useState } from 'react';
import { Eye, ArrowLeft, Globe, Lock, User as UserIcon, AlertCircle, Phone, MessageCircle, Sparkles, Zap, Camera, Cpu, Layers, Mail, CheckCircle2 } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { toast } from 'sonner';

// Google Logo Component
const GoogleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        <path d="M1 1h22v22H1z" fill="none"/>
    </svg>
);

export const AuthPage = ({ onBackToHome }: { onBackToHome: () => void }) => {
  const { supabase } = useApp();
  
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState(''); // Only for signup
  const [agreedToTerms, setAgreedToTerms] = useState(false); // New: Terms Checkbox
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showContact, setShowContact] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
     e.preventDefault();
     setError('');
     
     if (!isLoginMode && !agreedToTerms) {
         setError("Bạn phải đồng ý với Điều khoản sử dụng để đăng ký.");
         toast.error("Vui lòng đồng ý với Điều khoản sử dụng");
         return;
     }

     setLoading(true);

     try {
        if (isLoginMode) {
            // LOGIN
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password
            });
            if (error) throw error;
            toast.success("Chào mừng trở lại!", { duration: 2000 });
        } else {
            // SIGNUP
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
                    }
                }
            });
            if (error) throw error;
            toast.success("Đăng ký thành công!", { description: "Vui lòng đăng nhập để tiếp tục." });
            setIsLoginMode(true);
        }
     } catch (err: any) {
         const errorMsg = err.message === "Invalid login credentials" 
            ? "Email hoặc mật khẩu không chính xác." 
            : err.message;
         setError(errorMsg);
         toast.error("Đăng nhập thất bại", { description: errorMsg });
     } finally {
         setLoading(false);
     }
  };

  const handleGoogleLogin = () => {
      // Mock Google Login for visual purposes or implement real provider
      toast.info("Tính năng đang phát triển", { description: "Cần cấu hình GCP Console." });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#D4FC79] to-[#96E6A1] p-4 font-sans text-black relative overflow-hidden">
       {/* Creative Blobs */}
       <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-200/30 rounded-full blur-[120px]" />
       <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-200/30 rounded-full blur-[120px]" />

       <button 
         onClick={onBackToHome}
         className="absolute top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-white/50 backdrop-blur-md rounded-full text-sm font-bold text-gray-700 hover:bg-white hover:text-black transition-all shadow-sm group"
       >
         <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Trang chủ
       </button>

       <div className="flex w-full max-w-6xl items-center justify-between relative z-10 gap-10">
          {/* Left Side - Branding Text */}
          <div className="hidden lg:block w-7/12 animate-in fade-in slide-in-from-left-8 duration-500">
             <div className="mb-8 flex items-center gap-4">
                 <img src="https://i.postimg.cc/L5fXNrG4/MENTORIS-SPORT-LOGO-DEN.png" alt="Mentoris Logo" className="h-20 w-auto object-contain" />
                 
                 {/* Animated AI Icon */}
                 <div className="flex items-center gap-2 px-3 py-1.5 bg-black rounded-full shadow-xl animate-pulse">
                    <Sparkles className="w-4 h-4 text-[#66E91E] fill-current" />
                    <span className="text-[10px] font-black text-white tracking-[0.2em] uppercase">AI ENGINE</span>
                 </div>
             </div>
             
             <h1 className="text-5xl font-black mb-8 leading-tight tracking-tight">Mentoris AI Super Studio</h1>
             
             <ul className="space-y-6 text-gray-800">
               <li className="flex items-start gap-4 group">
                   <div className="w-10 h-10 rounded-xl bg-white/60 backdrop-blur flex items-center justify-center shadow-sm group-hover:bg-[#66E91E] transition-colors flex-shrink-0">
                       <Zap className="w-5 h-5 text-black fill-current" />
                   </div>
                   <div>
                       <h3 className="font-bold text-lg mb-1">R&D Tốc độ Siêu thanh (x100 lần)</h3>
                       <p className="text-sm font-medium text-gray-600 leading-relaxed">Chuyển đổi tức thì từ phác thảo sơ sài (Sketch) sang ảnh sản phẩm thực tế. Duyệt mẫu không cần chờ may.</p>
                   </div>
               </li>

               <li className="flex items-start gap-4 group">
                   <div className="w-10 h-10 rounded-xl bg-white/60 backdrop-blur flex items-center justify-center shadow-sm group-hover:bg-[#66E91E] transition-colors flex-shrink-0">
                       <Camera className="w-5 h-5 text-black" />
                   </div>
                   <div>
                       <h3 className="font-bold text-lg mb-1">Tự chủ Lookbook & Marketing</h3>
                       <p className="text-sm font-medium text-gray-600 leading-relaxed">Tự tạo bộ ảnh Lookbook 4K chuẩn Studio & Thương mại điện tử. Tiết kiệm hàng trăm triệu chi phí thuê mẫu, studio, nhiếp ảnh mỗi năm.</p>
                   </div>
               </li>

               <li className="flex items-start gap-4 group">
                   <div className="w-10 h-10 rounded-xl bg-white/60 backdrop-blur flex items-center justify-center shadow-sm group-hover:bg-[#66E91E] transition-colors flex-shrink-0">
                       <Cpu className="w-5 h-5 text-black" />
                   </div>
                   <div>
                       <h3 className="font-bold text-lg mb-1">Tiên phong vị thế "AI First"</h3>
                       <p className="text-sm font-medium text-gray-600 leading-relaxed">Biến công nghệ thành vũ khí cạnh tranh độc quyền. Giúp thương hiệu bứt tốc và bỏ xa đối thủ trên đường đua thị trường ngay hôm nay.</p>
                   </div>
               </li>
             </ul>
          </div>

          {/* Right Side - Creative Login Form */}
          <div className="w-full lg:w-5/12 bg-white/80 backdrop-blur-xl rounded-[32px] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white/50 animate-in fade-in slide-in-from-right-8 duration-500 relative">
             <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-1">{isLoginMode ? 'Welcome Back' : 'Create Account'}</h2>
                <p className="text-gray-500 text-sm">{isLoginMode ? 'Đăng nhập để truy cập Studio.' : 'Đăng ký tài khoản trải nghiệm miễn phí.'}</p>
             </div>

             {/* GOOGLE LOGIN BUTTON */}
             <button 
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-700 font-bold py-3.5 rounded-xl border border-gray-200 transition-all shadow-sm mb-6"
             >
                <GoogleIcon />
                <span>Tiếp tục với Google</span>
             </button>

             <div className="flex items-center gap-4 mb-6">
                <div className="h-px bg-gray-200 flex-1"></div>
                <span className="text-xs font-bold text-gray-400 uppercase">Hoặc</span>
                <div className="h-px bg-gray-200 flex-1"></div>
             </div>

             <form onSubmit={handleAuth} className="space-y-4">
                
                {/* Full Name field (Only for Signup) */}
                {!isLoginMode && (
                    <div className="animate-in fade-in slide-in-from-top-2">
                        <label className="block text-xs font-bold text-gray-500 mb-1 ml-1 uppercase tracking-wider">Họ và Tên</label>
                        <div className="relative group">
                            <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-black transition-colors" />
                            <input 
                                type="text" 
                                placeholder="Nguyễn Văn A" 
                                value={fullName} 
                                onChange={(e) => setFullName(e.target.value)} 
                                className="w-full bg-white/50 border-none rounded-xl pl-12 pr-4 py-4 text-sm font-semibold focus:ring-2 focus:ring-[#66E91E] outline-none shadow-sm transition-all placeholder:font-normal" 
                                required
                            />
                        </div>
                    </div>
                )}

                <div>
                   <label className="block text-xs font-bold text-gray-500 mb-1 ml-1 uppercase tracking-wider">Email</label>
                   <div className="relative group">
                       <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-black transition-colors" />
                       <input 
                           type="email" 
                           placeholder="name@company.com" 
                           value={email} 
                           onChange={(e) => setEmail(e.target.value)} 
                           className="w-full bg-white/50 border-none rounded-xl pl-12 pr-4 py-4 text-sm font-semibold focus:ring-2 focus:ring-[#66E91E] outline-none shadow-sm transition-all placeholder:font-normal" 
                           required
                       />
                   </div>
                </div>

                <div>
                   <label className="block text-xs font-bold text-gray-500 mb-1 ml-1 uppercase tracking-wider flex justify-between items-center">
                       <span>Password</span>
                       {isLoginMode && (
                           <a href="#" className="text-[#3b82f6] hover:underline normal-case font-medium">Quên mật khẩu?</a>
                       )}
                   </label>
                   <div className="relative group">
                       <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-black transition-colors" />
                       <input 
                           type="password" 
                           placeholder="••••••••" 
                           value={password} 
                           onChange={(e) => setPassword(e.target.value)} 
                           className="w-full bg-white/50 border-none rounded-xl pl-12 pr-4 py-4 text-sm font-semibold focus:ring-2 focus:ring-[#66E91E] outline-none shadow-sm transition-all placeholder:font-normal" 
                           required
                       />
                       <Eye className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer hover:text-black" />
                   </div>
                </div>

                {/* Terms Checkbox (Only Signup) */}
                {!isLoginMode && (
                    <div className="flex items-start gap-2 pt-1 animate-in fade-in">
                        <div className="relative flex items-center">
                            <input 
                                type="checkbox" 
                                id="terms" 
                                checked={agreedToTerms}
                                onChange={(e) => setAgreedToTerms(e.target.checked)}
                                className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-gray-300 shadow transition-all checked:border-black checked:bg-black focus:ring-1 focus:ring-black"
                            />
                            <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100">
                                <CheckCircle2 className="w-3 h-3" />
                            </div>
                        </div>
                        <label htmlFor="terms" className="text-xs text-gray-500 cursor-pointer select-none">
                            Tôi đồng ý với <span className="font-bold text-black hover:underline">Điều khoản sử dụng</span> & <span className="font-bold text-black hover:underline">Chính sách bảo mật</span> của Mentoris.
                        </label>
                    </div>
                )}

                {error && (
                   <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-bold text-center flex flex-col items-center justify-center gap-1 animate-in fade-in">
                       <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" /> {error}
                       </div>
                   </div>
                )}

                <button 
                    type="submit" 
                    disabled={loading || (!isLoginMode && !agreedToTerms)}
                    className="w-full bg-[#a3ff68] hover:bg-[#92ef58] text-black font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-[0.98] mt-2 uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                   {loading && <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>}
                   {isLoginMode ? 'Đăng nhập hệ thống' : 'Đăng ký tài khoản'}
                </button>
             </form>
             
             <div className="mt-8 text-center pt-6 border-t border-gray-100/50 flex flex-col gap-2">
                 <p className="text-xs text-gray-500">
                    {isLoginMode ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'} 
                    <button type="button" onClick={() => setIsLoginMode(!isLoginMode)} className="underline cursor-pointer hover:text-black font-bold ml-1">
                        {isLoginMode ? 'Đăng ký ngay' : 'Đăng nhập'}
                    </button>
                 </p>
                 
                 <button type="button" onClick={() => setShowContact(true)} className="text-[10px] text-gray-400 hover:text-gray-600 uppercase font-bold tracking-wider mt-2">
                     Liên hệ hỗ trợ Enterprise
                 </button>
             </div>

             {/* Contact Modal Overlay */}
             {showContact && (
                 <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-md rounded-[32px] flex flex-col items-center justify-center p-8 animate-in fade-in zoom-in duration-200">
                     <h3 className="text-xl font-bold mb-6">Thông tin hỗ trợ</h3>
                     <div className="bg-gray-50 p-6 rounded-2xl w-full space-y-4 border border-gray-100">
                         <div className="flex items-center gap-4">
                             <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center">
                                 <UserIcon className="w-5 h-5" />
                             </div>
                             <div>
                                 <p className="text-xs text-gray-500 uppercase font-bold">Quản trị viên</p>
                                 <p className="font-bold text-lg">Duẩn Nguyễn</p>
                             </div>
                         </div>
                         <div className="h-px bg-gray-200"></div>
                         <div className="flex items-center gap-4">
                             <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                                 <Phone className="w-5 h-5" />
                             </div>
                             <div>
                                 <p className="text-xs text-gray-500 uppercase font-bold">Hotline</p>
                                 <p className="font-bold text-lg">0344 569 854</p>
                             </div>
                         </div>
                         <a href="https://zalo.me/0344569854" target="_blank" rel="noreferrer" className="flex items-center gap-4 p-3 bg-blue-50 border border-blue-100 rounded-xl hover:bg-blue-100 transition-colors cursor-pointer group">
                             <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                 <MessageCircle className="w-5 h-5" />
                             </div>
                             <div>
                                 <p className="text-xs text-blue-500 uppercase font-bold">Chat Zalo</p>
                                 <p className="font-bold text-blue-700">Kết nối ngay</p>
                             </div>
                         </a>
                     </div>
                     <button onClick={() => setShowContact(false)} className="mt-6 text-sm font-bold text-gray-400 hover:text-black">Quay lại</button>
                 </div>
             )}
          </div>
       </div>
    </div>
  );
}
