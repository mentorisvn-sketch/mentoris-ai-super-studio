import React, { useEffect } from 'react';
import { GenConfig } from '../../types';
import { RESOLUTIONS, ASPECT_RATIOS } from '../../constants';
import { 
  Lock, Monitor, Smartphone, Square, LayoutTemplate, 
  RectangleHorizontal, RectangleVertical, Image as ImageIcon 
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

interface GenerationSettingsPanelProps {
  config: GenConfig;
  onChange: (config: GenConfig) => void;
  isPoseSelectionActive?: boolean;
}

export const GenerationSettingsPanel = ({ config, onChange, isPoseSelectionActive = false }: GenerationSettingsPanelProps) => {
  const { user } = useApp();

  // ==========================================
  // 🟢 PHẦN 1: LOGIC KIỂM TRA QUYỀN (GIỮ NGUYÊN)
  // ==========================================
  
  // Hàm kiểm tra xem user có được dùng độ phân giải này không (1K, 2K, 4K)
  const checkResPermission = (res: string) => {
      if (!user) return false;
      if (user.role === 'admin') return true; // Admin full quyền
      return user.allowedResolutions?.includes(res);
  };

  // Tự động hạ cấp về 1K nếu user đang chọn 4K mà bị khóa quyền
  useEffect(() => {
      if (user && user.role !== 'admin') {
          if (!user.allowedResolutions?.includes(config.resolution)) {
              const firstAllowed = user.allowedResolutions?.[0] || '1K';
              if (config.resolution !== firstAllowed) {
                  onChange({ ...config, resolution: firstAllowed });
              }
          }
      }
  }, [user, config.resolution]);

  // ==========================================
  // 🟢 PHẦN 2: HELPER ICON (CẬP NHẬT ĐỦ 9 TỈ LỆ)
  // ==========================================
  const getRatioIcon = (ratioId: string) => {
      switch (ratioId) {
          case '21:9': return <Monitor className="w-4 h-4" />;        // Cinema
          case '16:9': return <Monitor className="w-4 h-4" />;        // Landscape
          case '3:2':  return <ImageIcon className="w-4 h-4" />;      // Photo Landscape
          case '4:3':  return <RectangleHorizontal className="w-4 h-4" />; // Tablet
          case '1:1':  return <Square className="w-4 h-4" />;         // Square
          case '3:4':  return <RectangleVertical className="w-4 h-4" />; // Portrait Tablet
          case '2:3':  return <ImageIcon className="w-4 h-4 rotate-90" />; // Photo Portrait (Xoay icon)
          case '4:5':  return <ImageIcon className="w-4 h-4" />;      // Instagram
          case '9:16': return <Smartphone className="w-4 h-4" />;     // Mobile
          default: return <LayoutTemplate className="w-4 h-4" />;
      }
  };

  return (
    <div className="space-y-6">
      
      {/* ------------------------------------------------ */}
      {/* MỤC 1: CHẤT LƯỢNG ẢNH (CÓ TÍNH NĂNG KHÓA)      */}
      {/* ------------------------------------------------ */}
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
                // Chỉ cho click nếu được phép (isAllowed = true)
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
                
                {/* 🔒 Icon khóa hiện ra khi không có quyền */}
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

      {/* ------------------------------------------------ */}
      {/* MỤC 2: TỈ LỆ KHUNG HÌNH (ĐỦ 9 TỈ LỆ)             */}
      {/* ------------------------------------------------ */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Tỉ lệ khung hình</label>
        {/* Grid 3 cột x 3 dòng = 9 items rất đẹp */}
        <div className="grid grid-cols-3 gap-2"> 
          {ASPECT_RATIOS.map((ratio) => (
            <button
              key={ratio.id}
              onClick={() => onChange({ ...config, aspectRatio: ratio.id })}
              className={`
                flex items-center justify-center gap-2 px-2 py-2.5 rounded-xl text-[11px] font-bold border transition-all
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

      {/* ------------------------------------------------ */}
      {/* MỤC 3: SỐ LƯỢNG ẢNH (DẠNG 4 NÚT BẤM - ĐÃ KHÔI PHỤC) */}
      {/* ------------------------------------------------ */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Số lượng tạo</label>
        <div className="grid grid-cols-5 gap-2">
          {[1, 2, 3, 4, 6].map((num) => (
            <button
              key={num}
              onClick={() => onChange({ ...config, count: num })}
              className={`
                py-2.5 rounded-xl text-sm font-bold border transition-all
                ${config.count === num
                    ? 'bg-black text-white border-black shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                }
              `}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};
