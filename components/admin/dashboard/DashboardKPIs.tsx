
import React from 'react';
import { Users, DollarSign, Activity, Zap } from 'lucide-react';
import { EXCHANGE_RATE } from '../../../constants';

interface KPIProps {
    totalUsers: number;
    totalCost: number;
    totalTokens: number;
    totalImages: number;
    isLoading: boolean;
}

export const DashboardKPIs = ({ totalUsers, totalCost, totalTokens, totalImages, isLoading }: KPIProps) => {
    // Convert to VND
    const totalCostVND = totalCost * EXCHANGE_RATE;

    const renderValue = (value: React.ReactNode, subValue?: React.ReactNode) => {
        if (isLoading) {
            return (
                <div className="space-y-2">
                    <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
                    {subValue && <div className="h-3 w-20 bg-gray-100 rounded animate-pulse" />}
                </div>
            );
        }
        return (
            <>
                <div className="text-3xl md:text-4xl font-black tracking-tight">{value}</div>
                {subValue}
            </>
        );
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-32 relative overflow-hidden group">
                <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><Users className="w-16 h-16" /></div>
                <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Tổng User</h3>
                {renderValue(totalUsers, null)}
             </div>
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-32 relative overflow-hidden group">
                <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><DollarSign className="w-16 h-16" /></div>
                <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Chi phí thực (VND)</h3>
                <div className="flex flex-col">
                    {renderValue(
                        <span className="text-green-600">
                            {totalCostVND.toLocaleString('vi-VN', { maximumFractionDigits: 0 })} đ
                        </span>,
                        <p className="text-[10px] text-gray-400 font-medium mt-1">Est: ${totalCost.toFixed(3)}</p>
                    )}
                </div>
             </div>
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-32 relative overflow-hidden group">
                <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><Activity className="w-16 h-16" /></div>
                <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Tổng Token</h3>
                {renderValue(
                    <span className="text-purple-600">{(totalTokens / 1000).toFixed(1)}k</span>,
                    null
                )}
             </div>
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-32 relative overflow-hidden group">
                <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><Zap className="w-16 h-16" /></div>
                <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Ảnh đã tạo</h3>
                {renderValue(
                    <span className="text-blue-600">{totalImages}</span>,
                    null
                )}
             </div>
        </div>
    );
};
