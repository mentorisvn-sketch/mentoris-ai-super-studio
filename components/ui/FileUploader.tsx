
import React, { useState, useRef } from 'react';
import { Upload, X, Maximize2, Loader2, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import { processAndUploadImage } from '../../utils/imageProcessor';
import { useApp } from '../../contexts/AppContext';
import { toast } from 'sonner';

interface FileUploaderProps {
  label: string;
  image: string | null;
  // Deprecated: old handler (kept for compatibility if needed, but we prefer onFileSelect)
  onUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void; 
  // New: Returns processed URL and Base64
  onFileSelect?: (url: string, base64: string) => void;
  onRemove: () => void;
  onPreview?: () => void;
}

export const FileUploader = ({ 
  label, 
  image, 
  onUpload, 
  onFileSelect,
  onRemove,
  onPreview 
}: FileUploaderProps) => {
  const { user } = useApp();
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Use new logic if onFileSelect is provided
    if (onFileSelect) {
        try {
            setIsProcessing(true);
            
            if (file.size > 2 * 1024 * 1024) {
                setProgress("Đang nén ảnh...");
            } else {
                setProgress("Đang xử lý...");
            }

            const result = await processAndUploadImage(file, user?.id);
            
            setProgress("Hoàn tất!");
            await new Promise(r => setTimeout(r, 500)); // Small delay for UX
            
            onFileSelect(result.url, result.base64);
        } catch (error: any) {
            console.error(error);
            toast.error("Lỗi xử lý ảnh", { description: "Vui lòng thử lại với ảnh khác." });
        } finally {
            setIsProcessing(false);
            setProgress("");
            if (inputRef.current) inputRef.current.value = ''; // Reset input
        }
    } else if (onUpload) {
        // Fallback to old behavior
        onUpload(e);
    }
  };

  return (
    <div className="w-full">
      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">{label}</label>
      
      {!image && !isProcessing ? (
        <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors group relative overflow-hidden">
          <div className="flex flex-col items-center justify-center pt-5 pb-6 transition-transform group-hover:scale-105">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 group-hover:shadow-md transition-all">
                <Upload className="w-5 h-5 text-gray-400 group-hover:text-black" />
            </div>
            <p className="text-xs font-bold text-gray-600">Chạm để tải ảnh</p>
            <p className="text-[10px] text-gray-400 mt-1">Hỗ trợ JPG, PNG (dung lượng tối ưu &lt; 2MB)</p>
          </div>
          <input 
            type="file" 
            ref={inputRef}
            className="hidden" 
            accept="image/*" 
            onChange={handleFileChange} 
          />
        </label>
      ) : (
        <div className="relative w-full h-40 rounded-xl overflow-hidden border border-gray-200 group bg-gray-50">
          
          {isProcessing ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 z-20">
                  <Loader2 className="w-8 h-8 animate-spin text-black mb-2" />
                  <p className="text-xs font-bold text-gray-600 animate-pulse">{progress || 'Đang xử lý...'}</p>
              </div>
          ) : (
              <>
                <img src={image || ''} className="w-full h-full object-contain" alt="Uploaded" />
                
                {/* Actions Overlay */}
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-start justify-between p-2">
                    {/* Preview Button */}
                    {onPreview && (
                    <button 
                        onClick={(e) => { e.preventDefault(); onPreview(); }}
                        className="p-1.5 bg-white/90 text-gray-700 rounded-full hover:bg-black hover:text-white transition-colors shadow-sm backdrop-blur-sm"
                        title="Xem ảnh gốc"
                    >
                        <Maximize2 className="w-4 h-4" />
                    </button>
                    )}

                    {/* Remove Button (Always Top Right) */}
                    <button 
                    onClick={(e) => { e.preventDefault(); onRemove(); }}
                    className="p-1.5 bg-white/90 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-colors ml-auto shadow-sm backdrop-blur-sm"
                    title="Xóa ảnh"
                    >
                    <X className="w-4 h-4" />
                    </button>
                </div>
                
                {/* Success Indicator (Bottom Right) */}
                <div className="absolute bottom-2 right-2 bg-green-500 text-white p-1 rounded-full shadow-sm pointer-events-none">
                    <CheckCircle2 className="w-3 h-3" />
                </div>
              </>
          )}
        </div>
      )}
    </div>
  );
};
