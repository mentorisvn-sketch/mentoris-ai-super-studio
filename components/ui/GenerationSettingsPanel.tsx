import React, { useEffect } from 'react';
import { GenConfig } from '../../types';
import { RESOLUTIONS, ASPECT_RATIOS, COUNTS } from '../../constants';
import { Lock, Monitor, Smartphone, Square, LayoutTemplate } from 'lucide-react';
import { useApp } from '../../contexts/AppContext'; // Import Context để lấy quyền User

interface GenerationSettingsPanelProps {
  config: GenConfig;
  onChange: (config: GenConfig) => void;
  isPoseSelectionActive?: boolean;
}

export const GenerationSettingsPanel = ({ config, onChange, isPoseSelectionActive = false }: GenerationSettingsPanelProps) => {
  const { user } = useApp(); // Lấy thông tin User hiện tại

  // 🟢 LOGIC KIỂM TRA QUYỀN ĐỘ PHÂN GIẢI
  const checkResPermission = (res: string) => {
      if (!user) return false;
      if (user.role === 'admin') return true; // Admin luôn được full quyền
      return user.allowedResolutions?.includes(res);
  };

  // 🟢 TỰ ĐỘNG HẠ CẤP NẾU BỊ KHÓA
  // (Ví dụ: Đang chọn 4K mà bị Admin khóa 4K -> Tự nhảy về 1K)
  useEffect(() => {
      if (user && user.role !== 'admin') {
          if (!user.allowedResolutions?.includes(config.resolution)) {
              // Nếu độ phân giải hiện tại không được phép -> Reset về cái đầu tiên được phép (thường là 1K)
              const firstAllowed = user.allowedResolutions?.[0] || '1K';
              if (config.resolution !== firstAllowed) {
                  onChange({ ...config, resolution: firstAllowed });
              }
          }
      }
  }, [user, config.resolution]);

  // Helper render icon tỉ lệ
  const getRatioIcon = (ratioId: string) => {
      switch (ratioId) {
          case '1:1': return <Square className="w-4 h-4" />;
          case '9:16': return <Smartphone className="w-4 h-4" />;
          case '16:9': return <Monitor className="w-4 h-4" />;
          default: return <LayoutTemplate className="w-4 h-4" />;
      }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. ĐỘ PHÂN GIẢI (RESOLUTIONS) - CÓ KHÓA */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-gray-500 flex justify-between">
            Chất lượng ảnh
            <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                {config.resolution}
            </span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          {RESOLUTIONS.map((res) => {
            const isAllowed = checkResPermission(res);
            const isSelected = config.resolution === res;

            return (
              <button
                key={res}
                onClick={() => isAllowed && onChange({ ...config, resolution: res })}
                disabled={!isAllowed}
                className={`
                    relative px-3 py-3 rounded-xl text-sm font-bold border transition-all duration-200 flex flex-col items-center justify-center gap-1
                    ${isSelected && isAllowed
                        ? 'bg-black text-white border-black shadow-md transform scale-[1.02]' 
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                    }
                    ${!isAllowed ? 'opacity-50 cursor-not-allowed bg-gray-50 grayscale' : ''}
                `}
              >
                {res}
                {/* Hiển thị icon Lock nếu bị khóa */}
                {!isAllowed && (
                    <div className="absolute top-1 right-1">
                        <Lock className="w-3 h-3 text-gray-400" />
                    </div>
                )}
                
                {/* Label phụ (HD/4K) */}
                <span className={`text-[9px] font-normal uppercase ${isSelected ? 'text-gray-300' : 'text-gray-400'}`}>
                    {res === '1K' ? 'Standard' : res === '2K' ? 'High Def' : 'Ultra'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. TỈ LỆ KHUNG HÌNH (ASPECT RATIO) */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Tỉ lệ khung hình</label>
        <div className="grid grid-cols-3 gap-2">
          {ASPECT_RATIOS.map((ratio) => (
            <button
              key={ratio.id}
              onClick={() => onChange({ ...config, aspectRatio: ratio.id })}
              className={`
                flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold border transition-all
                ${config.aspectRatio === ratio.id 
                    ? 'bg-black text-white border-black shadow-sm' 
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                }
              `}
              title={ratio.label}
            >
              {getRatioIcon(ratio.id)}
              {ratio.id}
            </button>
          ))}
        </div>
      </div>

      {/* 3. SỐ LƯỢNG ẢNH (COUNT) */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-gray-500 flex justify-between">
            Số lượng tạo
            <span className="text-xs font-bold">{config.count} ảnh</span>
        </label>
        <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-gray-200">
            <input 
                type="range" 
                min="1" 
                max="6" 
                step="1"
                value={config.count}
                onChange={(e) => onChange({ ...config, count: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
            />
        </div>
        <div className="flex justify-between text-[10px] text-gray-400 font-medium px-1">
            <span>1</span>
            <span>2</span>
            <span>3</span>
            <span>4</span>
        </div>
      </div>

    </div>
  );
};
