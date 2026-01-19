
import React, { useState, useEffect } from 'react';
import { UserPlus, Search, Edit2, PlusCircle, PieChart, ChevronLeft, ChevronRight, Loader2, RefreshCw, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { User, UsageLog } from '../../../types';
import { UserFormModal } from './UserFormModal';
import { UserTopUpModal } from './UserTopUpModal';
import { UserStatsModal } from './UserStatsModal';
import { useApp } from '../../../contexts/AppContext';

export const UserList = ({ users: initialUsers, usageLogs }: { users: User[], usageLogs: UsageLog[] }) => {
    const { supabase } = useApp();
    
    // Server-side State
    const [dbUsers, setDbUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const USERS_PER_PAGE = 20;

    // Sorting State
    const [sortField, setSortField] = useState<string>('created_at');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // Search State
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modal State
    const [isUserModalOpen, setUserModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [isTopUpOpen, setTopUpOpen] = useState(false);
    const [selectedUserForTopUp, setSelectedUserForTopUp] = useState<User | null>(null);
    const [isStatsOpen, setStatsOpen] = useState(false);
    const [selectedUserForStats, setSelectedUserForStats] = useState<User | null>(null);

    // FETCH USERS FROM SUPABASE
    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const from = (page - 1) * USERS_PER_PAGE;
            const to = from + USERS_PER_PAGE - 1;

            let query = supabase
                .from('profiles')
                .select('*', { count: 'exact' });

            if (searchTerm) {
                // ILIKE for case-insensitive search on email or full_name
                query = query.or(`email.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`);
            }

            // Apply dynamic sorting
            query = query.order(sortField, { ascending: sortOrder === 'asc' });

            const { data, error, count } = await query.range(from, to);

            if (error) throw error;

            if (data) {
                // Map DB profiles to User Interface
                const mappedUsers: User[] = data.map((p: any) => ({
                    id: p.id,
                    email: p.email,
                    name: p.full_name || 'No Name',
                    role: p.role,
                    avatar: p.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.email}`,
                    credits: p.credits,
                    subscriptionTier: p.tier || 'free',
                    isActive: p.is_active,
                    permissions: p.role === 'admin' ? ['all'] : ['sketch', 'quick-design', 'lookbook', 'try-on', 'concept-product', 'resources'],
                    // Note: If permissions/resolutions are added to DB schema later, map them here.
                    allowedResolutions: ['1K', '2K'], // Default for display if not in DB
                    usageStats: { totalImages: 0, totalSpend: 0 }
                }));
                setDbUsers(mappedUsers);
                if (count) setTotalPages(Math.ceil(count / USERS_PER_PAGE));
            }
        } catch (error: any) {
            console.error("Error fetching users:", error.message || error);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle Header Click for Sorting
    const handleSort = (field: string) => {
        if (sortField === field) {
            // Toggle order
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            // New field, default to desc (highest first for credits usually)
            setSortField(field);
            setSortOrder('desc');
        }
        setPage(1); // Reset to page 1
    };

    const getSortIcon = (field: string) => {
        if (sortField !== field) return <ArrowUpDown className="w-3 h-3 opacity-30" />;
        return sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-black" /> : <ArrowDown className="w-3 h-3 text-black" />;
    };

    // Debounce Search
    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(1); // Reset to page 1 on search
            fetchUsers();
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Fetch on Page or Sort Change
    useEffect(() => {
        fetchUsers();
    }, [page, sortField, sortOrder]);

    // REFRESH HANDLER (Passed to Modals)
    const handleRefresh = () => {
        fetchUsers();
    };

    const openAddUser = () => {
        setEditingUser(null);
        setUserModalOpen(true);
    };
  
    const openEditUser = (u: User) => {
        setEditingUser(u);
        setUserModalOpen(true);
    };

    const openStats = (u: User) => {
        setSelectedUserForStats(u);
        setStatsOpen(true);
    };

    // SKELETON ROW COMPONENT
    const SkeletonRow = () => (
        <tr className="animate-pulse border-b border-gray-50">
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200" />
                    <div className="space-y-2">
                        <div className="h-3 w-32 bg-gray-200 rounded" />
                        <div className="h-2 w-24 bg-gray-100 rounded" />
                    </div>
                </div>
            </td>
            <td className="px-6 py-4">
                <div className="h-3 w-16 bg-gray-200 rounded mb-1" />
                <div className="h-2 w-12 bg-gray-100 rounded" />
            </td>
            <td className="px-6 py-4"><div className="h-4 w-12 bg-blue-100 rounded" /></td>
            <td className="px-6 py-4"><div className="h-4 w-16 bg-green-100 rounded" /></td>
            <td className="px-6 py-4"><div className="h-8 w-24 bg-gray-100 rounded ml-auto" /></td>
        </tr>
    );

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header / Search */}
            <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
               <div className="flex items-center gap-4 w-full sm:w-auto">
                   <h3 className="font-bold text-lg">Danh sách tài khoản</h3>
                   <div className="relative">
                       <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                       <input 
                         type="text" 
                         value={searchTerm}
                         onChange={(e) => setSearchTerm(e.target.value)}
                         placeholder="Tìm email hoặc tên..." 
                         className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-black transition-colors min-w-[250px]" 
                       />
                   </div>
               </div>
               <div className="flex gap-2">
                   <button onClick={handleRefresh} className="p-2.5 text-gray-500 hover:text-black hover:bg-gray-100 rounded-xl transition-colors">
                       <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                   </button>
                   <button onClick={openAddUser} className="px-5 py-2.5 bg-black text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-gray-800 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
                      <UserPlus className="w-4 h-4" /> Cấp quyền mới
                   </button>
               </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto relative min-h-[400px]">
              <table className="w-full text-left text-sm">
                 <thead className="bg-gray-50 text-gray-500 font-bold text-xs uppercase tracking-wider">
                    <tr>
                       <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('created_at')}>
                           <div className="flex items-center gap-1">User Profile / Login ID {getSortIcon('created_at')}</div>
                       </th>
                       <th className="px-6 py-4">Role / Tier</th>
                       <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('credits')}>
                           <div className="flex items-center gap-1">Số dư Credits {getSortIcon('credits')}</div>
                       </th>
                       <th className="px-6 py-4">Trạng thái</th>
                       <th className="px-6 py-4 text-right">Hành động</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100">
                    {isLoading ? (
                        Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                    ) : dbUsers.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                Không tìm thấy user nào.
                            </td>
                        </tr>
                    ) : (
                        dbUsers.map(u => (
                          <tr key={u.id} className="hover:bg-gray-50 transition-colors group">
                             <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                   <img src={u.avatar} className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 object-cover" />
                                   <div>
                                      <p className="font-bold text-black">{u.name}</p>
                                      <p className="text-xs text-gray-500 font-medium">{u.email}</p>
                                   </div>
                                 </div>
                             </td>
                             <td className="px-6 py-4">
                                <div className="flex flex-col items-start gap-1">
                                     <span className="px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-[10px] font-bold text-gray-600 uppercase tracking-wider">{u.role}</span>
                                     <span className="text-[10px] text-gray-400">Tier: {u.subscriptionTier}</span>
                                </div>
                             </td>
                             <td className="px-6 py-4 font-mono font-bold text-blue-600">{u.credits.toLocaleString()}</td>
                             <td className="px-6 py-4">
                                 {u.isActive ? (
                                     <span className="flex items-center gap-1.5 text-green-600 font-bold text-xs bg-green-50 px-2 py-1 rounded-md w-fit">
                                         <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span> Active
                                     </span>
                                 ) : (
                                     <span className="flex items-center gap-1.5 text-red-600 font-bold text-xs bg-red-50 px-2 py-1 rounded-md w-fit">
                                         <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span> Locked
                                     </span>
                                 )}
                             </td>
                             <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                       onClick={() => openStats(u)}
                                       className="p-2 hover:bg-purple-100 hover:text-purple-600 rounded transition-colors text-gray-500" 
                                       title="Xem thống kê"
                                    >
                                       <PieChart className="w-4 h-4"/>
                                    </button>
                                    <button 
                                       onClick={() => { setSelectedUserForTopUp(u); setTopUpOpen(true); }}
                                       className="p-2 hover:bg-black hover:text-white rounded transition-colors text-gray-500" 
                                       title="Nạp Credits"
                                    >
                                       <PlusCircle className="w-4 h-4"/>
                                    </button>
                                    <button 
                                       onClick={() => openEditUser(u)} 
                                       className="p-2 hover:bg-blue-100 hover:text-blue-600 rounded transition-colors text-gray-500" 
                                       title="Sửa thông tin"
                                    >
                                       <Edit2 className="w-4 h-4" />
                                    </button>
                                </div>
                             </td>
                          </tr>
                        ))
                    )}
                 </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
                <p className="text-xs text-gray-500">Trang {page} / {totalPages}</p>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <UserFormModal 
                isOpen={isUserModalOpen} 
                onClose={() => { setUserModalOpen(false); handleRefresh(); }} 
                editingUser={editingUser} 
            />
            <UserTopUpModal 
                isOpen={isTopUpOpen} 
                onClose={() => { setTopUpOpen(false); handleRefresh(); }} 
                user={selectedUserForTopUp} 
            />
            <UserStatsModal 
                isOpen={isStatsOpen}
                onClose={() => setStatsOpen(false)}
                user={selectedUserForStats}
                userLogs={usageLogs} 
            />
        </div>
    );
};
