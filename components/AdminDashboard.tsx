import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { Users, DollarSign, TrendingUp, Activity, Search, Plus, ShieldAlert, ChevronLeft, Save } from 'lucide-react';
import { User } from '../types';
import { toast } from 'sonner';

export const AdminDashboard = () => {
  const { supabase, setViewMode } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'finance'>('overview');
  
  // -- REAL DATA STATE --
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // -- KPI STATE --
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRevenue: 0, // Tính từ total_paid
    activeUsers: 0,
    totalUsage: 0    // Tính từ total_usage
  });

  // -- MODAL STATE --
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState(1000);
  const [topUpNote, setTopUpNote] = useState('Admin Top-up');

  // 1. FETCH DATA TỪ DATABASE
  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // Lấy danh sách từ bảng profiles
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        // Map dữ liệu
        const formattedUsers: User[] = data.map((u: any) => ({
          id: u.id,
          email: u.email || '',
          name: u.full_name || 'No Name',
          role: u.role || 'customer',
          avatar: u.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.email}`,
          credits: u.credits || 0,
          subscriptionTier: u.tier || 'free',
          isActive: u.is_active,
          permissions: [],
          phone: u.phone,
          totalUsage: u.total_usage || 0,
          totalPaid: u.total_paid || 0,
          lastSeen: u.last_seen,
          allowedResolutions: u.allowed_resolutions || ['1K']
        }));

        setUsers(formattedUsers);

        // Tính KPI
        setStats({
          totalUsers: formattedUsers.length,
          totalRevenue: formattedUsers.reduce((sum, u) => sum + (u.totalPaid || 0), 0),
          activeUsers: formattedUsers.filter(u => u.isActive).length,
          totalUsage: formattedUsers.reduce((sum, u) => sum + (u.totalUsage || 0), 0)
        });
      }
    } catch (error: any) {
      toast.error('Lỗi tải dữ liệu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // 2. LOGIC CẤP TIỀN (TOP UP) & GHI NHẬN DOANH THU
  const handleTopUp = async () => {
    if (!selectedUser) return;

    try {
      // Vì đây là CỘNG tiền (không phải trừ khi dùng), ta update trực tiếp
      // Đồng thời cộng vào total_paid (doanh thu) nếu muốn tính đây là tiền nạp
      const { error } = await supabase.from('profiles').update({
        credits: selectedUser.credits + topUpAmount,
        total_paid: (selectedUser.totalPaid || 0) + topUpAmount // Giả sử 1 credit = 1 VND/USD để track doanh thu
      }).eq('id', selectedUser.id);

      if (error) throw error;

      // Ghi log giao dịch
      await supabase.from('credit_transactions').insert({
        user_id: selectedUser.id,
        amount: topUpAmount,
        action_type: 'ADMIN_TOPUP',
        description: topUpNote
      });

      toast.success(`Đã nạp ${topUpAmount} credits cho ${selectedUser.name}`);
      setIsTopUpOpen(false);
      fetchAdminData(); // Refresh lại bảng
    } catch (error: any) {
      toast.error('Lỗi cấp tiền: ' + error.message);
    }
  };

  // 3. LOGIC KHÓA TÀI KHOẢN
  const toggleUserStatus = async (targetUser: User) => {
    try {
      const newStatus = !targetUser.isActive;
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: newStatus })
        .eq('id', targetUser.id);

      if (error) throw error;
      
      toast.success(`Đã ${newStatus ? 'mở khóa' : 'khóa'} tài khoản ${targetUser.email}`);
      // Cập nhật UI ngay lập tức
      setUsers(users.map(u => u.id === targetUser.id ? { ...u, isActive: newStatus } : u));
    } catch (error: any) {
      toast.error('Lỗi cập nhật: ' + error.message);
    }
  };

  // --- RENDER UI (GIỮ NGUYÊN STYLE) ---
  return (
    <div className="min-h-screen bg-black text-white flex font-sans">
      {/* SIDEBAR ADMIN */}
      <div className="w-64 border-r border-[#333] bg-[#111] flex flex-col p-4 shrink-0">
        <div className="flex items-center gap-3 mb-8 px-2">
            <div className="w-8 h-8 bg-[#66E91E] rounded-lg flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-black" />
            </div>
            <span className="font-bold text-lg tracking-tight">ADMIN CORE</span>
        </div>
        
        <nav className="space-y-1 flex-1">
            {[
                { id: 'overview', icon: Activity, label: 'Tổng Quan' },
                { id: 'users', icon: Users, label: 'Người Dùng' },
                { id: 'finance', icon: DollarSign, label: 'Doanh Thu & CP' },
            ].map((item) => (
                <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        activeTab === item.id 
                        ? 'bg-[#222] text-[#66E91E]' 
                        : 'text-gray-400 hover:text-white hover:bg-[#222]'
                    }`}
                >
                    <item.icon className="w-4 h-4" /> {item.label}
                </button>
            ))}
        </nav>

        <button 
            onClick={() => setViewMode('studio')}
            className="mt-auto flex items-center gap-2 text-gray-400 hover:text-white px-4 py-3 border-t border-[#333] pt-6"
        >
            <ChevronLeft className="w-4 h-4" /> Về Studio
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-8 overflow-y-auto h-screen">
        
        {/* HEADER KPI */}
        {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-in fade-in slide-in-from-bottom-4">
                <KpiCard title="Tổng User" value={stats.totalUsers} icon={Users} color="text-blue-400" />
                <KpiCard title="Tổng Doanh Thu" value={stats.totalRevenue.toLocaleString()} icon={DollarSign} color="text-[#66E91E]" />
                <KpiCard title="User Active" value={stats.activeUsers} icon={Activity} color="text-yellow-400" />
                <KpiCard title="Credits Đã Dùng" value={stats.totalUsage.toLocaleString()} icon={TrendingUp} color="text-purple-400" />
            </div>
        )}

        {/* TAB: QUẢN LÝ USER */}
        {(activeTab === 'users' || activeTab === 'overview') && (
            <div className="bg-[#111] border border-[#333] rounded-2xl p-6 shadow-xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                    <div>
                        <h2 className="text-xl font-bold">Danh Sách Người Dùng</h2>
                        <p className="text-xs text-gray-500 mt-1">Quản lý trạng thái và số dư tài khoản</p>
                    </div>
                    <div className="flex gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                            <input 
                                type="text" 
                                placeholder="Tìm email, tên..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-[#222] border border-[#333] rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:ring-1 focus:ring-[#66E91E] w-64 outline-none transition-all"
                            />
                        </div>
                        <button onClick={fetchAdminData} className="px-4 py-2 bg-[#222] hover:bg-[#333] border border-[#333] rounded-lg text-sm font-bold transition-colors">
                            Refresh
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-[#333]">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-[#1a1a1a]">
                            <tr className="text-xs text-gray-500 uppercase">
                                <th className="py-3 pl-4 font-bold">User</th>
                                <th className="py-3 font-bold">Role</th>
                                <th className="py-3 font-bold">Credits</th>
                                <th className="py-3 font-bold">Đã Dùng</th>
                                <th className="py-3 font-bold">Doanh Thu</th>
                                <th className="py-3 font-bold">Status</th>
                                <th className="py-3 pr-4 text-right font-bold">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-[#222]">
                            {loading ? (
                                <tr><td colSpan={7} className="py-8 text-center text-gray-500">Đang tải dữ liệu...</td></tr>
                            ) : users.filter(u => u.email.toLowerCase().includes(searchTerm.toLowerCase()) || u.name.toLowerCase().includes(searchTerm.toLowerCase())).map((u) => (
                                <tr key={u.id} className="hover:bg-[#1a1a1a] transition-colors group">
                                    <td className="py-4 pl-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-gray-800 overflow-hidden border border-[#333]">
                                                <img src={u.avatar} alt="avt" className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-white text-sm">{u.name}</div>
                                                <div className="text-xs text-gray-500">{u.email}</div>
                                                {u.phone && <div className="text-[10px] text-blue-400">{u.phone}</div>}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${u.role === 'admin' ? 'bg-purple-900/30 text-purple-400 border-purple-900/50' : 'bg-gray-800 text-gray-400 border-gray-700'}`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="font-mono text-[#66E91E] font-bold">{u.credits.toLocaleString()}</td>
                                    <td className="text-gray-400 font-mono">{u.totalUsage.toLocaleString()}</td>
                                    <td className="text-yellow-500 font-mono font-bold">${u.totalPaid.toLocaleString()}</td>
                                    <td>
                                        <button 
                                            onClick={() => toggleUserStatus(u)} 
                                            className={`w-2.5 h-2.5 rounded-full transition-all hover:scale-125 ${u.isActive ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`} 
                                            title={u.isActive ? "Đang hoạt động (Click để khóa)" : "Đã khóa (Click để mở)"} 
                                        />
                                    </td>
                                    <td className="py-4 pr-4 text-right">
                                        <button 
                                            onClick={() => { setSelectedUser(u); setIsTopUpOpen(true); }}
                                            className="px-3 py-1.5 bg-[#222] hover:bg-[#333] hover:text-[#66E91E] rounded-lg text-xs font-bold flex items-center gap-1 border border-[#333] ml-auto transition-all"
                                        >
                                            <Plus className="w-3 h-3" /> Nạp
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* TAB: FINANCE (KIỂM SOÁT CHI PHÍ) */}
        {activeTab === 'finance' && (
            <div className="bg-[#111] border border-[#333] rounded-2xl p-6 animate-in fade-in">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                        <DollarSign className="w-6 h-6 text-yellow-500" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">Kiểm Soát Chi Phí API</h2>
                        <p className="text-sm text-gray-400">Ước tính chi phí thực tế phải trả cho Google/OpenAI</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Bảng tính chi phí */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-4 bg-[#222] rounded-xl border border-[#333]">
                            <span className="text-gray-400">Tổng ảnh đã tạo (Usage)</span>
                            <span className="font-bold text-xl">{stats.totalUsage.toLocaleString()} ảnh</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-[#222] rounded-xl border border-[#333]">
                            <span className="text-gray-400">Chi phí trung bình/ảnh</span>
                            <span className="font-mono text-white">$0.002</span>
                        </div>
                         <div className="flex justify-between items-center p-4 bg-red-900/10 rounded-xl border border-red-900/30">
                            <span className="text-red-400 font-bold uppercase">Tổng Chi Phí Server (Est)</span>
                            <span className="font-mono text-2xl text-red-400">${(stats.totalUsage * 0.002).toFixed(2)}</span>
                        </div>
                        
                        <div className="flex justify-between items-center p-4 bg-green-900/10 rounded-xl border border-green-900/30 mt-4">
                            <span className="text-green-400 font-bold uppercase">Doanh Thu Nạp Credits</span>
                            <span className="font-mono text-2xl text-green-400">${stats.totalRevenue.toLocaleString()}</span>
                        </div>

                         <div className="flex justify-between items-center p-4 bg-[#1a1a1a] rounded-xl border border-[#333] mt-2">
                            <span className="text-gray-400 font-bold uppercase">Lợi Nhuận (Profit)</span>
                            <span className={`font-mono text-2xl font-bold ${(stats.totalRevenue - stats.totalUsage * 0.002) >= 0 ? 'text-[#66E91E]' : 'text-red-500'}`}>
                                ${(stats.totalRevenue - stats.totalUsage * 0.002).toFixed(2)}
                            </span>
                        </div>
                    </div>

                    {/* Khu vực Biểu đồ (Placeholder) */}
                    <div className="bg-[#1a1a1a] rounded-xl flex flex-col items-center justify-center border border-[#333] border-dashed min-h-[200px] p-6 text-center">
                        <TrendingUp className="w-10 h-10 text-gray-600 mb-3" />
                        <p className="text-gray-400 font-bold">Biểu đồ tăng trưởng</p>
                        <p className="text-xs text-gray-600 mt-1">Dữ liệu sẽ hiển thị khi có nhiều logs hơn</p>
                    </div>
                </div>
            </div>
        )}
      </div>

      {/* MODAL CẤP TIỀN */}
      {isTopUpOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-[#1a1a1a] border border-[#333] rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
                <button onClick={() => setIsTopUpOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white">✕</button>
                
                <h3 className="text-xl font-bold mb-1 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-[#66E91E]" /> Cấp Credits
                </h3>
                <p className="text-sm text-gray-400 mb-6 border-b border-[#333] pb-4">
                    Nạp tiền cho: <span className="text-white font-bold ml-1">{selectedUser.email}</span>
                </p>

                <div className="grid grid-cols-3 gap-3 mb-6">
                    {[100, 500, 1000, 5000, 10000, 50000].map(amount => (
                        <button 
                            key={amount}
                            onClick={() => setTopUpAmount(amount)}
                            className={`py-3 rounded-xl font-bold border transition-all ${topUpAmount === amount ? 'bg-white text-black border-white shadow-lg scale-105' : 'bg-[#222] text-gray-400 border-[#333] hover:border-gray-500'}`}
                        >
                            +{amount.toLocaleString()}
                        </button>
                    ))}
                </div>

                <div className="space-y-4 mb-6">
                    <div>
                        <label className="text-xs text-gray-500 uppercase font-bold mb-2 block">Số lượng tùy chỉnh</label>
                        <input 
                            type="number" 
                            value={topUpAmount}
                            onChange={(e) => setTopUpAmount(Number(e.target.value))}
                            className="w-full bg-black border border-[#333] rounded-xl px-4 py-3 text-white font-mono focus:border-[#66E91E] outline-none transition-colors"
                        />
                    </div>
                    <div>
                         <label className="text-xs text-gray-500 uppercase font-bold mb-2 block">Ghi chú giao dịch</label>
                         <input 
                            type="text" 
                            value={topUpNote}
                            onChange={(e) => setTopUpNote(e.target.value)}
                            className="w-full bg-black border border-[#333] rounded-xl px-4 py-3 text-white text-sm focus:border-[#66E91E] outline-none transition-colors"
                            placeholder="Lý do nạp..."
                        />
                    </div>
                </div>

                <div className="flex gap-3">
                    <button onClick={() => setIsTopUpOpen(false)} className="flex-1 py-3 bg-[#333] hover:bg-[#444] rounded-xl font-bold text-gray-300 transition-colors">Hủy</button>
                    <button onClick={handleTopUp} className="flex-1 py-3 bg-[#66E91E] hover:bg-[#52c415] rounded-xl font-bold text-black flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(102,233,30,0.4)] transition-all">
                        <Save className="w-4 h-4" /> Xác Nhận Nạp
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

// Component thẻ KPI nhỏ
const KpiCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-[#111] border border-[#333] p-5 rounded-2xl flex items-center justify-between hover:border-gray-600 transition-colors shadow-lg">
        <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">{title}</p>
            <h3 className={`text-2xl font-black ${color}`}>{value}</h3>
        </div>
        <div className={`p-3 rounded-xl bg-[#1a1a1a] border border-[#333] ${color.replace('text-', 'text-opacity-100 text-')}`}>
            <Icon className="w-6 h-6" />
        </div>
    </div>
);

export default AdminDashboard;
