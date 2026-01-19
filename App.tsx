
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from './contexts/AppContext';
import { MOCK_USER } from './constants';
import { PricingModal } from './components/studio/Modals';
import { LandingNavbar } from './components/layout/LandingNavbar';
import { StudioSidebar } from './components/layout/StudioSidebar';
import { AuthPage } from './pages/AuthPage';
import { LandingPage } from './pages/LandingPage';
import { AdminDashboard } from './components/AdminDashboard';
import { UserProfilePage } from './components/user/UserProfilePage'; 
import { StaticPage } from './pages/StaticPage'; 
import { ResourcesView } from './components/studio/ResourcesView';
import { SketchStudio } from './components/studio/SketchStudio';
import { QuickDesignStudio } from './components/studio/QuickDesignStudio';
import { LookbookStudio } from './components/studio/LookbookStudio';
import { VirtualTryOnStudio } from './components/studio/VirtualTryOnStudio';
import { ConceptStudio } from './components/studio/ConceptStudio';
import { HistoryGallery } from './components/studio/HistoryGallery';
import { Calendar, CheckCircle2, Crown, Mail, User as UserIcon, Wallet, Image as ImageIcon, Zap, Clock, ShieldCheck, Settings, Menu } from 'lucide-react';
import { Toaster } from 'sonner';

