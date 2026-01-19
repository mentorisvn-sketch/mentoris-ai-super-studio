
import React from 'react';
import { X, TrendingUp, Image as ImageIcon, Wallet, Database, Clock } from 'lucide-react';
import { User, UsageLog } from '../../../types';
import { EXCHANGE_RATE } from '../../../constants';

interface UserStatsModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    userLogs: UsageLog[];
}

export const UserStatsModal = ({ isOpen, onClose, user, userLogs }: UserStatsModalProps) => {
    if (!isOpen || !user) return null;

    // --- Core Calculation Logic ---
    const stats = userLogs.reduce((acc, log) => {
        // Skip admin credit adjustments for image counts
        if (log.action === 'ADMIN_CREDIT_ADJUSTMENT') return acc;

        const resolution = log.resolution || '1K'; // Default to 1K if undefined (legacy logs)
        
        // Count images by resolution
        if (resolution === '1K') acc.img1k += log.tokens.imageCount;
        if (resolution === '2K') acc.img2k += log.tokens.imageCount;
        if (resolution === '4K') acc.img4k += log.tokens.imageCount;

        // Sum Real Cost (This is the actual cost paid to Google API provider)
        acc.realCost += log.cost;

        // Sum Tokens
        acc.totalTokens += log.tokens.totalTokens;

        return acc;
    }, {
        img1k: 0,
        img2k: 0,
        img4k: 0,
        realCost: 0,
        totalTokens: 0
    });

    const totalImages = stats.img1k + stats.img2k + stats.img4k;
    const realCostVND = stats.realCost * EXCHANGE_RATE;

    return (
        <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
             <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <div className="flex items-center gap-3">
                        <img src={user.avatar} className="w-10 h-10 rounded-full border border-gray-200" />
                        <div>
                            <h3 className="text-lg font-bold text-black">{user.name}</h3>
                            <p className="text-xs text-gray-500 font-mono">{user.email}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X className="w-5 h-5"/></button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
                    
                    {/* Top Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-3 opacity-10"><Wallet className="w-12 h-12" /></div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Credits Balance</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-black text-black">{user.credits.toLocaleString()}</span>
                                <span className="text-xs font-medium text-gray-500">available</span>
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-3 opacity-10"><TrendingUp className="w-12 h-12" /></div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Real Cost (VND)</p>
                            <div className="flex flex-col">
                                <span className="text-3xl font-black text-green-600">
                                    {realCostVND.toLocaleString('vi-VN', { maximumFractionDigits: 0 })} đ
                                </span>
                                <span className="text-xs font-medium text-gray-400">
                                    ~${stats.realCost.toFixed(4)}
                                </span>
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-3 opacity-10"><Database className="w-12 h-12" /></div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Token Usage</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-black text-purple-600">{(stats.totalTokens / 1000).toFixed(1)}k</span>
                                <span className="text-xs font-medium text-gray-500">tokens</span>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Image Resolution Distribution */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h4 className="font-bold text-sm mb-4 flex items-center gap-2">
                                <ImageIcon className="w-4 h-4 text-blue-500" /> Phân bố Chất lượng Ảnh
                            </h4>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-xs font-bold mb-1">
                                        <span>Standard (1K)</span>
                                        <span>{stats.img1k} ảnh</span>
                                    </div>
                                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-gray-400 rounded-full" style={{ width: `${totalImages > 0 ? (stats.img1k / totalImages) * 100 : 0}%` }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs font-bold mb-1">
                                        <span>High Def (2K)</span>
                                        <span>{stats.img2k} ảnh</span>
                                    </div>
                                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${totalImages > 0 ? (stats.img2k / totalImages) * 100 : 0}%` }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs font-bold mb-1">
                                        <span>Cinematic (4K)</span>
                                        <span>{stats.img4k} ảnh</span>
                                    </div>
                                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-purple-600 rounded-full" style={{ width: `${totalImages > 0 ? (stats.img4k / totalImages) * 100 : 0}%` }}></div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
                                <span className="text-xs text-gray-500 font-medium">Tổng ảnh đã tạo</span>
                                <span className="text-lg font-black">{totalImages}</span>
                            </div>
                        </div>

                        {/* Recent Activity Log (Mini) */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
                            <h4 className="font-bold text-sm mb-4 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-orange-500" /> Hoạt động gần đây
                            </h4>
                            <div className="flex-1 overflow-y-auto max-h-[200px] pr-2 space-y-3">
                                {userLogs.slice(0, 5).map(log => (
                                    <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-xs">
                                        <div>
                                            <p className="font-bold text-gray-700">{log.action}</p>
                                            <p className="text-gray-400">{new Date(log.timestamp).toLocaleDateString()}</p>
                                        </div>
                                        <div className="text-right flex flex-col items-end">
                                            {log.resolution && <span className="block font-mono text-[10px] bg-gray-200 px-1 rounded w-fit mb-1">{log.resolution}</span>}
                                            <span className="font-bold">
                                                -{(log.cost * EXCHANGE_RATE).toLocaleString('vi-VN')} đ
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                {userLogs.length === 0 && <p className="text-xs text-gray-400 text-center py-4">Chưa có hoạt động nào.</p>}
                            </div>
                        </div>
                    </div>
                </div>
             </div>
        </div>
    );
};
