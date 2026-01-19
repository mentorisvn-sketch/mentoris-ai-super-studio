
import React, { useState, useEffect } from 'react';
import { X, Check, Monitor, Zap, Star, Scissors, Aperture, Camera, Shirt, Sparkles, Image as ImageIcon } from 'lucide-react';
import { User } from '../../../types';
import { useApp } from '../../../contexts/AppContext';

interface UserFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingUser: User | null;
}

// Updated Module Mapping with Icons matching Sidebar
const STUDIO_MODULES = [
    { id: 'sketch', label: 'Phác thảo (Sketch)', icon: Scissors },
    { id: 'quick-design', label: 'Design Lab (Chủ đạo)', icon: Aperture },
    { id: 'lookbook', label: 'Lookbook Studio', icon: Camera },
    { id: 'try-on', label: 'Thử đồ (Try-On)', icon: Shirt },
    { id: 'concept-product', label: 'Concept & Idea', icon: Sparkles },
    { id: 'resources', label: 'Thư viện Tài nguyên', icon: ImageIcon },
];

export const UserFormModal = ({ isOpen, onClose, editingUser }: UserFormModalProps) => {
    const { addUser, updateUser } = useApp();
    
    // State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        credits: 500,
        permissions: [] as string[],
        isActive: true,
        allowedResolutions: ['1K', '2K'] as string[]
    });

    useEffect(() => {
        if (editingUser) {
            setFormData({
                name: editingUser.name,
                email: editingUser.email,
                password: '', 
                credits: editingUser.credits,
                permissions: editingUser.permissions,
                isActive: editingUser.isActive,
                allowedResolutions: editingUser.allowedResolutions || ['1K', '2K'] // Fallback for legacy data
            });
        } else {
            // Reset for new user (Default: 1K + 2K, All Standard Modules)
            setFormData({
                name: '',
                email: '',
                password: '',
                credits: 500,
                permissions: ['sketch', 'quick-design', 'lookbook', 'try-on', 'concept-product', 'resources'],
                isActive: true,
                allowedResolutions: ['1K', '2K']
            });
        }
    }, [editingUser, isOpen]);

    const handleSaveUser = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.email || (!editingUser && !formData.password)) return alert("Vui lòng điền đủ thông tin!");

        const userData: Partial<User> = {
            name: formData.name,
            email: formData.email,
            credits: formData.credits,
            permissions: formData.permissions,
            isActive: formData.isActive,
            allowedResolutions: formData.allowedResolutions
        };

        if (editingUser) {
            updateUser(editingUser.id, userData);
            alert(`Đã cập nhật thông tin cho: ${formData.email}`);
        } else {
            const newUser: User = {
                id: `user_${Date.now()}`,
                name: formData.name,
                email: formData.email,
                credits: formData.credits,
                role: 'customer',
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.email}`,
                subscriptionTier: 'basic',
                isActive: formData.isActive,
                permissions: formData.permissions,
                allowedResolutions: formData.allowedResolutions,
                usageStats: { totalImages: 0, totalSpend: 0 }
            };
            addUser(newUser);
            alert(`Đã tạo tài khoản mới: ${formData.email}`);
        }
        onClose();
    };

    const togglePermission = (perm: string) => {
        setFormData(prev => ({
            ...prev,
            permissions: prev.permissions.includes(perm) 
                ? prev.permissions.filter(p => p !== perm) 
                : [...prev.permissions, perm]
        }));
    };

    const toggleResolution = (res: string) => {
        setFormData(prev => ({
            ...prev,
            allowedResolutions: prev.allowedResolutions.includes(res)
                ? prev.allowedResolutions.filter(r => r !== res)
                : [...prev.allowedResolutions, res]
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold">{editingUser ? 'Chỉnh sửa tài khoản' : 'Cấp quyền truy cập mới'}</h3>
                    <button onClick={onClose}><X className="w-5 h-5 text-gray-400 hover:text-black"/></button>
                </div>
                <form onSubmit={handleSaveUser} className="space-y-5">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">Tên hiển thị</label>
                          <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-black/10" placeholder="Nguyễn Văn A" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">Số Credits</label>
                          <input required value={formData.credits} onChange={e => setFormData({...formData, credits: Number(e.target.value)})} type="number" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-black/10" />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Email đăng nhập</label>
                            <input 
                                required 
                                value={formData.email} 
                                onChange={e => setFormData({...formData, email: e.target.value})} 
                                type="text" 
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-black/10" 
                                placeholder="email@company.com" 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Mật khẩu {editingUser && '(Để trống)'}</label>
                            <input 
                                required={!editingUser} 
                                value={formData.password} 
                                onChange={e => setFormData({...formData, password: e.target.value})} 
                                type="text" 
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-black/10" 
                                placeholder="******" 
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                        <label className="block text-xs font-bold text-gray-500 mb-2">Trạng thái hoạt động</label>
                        <div className="flex items-center gap-4">
                            <button type="button" onClick={() => setFormData({...formData, isActive: true})} className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-all ${formData.isActive ? 'bg-green-100 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>Hoạt động (Active)</button>
                            <button type="button" onClick={() => setFormData({...formData, isActive: false})} className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-all ${!formData.isActive ? 'bg-red-100 border-red-200 text-red-700' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>Đã khóa (Locked)</button>
                        </div>
                    </div>

                    {/* NEW: Max Resolution Control (Multi-Select Checkboxes) */}
                    <div className="pt-2 border-t border-gray-100">
                        <label className="block text-xs font-bold text-gray-500 mb-2 flex items-center gap-1">
                            <Monitor className="w-3.5 h-3.5" /> Chất lượng ảnh (Resolution Access)
                        </label>
                        <div className="flex bg-gray-50 p-2 rounded-xl border border-gray-100 gap-2">
                            {['1K', '2K', '4K'].map((res) => {
                                const isChecked = formData.allowedResolutions.includes(res);
                                return (
                                    <button
                                        key={res}
                                        type="button"
                                        onClick={() => toggleResolution(res)}
                                        className={`flex-1 py-2.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 border ${isChecked ? 'bg-white border-black text-black shadow-sm' : 'bg-transparent border-transparent text-gray-400 hover:bg-gray-100'}`}
                                    >
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${isChecked ? 'bg-black border-black text-white' : 'border-gray-300 bg-white'}`}>
                                            {isChecked && <Check className="w-3 h-3" />}
                                        </div>
                                        <span>
                                            {res === '1K' ? 'Standard (1K)' : res === '2K' ? 'High-Res (2K)' : 'Ultra (4K)'}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                        {formData.allowedResolutions.includes('4K') && (
                            <p className="text-[10px] text-purple-600 font-medium mt-1.5 flex items-center gap-1 animate-in fade-in">
                                <Zap className="w-3 h-3" /> Cảnh báo: Quyền 4K tiêu tốn nhiều tài nguyên hệ thống.
                            </p>
                        )}
                    </div>

                    {/* UPDATED: Module Permissions with Icons */}
                    <div className="pt-2">
                        <label className="block text-xs font-bold text-gray-500 mb-2">Phân quyền Module (Feature Access)</label>
                        <div className="grid grid-cols-2 gap-2">
                            {STUDIO_MODULES.map(module => (
                                <div key={module.id} 
                                  onClick={() => togglePermission(module.id)}
                                  className={`p-3 border rounded-xl cursor-pointer text-xs font-bold flex items-center gap-2 transition-all ${formData.permissions.includes(module.id) ? 'border-black bg-black text-white' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                                >
                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${formData.permissions.includes(module.id) ? 'border-white bg-white text-black' : 'border-gray-300'}`}>
                                        {formData.permissions.includes(module.id) && <Check className="w-2.5 h-2.5" />}
                                    </div>
                                    <module.icon className={`w-4 h-4 ${formData.permissions.includes(module.id) ? 'text-white' : 'text-gray-400'}`} />
                                    <span className="truncate">{module.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4">
                        <button type="submit" className="w-full py-4 bg-[#66E91E] text-black font-bold rounded-xl hover:bg-[#5cd41b] transition-colors shadow-lg shadow-green-500/20">
                            {editingUser ? 'Lưu thay đổi' : 'Xác nhận tạo tài khoản'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
