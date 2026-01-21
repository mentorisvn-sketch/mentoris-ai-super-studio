import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, UsageLog } from '../types';
import { createClient } from '../utils/supabase/client';
import { toast } from 'sonner';

interface AppContextType {
  user: User | null;
  isLoading: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  addUsageLog: (log: UsageLog) => void; // Không cần tham số creditsToDeduct nữa
  syncCredits: (newBalance: number) => void; // 🔥 Hàm mới: Đồng bộ tiền từ Server
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  // 1. Load User & Profile
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
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
           
           // Lưu cache nhẹ để dùng ở nơi khác nếu cần
           localStorage.setItem('mentoris_current_user', JSON.stringify({ id: session.user.id }));
        }
      } catch (e) {
          console.error("Auth Init Error:", e);
      } finally {
          setIsLoading(false);
      }
    };

    initAuth();

    // Listen for Auth Changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_OUT') {
            setUser(null);
            localStorage.removeItem('mentoris_current_user');
        } else if (event === 'SIGNED_IN' && session?.user) {
             // Reload profile khi login
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
        authListener.subscription.unsubscribe();
    };
  }, []);

  // 2. Hàm thêm Log (Chỉ hiển thị UI, không trừ tiền DB)
  const addUsageLog = (log: UsageLog) => {
    // Chỉ cập nhật thống kê cục bộ nếu cần thiết
    // Thực tế Server đã lưu log vào bảng 'generations' rồi
    console.log("Activity Logged:", log.action); 
  };

  // 3. Hàm đồng bộ số dư (Gọi khi API trả về số dư mới)
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
