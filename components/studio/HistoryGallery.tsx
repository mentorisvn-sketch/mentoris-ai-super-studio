
import React, { useEffect, useState } from 'react';
import { Trash2, Download, Maximize2, Loader2, Calendar, Database, ImageOff } from 'lucide-react';
import { SectionHeader, ImageLightbox, FadeImage } from '../ui';
import { useApp } from '../../contexts/AppContext';
import { getUserHistory, deleteImageFromStorage } from '../../services/storageService';
import { StoredImage } from '../../types';

export const HistoryGallery = () => {
  const { user } = useApp();
  const [images, setImages] = useState<{ id: string, url: string, record: StoredImage }[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
    // Cleanup URLs on unmount to prevent memory leaks
    return () => {
        images.forEach(img => URL.revokeObjectURL(img.url));
    };
  }, [user]);

  const loadHistory = async () => {
    if (!user) return;
    setLoading(true);
    try {
        const history = await getUserHistory(user.id);
        setImages(history);
    } catch (e) {
        console.error("Failed to load history", e);
    } finally {
        setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
      if (confirm("Bạn có chắc muốn xóa ảnh này? Hành động không thể hoàn tác.")) {
          try {
              await deleteImageFromStorage(id);
              // Remove from local state
              setImages(prev => {
                  const target = prev.find(i => i.id === id);
                  if (target) URL.revokeObjectURL(target.url); // Cleanup memory
                  return prev.filter(i => i.id !== id);
              });
          } catch (e) {
              alert("Lỗi khi xóa ảnh.");
          }
      }
  };

  const handleDownload = (url: string, id: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `mentoris-history-${id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8 max-w-full mx-auto h-full overflow-y-auto bg-gray-50/50">
       <div className="flex justify-between items-start mb-6">
           <SectionHeader title="Lịch Sử Thiết Kế" subtitle="Thư viện ảnh đã tạo (Lưu trữ trên thiết bị này)" />
           <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-100">
               <Database className="w-3 h-3" />
               Offline-First Storage
           </div>
       </div>

       {loading ? (
           <div className="flex flex-col items-center justify-center h-64 text-gray-400">
               <Loader2 className="w-8 h-8 animate-spin mb-2" />
               <p className="text-sm">Đang tải từ bộ nhớ...</p>
           </div>
       ) : images.length === 0 ? (
           <div className="flex flex-col items-center justify-center h-64 text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl">
               <ImageOff className="w-12 h-12 mb-3 opacity-20" />
               <p className="text-sm font-bold">Chưa có dữ liệu</p>
               <p className="text-xs mt-1">Các thiết kế bạn tạo sẽ xuất hiện tại đây.</p>
           </div>
       ) : (
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
               {images.map(({ id, url, record }) => (
                   <div key={id} className="group relative aspect-[3/4] bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all animate-in fade-in zoom-in duration-300">
                       <FadeImage src={url} className="w-full h-full object-cover" />
                       
                       {/* Overlay */}
                       <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                           <div className="flex justify-end">
                               <button 
                                   onClick={() => handleDelete(id)}
                                   className="p-2 bg-white/20 backdrop-blur-md text-white hover:bg-red-500 rounded-full transition-colors"
                                   title="Xóa vĩnh viễn"
                               >
                                   <Trash2 className="w-3 h-3" />
                               </button>
                           </div>
                           
                           <div>
                               <div className="flex items-center gap-2 mb-2">
                                   <span className="px-2 py-0.5 bg-black/50 backdrop-blur text-white text-[10px] font-bold uppercase rounded flex items-center gap-1">
                                       {record.metadata?.resolution || '1K'}
                                   </span>
                                   <span className="px-2 py-0.5 bg-white/20 backdrop-blur text-white text-[10px] uppercase rounded">
                                       {record.type}
                                   </span>
                               </div>
                               <div className="flex gap-2">
                                   <button 
                                       onClick={() => setLightboxImage(url)}
                                       className="flex-1 py-1.5 bg-white text-black text-[10px] font-bold rounded hover:bg-gray-100"
                                   >
                                       Xem
                                   </button>
                                   <button 
                                       onClick={() => handleDownload(url, id)}
                                       className="flex-1 py-1.5 bg-black text-white text-[10px] font-bold rounded hover:bg-gray-800"
                                   >
                                       Tải
                                   </button>
                               </div>
                           </div>
                       </div>
                       
                       {/* Date Label (Only visible when not hovering) */}
                       <div className="absolute top-2 left-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] font-bold text-gray-500 group-hover:opacity-0 transition-opacity flex items-center gap-1">
                           <Calendar className="w-3 h-3" />
                           {new Date(record.createdAt).toLocaleDateString()}
                       </div>
                   </div>
               ))}
           </div>
       )}

       {lightboxImage && (
          <ImageLightbox src={lightboxImage} onClose={() => setLightboxImage(null)} />
       )}
    </div>
  );
};