const MainLayout = () => {
  const { 
    user, viewMode, setViewMode, 
    activeStudioTab, setActiveStudioTab, 
    isPricingOpen, setPricingOpen,
    allUsers, usageLogs, logout
  } = useApp();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  // NEW: State for Mobile Sidebar
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  const profileRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Calculate User Stats for the Profile Dropdown
  const userStats = useMemo(() => {
    if (!user) return { img1k: 0, img2k: 0, img4k: 0, total: 0 };
    return usageLogs
        .filter(log => log.userId === user.id)
        .reduce((acc, log) => {
            // Count total images (not just requests)
            const count = log.tokens.imageCount || 0;
            const res = log.resolution || '1K';
            
            acc.total += count;
            if (res === '1K') acc.img1k += count;
            else if (res === '2K') acc.img2k += count;
            else if (res === '4K') acc.img4k += count;
            
            return acc;
        }, { img1k: 0, img2k: 0, img4k: 0, total: 0 });
  }, [user, usageLogs]);

  // Derive activation date from ID (if timestamp based) or default to now
  const activationDate = useMemo(() => {
      if (!user) return new Date();
      // Try to parse timestamp from ID if it follows "user_123456789" format
      if (user.id.startsWith('user_')) {
          const ts = parseInt(user.id.split('_')[1]);
          if (!isNaN(ts)) return new Date(ts);
      }
      // Fallback for mock user
      return new Date('2024-01-01');
  }, [user]);

  // Helper to handle navigation logic based on auth status
  const handleStudioNavigation = async () => {
      if (user) {
          // Check/Prompt for API Key (Critical for 403 Permission Denied Fix)
          if ((window as any).aistudio) {
              try {
                  const hasKey = await (window as any).aistudio.hasSelectedApiKey();
                  if (!hasKey) {
                      await (window as any).aistudio.openSelectKey();
                      // Race condition mitigation: assume success and proceed
                  }
              } catch (e) {
                  console.error("API Key selection error:", e);
              }
          }
          setViewMode('studio');
      } else {
          setViewMode('auth');
      }
  };

  // REFACTORED: Add animate-slide-up class when tab is active
  const renderStudioContent = () => {
    return (
        <>
            <div className={`h-full w-full ${activeStudioTab === 'sketch' ? 'block animate-slide-up' : 'hidden'}`}>
                <SketchStudio />
            </div>
            <div className={`h-full w-full ${activeStudioTab === 'quick-design' ? 'block animate-slide-up' : 'hidden'}`}>
                <QuickDesignStudio />
            </div>
            <div className={`h-full w-full ${activeStudioTab === 'lookbook' ? 'block animate-slide-up' : 'hidden'}`}>
                <LookbookStudio />
            </div>
            <div className={`h-full w-full ${activeStudioTab === 'try-on' ? 'block animate-slide-up' : 'hidden'}`}>
                <VirtualTryOnStudio />
            </div>
            <div className={`h-full w-full ${activeStudioTab === 'concept-product' ? 'block animate-slide-up' : 'hidden'}`}>
                <ConceptStudio />
            </div>
            <div className={`h-full w-full ${activeStudioTab === 'resources' ? 'block animate-slide-up' : 'hidden'}`}>
                <ResourcesView />
            </div>
            <div className={`h-full w-full ${activeStudioTab === 'history' ? 'block animate-slide-up' : 'hidden'}`}>
                <HistoryGallery />
            </div>
        </>
    );
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      {/* GLOBAL TOASTER: Positioned top-center for best visibility on all devices */}
      <Toaster position="top-center" richColors closeButton />

      {/* LANDING */}
      {viewMode === 'landing' && (
          <>
            <LandingNavbar 
                user={user || MOCK_USER} 
                onUpgrade={() => setPricingOpen(true)} 
                onLogin={() => setViewMode('auth')}
                onEnterStudio={handleStudioNavigation}
            />
            <LandingPage 
                onNavigate={(tab) => {
                    setActiveStudioTab(tab);
                }}
                onEnterStudio={handleStudioNavigation}
            />
          </>
      )}

      {/* STATIC PAGES (NEW) */}
      {(viewMode === 'about' || viewMode === 'privacy' || viewMode === 'terms') && (
          <StaticPage type={viewMode} />
      )}

      {/* ADMIN */}
      {viewMode === 'admin' && user?.role === 'admin' && (
          <AdminDashboard 
             users={allUsers}
             onUpdateUser={(u) => console.log('Update', u)}
             usageLogs={usageLogs}
             onLogout={logout}
          />
      )}

      {/* USER SETTINGS */}
      {viewMode === 'settings' && user && (
          <UserProfilePage />
      )}

      {/* STUDIO */}
      {viewMode === 'studio' && (
          <div className="flex h-screen overflow-hidden bg-gray-50 relative">
             <StudioSidebar 
                activeTab={activeStudioTab}
                onTabChange={(tab) => { setActiveStudioTab(tab); setIsMobileSidebarOpen(false); }}
                onExitStudio={() => setViewMode('landing')}
                user={user}
                onGoToAdmin={() => setViewMode('admin')}
                onLogout={logout}
                // Mobile props
                isOpen={isMobileSidebarOpen}
                onClose={() => setIsMobileSidebarOpen(false)}
             />
             
             {/* Main Content */}
             <main className="flex-1 relative h-full overflow-hidden w-full lg:ml-32 transition-all duration-300"> 
                
                {/* Mobile Header Bar */}
                <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur border-b border-gray-100 z-30 sticky top-0">
                    <button onClick={() => setIsMobileSidebarOpen(true)} className="p-2 -ml-2 rounded-lg hover:bg-gray-100">
                        <Menu className="w-6 h-6 text-gray-700" />
                    </button>
                    <span className="font-bold text-sm uppercase tracking-wider">{activeStudioTab.replace('-', ' ')}</span>
                    <div className="w-8"></div> {/* Spacer for center alignment */}
                </div>

                {/* Floating User Info Widget (Responsive) */}
                <div className="absolute top-16 right-4 lg:top-6 lg:right-8 z-40 flex items-center gap-2 lg:gap-4 pointer-events-none">
                    <div className="bg-white/90 backdrop-blur-md border border-gray-200 rounded-full px-3 py-1 lg:px-4 lg:py-1.5 shadow-sm flex items-center gap-2 lg:gap-3 pointer-events-auto transition-transform hover:scale-105">
                        <div className="flex items-center gap-1.5">
                            <div className="p-1 bg-yellow-100 rounded-full text-yellow-600">
                                <Wallet className="w-3 h-3" />
                            </div>
                            <span className="text-[10px] lg:text-xs font-bold text-gray-500 uppercase tracking-wide hidden sm:inline">Credits</span>
                        </div>
                        <div className="h-3 w-px bg-gray-200"></div>
                        <span className="text-xs lg:text-sm font-black text-black">{user?.credits.toLocaleString()}</span>
                    </div>

                    <div className="relative pointer-events-auto group" ref={profileRef}>
                        <button 
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-white border-2 border-white shadow-md p-0.5 cursor-pointer hover:shadow-lg transition-all overflow-hidden active:scale-95"
                        >
                            <img src={user?.avatar} className="w-full h-full rounded-full object-cover" alt="User" />
                        </button>
                        
                        {/* Enhanced Profile Dropdown */}
                        {isProfileOpen && (
                            <div className="absolute top-full right-0 mt-2 w-72 lg:w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in duration-200 origin-top-right">
                                {/* Header */}
                                <div className="p-5 bg-black text-white relative overflow-hidden">
                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                                    <div className="relative z-10 flex items-center gap-3">
                                        <img src={user?.avatar} className="w-12 h-12 rounded-full border-2 border-white/20" alt="Avatar" />
                                        <div>
                                            <p className="font-bold text-lg leading-tight">{user?.name}</p>
                                            <p className="text-xs text-gray-400 truncate max-w-[180px]">{user?.email}</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                        <Clock className="w-3 h-3" />
                                        <span>Kích hoạt: {activationDate.toLocaleDateString('vi-VN')}</span>
                                    </div>
                                </div>

                                {/* Stats Grid */}
                                <div className="p-2">
                                    <div className="grid grid-cols-2 gap-2 p-2">
                                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                            <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                                                <Wallet className="w-3.5 h-3.5" />
                                                <span className="text-[10px] font-bold uppercase">Số dư Credit</span>
                                            </div>
                                            <p className="text-xl font-black text-black">{user?.credits.toLocaleString()}</p>
                                        </div>
                                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                            <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                                                <ImageIcon className="w-3.5 h-3.5" />
                                                <span className="text-[10px] font-bold uppercase">Tổng ảnh tạo</span>
                                            </div>
                                            <p className="text-xl font-black text-black">{userStats.total}</p>
                                        </div>
                                    </div>

                                    {/* Resolution Breakdown */}
                                    <div className="px-4 py-2">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Chi tiết sản lượng</p>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 bg-white border border-gray-200 rounded-lg p-2 text-center">
                                                <span className="block text-[10px] font-bold text-gray-500">Standard 1K</span>
                                                <span className="block text-sm font-black">{userStats.img1k}</span>
                                            </div>
                                            <div className="flex-1 bg-white border border-blue-100 rounded-lg p-2 text-center relative overflow-hidden">
                                                <div className="absolute top-0 left-0 w-full h-0.5 bg-blue-500"></div>
                                                <span className="block text-[10px] font-bold text-blue-600">HD 2K</span>
                                                <span className="block text-sm font-black">{userStats.img2k}</span>
                                            </div>
                                            <div className="flex-1 bg-white border border-purple-100 rounded-lg p-2 text-center relative overflow-hidden">
                                                <div className="absolute top-0 left-0 w-full h-0.5 bg-purple-500"></div>
                                                <span className="block text-[10px] font-bold text-purple-600">Cinema 4K</span>
                                                <span className="block text-sm font-black">{userStats.img4k}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="h-px bg-gray-100 mx-4 my-2"></div>
                                </div>

                                {/* Actions */}
                                <div className="p-3 bg-gray-50 border-t border-gray-100 flex flex-col gap-2">
                                    <button 
                                        onClick={() => { setViewMode('settings'); setIsProfileOpen(false); }} 
                                        className="w-full text-left py-2.5 px-4 text-xs font-bold text-gray-700 hover:bg-white hover:text-black rounded-xl flex items-center gap-2 transition-colors border border-transparent hover:border-gray-200 hover:shadow-sm"
                                    >
                                        <Settings className="w-3.5 h-3.5" /> Cài đặt tài khoản
                                    </button>
                                    <button 
                                        onClick={() => setPricingOpen(true)} 
                                        className="w-full text-center py-2.5 text-xs font-bold text-black bg-[#66E91E] hover:bg-[#5cd41b] rounded-xl flex items-center justify-center gap-2 shadow-sm transition-transform hover:-translate-y-0.5"
                                    >
                                        <Crown className="w-3.5 h-3.5" /> Mua thêm Credit
                                    </button>
                                    <button onClick={() => setViewMode('landing')} className="w-full text-center py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                                        Thoát Studio
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {renderStudioContent()}
             </main>
          </div>
      )}

      {/* AUTH */}
      {viewMode === 'auth' && (
          <AuthPage onBackToHome={() => setViewMode('landing')} />
      )}

      <PricingModal 
         isOpen={isPricingOpen} 
         onClose={() => setPricingOpen(false)} 
         onSelectPackage={(pkg) => console.log(pkg)} 
      />
    </div>
  );
};

export default MainLayout;
