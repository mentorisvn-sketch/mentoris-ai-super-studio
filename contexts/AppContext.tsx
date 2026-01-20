import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '../utils/supabase/client';
import { User, DesignTab } from '../types'; // Import thêm DesignTab
import { toast } from 'sonner';

// Định nghĩa đầy đủ Context để App.tsx không bị lỗi
interface AppContextType {
  // Auth State
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>; // Đổi tên từ signOut thành logout cho khớp App.tsx

  // UI State (Quan trọng: Thiếu cái này là trắng trang)
  viewMode: string; 
  setViewMode: (mode: string) => void;
  activeStudioTab: DesignTab;
  setActiveStudioTab: (tab: DesignTab) => void;
  isPricingOpen: boolean;
  setPricingOpen: (open: boolean) => void;

  // Admin Data (Giữ khung để không lỗi Admin Dashboard)
  allUsers: User[];
  usageLogs: any[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // 1. AUTH STATE
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // 2. UI STATE (Khôi phục lại các biến này)
  const [viewMode, setViewMode] = useState('landing');
  const [activeStudioTab, setActiveStudioTab] = useState<DesignTab>('resources');
  const [isPricingOpen, setPricingOpen] = useState(false);
  
  // 3. ADMIN STATE (Tạm thời để rỗng để tránh lỗi)
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [usageLogs, setUsageLogs] = useState<any[]>([]);

  const supabase = createClient();

  // Hàm làm mới User (Mapping dữ liệu chuẩn từ DB sang Code)
  const refreshUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        setUser(null);
        return;
      }

      // Lấy profile từ Supabase
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        // MAPPING QUAN TRỌNG: Chuyển tên cột DB sang tên biến trong Code
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          // DB là full_name -> Code là name
          name: profile.full_name || session.user.user_metadata?.full_name || 'User',
          // DB là avatar_url -> Code là avatar
          avatar: profile.avatar_url || session.user.user_metadata?.avatar_url || 'https://via.placeholder.com/150',
          credits: profile.credits || 0,
          // DB là is_admin (bool) -> Code là role (string)
          role: profile.is_admin ? 'admin' : 'customer',
          
          // Các trường mặc định (để không bị lỗi Type)
          subscriptionTier: 'free',
          isActive: true,
          permissions: [],
          allowedResolutions: ['1K']
        });
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setViewMode('landing'); // Về trang chủ khi đăng xuất
      toast.success('Đã đăng xuất');
    } catch (error) {
      toast.error('Lỗi khi đăng xuất');
    }
  };

  useEffect(() => {
    refreshUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        refreshUser();
      } else {
        setUser(null);
        setIsLoading(false);
        setViewMode('landing');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AppContext.Provider value={{ 
      user, setUser, isLoading, refreshUser, logout,
      viewMode, setViewMode,
      activeStudioTab, setActiveStudioTab,
      isPricingOpen, setPricingOpen,
      allUsers, usageLogs
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
