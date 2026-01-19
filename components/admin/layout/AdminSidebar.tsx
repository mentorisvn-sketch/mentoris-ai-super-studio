
import React from 'react';
import { Users, DollarSign, LogOut, BookOpen, X } from 'lucide-react';

interface AdminSidebarProps {
  activeTab: 'users' | 'cost' | 'docs';
  setActiveTab: (tab: 'users' | 'cost' | 'docs') => void;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const AdminSidebar = ({ activeTab, setActiveTab, onLogout, isOpen, onClose }: AdminSidebarProps) => {
  return (
    <>
        {/* Backdrop for Mobile */}
        {isOpen && (
            <div className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm" onClick={onClose} />
        )}

        <aside className={`
            fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out
            lg:translate-x-0 lg:static
            ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img src="https://i.postimg.cc/L5fXNrG4/MENTORIS-SPORT-LOGO-DEN.png" className="w-10 h-10 object-contain" alt="Logo" />
              <div>
                  <span className="font-bold text-lg block leading-none">Admin</span>
                  <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Dashboard</span>
              </div>
            </div>
            {/* Close button for mobile */}
            <button onClick={onClose} className="lg:hidden p-1 rounded-md hover:bg-gray-100">
                <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            <button onClick={() => setActiveTab('users')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${activeTab === 'users' ? 'bg-black text-white shadow-lg shadow-black/20' : 'text-gray-500 hover:bg-gray-100 hover:text-black'}`}>
              <Users className="w-5 h-5" /> Quản lý người dùng
            </button>
            <button onClick={() => setActiveTab('cost')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${activeTab === 'cost' ? 'bg-black text-white shadow-lg shadow-black/20' : 'text-gray-500 hover:bg-gray-100 hover:text-black'}`}>
              <DollarSign className="w-5 h-5" /> Kiểm soát chi phí
            </button>
            <button onClick={() => setActiveTab('docs')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${activeTab === 'docs' ? 'bg-black text-white shadow-lg shadow-black/20' : 'text-gray-500 hover:bg-gray-100 hover:text-black'}`}>
              <BookOpen className="w-5 h-5" /> Tài liệu cơ chế
            </button>
          </nav>
          <div className="p-4 border-t border-gray-100">
             <button onClick={onLogout} className="w-full flex items-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-bold text-sm">
                <LogOut className="w-5 h-5" /> Đăng xuất
             </button>
          </div>
        </aside>
    </>
  );
};
