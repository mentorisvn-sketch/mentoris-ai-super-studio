
import React from 'react';
import { RefreshCw, Activity } from 'lucide-react';
import { UsageLog } from '../../../types';
import { EXCHANGE_RATE } from '../../../constants';

export const CostOverview = ({ usageLogs }: { usageLogs: UsageLog[] }) => {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
               <h3 className="font-bold text-lg">Nhật ký hệ thống & Biến động số dư</h3>
               <button className="text-xs font-bold text-gray-400 hover:text-black flex items-center gap-1"><RefreshCw className="w-3 h-3"/> Làm mới</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                 <thead className="bg-gray-50 text-gray-500 font-bold text-xs uppercase tracking-wider">
                    <tr>
                       <th className="px-6 py-4">Thời gian</th>
                       <th className="px-6 py-4">Đối tượng</th>
                       <th className="px-6 py-4">Loại hành động</th>
                       <th className="px-6 py-4 text-right">Chi phí / Giá trị</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100">
                    {usageLogs.length === 0 ? (
                       <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                              <Activity className="w-8 h-8 mx-auto mb-2 opacity-20" />
                              Chưa có dữ liệu sử dụng.
                          </td>
                       </tr>
                    ) : (
                       usageLogs.map(log => (
                          <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                             <td className="px-6 py-4 text-gray-500 font-mono text-xs">{new Date(log.timestamp).toLocaleString('vi-VN')}</td>
                             <td className="px-6 py-4 font-bold">{log.userName}</td>
                             <td className="px-6 py-4">
                                 {log.action === 'ADMIN_CREDIT_ADJUSTMENT' ? (
                                     <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded border border-green-200">Admin Nạp Credit</span>
                                 ) : (
                                     <span className="text-gray-700 font-medium bg-gray-100 px-2 py-1 rounded text-xs">{log.action}</span>
                                 )}
                             </td>
                             <td className="px-6 py-4 text-right font-mono">
                                 {log.action === 'ADMIN_CREDIT_ADJUSTMENT' ? (
                                     <span className="text-green-600 font-bold">+Credits</span>
                                 ) : (
                                     <div className="flex flex-col items-end">
                                         <span className="text-black font-bold">
                                            {(log.cost * EXCHANGE_RATE).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                                         </span>
                                         <span className="text-[10px] text-gray-400">
                                            ${log.cost.toFixed(5)}
                                         </span>
                                     </div>
                                 )}
                             </td>
                          </tr>
                       ))
                    )}
                 </tbody>
              </table>
            </div>
        </div>
    );
};
