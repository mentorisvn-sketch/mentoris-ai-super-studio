import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { 
  Users, DollarSign, TrendingUp, Activity, Search, Plus, ShieldAlert, 
  ChevronLeft, Save, CreditCard, Edit3, Phone, CheckCircle, XCircle,
  Lock, Unlock, Layers, Image as ImageIcon, Video, Scissors, Aperture
} from 'lucide-react';
import { User } from '../types';
import { toast } from 'sonner';
import { TOPUP_PACKAGES } from '../constants';

// =============================================================================
// 1. CẤU HÌNH DANH SÁCH QUYỀN HẠN (CONSTANTS)
// =============================================================================

// Danh sách các tính năng có thể Bật/Tắt
const FEATURE_LIST = [
    { id: 'sketch', label: 'Phác Thảo (Sketch)', icon: Edit3 },
    { id: 'quick-design', label: 'Quick Design', icon: Layers },
    { id: 'lookbook', label: 'Lookbook Pro', icon: ImageIcon },
    { id: 'try-on', label: 'Thử Đồ (VTON)', icon: Scissors },
    { id: 'concept-product', label: 'Concept Studio', icon: Aperture },
];

// Danh sách độ phân giải có thể cấp phép
const RESOLUTION_LIST = ['1K', '2K', '4K'];

// =============================================================================
// 2. SUB-COMPONENTS: MODALS (CỬA SỔ POPUP)
// =============================================================================

