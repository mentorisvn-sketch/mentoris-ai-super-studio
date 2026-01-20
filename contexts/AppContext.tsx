import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '../utils/supabase/client';
import { User, DesignTab } from '../types';
import { toast } from 'sonner';
import { SupabaseClient } from '@supabase/supabase-js'; // Import thêm type này

interface AppContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
  
  // UI State
  viewMode: string;
  setViewMode: (mode: string) => void;
  activeStudioTab: DesignTab;
  setActiveStudioTab: (tab: DesignTab) => void;
  isPricingOpen: boolean;
  setPricingOpen: (open: boolean) => void;

  // Admin Data
  allUsers: User[];
  usageLogs: any[];

  // QUAN TRỌNG: Phải export supabase ra ngoài để AuthPage dùng
  supabase: SupabaseClient; 
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Khởi tạo Supabase Client ngay từ đầu
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // UI State
  const [viewMode, setViewMode] = useState('landing');
  const [activeStudioTab, setActiveStudioTab] = useState<DesignTab>('resources');
  const [isPricingOpen, setPricingOpen] = useState(false);
  
  // Admin State (Tạm thời)
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [usageLogs, setUsageLogs] = useState<any[]>([]);

  const refreshUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        setUser(null);
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: profile.full_name || session.user.user_metadata?.full_name || 'User',
          avatar: profile.avatar_url || session.user.user_metadata?.avatar_url || 'https://via.placeholder.com/150',
          credits: profile.credits || 0,
          role: profile.is_admin ? 'admin' : 'customer',
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
      setViewMode('landing');
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
      allUsers, usageLogs,
      supabase // ✅ Đã thêm vào đây để AuthPage dùng được
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
