import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UsageLog, Asset, CreditTransaction } from '../types';
import { MOCK_ASSETS, MOCK_USER } from '../constants';
import { createClient } from '../utils/supabase/client';
import { SupabaseClient } from '@supabase/supabase-js';

interface AppContextType {
  // User State (Supabase)
  user: User | null;
  loading: boolean;
  supabase: SupabaseClient;
  
  logout: () => Promise<void>;
  
  // Navigation State
  viewMode: 'landing' | 'auth' | 'studio' | 'admin' | 'settings' | 'about' | 'privacy' | 'terms';
  setViewMode: (mode: 'landing' | 'auth' | 'studio' | 'admin' | 'settings' | 'about' | 'privacy' | 'terms') => void;
  activeStudioTab: string;
  setActiveStudioTab: (tab: string) => void;

  // Data State
  assets: Asset[];
  usageLogs: UsageLog[];
  transactions: CreditTransaction[]; // New: Transaction History
  addUsageLog: (log: UsageLog, creditsToDeduct?: number) => void;
  
  // Admin (Legacy / Placeholder for now)
  allUsers: User[];
  addUser: (user: User) => void;
  updateUser: (id: string, data: Partial<User>) => void;

  // UI State
  isPricingOpen: boolean;
  setPricingOpen: (isOpen: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// MOCK TRANSACTIONS DATA
const MOCK_TRANSACTIONS: CreditTransaction[] = [
    { id: 'tx_1', userId: 'u1', amount: 2000, type: 'top_up', description: 'Nạp Credits gói Pro (Banking)', status: 'completed', timestamp: Date.now() - 86400000 * 2 },
    { id: 'tx_2', userId: 'u1', amount: -20, type: 'usage', description: 'Tạo Lookbook 4K (x1)', status: 'completed', timestamp: Date.now() - 3600000 },
    { id: 'tx_3', userId: 'u1', amount: -4, type: 'usage', description: 'Phác thảo Sketch (x1)', status: 'completed', timestamp: Date.now() - 1800000 },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const supabase = createClient();
  
  // -- Auth State --
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // -- App State --
  const [assets, setAssets] = useState<Asset[]>(MOCK_ASSETS);
  const [viewMode, setViewMode] = useState<'landing' | 'auth' | 'studio' | 'admin' | 'settings' | 'about' | 'privacy' | 'terms'>('landing');
  const [activeStudioTab, setActiveStudioTab] = useState('sketch');
  const [isPricingOpen, setPricingOpen] = useState(false);
  const [usageLogs, setUsageLogs] = useState<UsageLog[]>([]);
  const [transactions, setTransactions] = useState<CreditTransaction[]>(MOCK_TRANSACTIONS);
  
  // Placeholder for Admin lists until we connect Admin Dashboard to DB
  const [allUsers, setAllUsers] = useState<User[]>([]); 

  // Helper to get Env Var safely
  const getSupabaseUrl = () => {
      const meta = import.meta as any;
      return (meta.env && meta.env.VITE_SUPABASE_URL) ? meta.env.VITE_SUPABASE_URL : '';
  };

  // 1. SUPABASE AUTH LISTENER & FAIL-SAFE MODE
  useEffect(() => {
    const sbUrl = getSupabaseUrl();
    const isMockMode = !sbUrl || sbUrl.includes('placeholder');

    if (isMockMode) {
        console.warn("⚠️ SUPABASE KEYS MISSING: Running in Mock/Guest Mode.");
        // FAIL-SAFE: Automatically log in as Mock User to prevent UI block
        setUser(MOCK_USER); 
        setLoading(false);
        return;
    }

    const fetchProfile = async (sessionUser: any) => {
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', sessionUser.id)
          .single();

        if (error) {
          console.error("Profile fetch error:", error);
          return;
        }

        if (profile) {
          // Map DB columns to Frontend User Interface
          const mappedUser: User = {
            id: profile.id,
            email: profile.email || sessionUser.email,
            name: profile.full_name || sessionUser.email.split('@')[0],
            role: profile.role || 'customer',
            avatar: profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.email}`,
            credits: profile.credits || 0,
            subscriptionTier: profile.tier || 'free',
            isActive: profile.is_active ?? true,
            permissions: profile.role === 'admin' ? ['all'] : ['sketch', 'quick-design', 'lookbook', 'try-on', 'concept-product', 'resources', 'history'],
            usageStats: { totalImages: 0, totalSpend: 0 }
          };
          setUser(mappedUser);
          
          // Auto-redirect to studio if on Auth page
          if (viewMode === 'auth') setViewMode('studio');
        }
      } catch (err) {
        console.error("Auth Error:", err);
      } finally {
        setLoading(false);
      }
    };

    // Check active session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfile(session.user);
      } else {
        setUser(null);
        setViewMode('landing');
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [viewMode]);


  // 2. LOGOUT
  const logout = async () => {
    const sbUrl = getSupabaseUrl();
    if (sbUrl && !sbUrl.includes('placeholder')) {
        await supabase.auth.signOut();
    }
    setUser(null);
    setViewMode('landing');
  };

  // 3. CREDIT MANAGEMENT (Optimistic UI + RPC Call)
  const addUsageLog = async (log: UsageLog, creditsToDeduct: number = 0) => {
    setUsageLogs(prev => [log, ...prev]);

    // Optimistic Update
    if (user && creditsToDeduct > 0) {
       setUser(prev => prev ? { ...prev, credits: Math.max(0, prev.credits - creditsToDeduct) } : null);
       
       // Log to history locally as well for immediate UI update in settings
       setTransactions(prev => [{
           id: `tx_${Date.now()}`,
           userId: user.id,
           amount: -creditsToDeduct,
           type: 'usage',
           description: log.action,
           status: 'completed',
           timestamp: Date.now()
       }, ...prev]);

       const sbUrl = getSupabaseUrl();
       if (!sbUrl || sbUrl.includes('placeholder')) {
           return;
       }

       // Real DB Update
       const { error } = await supabase.rpc('deduct_credits', {
          p_user_id: user.id,
          p_amount: creditsToDeduct,
          p_description: log.action
       });

       if (error) {
         console.error("Failed to deduct credits on server:", error);
       }
    }
  };

  // Admin Placeholders
  const addUser = (u: User) => setAllUsers(prev => [...prev, u]);
  const updateUser = (id: string, data: Partial<User>) => {
      // Local update for immediate feedback
      if (user && user.id === id) {
          setUser({ ...user, ...data });
      }
  };

  return (
    <AppContext.Provider value={{
      user, loading, supabase, logout,
      viewMode, setViewMode, activeStudioTab, setActiveStudioTab,
      assets, usageLogs, transactions, addUsageLog,
      allUsers, addUser, updateUser,
      isPricingOpen, setPricingOpen
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};