// --- 2.1. MODAL NẠP TIỀN (TOP UP) ---
const TopUpModal = ({ user, isOpen, onClose, onSuccess }: any) => {
    const { supabase } = useApp();
    const [selectedPkg, setSelectedPkg] = useState(TOPUP_PACKAGES[0]);
    const [loading, setLoading] = useState(false);

    if (!isOpen || !user) return null;

    const handleTopUp = async () => {
        setLoading(true);
        const totalCredits = selectedPkg.credits + selectedPkg.bonus;
        try {
            // 1. Cộng tiền vào tài khoản & Cộng doanh thu
            const { error } = await supabase.from('profiles').update({
                credits: user.credits + totalCredits,
                total_paid: (user.totalPaid || 0) + selectedPkg.price
            }).eq('id', user.id);

            if (error) throw error;

            // 2. Ghi lịch sử giao dịch
            await supabase.from('credit_transactions').insert({
                user_id: user.id,
                amount: totalCredits,
                action_type: 'ADMIN_TOPUP',
                description: `Admin nạp gói ${selectedPkg.label}`
            });

            toast.success(`Đã nạp thành công cho ${user.name}`);
            onSuccess();
            onClose();
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-[#1a1a1a] border border-[#333] rounded-2xl p-6 w-full max-w-lg shadow-2xl relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">✕</button>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-white"><CreditCard className="w-5 h-5 text-[#66E91E]" /> Nạp Credits</h3>
                
                {/* Thông tin user tóm tắt */}
                <div className="bg-[#222] p-4 rounded-xl mb-4 flex items-center gap-4 border border-[#333]">
                    <img src={user.avatar} className="w-12 h-12 rounded-full border border-[#444]" alt="avatar" />
                    <div>
                        <div className="font-bold text-white">{user.name}</div>
                        <div className="text-xs text-gray-400">{user.email}</div>
                        <div className="text-xs text-[#66E91E] mt-1 font-mono">Số dư: {user.credits.toLocaleString()} Cr</div>
                    </div>
                </div>

                {/* Chọn gói nạp */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    {TOPUP_PACKAGES.map((pkg) => (
                        <div key={pkg.id} onClick={() => setSelectedPkg(pkg)}
                            className={`p-3 rounded-xl border cursor-pointer transition-all ${selectedPkg.id === pkg.id ? 'bg-[#2a2a2a] border-[#66E91E] shadow-[0_0_10px_rgba(102,233,30,0.2)]' : 'bg-black border-[#333] hover:border-gray-500'}`}>
                            <div className="font-bold text-white text-sm">{pkg.label}</div>
                            <div className="text-[#66E91E] font-black text-lg">{pkg.credits.toLocaleString()} Cr</div>
                            <div className="text-xs text-gray-500">{pkg.price.toLocaleString()} đ</div>
                        </div>
                    ))}
                </div>

                <button onClick={handleTopUp} disabled={loading} className="w-full py-3 bg-[#66E91E] hover:bg-[#52c415] rounded-xl font-bold text-black flex items-center justify-center gap-2 transition-all">
                    {loading ? 'Đang xử lý...' : 'Xác nhận nạp tiền'}
                </button>
            </div>
        </div>
    );
};

// --- 2.2. MODAL CHỈNH SỬA USER (EDIT PROFILES & PERMISSIONS) ---
const EditUserModal = ({ user, isOpen, onClose, onSuccess }: any) => {
    const { supabase } = useApp();
    
    // State form chỉnh sửa
    const [formData, setFormData] = useState({ 
        full_name: '', 
        phone: '', 
        role: 'customer' 
    });
    
    // State phân quyền (Permissions)
    const [permissions, setPermissions] = useState<string[]>([]);
    
    // State độ phân giải (Resolutions)
    const [allowedResolutions, setAllowedResolutions] = useState<string[]>([]);
    
    const [loading, setLoading] = useState(false);

    // Load dữ liệu user khi mở modal
    useEffect(() => {
        if(user) {
            setFormData({ 
                full_name: user.name, 
                phone: user.phone || '', 
                role: user.role 
            });
            // Nếu user chưa có quyền gì thì mặc định là rỗng
            setPermissions(user.permissions || []);
            setAllowedResolutions(user.allowedResolutions || ['1K']);
        }
    }, [user]);

    if (!isOpen || !user) return null;

    // Logic Toggle Checkbox (Thêm/Xóa quyền)
    const togglePermission = (id: string) => {
        setPermissions(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
    };

    const toggleResolution = (res: string) => {
        setAllowedResolutions(prev => prev.includes(res) ? prev.filter(r => r !== res) : [...prev, res]);
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            // Cập nhật DB (Bảng profiles)
            // Lưu ý: Tên cột trong DB phải khớp (allowed_resolutions, permissions)
            const { error } = await supabase.from('profiles').update({
                full_name: formData.full_name,
                phone: formData.phone,
                role: formData.role,
                permissions: permissions,             // Cập nhật mảng quyền
                allowed_resolutions: allowedResolutions // Cập nhật mảng độ phân giải
            }).eq('id', user.id);

            if (error) throw error;
            toast.success("Cập nhật thông tin & quyền hạn thành công!");
            onSuccess();
            onClose();
        } catch (e: any) {
            toast.error("Lỗi cập nhật: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in p-4">
            <div className="bg-[#1a1a1a] border border-[#333] rounded-2xl w-full max-w-2xl shadow-2xl relative flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="p-6 border-b border-[#333] flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Edit3 className="w-5 h-5 text-blue-500" /> Quản Lý Người Dùng
                    </h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-white">✕</button>
                </div>
                
                {/* Scrollable Content */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-8">
                    
                    {/* KHU VỰC 1: THÔNG TIN CƠ BẢN */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-[#333] pb-2">1. Thông tin chung</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-400 block mb-1.5">Họ tên</label>
                                <input type="text" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} className="w-full bg-black border border-[#333] rounded-lg p-3 text-white focus:border-blue-500 outline-none transition-colors"/>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 block mb-1.5">Số điện thoại (Zalo)</label>
                                <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-black border border-[#333] rounded-lg p-3 text-white focus:border-blue-500 outline-none transition-colors"/>
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-xs font-bold text-gray-400 block mb-1.5">Vai trò hệ thống</label>
                                <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full bg-black border border-[#333] rounded-lg p-3 text-white focus:border-blue-500 outline-none cursor-pointer">
                                    <option value="customer">Khách hàng (Customer)</option>
                                    <option value="admin">Quản trị viên (Admin - Full quyền)</option>
                                </select>
                                {formData.role === 'admin' && <p className="text-[10px] text-yellow-500 mt-1 italic">*Admin sẽ mặc định có tất cả các quyền.</p>}
                            </div>
                        </div>
                    </div>

                    {/* KHU VỰC 2: PHÂN QUYỀN TÍNH NĂNG */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-[#333] pb-2 flex justify-between">
                            <span>2. Mở khóa Tính Năng</span>
                            <span className="text-[10px] normal-case text-gray-400">(Tắt = Khóa & Làm mờ trên UI)</span>
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                            {FEATURE_LIST.map(feature => {
                                const isChecked = permissions.includes(feature.id) || formData.role === 'admin';
                                return (
                                    <div 
                                        key={feature.id} 
                                        onClick={() => formData.role !== 'admin' && togglePermission(feature.id)}
                                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${isChecked ? 'bg-blue-900/20 border-blue-500/50' : 'bg-black border-[#333] opacity-60 hover:opacity-100'} ${formData.role === 'admin' ? 'cursor-not-allowed opacity-100' : ''}`}
                                    >
                                        <div className={`w-5 h-5 rounded flex items-center justify-center border ${isChecked ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-500 text-transparent'}`}>
                                            ✓
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <feature.icon className={`w-4 h-4 ${isChecked ? 'text-blue-400' : 'text-gray-500'}`} />
                                            <span className={`text-sm font-medium ${isChecked ? 'text-white' : 'text-gray-500'}`}>{feature.label}</span>
                                        </div>
                                        {!isChecked && <Lock className="w-3 h-3 text-gray-600 ml-auto" />}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* KHU VỰC 3: GIỚI HẠN ĐỘ PHÂN GIẢI */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-[#333] pb-2 flex justify-between">
                            <span>3. Chất lượng ảnh cho phép</span>
                            <span className="text-[10px] normal-case text-gray-400">(Chỉ được tạo ảnh ở độ phân giải đã chọn)</span>
                        </h4>
                        <div className="flex gap-4">
                            {RESOLUTION_LIST.map(res => {
                                const isChecked = allowedResolutions.includes(res) || formData.role === 'admin';
                                return (
                                    <div 
                                        key={res} 
                                        onClick={() => formData.role !== 'admin' && toggleResolution(res)}
                                        className={`flex-1 flex flex-col items-center justify-center p-4 rounded-xl border cursor-pointer transition-all ${isChecked ? 'bg-[#66E91E]/10 border-[#66E91E] text-[#66E91E]' : 'bg-black border-[#333] text-gray-500 hover:border-gray-500'}`}
                                    >
                                        <span className="text-lg font-black">{res}</span>
                                        <span className="text-[10px] uppercase font-bold mt-1">{isChecked ? 'Unlocked' : 'Locked'}</span>
                                        {!isChecked && <Lock className="w-4 h-4 mt-2 opacity-50" />}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-[#333] bg-[#1a1a1a] flex gap-3 rounded-b-2xl">
                    <button onClick={onClose} className="flex-1 py-3 bg-[#333] hover:bg-[#444] rounded-xl font-bold text-gray-300 transition-colors">Hủy bỏ</button>
                    <button onClick={handleSave} disabled={loading} className="flex-1 py-3 bg-white text-black hover:bg-gray-200 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                        {loading ? 'Đang lưu...' : <><Save className="w-4 h-4" /> Lưu Cấu Hình</>}
                    </button>
                </div>
            </div>
        </div>
    );
};

// =============================================================================
// 3. MAIN DASHBOARD COMPONENT (GIAO DIỆN CHÍNH)
// =============================================================================

export const AdminDashboard = () => {
  const { supabase, setViewMode } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'finance'>('users');
  
  // -- State Dữ Liệu --
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // -- State Modal --
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalType, setModalType] = useState<'none' | 'topup' | 'edit'>('none');

  // -- KPI Stats --
  const stats = {
    totalUsers: users.length,
    totalRevenue: users.reduce((sum, u) => sum + (u.totalPaid || 0), 0),
    activeUsers: users.filter(u => u.isActive).length,
    totalUsage: users.reduce((sum, u) => sum + (u.totalUsage || 0), 0)
  };

  // 1. FETCH DATA & REALTIME (Tự động cập nhật khi có User mới)
  const fetchAdminData = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        // Map dữ liệu từ DB sang Interface User
        const formattedUsers: User[] = data.map((u: any) => ({
          id: u.id,
          email: u.email || '',
          name: u.full_name || 'No Name',
          role: u.role || 'customer',
          avatar: u.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.email}`,
          credits: u.credits || 0,
          subscriptionTier: u.tier || 'free',
          isActive: u.is_active,
          // Map các trường mới cho Edit Modal
          permissions: u.permissions || [],
          phone: u.phone,
          totalUsage: u.total_usage || 0,
          totalPaid: u.total_paid || 0,
          lastSeen: u.last_seen,
          allowedResolutions: u.allowed_resolutions || ['1K']
        }));
        setUsers(formattedUsers);
      }
    } catch (error: any) {
      toast.error('Lỗi tải dữ liệu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. SETUP REALTIME SUBSCRIPTION
  useEffect(() => {
    fetchAdminData();

    const channel = supabase
      .channel('admin-dashboard-users')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, (payload) => {
          fetchAdminData(); // Refresh bảng ngay lập tức khi DB thay đổi
          if(payload.eventType === 'INSERT') toast.info("🚀 Có thành viên mới vừa đăng ký!");
      })
      .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
  }, []);

  const formatVND = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  return (
    <div className="min-h-screen bg-black text-white flex font-sans">
      {/* --- SIDEBAR --- */}
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
                { id: 'users', icon: Users, label: 'Thành Viên' },
                { id: 'finance', icon: DollarSign, label: 'Tài Chính' },
            ].map((item) => (
                <button key={item.id} onClick={() => setActiveTab(item.id as any)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === item.id ? 'bg-[#222] text-[#66E91E]' : 'text-gray-400 hover:text-white hover:bg-[#222]'}`}>
                    <item.icon className="w-4 h-4" /> {item.label}
                </button>
            ))}
        </nav>
        <button onClick={() => setViewMode('studio')} className="mt-auto flex items-center gap-2 text-gray-400 hover:text-white px-4 py-3 border-t border-[#333] pt-6">
            <ChevronLeft className="w-4 h-4" /> Về Studio
        </button>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 p-8 overflow-y-auto h-screen">
        
        {/* KPI CARDS (Tổng quan) */}
        {activeTab === 'overview' && (
            <div className="grid grid-cols-4 gap-6 mb-8 animate-in fade-in slide-in-from-bottom-4">
                <KpiCard title="Tổng Thành Viên" value={stats.totalUsers} icon={Users} color="text-blue-400" />
                <KpiCard title="Doanh Thu" value={formatVND(stats.totalRevenue)} icon={DollarSign} color="text-[#66E91E]" />
                <KpiCard title="Hoạt Động" value={stats.activeUsers} icon={Activity} color="text-yellow-400" />
                <KpiCard title="Credits Đã Dùng" value={stats.totalUsage.toLocaleString()} icon={TrendingUp} color="text-purple-400" />
            </div>
        )}

        {/* USERS TABLE (Danh sách người dùng) */}
        {(activeTab === 'users' || activeTab === 'overview') && (
            <div className="bg-[#111] border border-[#333] rounded-2xl p-6 shadow-xl flex flex-col h-[calc(100vh-140px)]">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-bold">Danh Sách Thành Viên</h2>
                        <p className="text-xs text-gray-500 mt-1">Quản lý quyền hạn & tài chính (Real-time)</p>
                    </div>
                    <div className="flex gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                            <input type="text" placeholder="Tìm kiếm tên, email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-[#222] border border-[#333] rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:ring-1 focus:ring-[#66E91E] w-64 outline-none" />
                        </div>
                        <button onClick={fetchAdminData} className="px-4 py-2 bg-[#222] hover:bg-[#333] border border-[#333] rounded-lg text-sm font-bold">Refresh</button>
                    </div>
                </div>

                <div className="flex-1 overflow-auto rounded-lg border border-[#333] custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-[#1a1a1a] sticky top-0 z-10 shadow-sm">
                            <tr className="text-xs text-gray-500 uppercase">
                                <th className="py-3 pl-4 font-bold">User Info</th>
                                <th className="py-3 font-bold">Liên hệ</th>
                                <th className="py-3 font-bold">Quyền hạn</th>
                                <th className="py-3 font-bold">Ví tiền</th>
                                <th className="py-3 font-bold">Trạng thái</th>
                                <th className="py-3 pr-4 text-right font-bold">Action</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-[#222]">
                            {loading ? (
                                <tr><td colSpan={6} className="py-10 text-center text-gray-500">Đang tải dữ liệu...</td></tr>
                            ) : users.filter(u => u.email.toLowerCase().includes(searchTerm.toLowerCase()) || u.name.toLowerCase().includes(searchTerm.toLowerCase())).map((u) => (
                                <tr key={u.id} className="hover:bg-[#1a1a1a] transition-colors group">
                                    {/* 1. User Info */}
                                    <td className="py-4 pl-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-800 overflow-hidden border border-[#333]">
                                                <img src={u.avatar} alt="avt" className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-white text-sm">{u.name}</div>
                                                <div className="text-xs text-gray-500">{u.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    
                                    {/* 2. Contact */}
                                    <td>
                                        {u.phone ? <div className="text-gray-300 flex items-center gap-1"><Phone className="w-3 h-3"/> {u.phone}</div> : <span className="text-gray-600 text-xs italic">--</span>}
                                    </td>

                                    {/* 3. Role & Permissions Summary */}
                                    <td>
                                        <div className="flex flex-col gap-1 items-start">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${u.role === 'admin' ? 'bg-purple-900/30 text-purple-400 border-purple-900/50' : 'bg-blue-900/30 text-blue-400 border-blue-900/50'}`}>
                                                {u.role}
                                            </span>
                                            {u.role !== 'admin' && (
                                                <div className="flex gap-1">
                                                    {u.allowedResolutions.includes('4K') && <span className="text-[9px] bg-[#222] border border-[#444] px-1 rounded text-white">4K</span>}
                                                    <span className="text-[9px] text-gray-500">+{u.permissions.length} apps</span>
                                                </div>
                                            )}
                                        </div>
                                    </td>

                                    {/* 4. Finance */}
                                    <td>
                                        <div className="font-mono text-[#66E91E] font-bold">{u.credits.toLocaleString()} Cr</div>
                                        <div className="text-[10px] text-gray-500 mt-1">Đã nạp: {formatVND(u.totalPaid)}</div>
                                    </td>

                                    {/* 5. Status */}
                                    <td>
                                        <div className="flex items-center gap-2">
                                            {u.isActive ? (
                                                <span className="flex items-center gap-1 text-xs text-green-500 bg-green-900/20 px-2 py-1 rounded-full"><CheckCircle className="w-3 h-3"/> Active</span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-xs text-red-500 bg-red-900/20 px-2 py-1 rounded-full"><XCircle className="w-3 h-3"/> Blocked</span>
                                            )}
                                        </div>
                                    </td>

                                    {/* 6. Actions Buttons */}
                                    <td className="py-4 pr-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => { setSelectedUser(u); setModalType('edit'); }} className="p-2 bg-[#222] hover:bg-[#333] border border-[#333] rounded-lg text-blue-400 transition-colors" title="Chỉnh sửa & Phân quyền">
                                                <Edit3 className="w-4 h-4"/>
                                            </button>
                                            <button onClick={() => { setSelectedUser(u); setModalType('topup'); }} className="p-2 bg-[#222] hover:bg-[#333] border border-[#333] rounded-lg text-[#66E91E] transition-colors" title="Nạp tiền">
                                                <Plus className="w-4 h-4"/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* Placeholder for Finance */}
        {activeTab === 'finance' && (
            <div className="bg-[#111] border border-[#333] rounded-2xl p-6 text-center py-20 text-gray-500">
                <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-bold">Báo cáo tài chính chi tiết</h3>
                <p>Đang phát triển...</p>
            </div>
        )}
      </div>

      {/* --- MODAL MANAGERS --- */}
      <TopUpModal user={selectedUser} isOpen={modalType === 'topup'} onClose={() => setModalType('none')} onSuccess={fetchAdminData} />
      <EditUserModal user={selectedUser} isOpen={modalType === 'edit'} onClose={() => setModalType('none')} onSuccess={fetchAdminData} />
    </div>
  );
};

// Component thẻ KPI nhỏ
const KpiCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-[#111] border border-[#333] p-5 rounded-2xl flex items-center justify-between shadow-lg hover:border-gray-600 transition-all">
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
