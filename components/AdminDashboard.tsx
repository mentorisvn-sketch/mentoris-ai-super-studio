
import React, { useState, useEffect } from 'react';
import { User, UsageLog } from '../types';
import { AdminSidebar } from './admin/layout/AdminSidebar';
import { AdminHeader } from './admin/layout/AdminHeader';
import { DashboardKPIs } from './admin/dashboard/DashboardKPIs';
import { UserList } from './admin/users/UserList';
import { CostOverview } from './admin/finance/CostOverview';
import { DocsView } from './admin/docs/DocsView';
import { useApp } from '../contexts/AppContext';
import { Loader2, ShieldAlert } from 'lucide-react';

export const AdminDashboard = ({ 
  // Props are deprecated in favor of internal fetching, keeping for compatibility if needed
  users: initialUsers, 
  onUpdateUser, 
  usageLogs: initialLogs, 
  onLogout 
}: { 
  users: User[], 
  onUpdateUser: (u: User) => void, 
  usageLogs: UsageLog[],
  onLogout: () => void 
}) => {
  const { user, supabase } = useApp();
  const [activeTab, setActiveTab] = useState<'users' | 'cost' | 'docs'>('users');
  const [stats, setStats] = useState({
      totalUsers: 0,
      totalCost: 0,
      totalTokens: 0,
      totalImages: 0
  });
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 1. SECURITY CHECK
  if (!user || user.role !== 'admin') {
      return (
          <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center p-6">
              <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
              <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
              <p className="text-gray-500 mt-2">Bạn không có quyền truy cập trang quản trị này.</p>
              <button onClick={onLogout} className="mt-6 px-6 py-2 bg-black text-white rounded-full text-sm font-bold">Quay lại trang chủ</button>
          </div>
      );
  }

  // 2. FETCH REAL DASHBOARD STATS
  useEffect(() => {
      const fetchStats = async () => {
          setLoading(true);
          try {
              // A. Count Users
              const { count: userCount, error: userError } = await supabase
                  .from('profiles')
                  .select('*', { count: 'exact', head: true });

              // B. Count Images
              const { count: imgCount, error: imgError } = await supabase
                  .from('generations')
                  .select('*', { count: 'exact', head: true });

              // C. Sum Cost/Tokens (Note: In production, use an RPC function like 'get_admin_stats' for performance)
              // For now, we fetch the last 1000 generations to estimate or calculate client-side for "Dev Mode" to "Real" transition
              // Assuming 'generations' has 'cost' column.
              const { data: genData } = await supabase
                  .from('generations')
                  .select('cost')
                  .limit(1000); // Limit for performance safety

              const totalEstCost = genData ? genData.reduce((acc, curr) => acc + (curr.cost || 0), 0) : 0;
              
              setStats({
                  totalUsers: userCount || 0,
                  totalImages: imgCount || 0,
                  totalCost: totalEstCost, // Real accumulated cost from history
                  totalTokens: (imgCount || 0) * 8000 // Estimation if token column missing: ~8k tokens per image avg
              });

          } catch (error) {
              console.error("Dashboard Stats Error:", error);
          } finally {
              setLoading(false);
          }
      };

      fetchStats();
  }, [supabase]);

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-black relative">
      <AdminSidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => { setActiveTab(tab); setIsSidebarOpen(false); }} 
        onLogout={onLogout} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <main className="flex-1 w-full lg:ml-64 overflow-y-auto min-h-screen">
        <AdminHeader 
            activeTab={activeTab} 
            onToggleSidebar={() => setIsSidebarOpen(true)}
        />

        <div className="p-4 md:p-8">
          {activeTab !== 'docs' && (
              <DashboardKPIs 
                totalUsers={stats.totalUsers} 
                totalCost={stats.totalCost} 
                totalTokens={stats.totalTokens} 
                totalImages={stats.totalImages} 
                isLoading={loading}
              />
          )}

          {activeTab === 'users' && <UserList users={[]} usageLogs={[]} />} 
          
          {activeTab === 'cost' && <CostOverview usageLogs={[]} />} 
          
          {activeTab === 'docs' && <DocsView />}
        </div>
      </main>
    </div>
  );
};
