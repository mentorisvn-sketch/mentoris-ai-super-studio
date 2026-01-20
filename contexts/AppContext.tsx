import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '../utils/supabase/client';
import { User } from '../types';
import { toast } from 'sonner';

interface AppContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // SỬA: Đặt mặc định là null (không có ai đăng nhập)
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  // Hàm làm mới thông tin User (Lấy từ Supabase thật)
  const refreshUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        setUser(null);
        return;
      }

      // Lấy thông tin chi tiết từ bảng profiles
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      if (profile) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          full_name: profile.full_name || session.user.user_metadata?.full_name || 'User',
          avatar_url: profile.avatar_url || session.user.user_metadata?.avatar_url,
          credits: profile.credits || 0,
          is_admin: profile.is_admin || false // Nếu bạn có trường này
        });
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm Đăng xuất
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      toast.success('Đã đăng xuất thành công');
      // Chuyển hướng về trang chủ hoặc reload
      window.location.href = '/';
    } catch (error) {
      toast.error('Lỗi khi đăng xuất');
    }
  };

  // Tự động kiểm tra đăng nhập khi vào web
  useEffect(() => {
    refreshUser();

    // Lắng nghe sự kiện thay đổi đăng nhập/đăng xuất
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        refreshUser();
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AppContext.Provider value={{ user, setUser, isLoading, refreshUser, signOut }}>
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
