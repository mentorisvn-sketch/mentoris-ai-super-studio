
import React, { useState } from 'react';
import { User, CreditCard, History, Settings, LogOut, Check, QrCode, ArrowLeft, Loader2, Copy } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { toast } from 'sonner';

// Bank Transfer QR Modal
const BankTransferModal = ({ 
    isOpen, 
    onClose, 
    packageInfo,
    onConfirm
}: { 
    isOpen: boolean, 
    onClose: () => void,
    packageInfo: { name: string, price: string, credits: number },
    onConfirm: () => void
}) => {
    if (!isOpen) return null;

    const BANK_INFO = {
        bankName: "MB Bank",
        accountNo: "0344569854",
        accountName: "NGUYEN VAN A",
        content: `MENTORIS ${Math.floor(Math.random() * 10000)}`
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Đã sao chép vào clipboard");
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-0 overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white text-center">
                    <h3 className="text-xl font-bold mb-1">Thanh toán chuyển khoản</h3>
                    <p className="text-sm opacity-90">Gói {packageInfo.name} - {packageInfo.price}</p>
                </div>
                
                <div className="p-8 flex flex-col items-center">
                    {/* Placeholder QR */}
                    <div className="w-48 h-48 bg-white border-2 border-gray-100 rounded-xl mb-6 shadow-lg flex items-center justify-center relative overflow-hidden group">
                        <QrCode className="w-32 h-32 text-gray-800" />
                        <div className="absolute inset-0 bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center font-bold text-xs text-gray-500">
                             QR Code Mẫu
                        </div>
                    </div>

                    <div className="w-full space-y-3 mb-8">
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                             <span className="text-xs font-bold text-gray-500 uppercase">Ngân hàng</span>
                             <span className="font-bold text-black">{BANK_INFO.bankName}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                             <span className="text-xs font-bold text-gray-500 uppercase">Số tài khoản</span>
                             <div className="flex items-center gap-2">
                                <span className="font-bold text-black tracking-wider">{BANK_INFO.accountNo}</span>
                                <Copy 
                                    className="w-3 h-3 text-gray-400 cursor-pointer hover:text-black" 
                                    onClick={() => copyToClipboard(BANK_INFO.accountNo)}
                                />
                             </div>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                             <span className="text-xs font-bold text-gray-500 uppercase">Chủ tài khoản</span>
                             <span className="font-bold text-black">{BANK_INFO.accountName}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-yellow-50 border border-yellow-100 rounded-lg">
                             <span className="text-xs font-bold text-yellow-700 uppercase">Nội dung CK</span>
                             <div className="flex items-center gap-2">
                                <span className="font-bold text-red-600">{BANK_INFO.content}</span>
                                <Copy 
                                    className="w-3 h-3 text-red-400 cursor-pointer hover:text-red-700" 
                                    onClick={() => copyToClipboard(BANK_INFO.content)}
                                />
                             </div>
                        </div>
                    </div>

                    <div className="flex gap-3 w-full">
                        <button onClick={onClose} className="flex-1 py-3 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors">
                            Hủy
                        </button>
                        <button onClick={onConfirm} className="flex-1 py-3 text-sm font-bold bg-black text-white hover:bg-gray-800 rounded-xl transition-colors shadow-lg">
                            Tôi đã chuyển khoản
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const UserProfilePage = () => {
    const { user, updateUser, setViewMode, logout, transactions } = useApp();
    const [activeTab, setActiveTab] = useState<'general' | 'billing' | 'history'>('general');
    
    // Form State
    const [name, setName] = useState(user?.name || "");
    const [avatar, setAvatar] = useState(user?.avatar || "");
    const [isSaving, setIsSaving] = useState(false);

    // Billing State
    const [selectedPackage, setSelectedPackage] = useState<{name: string, price: string, credits: number} | null>(null);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessingPayment(true); // Using same loader state for simplicity
        
        // Simulate API call
        await new Promise(r => setTimeout(r, 1000));
        
        if (user) {
            updateUser(user.id, { name, avatar });
            toast.success("Đã lưu thay đổi hồ sơ");
        } else {
            toast.error("Lỗi: Không tìm thấy người dùng");
        }
        
        setIsProcessingPayment(false);
    };

    const handlePaymentConfirm = () => {
        setSelectedPackage(null);
        toast.success("Xác nhận thanh toán thành công", { description: "Credits sẽ được cộng sau khi Admin duyệt (tối đa 15 phút)." });
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans text-black">
            {/* Sidebar Navigation */}
            <aside className="w-full md:w-72 bg-white border-r border-gray-200 flex-shrink-0 flex flex-col h-screen sticky top-0">
                <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                     <button onClick={() => setViewMode('studio')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                         <ArrowLeft className="w-5 h-5 text-gray-500" />
                     </button>
                     <h2 className="font-bold text-lg">Cài đặt tài khoản</h2>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    <button 
                        onClick={() => setActiveTab('general')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${activeTab === 'general' ? 'bg-black text-white shadow-lg' : 'text-gray-500 hover:bg-gray-100 hover:text-black'}`}
                    >
                        <Settings className="w-4 h-4" /> Thông tin chung
                    </button>
                    <button 
                        onClick={() => setActiveTab('billing')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${activeTab === 'billing' ? 'bg-black text-white shadow-lg' : 'text-gray-500 hover:bg-gray-100 hover:text-black'}`}
                    >
                        <CreditCard className="w-4 h-4" /> Nạp Credits & Gói
                    </button>
                    <button 
                        onClick={() => setActiveTab('history')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${activeTab === 'history' ? 'bg-black text-white shadow-lg' : 'text-gray-500 hover:bg-gray-100 hover:text-black'}`}
                    >
                        <History className="w-4 h-4" /> Lịch sử giao dịch
                    </button>
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <button onClick={() => { logout(); setViewMode('landing'); }} className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl font-bold text-sm transition-colors">
                        <LogOut className="w-4 h-4" /> Đăng xuất
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 md:p-10 overflow-y-auto">
                
                {/* 1. GENERAL TAB */}
                {activeTab === 'general' && (
                    <div className="max-w-2xl animate-slide-up">
                        <h3 className="text-2xl font-bold mb-1">Hồ sơ cá nhân</h3>
                        <p className="text-gray-500 text-sm mb-8">Quản lý thông tin hiển thị và bảo mật.</p>

                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                             <form onSubmit={handleSaveProfile} className="space-y-6">
                                 <div className="flex items-center gap-6">
                                     <div className="relative group cursor-pointer">
                                         <img src={avatar} className="w-24 h-24 rounded-full border-4 border-gray-50 object-cover" />
                                         <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity">
                                             Đổi ảnh
                                         </div>
                                     </div>
                                     <div className="flex-1">
                                         <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Avatar URL</label>
                                         <input 
                                            type="text" 
                                            value={avatar} 
                                            onChange={(e) => setAvatar(e.target.value)} 
                                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-black/10 outline-none"
                                         />
                                     </div>
                                 </div>

                                 <div>
                                     <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tên hiển thị</label>
                                     <input 
                                        type="text" 
                                        value={name} 
                                        onChange={(e) => setName(e.target.value)} 
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-black/10 outline-none"
                                     />
                                 </div>

                                 <div>
                                     <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email (Không thể đổi)</label>
                                     <input 
                                        type="email" 
                                        value={user.email} 
                                        disabled 
                                        className="w-full p-3 bg-gray-100 border border-gray-200 rounded-xl text-sm font-medium text-gray-500 cursor-not-allowed"
                                     />
                                 </div>

                                 <div className="pt-4">
                                     <button 
                                        type="submit" 
                                        disabled={isProcessingPayment}
                                        className="px-8 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-all flex items-center gap-2 hover:scale-105 active:scale-95"
                                     >
                                         {isProcessingPayment && <Loader2 className="w-4 h-4 animate-spin" />} Lưu thay đổi
                                     </button>
                                 </div>
                             </form>
                        </div>
                    </div>
                )}

                {/* 2. BILLING TAB */}
                {activeTab === 'billing' && (
                    <div className="max-w-5xl animate-slide-up">
                        <div className="flex justify-between items-end mb-8">
                             <div>
                                <h3 className="text-2xl font-bold mb-1">Nạp Credits</h3>
                                <p className="text-gray-500 text-sm">Chọn gói phù hợp để tiếp tục sáng tạo.</p>
                             </div>
                             <div className="bg-green-50 px-4 py-2 rounded-xl border border-green-100 text-right">
                                 <p className="text-xs font-bold text-green-700 uppercase">Số dư hiện tại</p>
                                 <p className="text-2xl font-black text-green-700">{user.credits.toLocaleString()}</p>
                             </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Starter */}
                            <div className="bg-white p-6 rounded-3xl border border-gray-200 hover:border-black transition-colors flex flex-col relative overflow-hidden group hover:shadow-lg">
                                <h4 className="text-lg font-bold mb-2">Starter</h4>
                                <div className="text-3xl font-black mb-4">499.000đ</div>
                                <div className="flex-1 space-y-3 mb-8">
                                    <div className="flex items-center gap-2 text-sm text-gray-600"><Check className="w-4 h-4 text-black"/> <strong>2,000</strong> Credits</div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600"><Check className="w-4 h-4 text-black"/> ~500 Ảnh Standard</div>
                                </div>
                                <button 
                                    onClick={() => setSelectedPackage({ name: 'Starter', price: '499.000đ', credits: 2000 })}
                                    className="w-full py-3 bg-gray-100 text-black font-bold rounded-xl hover:bg-black hover:text-white transition-colors hover:scale-105 active:scale-95"
                                >
                                    Mua ngay
                                </button>
                            </div>

                            {/* Pro */}
                            <div className="bg-black text-white p-6 rounded-3xl border border-black flex flex-col relative overflow-hidden transform hover:-translate-y-1 transition-all shadow-xl hover:shadow-2xl">
                                <div className="absolute top-0 right-0 bg-[#66E91E] text-black text-[10px] font-bold px-3 py-1 rounded-bl-xl">POPULAR</div>
                                <h4 className="text-lg font-bold mb-2 text-[#66E91E]">Pro Creator</h4>
                                <div className="text-3xl font-black mb-4">2.990.000đ</div>
                                <div className="flex-1 space-y-3 mb-8">
                                    <div className="flex items-center gap-2 text-sm text-gray-300"><Check className="w-4 h-4 text-[#66E91E]"/> <strong>15,000</strong> Credits</div>
                                    <div className="flex items-center gap-2 text-sm text-gray-300"><Check className="w-4 h-4 text-[#66E91E]"/> +20% Bonus Credits</div>
                                    <div className="flex items-center gap-2 text-sm text-gray-300"><Check className="w-4 h-4 text-[#66E91E]"/> Mở khóa Lookbook Pro</div>
                                </div>
                                <button 
                                    onClick={() => setSelectedPackage({ name: 'Pro Creator', price: '2.990.000đ', credits: 15000 })}
                                    className="w-full py-3 bg-[#66E91E] text-black font-bold rounded-xl hover:bg-[#5cd41b] transition-colors hover:scale-105 active:scale-95"
                                >
                                    Mua ngay
                                </button>
                            </div>

                            {/* Business */}
                            <div className="bg-white p-6 rounded-3xl border border-gray-200 hover:border-purple-500 transition-colors flex flex-col relative overflow-hidden group hover:shadow-lg">
                                <h4 className="text-lg font-bold mb-2">Business</h4>
                                <div className="text-3xl font-black mb-4">10.000.000đ</div>
                                <div className="flex-1 space-y-3 mb-8">
                                    <div className="flex items-center gap-2 text-sm text-gray-600"><Check className="w-4 h-4 text-black"/> <strong>60,000</strong> Credits</div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600"><Check className="w-4 h-4 text-black"/> Hỗ trợ ưu tiên 1:1</div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600"><Check className="w-4 h-4 text-black"/> API Access</div>
                                </div>
                                <button 
                                    onClick={() => setSelectedPackage({ name: 'Business', price: '10.000.000đ', credits: 60000 })}
                                    className="w-full py-3 bg-gray-100 text-black font-bold rounded-xl hover:bg-black hover:text-white transition-colors hover:scale-105 active:scale-95"
                                >
                                    Liên hệ Sale
                                </button>
                            </div>
                        </div>

                        {/* QR Modal */}
                        {selectedPackage && (
                            <BankTransferModal 
                                isOpen={true} 
                                onClose={() => setSelectedPackage(null)} 
                                packageInfo={selectedPackage} 
                                onConfirm={handlePaymentConfirm}
                            />
                        )}
                    </div>
                )}

                {/* 3. HISTORY TAB */}
                {activeTab === 'history' && (
                     <div className="max-w-4xl animate-slide-up">
                        <h3 className="text-2xl font-bold mb-1">Lịch sử giao dịch</h3>
                        <p className="text-gray-500 text-sm mb-8">Theo dõi biến động số dư credits của bạn.</p>

                        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                                    <tr>
                                        <th className="p-4 border-b border-gray-100">Thời gian</th>
                                        <th className="p-4 border-b border-gray-100">Hành động</th>
                                        <th className="p-4 border-b border-gray-100 text-right">Biến động</th>
                                        <th className="p-4 border-b border-gray-100 text-right">Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm divide-y divide-gray-100">
                                    {transactions.map((tx) => (
                                        <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-4 text-gray-500">
                                                {new Date(tx.timestamp).toLocaleString('vi-VN')}
                                            </td>
                                            <td className="p-4 font-medium">
                                                {tx.description}
                                            </td>
                                            <td className={`p-4 font-mono font-bold text-right ${tx.amount > 0 ? 'text-green-600' : 'text-gray-900'}`}>
                                                {tx.amount > 0 ? '+' : ''}{tx.amount}
                                            </td>
                                            <td className="p-4 text-right">
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${tx.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                    {tx.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {transactions.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="p-8 text-center text-gray-400">
                                                Chưa có giao dịch nào.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                     </div>
                )}
            </main>
        </div>
    );
};
