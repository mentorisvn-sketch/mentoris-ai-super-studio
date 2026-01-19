
import React, { useState } from 'react';
import { ArrowRight, Check, Zap, Scissors, Shirt, Camera, Sparkles, User, Phone, MessageCircle, X, Facebook, Instagram, Twitter } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

export const LandingPage = ({ onNavigate, onEnterStudio }: { onNavigate: (tab: string) => void, onEnterStudio: () => void }) => {
  const [showContact, setShowContact] = useState(false);
  const { setPricingOpen, setViewMode } = useApp();

  return (
    <div className="h-full overflow-y-auto bg-white pt-16">
      <div className="relative min-h-[600px] flex flex-col items-center justify-center text-center overflow-hidden bg-white px-4">
        <div className="absolute inset-0 flex justify-between items-center px-4 md:px-10 pointer-events-none select-none overflow-hidden opacity-20">
            <span className="text-[18vw] leading-none font-bold text-transparent [-webkit-text-stroke:1px_#000000] transform -translate-x-10 md:-translate-x-20">SUPER</span>
            <span className="text-[18vw] leading-none font-bold text-transparent [-webkit-text-stroke:1px_#000000] transform translate-x-10 md:translate-x-20">STUDIO</span>
        </div>

        <div className="relative z-10 max-w-4xl px-4 md:px-6 flex flex-col items-center animate-in fade-in zoom-in duration-500">
           <div className="mb-4">
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-gray-400">CHÀO MỪNG ĐẾN VỚI THỜI TRANG AI</span>
           </div>
           <h1 className="text-4xl md:text-7xl font-bold tracking-tighter mb-6 bg-gradient-to-r from-black via-gray-600 to-black bg-clip-text text-transparent animate-text-gradient bg-[length:200%_auto]">
             Mentoris AI Super Studio
           </h1>
           <p className="text-base md:text-xl text-gray-500 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
             Giải pháp R&D thời trang toàn diện. Biến ý tưởng thành hiện thực chỉ trong vài giây với sức mạnh của Generative AI.
           </p>
           
           <div className="flex flex-col md:flex-row justify-center gap-4 w-full md:w-auto">
              <button onClick={() => { onEnterStudio(); onNavigate('sketch'); }} className="h-14 px-10 text-base rounded-full bg-[#66E91E] text-black hover:bg-[#5cd41b] border-none font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 flex items-center justify-center w-full md:w-auto">
                Bắt đầu thiết kế
              </button>
              <button onClick={() => { onEnterStudio(); onNavigate('lookbook'); }} className="h-14 px-10 rounded-full border border-gray-200 text-gray-600 font-medium hover:border-black hover:text-black transition-colors flex items-center justify-center bg-white w-full md:w-auto">
                 Tạo Lookbook
              </button>
           </div>
        </div>
      </div>

      <div className="py-16 px-6 max-w-7xl mx-auto border-b border-gray-100">
         <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Giải pháp tối ưu cho doanh nghiệp Thời Trang.</h2>
            <p className="text-gray-500 text-lg max-w-3xl mx-auto font-light">
               Đối thủ sẽ không thể hình dung bạn mạnh lên quá nhanh vì ứng dụng bộ giải pháp AI của chúng tôi.
            </p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <div className="text-center p-8 bg-gray-50 rounded-3xl hover:bg-gray-100 transition-colors duration-300">
               <div className="text-6xl font-black mb-3 text-black tracking-tighter">50x</div>
               <div className="text-lg font-bold text-gray-800">Gia tăng hiệu suất R&D</div>
            </div>
            <div className="text-center p-8 bg-gray-50 rounded-3xl hover:bg-gray-100 transition-colors duration-300">
               <div className="text-6xl font-black mb-3 text-black tracking-tighter">-90%</div>
               <div className="text-lg font-bold text-gray-800">Tiết kiệm chi phí Sản xuất hình ảnh</div>
            </div>
            <div className="text-center p-8 bg-gray-50 rounded-3xl hover:bg-gray-100 transition-colors duration-300">
               <div className="text-6xl font-black mb-3 text-black tracking-tighter">100x</div>
               <div className="text-lg font-bold text-gray-800">Tốc độ ra mắt BST mẫu</div>
            </div>
         </div>
      </div>

      <div className="py-12 md:py-20 px-6 max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Chọn Studio AI của bạn</h2>
              <p className="text-gray-500 max-w-2xl mx-auto text-sm md:text-base">Mỗi studio được thiết kế cho một nhu cầu thời trang AI cụ thể. Chọn giải pháp phù hợp với bạn.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div onClick={() => { onEnterStudio(); onNavigate('sketch'); }} className="group relative h-96 rounded-2xl overflow-hidden cursor-pointer bg-neutral-900 text-white shadow-xl hover:shadow-2xl transition-all">
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1576185850227-1f72b7f8d483?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-60 group-hover:opacity-70 transition-opacity"></div>
                  <div className="relative z-10 p-8 h-full flex flex-col justify-end">
                      <div className="text-xs font-bold uppercase tracking-widest text-gray-200 mb-2">Studio 01</div>
                      <h3 className="text-3xl font-bold mb-3">Thiết kế Thời trang AI</h3>
                      <p className="text-gray-200 text-sm mb-6 max-w-md">Thiết kế trang phục, trang sức và phụ kiện. Thử nghiệm với các loại vải, bản phác thảo và hơn thế nữa. Lặp lại nhanh hơn.</p>
                      <button className="w-fit rounded-full px-6 py-3 bg-[#66E91E] text-black hover:bg-[#5cd41b] font-bold transition-transform hover:-translate-y-1">Bắt đầu ngay</button>
                  </div>
              </div>

              <div onClick={() => { onEnterStudio(); onNavigate('lookbook'); }} className="group relative h-96 rounded-2xl overflow-hidden cursor-pointer bg-neutral-900 text-white shadow-xl hover:shadow-2xl transition-all">
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=2574&auto=format&fit=crop')] bg-cover bg-top opacity-60 group-hover:opacity-70 transition-opacity"></div>
                  <div className="relative z-10 p-8 h-full flex flex-col justify-end">
                      <div className="text-xs font-bold uppercase tracking-widest text-gray-200 mb-2">Studio 02</div>
                      <h3 className="text-3xl font-bold mb-3">Thử đồ Ảo AI</h3>
                      <p className="text-gray-200 text-sm mb-6 max-w-md">Thử quần áo, trang sức và phụ kiện. Với độ chính xác cao và khả năng kiểm soát sáng tạo.</p>
                      <button className="w-fit rounded-full px-6 py-3 bg-[#66E91E] text-black hover:bg-[#5cd41b] font-bold transition-transform hover:-translate-y-1">Bắt đầu ngay</button>
                  </div>
              </div>
          </div>
      </div>

      <div className="py-20 px-6 bg-gray-50 border-t border-gray-200">
         <div className="max-w-5xl mx-auto">
             <div className="text-center mb-12">
                 <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Gói Giải Pháp Enterprise</h2>
                 <p className="text-gray-500 text-lg max-w-2xl mx-auto font-light">
                     Sở hữu Phòng R&D và Studio Thời Trang Ảo trọn gói - Tăng tốc độ ra hàng, tối ưu chi phí hình ảnh.
                 </p>
             </div>

             <div className="bg-white rounded-[32px] shadow-2xl overflow-hidden border border-gray-100 flex flex-col md:flex-row transition-transform hover:scale-[1.01] duration-300">
                 <div className="md:w-5/12 bg-black text-white p-10 flex flex-col justify-between relative overflow-hidden group">
                     <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay group-hover:scale-110 transition-transform duration-700"></div>
                     <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                     
                     <div className="relative z-10">
                         <div className="w-12 h-12 bg-white text-black flex items-center justify-center font-bold text-xl mb-6 rounded-xl shadow-lg">M</div>
                         <h3 className="text-2xl font-bold leading-tight mb-2">MENTORIS<br/>SUPER STUDIO</h3>
                         <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-xs font-bold tracking-widest border border-white/10">ENTERPRISE EDITION</div>
                     </div>

                     <div className="relative z-10 mt-12 md:mt-0">
                         <p className="text-gray-400 text-xs uppercase tracking-widest font-bold mb-2">Đăng ký tháng</p>
                         <div className="flex items-baseline gap-2">
                             <span className="text-5xl md:text-6xl font-black tracking-tighter">10tr</span>
                             <span className="text-sm md:text-base text-gray-400 font-medium">VNĐ / tháng</span>
                         </div>
                         <p className="text-[11px] text-gray-300 italic mt-1 font-medium">(Chỉ bằng chi phí thuê 1 mẫu chụp ảnh trong 2 giờ)</p>
                         <p className="text-xs text-gray-500 mt-4">*Đã bao gồm VAT</p>
                     </div>
                 </div>

                 <div className="md:w-7/12 p-8 md:p-12 flex flex-col justify-center">
                     <p className="text-gray-600 mb-8 leading-relaxed font-light text-base">
                         Biến bản phác thảo thành doanh thu. Hệ thống <strong>Mentoris AI Core</strong> giúp đội ngũ của bạn cắt giảm 90% quy trình sản xuất hình ảnh truyền thống.
                     </p>
                     
                     <ul className="space-y-6 mb-10">
                         <li className="flex items-start gap-4">
                             <div className="bg-green-100 p-1.5 rounded-full text-green-600 mt-0.5"><Check className="w-4 h-4" /></div>
                             <div>
                                 <strong className="block text-black text-sm mb-0.5">R&D Tốc độ Siêu thanh (x100 lần)</strong>
                                 <span className="text-xs text-gray-500 leading-snug block">Chuyển đổi tức thì từ phác thảo sơ sài (Sketch) sang ảnh sản phẩm thực tế. Duyệt mẫu không cần chờ may.</span>
                             </div>
                         </li>
                         <li className="flex items-start gap-4">
                             <div className="bg-green-100 p-1.5 rounded-full text-green-600 mt-0.5"><Camera className="w-4 h-4" /></div>
                             <div>
                                 <strong className="block text-black text-sm mb-0.5">Tự chủ Lookbook & Marketing</strong>
                                 <span className="text-xs text-gray-500 leading-snug block">Tự tạo bộ ảnh Lookbook 4K chuẩn Studio & Thương mại điện tử. Tiết kiệm hàng trăm triệu chi phí thuê mẫu, studio, nhiếp ảnh mỗi năm.</span>
                             </div>
                         </li>
                         <li className="flex items-start gap-4">
                             <div className="bg-green-100 p-1.5 rounded-full text-green-600 mt-0.5"><Zap className="w-4 h-4 fill-current" /></div>
                             <div>
                                 <strong className="block text-black text-sm mb-0.5">Tiên phong vị thế "AI First" - Bước tiến vượt xa đối thủ</strong>
                                 <span className="text-xs text-gray-500 leading-snug block">Biến công nghệ thành vũ khí cạnh tranh độc quyền. Giúp thương hiệu bứt tốc và bỏ xa đối thủ trên đường đua thị trường ngay hôm nay.</span>
                             </div>
                         </li>
                         <li className="flex items-start gap-4">
                             <div className="bg-green-100 p-1.5 rounded-full text-green-600 mt-0.5"><Sparkles className="w-4 h-4" /></div>
                             <div>
                                 <strong className="block text-black text-sm mb-0.5">Sáng tạo & Thử nghiệm không giới hạn</strong>
                                 <span className="text-xs text-gray-500 leading-snug block">Thoải mái tạo hàng trăm biến thể (mix-match) về chất liệu, bối cảnh, người mẫu mà không tốn chi phí sản xuất mẫu thật.</span>
                             </div>
                         </li>
                     </ul>

                     <button 
                        onClick={() => setShowContact(true)}
                        className="w-full py-4 bg-black text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center justify-center gap-2"
                     >
                         Đặt lịch Demo Giải pháp <ArrowRight className="w-4 h-4" />
                     </button>
                     <p className="text-center text-[10px] text-gray-400 mt-4">Nâng cấp phòng thiết kế của bạn ngày hôm nay!</p>
                 </div>
             </div>
         </div>
      </div>

      {/* --- NEW FOOTER SECTION --- */}
      <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
          <div className="max-w-7xl mx-auto px-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                  {/* Brand Column */}
                  <div className="md:col-span-1">
                      <div className="flex items-center gap-2 mb-4">
                          <img src="https://i.postimg.cc/L5fXNrG4/MENTORIS-SPORT-LOGO-DEN.png" alt="Mentoris Logo" className="h-8 w-auto object-contain" />
                          <span className="text-xs font-black tracking-widest uppercase">Mentoris AI</span>
                      </div>
                      <p className="text-sm text-gray-500 leading-relaxed mb-6">
                          Tiên phong ứng dụng Generative AI vào quy trình thiết kế và sản xuất thời trang. Tối ưu hóa chi phí, bứt phá sáng tạo.
                      </p>
                      <div className="flex gap-4">
                          <button className="p-2 bg-gray-50 rounded-full hover:bg-black hover:text-white transition-colors text-gray-400"><Facebook className="w-4 h-4"/></button>
                          <button className="p-2 bg-gray-50 rounded-full hover:bg-black hover:text-white transition-colors text-gray-400"><Instagram className="w-4 h-4"/></button>
                          <button className="p-2 bg-gray-50 rounded-full hover:bg-black hover:text-white transition-colors text-gray-400"><Twitter className="w-4 h-4"/></button>
                      </div>
                  </div>

                  {/* Company Links */}
                  <div>
                      <h4 className="font-bold text-sm uppercase tracking-wider mb-6">Công ty</h4>
                      <ul className="space-y-4 text-sm text-gray-500">
                          <li><button onClick={() => setViewMode('about')} className="hover:text-black transition-colors hover:underline">Về chúng tôi</button></li>
                          <li><button onClick={() => setShowContact(true)} className="hover:text-black transition-colors hover:underline">Liên hệ & Hợp tác</button></li>
                          <li><button onClick={() => setPricingOpen(true)} className="hover:text-black transition-colors hover:underline">Bảng giá Enterprise</button></li>
                      </ul>
                  </div>

                  {/* Legal Links */}
                  <div>
                      <h4 className="font-bold text-sm uppercase tracking-wider mb-6">Pháp lý & Hỗ trợ</h4>
                      <ul className="space-y-4 text-sm text-gray-500">
                          <li><button onClick={() => setViewMode('privacy')} className="hover:text-black transition-colors hover:underline">Chính sách bảo mật</button></li>
                          <li><button onClick={() => setViewMode('terms')} className="hover:text-black transition-colors hover:underline">Thỏa thuận người dùng</button></li>
                          <li><a href="#" className="hover:text-black transition-colors hover:underline">Trung tâm trợ giúp</a></li>
                      </ul>
                  </div>

                  {/* Contact Info */}
                  <div>
                      <h4 className="font-bold text-sm uppercase tracking-wider mb-6">Văn phòng</h4>
                      <ul className="space-y-4 text-sm text-gray-500">
                          <li className="flex gap-2">
                              <span className="font-bold text-black min-w-[60px]">Email:</span>
                              mentoirs.studio@gmail.com
                          </li>
                          <li className="flex gap-2">
                              <span className="font-bold text-black min-w-[60px]">Hotline:</span>
                              0344 569 854
                          </li>
                          <li className="flex gap-2">
                              <span className="font-bold text-black min-w-[60px]">Địa chỉ:</span>
                              Hanoi, Vietnam
                          </li>
                      </ul>
                  </div>
              </div>

              <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400">
                  <p>© 2026 Mentoris AI Super Studio. All rights reserved.</p>
                  <p>Designed by Duan Nguyen | Powered by Google Gemini 3 Pro</p>
              </div>
          </div>
      </footer>

      {/* Contact Modal Overlay */}
      {showContact && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[32px] p-8 max-w-md w-full relative shadow-2xl">
                <button 
                onClick={() => setShowContact(false)}
                className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                <X className="w-5 h-5" />
                </button>
                
                <h3 className="text-2xl font-bold mb-6 text-center">Liên hệ tư vấn Enterprise</h3>
                
                <div className="space-y-4">
                    {/* Admin Card */}
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center">
                            <User className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold">Chuyên gia tư vấn</p>
                            <p className="font-bold text-lg">Duẩn Nguyễn</p>
                        </div>
                    </div>

                    {/* Phone Card */}
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                            <Phone className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold">Hotline / Zalo</p>
                            <p className="font-bold text-lg">0344 569 854</p>
                        </div>
                    </div>

                    {/* Zalo Button */}
                    <a href="https://zalo.me/0344569854" target="_blank" rel="noreferrer" className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-100 rounded-2xl hover:bg-blue-100 transition-colors cursor-pointer group">
                        <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <MessageCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-blue-500 uppercase font-bold">Chat trực tiếp</p>
                            <p className="font-bold text-blue-700">Kết nối qua Zalo</p>
                        </div>
                    </a>
                </div>
                
                <p className="text-center text-xs text-gray-400 mt-6">
                Đội ngũ Mentoris sẽ phản hồi trong vòng 5 phút.
                </p>
            </div>
        </div>
      )}
    </div>
  );
};
