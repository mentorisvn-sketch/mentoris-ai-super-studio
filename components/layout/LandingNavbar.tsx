
import React, { useState, useRef, useEffect } from 'react';
import { Crown, LogOut, LayoutDashboard, ChevronDown, User as UserIcon, Wallet, Zap, Shield, Sparkles, Settings } from 'lucide-react';
import { User } from '../../types';
import { Button } from '../ui/Button';
import { useApp } from '../../contexts/AppContext';

export const LandingNavbar = ({ user, onUpgrade, onLogin, onEnterStudio }: { user: User, onUpgrade: () => void, onLogin: () => void, onEnterStudio: () => void }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { logout, user: contextUser, setViewMode } = useApp();
  
  // Real login check: contextUser is not null
  const isLoggedIn = !!contextUser;
  const displayUser = contextUser || user; // Fallback to prop user (MOCK) if not logged in

  const handleLogout = () => {
      logout();
      setIsDropdownOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 h-16 transition-all">
       <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          {/* Logo & AI Badge */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.location.reload()}>
             <img src="https://i.postimg.cc/L5fXNrG4/MENTORIS-SPORT-LOGO-DEN.png" alt="Mentoris Logo" className="h-10 w-auto object-contain" />
             
             {/* Animated AI Badge */}
             <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-black rounded-full border border-gray-800 shadow-sm transition-transform group-hover:scale-105">
                <Sparkles className="w-3 h-3 text-[#66E91E] fill-current animate-pulse" />
                <span className="text-[9px] font-black text-white tracking-[0.15em] uppercase leading-none pt-0.5">AI CORE</span>
             </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
             {isLoggedIn ? (
                 <div className="flex items-center gap-4 relative" ref={dropdownRef}>
                     <Button 
                         variant="primary" 
                         onClick={onEnterStudio}
                         className="hidden sm:flex px-6 py-2 text-xs h-10 shadow-green-200"
                     >
                         Truy cập Studio
                     </Button>

                     <div 
                        className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity p-1 rounded-full border border-transparent hover:border-gray-100"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                     >
                        <img src={displayUser.avatar} className="w-9 h-9 rounded-full bg-gray-100 object-cover border border-gray-200" alt="Avatar" />
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                     </div>

                     {/* User Dropdown */}
                     {isDropdownOpen && (
                         <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                             <div className="p-4 bg-gray-50 border-b border-gray-100">
                                 <p className="font-bold text-sm text-black">{displayUser.name}</p>
                                 <p className="text-xs text-gray-500 truncate">{displayUser.email}</p>
                                 <div className="mt-2 flex items-center gap-2">
                                     <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${displayUser.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                         {displayUser.isActive ? 'Active' : 'Locked'}
                                     </span>
                                     <span className="px-2 py-0.5 bg-black text-white rounded text-[10px] font-bold uppercase">
                                         {displayUser.role}
                                     </span>
                                 </div>
                             </div>
                             
                             <div className="p-2 space-y-1">
                                 <div className="px-3 py-2 flex items-center justify-between hover:bg-gray-50 rounded-lg">
                                     <div className="flex items-center gap-3">
                                         <div className="p-1.5 bg-yellow-100 text-yellow-700 rounded-md"><Wallet className="w-4 h-4"/></div>
                                         <span className="text-sm font-medium">Credits</span>
                                     </div>
                                     <span className="font-bold text-sm">{displayUser.credits.toLocaleString()}</span>
                                 </div>
                                 <div className="px-3 py-2 flex items-center justify-between hover:bg-gray-50 rounded-lg">
                                     <div className="flex items-center gap-3">
                                         <div className="p-1.5 bg-purple-100 text-purple-700 rounded-md"><Zap className="w-4 h-4"/></div>
                                         <span className="text-sm font-medium">Features</span>
                                     </div>
                                     <span className="text-xs text-gray-500 font-medium">{displayUser.permissions.length} active</span>
                                 </div>
                             </div>

                             <div className="h-px bg-gray-100 my-1 mx-2"></div>

                             <div className="p-2">
                                 {displayUser.role === 'admin' && (
                                     <button onClick={() => { setViewMode('admin'); setIsDropdownOpen(false); }} className="w-full text-left px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2 mb-1">
                                         <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
                                     </button>
                                 )}
                                 <button onClick={() => { setViewMode('settings'); setIsDropdownOpen(false); }} className="w-full text-left px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2 mb-1">
                                     <Settings className="w-4 h-4" /> Cài đặt tài khoản
                                 </button>
                                 <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2">
                                     <LogOut className="w-4 h-4" /> Đăng xuất
                                 </button>
                             </div>
                         </div>
                     )}
                 </div>
             ) : (
                 <div className="flex items-center gap-3">
                    <Button 
                        variant="secondary" 
                        onClick={onEnterStudio} 
                        className="px-6 py-2 text-xs h-10 font-bold shadow-lg hover:scale-105 active:scale-95 transition-all"
                    >
                        Truy cập Studio
                    </Button>
                 </div>
             )}
          </div>
       </div>
    </nav>
  );
};
