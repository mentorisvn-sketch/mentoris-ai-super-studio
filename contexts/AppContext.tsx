import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, UsageLog } from '../types';
import { createClient } from '../utils/supabase/client';

interface AppContextType {
  user: User | null;
  isLoading: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  addUsageLog: (log: UsageLog) => void;
  syncCredits: (newBalance: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Khởi tạo client an toàn
  const supabase = createClient();

  // 1. Load User & Profile
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        // 🔥 FIX TREO: Đặt timeout, nếu sau 3s Supabase chưa trả lời thì tự tắt loading
        // Giúp người dùng không bao giờ bị kẹt ở màn hình trắng
        const timeOutId = setTimeout(() => {
            if (mounted) {
                console.warn("⚠️ Auth timeout: Force loading to false");
                setIsLoading(false);
            }
        }, 3000);

        // Lấy session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        clearTimeout(timeOutId); // Xóa timeout nếu lấy xong

        if (error) throw error;
        
        if (session?.user && mounted) {
           // Fetch profile (credits)
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
               totalUsage: profile?.total_usage || 0
           });
           
           localStorage.setItem('mentoris_current_user', JSON.stringify({ id: session.user.id }));
        }
      } catch (e: any) {
          // Bỏ qua các lỗi lock/abort rác để console đỡ báo đỏ
          const isIgnorable = e.message?.includes('Lock') || e.message?.includes('Abort');
          if (!isIgnorable) {
              console.error("Auth Init Error (Safe):", e);
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
            localStorage.removeItem('mentoris_current_user');
        } else if (event === 'SIGNED_IN' && session?.user) {
             const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
             setUser({
                 id: session.user.id,
                 email: session.user.email || '',
                 name: profile?.full_name || 'User',
                 credits: profile?.credits || 0,
                 role: profile?.role || 'customer',
                 avatar: profile?.avatar_url,
                 totalUsage: profile?.total_usage || 0
             });
        }
    });

    return () => {
        mounted = false;
        authListener.subscription.unsubscribe();
    };
  }, []);

  const addUsageLog = (log: UsageLog) => {
    console.log("Activity Logged:", log.action); 
  };

  const syncCredits = (newBalance: number) => {
      if (user) {
          setUser(prev => prev ? { ...prev, credits: newBalance } : null);
      }
  };

  return (
    <AppContext.Provider value={{ user, isLoading, setUser, addUsageLog, syncCredits }}>
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
