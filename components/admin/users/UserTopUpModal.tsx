
import React, { useState } from 'react';
import { User } from '../../../types';
import { useApp } from '../../../contexts/AppContext';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface UserTopUpModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
}

export const UserTopUpModal = ({ isOpen, onClose, user }: UserTopUpModalProps) => {
    const { supabase, addUsageLog } = useApp();
    const [topUpAmount, setTopUpAmount] = useState(1000);
    const [isLoading, setIsLoading] = useState(false);

    const handleTopUp = async () => {
        if (!user) return;
        setIsLoading(true);

        try {
            // 1. Direct DB Update (Since we are Admin)
            // Note: In strict RLS, you might need an RPC 'admin_add_credits'
            // For now we assume the user logged in has Admin role in Supabase or we use RPC.
            
            // Method A: Update Profile directly
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ credits: user.credits + topUpAmount })
                .eq('id', user.id);

            if (updateError) throw updateError;

            // 2. Log Transaction
            await supabase.from('credit_transactions').insert({
                user_id: user.id,
                amount: topUpAmount,
                action_type: 'ADMIN_TOPUP',
                description: `Admin manual top-up: +${topUpAmount} credits`
            });

            toast.success(`Đã cộng ${topUpAmount} credits`, { description: `Số dư mới của ${user.name} đã được cập nhật.` });
            onClose();
        } catch (error: any) {
            console.error("TopUp Error:", error);
            toast.error("Lỗi nạp tiền", { description: error.message });
        } finally {
            setIsLoading(false);
            setTopUpAmount(1000);
        }
    };

    if (!isOpen || !user) return null;

    return (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
             <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
                <h3 className="text-lg font-bold mb-4">Nạp Credit: {user.name}</h3>
                <div className="mb-6">
                    <label className="block text-xs font-bold text-gray-500 mb-2">Số lượng thêm</label>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setTopUpAmount(Math.max(0, topUpAmount - 500))} className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200">-</button>
                        <input type="number" value={topUpAmount} onChange={(e) => setTopUpAmount(Number(e.target.value))} className="flex-1 text-center p-2 font-mono font-bold text-lg border-b border-gray-200 outline-none" />
                        <button onClick={() => setTopUpAmount(topUpAmount + 500)} className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200">+</button>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button onClick={onClose} disabled={isLoading} className="flex-1 py-3 bg-gray-100 font-bold rounded-xl text-sm hover:bg-gray-200">Hủy</button>
                    <button onClick={handleTopUp} disabled={isLoading} className="flex-1 py-3 bg-black text-white font-bold rounded-xl text-sm hover:bg-gray-800 shadow-lg flex items-center justify-center gap-2">
                        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />} Xác nhận
                    </button>
                </div>
             </div>
          </div>
    );
};
