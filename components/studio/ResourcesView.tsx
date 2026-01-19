
import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Upload, Loader2, AlertCircle } from 'lucide-react';
import { SectionHeader } from '../ui';
import { MOCK_ASSETS } from '../../constants';
import { Asset } from '../../types';

// Utility to compress image before storage
const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        // Resize logic: Max width 800px to save LocalStorage space
        const MAX_WIDTH = 800; 
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            resolve(event.target?.result as string); // Fallback to original if canvas fails
            return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        // Compress to JPEG with 0.7 quality
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        resolve(dataUrl);
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const ResourcesView = () => {
  // 1. Lazy Initialization: Load from LocalStorage or fallback to MOCK
  const [assets, setAssets] = useState<Asset[]>(() => {
      if (typeof window !== 'undefined') {
          const saved = localStorage.getItem('mentoris_assets_v1');
          if (saved) {
              try {
                  return JSON.parse(saved);
              } catch (e) {
                  console.error("Error parsing assets", e);
              }
          }
      }
      return MOCK_ASSETS;
  });

  const [activeTab, setActiveTab] = useState<'all' | 'base' | 'texture' | 'graphic' | 'model'>('all');
  const [isProcessing, setIsProcessing] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 2. Persistence: Save to LocalStorage whenever assets change
  useEffect(() => {
      try {
        localStorage.setItem('mentoris_assets_v1', JSON.stringify(assets));
        setStorageError(null); // Clear error if save successful
      } catch (e: any) {
        console.error("LocalStorage Save Failed:", e);
        if (e.name === 'QuotaExceededError' || e.code === 22) {
            setStorageError("Bộ nhớ trình duyệt đã đầy. Ảnh mới sẽ chỉ hiển thị tạm thời và mất đi khi tải lại trang.");
        }
      }
  }, [assets]);

  const filteredAssets = activeTab === 'all' ? assets : assets.filter(a => a.type === activeTab);

  const tabs = [
    { id: 'all', label: 'Tất cả' },
    { id: 'base', label: 'Form áo' },
    { id: 'texture', label: 'Chất liệu' },
    { id: 'graphic', label: 'Họa tiết' },
    { id: 'model', label: 'Người mẫu' },
  ];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsProcessing(true);
      setStorageError(null);

      try {
          // Determine asset type based on active tab. Default to 'base' if on 'all'.
          const typeToAssign = activeTab === 'all' ? 'base' : activeTab;

          // Compress image to avoid QuotaExceededError
          const compressedBase64 = await compressImage(file);

          const newAsset: Asset = {
              id: `custom_${Date.now()}`,
              name: file.name.split('.')[0].substring(0, 15), // Truncate name
              url: compressedBase64,
              type: typeToAssign
          };
          
          setAssets(prev => [newAsset, ...prev]);
      } catch (error) {
          console.error("Upload error", error);
          alert("Lỗi xử lý ảnh. Vui lòng thử lại với ảnh khác.");
      } finally {
          setIsProcessing(false);
          // Reset input
          if (fileInputRef.current) fileInputRef.current.value = '';
      }
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if (window.confirm("Bạn có chắc muốn xóa tài nguyên này?")) {
          setAssets(prev => prev.filter(a => a.id !== id));
      }
  };

  const getAddLabel = () => {
      if (activeTab === 'all') return 'Thêm Form áo';
      const tab = tabs.find(t => t.id === activeTab);
      return `Thêm ${tab?.label}`;
  };

  return (
    <div className="p-8 max-w-full mx-auto h-full overflow-y-auto bg-gray-50/50">
      <SectionHeader title="Kho Tài Nguyên" subtitle="Quản lý tài sản thiết kế của bạn" />
      
      {/* Storage Warning */}
      {storageError && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-3 text-yellow-800 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                  <p className="font-bold text-sm">Cảnh báo bộ nhớ</p>
                  <p className="text-xs mt-1">{storageError}. Hãy xóa bớt ảnh cũ để giải phóng dung lượng.</p>
              </div>
          </div>
      )}

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 mb-6 pb-2 no-scrollbar border-b border-gray-200">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-all border-b-2 ${activeTab === tab.id ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        
        {/* Upload Card */}
        <div 
            onClick={() => !isProcessing && fileInputRef.current?.click()}
            className={`aspect-[3/4] border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-black hover:text-black cursor-pointer transition-all group bg-white hover:bg-gray-50 shadow-sm ${isProcessing ? 'opacity-50 cursor-wait' : ''}`}
        >
           {isProcessing ? (
               <Loader2 className="w-8 h-8 animate-spin text-black" />
           ) : (
               <>
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Upload className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold">{getAddLabel()}</span>
                <span className="text-[10px] text-gray-400 mt-1">Tự động nén ảnh</span>
               </>
           )}
           <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileUpload}
                disabled={isProcessing} 
           />
        </div>

        {/* Assets List */}
        {filteredAssets.map(asset => (
          <div key={asset.id} className="group relative aspect-[3/4] rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow animate-in fade-in duration-300">
            <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
            
            {/* Overlay Info */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
               <p className="text-white text-xs font-bold truncate">{asset.name}</p>
               <div className="flex justify-between items-end mt-1">
                   <p className="text-gray-300 text-[10px] uppercase font-medium">{tabs.find(t => t.id === asset.type)?.label || asset.type}</p>
                   <button 
                        onClick={(e) => handleDelete(e, asset.id)}
                        className="p-1.5 bg-white/20 text-white hover:bg-red-500 hover:text-white rounded-full backdrop-blur-sm transition-colors"
                        title="Xóa"
                   >
                       <Trash2 className="w-3 h-3" />
                   </button>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
