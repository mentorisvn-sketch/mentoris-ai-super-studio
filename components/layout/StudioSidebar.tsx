import React, { useState } from 'react';
import { Scissors, Shirt, Camera, Layers, LogOut, LayoutDashboard, Lock, History, Aperture, Sparkles, X, ChevronLeft, ChevronRight, Image as ImageIcon, Menu, Settings } from 'lucide-react';
import { User } from '../../types';

interface StudioSidebarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
    onExitStudio: () => void;
    user: User | null;
    onGoToAdmin: () => void;
    onLogout: () => void;
    isOpen: boolean; // Mobile toggle state
    onClose: () => void; // Mobile close handler
    
    // 🔥 NEW PROP: Hàm kiểm tra quyền từ App.tsx
    checkPermission: (permId: string) => boolean; 
}

export const StudioSidebar = ({ 
    activeTab, onTabChange, onExitStudio, user, onGoToAdmin, onLogout, isOpen, onClose, checkPermission 
}: StudioSidebarProps) => {
    
    // 1. STATE MANAGEMENT
    const [isExpanded, setIsExpanded] = useState(false); // Default collapsed
    // NEW: Decoupled Tooltip State
    const [activeTooltip, setActiveTooltip] = useState<{ label: string; top: number; isAllowed: boolean } | null>(null);

    // 2. MENU DEFINITION (GIỮ NGUYÊN ICON GỐC CỦA BẠN)
    const menuItems = [
      { id: 'sketch', label: 'Phác thảo (Sketch)', icon: Scissors },
      { id: 'quick-design', label: 'Design Lab', icon: Aperture }, // Giữ nguyên icon Aperture như code gốc của bạn
      { id: 'lookbook', label: 'Lookbook Studio', icon: Camera },
      { id: 'try-on', label: 'Thử đồ (Try-On)', icon: Shirt },
      { id: 'concept-product', label: 'Concept & Idea', icon: Sparkles }, // Giữ nguyên icon Sparkles như code gốc của bạn
      { id: 'resources', label: 'Thư viện Tài nguyên', icon: ImageIcon }, 
      { id: 'history', label: 'Lịch sử thiết kế', icon: History },
    ];

    // Helper to handle hover
    const handleMouseEnter = (e: React.MouseEvent, label: string, isAllowed: boolean = true) => {
        if (isExpanded) return;
        const rect = e.currentTarget.getBoundingClientRect();
        setActiveTooltip({
            label,
            top: rect.top + rect.height / 2,
            isAllowed
        });
    };
   
    return (
      <>
        {/* --- MOBILE DRAWER (Overlay Mode) --- */}
        <div 
            className={`lg:hidden fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} 
            onClick={onClose} 
        />
        
        <aside className={`
            lg:hidden fixed top-0 left-0 z-[70] h-full w-72 bg-white shadow-2xl transition-transform duration-300 ease-in-out flex flex-col
            ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
            {/* Mobile Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <img src="https://i.postimg.cc/L5fXNrG4/MENTORIS-SPORT-LOGO-DEN.png" alt="Logo" className="w-8 h-8 object-contain" />
                    <span className="font-bold text-lg">Studio Menu</span>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-6 h-6" /></button>
            </div>
            {/* Mobile Menu Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {menuItems.map((item) => {
                    const isAllowed = checkPermission(item.id); 
                    return (
                        <button
                            key={item.id}
                            // Logic: Chỉ cho click nếu có quyền
                            onClick={() => { if(isAllowed) { onTabChange(item.id); onClose(); } }}
                            disabled={!isAllowed}
                            className={`w-full flex items-center justify-between p-3 rounded-xl font-medium transition-all 
                                ${activeTab === item.id ? 'bg-black text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}
                                ${!isAllowed ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}
                            `}
                        >
                            <div className="flex items-center">
                                <item.icon className="w-5 h-5 mr-3" />
                                {item.label}
                            </div>
                            {/* Icon Lock cho Mobile */}
                            {!isAllowed && <Lock className="w-4 h-4 text-gray-400" />}
                        </button>
                    );
                })}
                <div className="h-px bg-gray-100 my-2" />
                <button onClick={onExitStudio} className="w-full flex items-center p-3 rounded-xl font-medium text-red-600 hover:bg-red-50">
                    <LogOut className="w-5 h-5 mr-3" /> Thoát Studio
                </button>
            </div>
        </aside>


        {/* --- DESKTOP FLOATING DOCK (MacOS Style) --- */}
        <aside 
            className={`
                hidden lg:flex flex-col fixed left-6 top-1/2 -translate-y-1/2 z-50 
                bg-white/90 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.12)]
                rounded-[2rem] transition-all duration-300 ease-out
                ${isExpanded ? 'w-64 p-4' : 'w-20 py-6 px-2 items-center'}
                max-h-[85vh]
            `}
        >
            {/* 1. Branding / Home Button */}
            <div className="mb-4 flex justify-center shrink-0">
                <button 
                    onClick={onExitStudio}
                    onMouseEnter={(e) => handleMouseEnter(e, "Về trang chủ")}
                    onMouseLeave={() => setActiveTooltip(null)}
                    className="group relative flex items-center justify-center w-12 h-12 rounded-2xl hover:bg-gray-100 transition-all"
                >
                    <img 
                        src="https://i.postimg.cc/L5fXNrG4/MENTORIS-SPORT-LOGO-DEN.png" 
                        alt="Mentoris" 
                        className="w-10 h-10 object-contain drop-shadow-sm transition-transform group-hover:scale-110" 
                    />
                    <div className="absolute top-0 right-0 w-3 h-3 bg-[#A3E635] rounded-full border-2 border-white animate-pulse" />
                </button>
            </div>

            {/* 2. Menu Items Container */}
            <div 
                className="flex-1 flex flex-col gap-2 w-full overflow-y-auto overflow-x-visible [&::-webkit-scrollbar]:hidden py-2"
                style={{ scrollbarWidth: 'none' }}
            >
                {menuItems.map((item) => {
                    const isActive = activeTab === item.id;
                    const isAllowed = checkPermission(item.id);

                    return (
                        <button
                            key={item.id}
                            onClick={() => isAllowed && onTabChange(item.id)}
                            disabled={!isAllowed}
                            onMouseEnter={(e) => handleMouseEnter(e, item.label, isAllowed)}
                            onMouseLeave={() => setActiveTooltip(null)}
                            className={`
                                group relative flex items-center transition-all duration-300 ease-out shrink-0
                                ${isExpanded 
                                    ? 'w-full px-4 py-3 rounded-2xl justify-start' 
                                    : 'w-12 h-12 rounded-2xl justify-center'
                                }
                                ${isActive 
                                    ? 'bg-[#A3E635] text-black shadow-lg shadow-lime-200 scale-100' 
                                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                                }
                                ${!isAllowed ? 'opacity-40 cursor-not-allowed grayscale' : ''}
                            `}
                        >
                            <item.icon 
                                className={`
                                    flex-shrink-0 transition-all duration-300
                                    ${isExpanded ? 'w-5 h-5' : 'w-6 h-6'}
                                    ${isActive ? 'text-black' : ''}
                                    ${!isActive && !isExpanded ? 'group-hover:scale-110' : ''}
                                `} 
                            />

                            {isExpanded && (
                                <span className={`
                                    ml-3 text-sm font-bold whitespace-nowrap overflow-hidden transition-all duration-300
                                    ${isActive ? 'text-black' : 'text-gray-600'}
                                `}>
                                    {item.label}
                                </span>
                            )}

                            {!isAllowed && isExpanded && <Lock className="w-3 h-3 ml-auto text-gray-400" />}
                        </button>
                    );
                })}
            </div>

            {/* Separator / Footer Group */}
            <div className={`mt-auto pt-4 flex flex-col gap-2 w-full shrink-0 border-t border-gray-100 ${isExpanded ? 'px-0' : 'px-0'}`}>
                {user?.role === 'admin' && (
                    <button 
                        onClick={onGoToAdmin}
                        onMouseEnter={(e) => handleMouseEnter(e, "Trang Quản trị")}
                        onMouseLeave={() => setActiveTooltip(null)}
                        className={`
                            group relative flex items-center transition-all duration-300
                            ${isExpanded 
                                ? 'w-full px-4 py-3 rounded-2xl justify-start hover:bg-purple-50 text-gray-500 hover:text-purple-600' 
                                : 'w-12 h-12 rounded-2xl justify-center text-gray-400 hover:text-purple-600 hover:bg-purple-50'
                            }
                        `}
                    >
                        <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
                        {isExpanded && <span className="ml-3 text-sm font-bold">Admin</span>}
                    </button>
                )}

                <button 
                    onClick={onLogout}
                    onMouseEnter={(e) => handleMouseEnter(e, "Đăng xuất")}
                    onMouseLeave={() => setActiveTooltip(null)}
                    className={`
                        group relative flex items-center transition-all duration-300
                        ${isExpanded 
                            ? 'w-full px-4 py-3 rounded-2xl justify-start hover:bg-red-50 text-gray-500 hover:text-red-600' 
                            : 'w-12 h-12 rounded-2xl justify-center text-gray-400 hover:text-red-600 hover:bg-red-50'
                        }
                    `}
                >
                    <LogOut className="w-5 h-5 flex-shrink-0" />
                    {isExpanded && <span className="ml-3 text-sm font-bold">Đăng xuất</span>}
                </button>
            </div>

            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className={`
                    absolute -right-3 top-1/2 -translate-y-1/2 
                    w-6 h-6 bg-white border border-gray-200 rounded-full shadow-md 
                    flex items-center justify-center text-gray-400 hover:text-black hover:scale-110 transition-all z-[60]
                `}
                title={isExpanded ? "Thu gọn" : "Mở rộng"}
            >
                {isExpanded ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </button>
        </aside>

        {/* --- TOOLTIP --- */}
        {!isExpanded && activeTooltip && (
            <div 
                className="fixed z-[100] left-28 bg-slate-900 text-white text-xs font-medium px-3 py-2 rounded-lg shadow-xl whitespace-nowrap flex items-center gap-2 pointer-events-none transition-all duration-200 opacity-100 scale-100"
                style={{ 
                    top: activeTooltip.top, 
                    transform: 'translateY(-50%)' 
                }}
            >
                <div className="absolute top-1/2 right-full -translate-y-1/2 border-[5px] border-transparent border-r-slate-900"></div>
                {activeTooltip.label}
                {!activeTooltip.isAllowed && <Lock className="w-3 h-3 text-gray-400" />}
            </div>
        )}
      </>
    );
};
