import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, UsageLog, GenConfig } from '../types';
import { createClient } from '../utils/supabase/client';
import { toast } from 'sonner';
import { MOCK_USERS, MOCK_LOGS } from '../constants'; // Import mock data nếu cần

interface AppContextType {
  user: User | null;
  isLoading: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  
  // 🔥 CÁC BIẾN BỊ THIẾU ĐÃ ĐƯỢC KHÔI PHỤC:
  viewMode: string;
  setViewMode: (mode: string) => void;
  activeStudioTab: string;
  setActiveStudioTab: (tab: string) => void;
  isPricingOpen: boolean;
  setPricingOpen: (open: boolean) => void;
  
  allUsers: User[]; // Dành cho Admin
  usageLogs: UsageLog[];
  logout: () => Promise<void>;
  
  addUsageLog: (log: UsageLog) => void;
  syncCredits: (newBalance: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  // 1. Core Auth State
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // 2. Navigation State (BỊ MẤT TRƯỚC ĐÂY)
  const [viewMode, setViewMode] = useState('landing'); // Mặc định là landing
  const [activeStudioTab, setActiveStudioTab] = useState('sketch');
  const [isPricingOpen, setPricingOpen] = useState(false);
  
  // 3. Admin Data (Mock hoặc Fetch)
  const [allUsers, setAllUsers] = useState<User[]>(MOCK_USERS || []);
  const [usageLogs, setUsageLogs] = useState<UsageLog[]>(MOCK_LOGS || []);

  const supabase = createClient();

  // --- AUTH INITIALIZATION (WITH TIMEOUT FIX) ---
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      // 🔥 FIX TREO: Timeout 2 giây, nếu Supabase kẹt thì ép vào Landing Page
      const timeOutId = setTimeout(() => {
          if (mounted && isLoading) {
              console.warn("⚠️ Auth timeout: Force app to load");
              setIsLoading(false);
          }
      }, 2000);

      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        clearTimeout(timeOutId); // Hủy timeout nếu lấy được session

        if (error) throw error;
        
        if (session?.user && mounted) {
           const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

           setUser({
               id: session.user.id,
               email: session.user.email || '',
               name: profile?.full_name || session.user.email?.split('@')[0] || 'User',
               credits: profile?.credits || 0,
               role: profile?.role || 'customer',
               avatar: profile?.avatar_url,
               totalUsage: profile?.total_usage || 0,
               permissions: profile?.permissions || []
           });
           
           // Nếu đã login, vào thẳng Studio (hoặc Landing tùy logic)
           // setViewMode('studio'); 
        }
      } catch (e: any) {
          // Bỏ qua lỗi lock rác
          if (!e.message?.includes('Lock') && !e.message?.includes('Abort')) {
              console.error("Auth Error:", e);
          }
      } finally {
          if (mounted) setIsLoading(false);
      }
    };

    initAuth();

    // Listen for Auth Changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!mounted) return;
        if (event === 'SIGNED_OUT') {
            setUser(null);
            setViewMode('landing'); // Về trang chủ khi logout
        } else if (event === 'SIGNED_IN' && session?.user) {
             const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
             setUser({
                 id: session.user.id,
                 email: session.user.email || '',
                 name: profile?.full_name || 'User',
                 credits: profile?.credits || 0,
                 role: profile?.role || 'customer',
                 avatar: profile?.avatar_url,
                 totalUsage: profile?.total_usage || 0,
                 permissions: profile?.permissions || []
             });
        }
    });

    return () => {
        mounted = false;
        authListener.subscription.unsubscribe();
    };
  }, []);

  // --- ACTIONS ---
  const logout = async () => {
      await supabase.auth.signOut();
      setUser(null);
      setViewMode('landing');
      toast.success("Đã đăng xuất");
  };

  const addUsageLog = (log: UsageLog) => {
      setUsageLogs(prev => [log, ...prev]);
  };

  const syncCredits = (newBalance: number) => {
      if (user) {
          setUser(prev => prev ? { ...prev, credits: newBalance } : null);
      }
  };

  return (
    <AppContext.Provider value={{ 
        user, isLoading, setUser, 
        viewMode, setViewMode,
        activeStudioTab, setActiveStudioTab,
        isPricingOpen, setPricingOpen,
        allUsers, usageLogs, logout,
        addUsageLog, syncCredits
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
