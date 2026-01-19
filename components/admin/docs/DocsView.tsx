
import React from 'react';
import { BookOpen, Info, Zap, Camera, Scissors } from 'lucide-react';

export const DocsView = () => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-lg flex items-center gap-2">
                <BookOpen className="w-5 h-5" /> Cơ chế tính phí Credit & Vận hành
            </h3>
        </div>
        
        <div className="p-8 max-w-4xl">
            {/* Introduction */}
            <div className="mb-10">
                <h4 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">1. Nguyên tắc cốt lõi</h4>
                <p className="text-gray-700 leading-relaxed mb-4">
                    Hệ thống tính phí (Credit) của Mentoris dựa trên 2 yếu tố nhân: <strong>Độ phân giải (Resolution)</strong> và <strong>Độ phức tạp tính năng (Complexity)</strong>.
                    Mỗi hành động tạo ảnh sẽ trừ trực tiếp vào quỹ Credit của người dùng.
                </p>
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3 items-start">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-800">
                        <strong>Lưu ý:</strong> 1 Credit tương đương giá trị khoảng $0.01 (250 VNĐ). Hệ thống tự động trừ credit khi người dùng bấm "Tạo". Nếu quá trình tạo lỗi do hệ thống, Admin sẽ cần hoàn lại (Top-up) thủ công.
                    </p>
                </div>
            </div>

            {/* Pricing Table */}
            <div className="mb-10">
                <h4 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">2. Bảng quy đổi giá trị (Per Image)</h4>
                <div className="overflow-hidden border border-gray-200 rounded-xl shadow-sm">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-900 text-white">
                            <tr>
                                <th className="px-6 py-4 font-bold">Cấu hình / Chất lượng</th>
                                <th className="px-6 py-4 font-bold bg-gray-800">
                                    <div className="flex items-center gap-2">
                                        <Scissors className="w-4 h-4 text-[#66E91E]" />
                                        <span>Basic Tier</span>
                                    </div>
                                    <span className="text-[10px] font-normal text-gray-300 block mt-1">(Sketch, Design Lab)</span>
                                </th>
                                <th className="px-6 py-4 font-bold bg-black">
                                    <div className="flex items-center gap-2">
                                        <Camera className="w-4 h-4 text-[#66E91E]" />
                                        <span>Advanced Tier</span>
                                    </div>
                                    <span className="text-[10px] font-normal text-gray-300 block mt-1">(Lookbook Studio)</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            <tr className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <p className="font-bold text-black">Standard (1K)</p>
                                    <p className="text-xs text-gray-500">Phác thảo ý tưởng nhanh</p>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="font-bold text-lg">4 Credits</span>
                                    <span className="text-xs text-gray-400 ml-2">~1.000đ</span>
                                </td>
                                <td className="px-6 py-4 bg-gray-50/50">
                                    <span className="font-bold text-lg text-purple-600">6 Credits</span>
                                    <span className="text-xs text-gray-400 ml-2">~1.500đ</span>
                                </td>
                            </tr>
                            <tr className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <p className="font-bold text-black">High Def (2K)</p>
                                    <p className="text-xs text-gray-500">Trình chiếu & Web</p>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="font-bold text-lg">8 Credits</span>
                                    <span className="text-xs text-gray-400 ml-2">~2.000đ</span>
                                </td>
                                <td className="px-6 py-4 bg-gray-50/50">
                                    <span className="font-bold text-lg text-purple-600">12 Credits</span>
                                    <span className="text-xs text-gray-400 ml-2">~3.000đ</span>
                                </td>
                            </tr>
                            <tr className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <p className="font-bold text-black">Cinematic (4K)</p>
                                    <p className="text-xs text-gray-500">In ấn & Marketing</p>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="font-bold text-lg">15 Credits</span>
                                    <span className="text-xs text-gray-400 ml-2">~3.750đ</span>
                                </td>
                                <td className="px-6 py-4 bg-gray-50/50">
                                    <span className="font-bold text-lg text-purple-600">20 Credits</span>
                                    <span className="text-xs text-gray-400 ml-2">~5.000đ</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Formula */}
            <div className="mb-10">
                <h4 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">3. Công thức tính tổng</h4>
                <div className="p-6 bg-gray-900 text-white rounded-xl font-mono text-center shadow-lg">
                    <p className="text-lg">
                        <span className="text-[#66E91E]">Total Credits</span> = (Giá mỗi ảnh theo Tier) x (Số lượng ảnh)
                    </p>
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border border-gray-200 rounded-lg">
                        <h5 className="font-bold text-sm mb-2 flex items-center gap-2"><Zap className="w-4 h-4 text-yellow-500"/> Ví dụ 1: Design Lab</h5>
                        <p className="text-sm text-gray-600">User tạo <strong>3 ảnh</strong> chất lượng <strong>2K</strong>.</p>
                        <p className="mt-2 text-sm font-bold">Chi phí: 8 x 3 = 24 Credits.</p>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-lg">
                        <h5 className="font-bold text-sm mb-2 flex items-center gap-2"><Zap className="w-4 h-4 text-purple-500"/> Ví dụ 2: Lookbook</h5>
                        <p className="text-sm text-gray-600">User tạo <strong>1 ảnh</strong> chất lượng <strong>4K</strong> (kèm xử lý khuôn mặt).</p>
                        <p className="mt-2 text-sm font-bold">Chi phí: 20 x 1 = 20 Credits.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};
