import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '../utils/supabase/client';
import { User, DesignTab, CreditTransaction, Asset, UsageLog } from '../types';
import { toast } from 'sonner';
import { SupabaseClient } from '@supabase/supabase-js';
// Import giá mặc định để đề phòng trường hợp mất mạng không lấy được tỷ giá live
import { EXCHANGE_RATE as DEFAULT_EXCHANGE_RATE } from '../constants'; 

// Dữ liệu mẫu an toàn cho Assets
const DEFAULT_ASSETS: Asset[] = [
  { id: '1', name: 'Áo Thun Cơ Bản', url: 'https://via.placeholder.com/300', type: 'base' }
];

interface AppContextType {
  // 1. Auth & User State
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
  supabase: SupabaseClient;

  // 2. UI State
  viewMode: string;
  setViewMode: (mode: string) => void;
  activeStudioTab: DesignTab;
  setActiveStudioTab: (tab: DesignTab) => void;
  isPricingOpen: boolean;
  setPricingOpen: (open: boolean) => void;

  // 3. Data State
  assets: Asset[];
  usageLogs: UsageLog[];
  transactions: CreditTransaction[];
  addUsageLog: (log: UsageLog, creditsToDeduct?: number) => void;
  
  // 4. Admin Data & System Info
  allUsers: User[];
  exchangeRate: number; // 🔥 BIẾN MỚI: Tỷ giá USD/VND động
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();

  // -- AUTH STATE --
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // -- UI STATE --
  const [viewMode, setViewMode] = useState('landing');
  const [activeStudioTab, setActiveStudioTab] = useState<DesignTab>('resources');
  const [isPricingOpen, setPricingOpen] = useState(false);

  // -- DATA STATE --
  const [assets, setAssets] = useState<Asset[]>(DEFAULT_ASSETS);
  const [usageLogs, setUsageLogs] = useState<UsageLog[]>([]);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  // 🔥 STATE TỶ GIÁ: Khởi tạo bằng giá mặc định (25450), sau đó sẽ tự update
  const [exchangeRate, setExchangeRate] = useState<number>(DEFAULT_EXCHANGE_RATE || 25450);

  // 🟢 HÀM LẤY TỶ GIÁ TỰ ĐỘNG (USD -> VND) TỪ API MIỄN PHÍ
  const fetchExchangeRate = async () => {
    try {
      // Gọi API Open Exchange Rates (Miễn phí, không cần key)
      const res = await fetch('https://open.er-api.com/v6/latest/USD');
      const data = await res.json();
      
      if (data && data.rates && data.rates.VND) {
        const rate = data.rates.VND;
        setExchangeRate(rate);
        // console.log('✅ Đã cập nhật tỷ giá USD/VND:', rate);
      }
    } catch (error) {
      console.warn('⚠️ Lỗi lấy tỷ giá thực tế, đang dùng tỷ giá mặc định:', DEFAULT_EXCHANGE_RATE);
    }
  };

  // 🟢 HÀM REFRESH USER
  const refreshUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        setUser(null);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        const isAdmin = profile.role === 'admin';
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: profile.full_name || session.user.user_metadata?.full_name || 'User',
          avatar: profile.avatar_url || session.user.user_metadata?.avatar_url || 'https://via.placeholder.com/150',
          role: profile.role || 'customer',
          credits: profile.credits || 0,
          subscriptionTier: profile.tier || 'free',
          isActive: profile.is_active ?? true,
          permissions: isAdmin 
            ? ['all'] 
            : ['sketch', 'quick-design', 'lookbook', 'try-on', 'concept-product', 'resources', 'history'],
          phone: profile.phone || '',
          allowedResolutions: profile.allowed_resolutions || ['1K'],
          totalUsage: profile.total_usage || 0,
          totalPaid: profile.total_paid || 0,
          lastSeen: profile.last_seen || new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 🟢 HÀM LOGOUT
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

  // 🟢 HÀM TRỪ TIỀN & GHI LOG
  const addUsageLog = async (log: UsageLog, creditsToDeduct: number = 0) => {
    setUsageLogs(prev => [log, ...prev]);
    
    if (user && creditsToDeduct > 0) {
      setUser(prev => prev ? { 
        ...prev, 
        credits: Math.max(0, prev.credits - creditsToDeduct),
        totalUsage: (prev.totalUsage || 0) + creditsToDeduct 
      } : null);
    }

    if (creditsToDeduct > 0 && user) {
       const { error } = await supabase.rpc('deduct_credits', {
          p_user_id: user.id,
          p_amount: creditsToDeduct,
          p_description: log.action
       });
       if (error) console.error("❌ Lỗi trừ tiền DB:", error);
    }
  };

  useEffect(() => {
    refreshUser();
    fetchExchangeRate(); // 🔥 Gọi hàm lấy tỷ giá ngay khi vào Web
    
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
      user, setUser, isLoading, refreshUser, logout, supabase,
      viewMode, setViewMode, activeStudioTab, setActiveStudioTab,
      isPricingOpen, setPricingOpen,
      assets, usageLogs, transactions, addUsageLog,
      allUsers,
      exchangeRate // 🔥 Xuất biến tỷ giá ra để AdminDashboard dùng
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
