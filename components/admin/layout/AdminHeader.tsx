
import React, { useState, useEffect } from 'react';
import { Shield, ExternalLink, Activity, Menu } from 'lucide-react';
import { useApp } from '../../../contexts/AppContext';

export const AdminHeader = ({ activeTab, onToggleSidebar }: { activeTab: string, onToggleSidebar: () => void }) => {
    const { user, setViewMode, supabase } = useApp();
    const [healthStatus, setHealthStatus] = useState<'checking' | 'online' | 'slow' | 'offline'>('checking');
    const [latency, setLatency] = useState(0);

    const getTitle = () => {
        switch(activeTab) {
            case 'users': return 'User Management';
            case 'cost': return 'Cost & Logs';
            case 'docs': return 'System Documentation';
            default: return 'Dashboard';
        }
    };

    // System Ping Logic
    useEffect(() => {
        const checkHealth = async () => {
            const start = performance.now();
            try {
                // Ping Supabase with a lightweight HEAD request
                const { error } = await supabase.from('profiles').select('id', { count: 'exact', head: true });
                const end = performance.now();
                const diff = Math.round(end - start);
                
                setLatency(diff);
                if (error) {
                    setHealthStatus('offline');
                } else if (diff > 500) {
                    setHealthStatus('slow');
                } else {
                    setHealthStatus('online');
                }
            } catch (e) {
                setHealthStatus('offline');
            }
        };

        checkHealth();
        // Optional: Ping every 30s
        const interval = setInterval(checkHealth, 30000);
        return () => clearInterval(interval);
    }, [supabase]);

    return (
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 h-16 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3 md:gap-4">
             {/* Mobile Sidebar Toggle */}
             <button onClick={onToggleSidebar} className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100">
                 <Menu className="w-6 h-6 text-gray-700" />
             </button>

             <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="hidden md:inline">Hệ thống</span> <span className="hidden md:inline">/</span> <span className="font-bold text-black">{getTitle()}</span>
             </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
             {/* System Health Widget */}
             <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-200" title={`Latency: ${latency}ms`}>
                 <Activity className="w-3.5 h-3.5 text-gray-400" />
                 <span className="text-[10px] font-bold uppercase text-gray-500">Status:</span>
                 <div className="flex items-center gap-1.5">
                     <span className={`w-2 h-2 rounded-full ${
                         healthStatus === 'checking' ? 'bg-gray-400 animate-pulse' :
                         healthStatus === 'online' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 
                         healthStatus === 'slow' ? 'bg-yellow-500' : 'bg-red-500'
                     }`}></span>
                     <span className={`text-[10px] font-bold ${
                         healthStatus === 'online' ? 'text-green-700' : 
                         healthStatus === 'slow' ? 'text-yellow-700' : 
                         healthStatus === 'offline' ? 'text-red-700' : 'text-gray-500'
                     }`}>
                         {healthStatus === 'checking' ? 'Checking...' : 
                          healthStatus === 'online' ? 'Operational' : 
                          healthStatus === 'slow' ? 'High Latency' : 'Offline'}
                     </span>
                 </div>
             </div>

             <button 
                onClick={() => setViewMode('studio')}
                className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-gray-100 hover:bg-gray-200 text-black text-xs font-bold rounded-full transition-all border border-gray-200"
             >
                <span className="hidden sm:inline">Truy cập</span> Studio <ExternalLink className="w-3 h-3" />
             </button>
             
             <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-black">{user?.name || 'Administrator'}</p>
                <p className="text-[10px] text-gray-400 font-medium">Super Admin</p>
             </div>
             
             <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200 shadow-sm overflow-hidden">
                <img src={user?.avatar} alt="Admin" className="w-full h-full object-cover" />
             </div>
          </div>
        </header>
    );
}
