
import React, { useState, useRef, useEffect } from 'react';
import { Shirt, Camera, RefreshCcw, Download, Maximize2, Plus, X, Image as ImageIcon, Loader2, Sparkles, User as UserIcon } from 'lucide-react';
import { Button, SectionHeader, FileUploader, GenerationSettingsPanel, ImageLightbox, FadeImage } from '../ui';
import { DEFAULT_GEN_CONFIG } from '../../constants';
import { GenConfig } from '../../types';
import { generateVirtualTryOn } from '../../services/ai';
import { useApp } from '../../contexts/AppContext';
import { getUserHistory } from '../../services/storageService';
import { toast } from 'sonner';

export const VirtualTryOnStudio = () => {
  const { addUsageLog, user } = useApp();
  
  // --- STATE ---
  const [modelImage, setModelImage] = useState<string | null>(null);
  const [garmentImage, setGarmentImage] = useState<string | null>(null);
  const [accessories, setAccessories] = useState<string[]>([]);
  
  const [bgMode, setBgMode] = useState<'original' | 'change'>('original');
  const [bgDescription, setBgDescription] = useState("");
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string[]>([]);
  const [config, setConfig] = useState<GenConfig>(DEFAULT_GEN_CONFIG);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  
  const [recentHistory, setRecentHistory] = useState<{ id: string, url: string }[]>([]);
  const accInputRef = useRef<HTMLInputElement>(null);

  // Pricing Logic
  const calculateCredits = (cfg: GenConfig) => {
      let perImage = 8; // Higher base cost due to complexity
      if (cfg.resolution === '2K') perImage = 15;
      if (cfg.resolution === '4K') perImage = 25;
      return perImage * cfg.count;
  };

  const estimatedCredits = calculateCredits(config);

  // --- EFFECTS ---
  useEffect(() => {
      const fetchHistory = async () => {
          if (!user) return;
          try {
              const history = await getUserHistory(user.id);
              const tryOnHistory = history
                  .filter(item => item.record.type === 'try-on')
                  .slice(0, 50) 
                  .map(h => ({ id: h.id, url: h.url }));
              setRecentHistory(tryOnHistory);
          } catch (e) { console.error(e); }
      };
      
      if (!isGenerating) fetchHistory();
  }, [user, isGenerating]);

  // --- HANDLERS ---
  const removeAccessory = (index: number) => {
      setAccessories(prev => prev.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    if (!modelImage) return toast.error("Vui lòng tải lên ảnh người mẫu!");
    if (!garmentImage) return toast.error("Vui lòng tải lên ảnh sản phẩm cần thay!");

    if (user && user.credits < estimatedCredits) {
        toast.error("Không đủ Credits");
        return;
    }

    setIsGenerating(true);
    setResult([]);

    try {
        const res = await generateVirtualTryOn(
            modelImage,
            garmentImage,
            accessories,
            bgMode,
            bgDescription,
            config
        );
        
        setResult(res.images);

       addUsageLog({
           id: Date.now().toString(),
           timestamp: Date.now(),
           userId: user?.id || 'guest',
           userName: user?.name || 'Guest',
           action: 'VIRTUAL_TRY_ON',
           modelName: 'gemini-3-pro-image-preview',
           resolution: config.resolution,
           tokens: res.usage,
           cost: res.usage.imageCount * 0.08
       }, estimatedCredits);

       toast.success("Thử đồ thành công!");

    } catch (e) {
        console.error(e);
        toast.error("Lỗi thử đồ. Vui lòng thử lại.");
    } finally {
        setIsGenerating(false);
    }
  };

  const handleDownload = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `mentoris-tryon-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col lg:flex-row h-full bg-white overflow-hidden">
       {/* --- LEFT COLUMN: FIXED --- */}
       <div className="w-full lg:w-[400px] xl:w-[450px] flex-shrink-0 h-full flex flex-col border-r border-gray-200 bg-white z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
          <div className="flex-none p-5 border-b border-gray-100 bg-white z-10">
             <SectionHeader title="Thử Đồ Ảo" subtitle="Virtual Try-On (VTON)" />
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-6 [&::-webkit-scrollbar]:hidden">
                {/* 1. Model Input */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                   <div className="flex justify-between items-center mb-2">
                       <label className="text-xs font-bold uppercase tracking-wider text-gray-500">1. Ảnh Mẫu</label>
                   </div>
                   <FileUploader 
                        label="" 
                        image={modelImage} 
                        onFileSelect={(url, base64) => setModelImage(base64)} 
                        onRemove={() => setModelImage(null)} 
                        onPreview={() => modelImage && setLightboxImage(modelImage)}
                    />
                    <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
                        <UserIcon className="w-3 h-3" /> Face-Lock Auto.
                    </p>
                </div>

                {/* 2. Product Input */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                   <div className="flex justify-between items-center mb-2">
                       <label className="text-xs font-bold uppercase tracking-wider text-gray-500">2. Sản phẩm (Quần áo)</label>
                   </div>
                   <FileUploader 
                        label="" 
                        image={garmentImage} 
                        onFileSelect={(url, base64) => setGarmentImage(base64)} 
                        onRemove={() => setGarmentImage(null)} 
                        onPreview={() => garmentImage && setLightboxImage(garmentImage)}
                    />
                </div>

                {/* 3. Accessories */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500">3. Phụ kiện (Optional)</label>
                        <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-500">{accessories.length}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        {accessories.map((acc, index) => (
                            <div key={index} className="relative aspect-square rounded-lg border border-gray-200 overflow-hidden group bg-white">
                                <img src={acc} className="w-full h-full object-cover" />
                                <button onClick={() => removeAccessory(index)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 hover:bg-red-500 transition-colors"><X className="w-3 h-3" /></button>
                            </div>
                        ))}
                        <button onClick={() => accInputRef.current?.click()} className="aspect-square rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:border-black hover:text-black transition-colors bg-gray-50 hover:bg-white">
                            <Plus className="w-4 h-4" />
                        </button>
                        <input type="file" ref={accInputRef} className="hidden" accept="image/*" onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) { const reader = new FileReader(); reader.onload = (ev) => ev.target?.result && setAccessories(prev => [...prev, ev.target!.result as string]); reader.readAsDataURL(file); }
                        }} />
                    </div>
                </div>

                {/* 4. Background Settings */}
                <div className="space-y-3">
                   <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 pb-2">4. Tùy chọn Background</h3>
                   <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                       <button onClick={() => setBgMode('original')} className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${bgMode === 'original' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-black'}`}>Giữ nguyên</button>
                       <button onClick={() => setBgMode('change')} className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${bgMode === 'change' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-black'}`}>Thay đổi</button>
                   </div>
                   {bgMode === 'change' && (
                       <textarea value={bgDescription} onChange={(e) => setBgDescription(e.target.value)} placeholder="Mô tả bối cảnh mới..." className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm h-20 resize-none outline-none focus:ring-1 focus:ring-black focus:bg-white" />
                   )}
                </div>

                <div className="pb-4">
                    <GenerationSettingsPanel config={config} onChange={setConfig} isPoseSelectionActive={false} />
                </div>
          </div>

          <div className="flex-none p-5 border-t border-gray-100 bg-white shadow-[0_-4px_10px_rgba(0,0,0,0.03)] z-30">
                <Button onClick={handleGenerate} loading={isGenerating} className="w-full h-12 text-base shadow-xl rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white">
                    {isGenerating ? 'Đang may đo...' : 'Thử Đồ Ngay'} <Shirt className="w-5 h-5 ml-1" />
                </Button>
                <div className="flex items-center justify-center gap-2 mt-3 text-[10px] text-gray-400 font-medium">
                    <span className="bg-black text-white px-2 py-0.5 rounded">{estimatedCredits} credits</span>
                    <span className="font-bold text-indigo-600">VTON Pro Mode</span>
                </div>
          </div>
       </div>

       {/* --- RIGHT COLUMN: RESULTS --- */}
       <div className="flex-1 h-full bg-gray-50/50 overflow-y-auto p-4 md:p-8">
            <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">5. Kết quả Thử đồ</h3>
                    {result.length > 0 && !isGenerating && <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">Hoàn thành</span>}
                </div>
                
                {(isGenerating || result.length > 0) ? (
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
                        {isGenerating ? (
                            Array.from({ length: config.count }).map((_, idx) => (
                                <div key={idx} className="relative aspect-[3/4] bg-white rounded-2xl overflow-hidden border border-gray-200 flex flex-col items-center justify-center shadow-sm">
                                    <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-2" />
                                    <p className="text-xs font-medium text-indigo-600">AI đang xử lý...</p>
                                </div>
                            ))
                        ) : (
                            result.map((img, idx) => (
                                <div key={idx} className="relative aspect-[3/4] bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 group transition-transform hover:-translate-y-1">
                                    <FadeImage src={img} className="w-full h-full object-cover" />
                                    <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleDownload(img)} className="p-2 bg-white rounded-full shadow-md hover:bg-black hover:text-white transition-colors"><Download className="w-4 h-4" /></button>
                                        <button onClick={() => setLightboxImage(img)} className="p-2 bg-white rounded-full shadow-md hover:bg-black hover:text-white transition-colors"><Maximize2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="aspect-[16/9] bg-white rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-300">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <Shirt className="w-8 h-8 opacity-40" />
                        </div>
                        <p className="text-sm font-medium text-gray-400">Khu vực hiển thị kết quả</p>
                        <p className="text-xs text-gray-300 mt-1">Chọn mẫu và sản phẩm để bắt đầu</p>
                    </div>
                )}
            </div>

            {recentHistory.length > 0 && (
                 <div className="max-w-5xl mx-auto mt-12 pt-8 border-t border-gray-200">
                     <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-6 flex items-center gap-2">
                         <RefreshCcw className="w-4 h-4" /> Đã thử gần đây
                     </h3>
                     <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                         {recentHistory.map((item) => (
                             <div key={item.id} className="relative aspect-[3/4] rounded-xl overflow-hidden border border-gray-200 group cursor-pointer shadow-sm hover:shadow-md transition-all">
                                 <FadeImage src={item.url} className="w-full h-full object-cover" />
                                 <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                     <button onClick={() => setLightboxImage(item.url)} className="p-1.5 bg-white rounded-full text-black hover:scale-110 transition-transform"><Maximize2 className="w-3 h-3" /></button>
                                     <button onClick={() => handleDownload(item.url)} className="p-1.5 bg-black rounded-full text-white hover:scale-110 transition-transform"><Download className="w-3 h-3" /></button>
                                 </div>
                             </div>
                         ))}
                     </div>
                 </div>
            )}
       </div>
       
       {lightboxImage && <ImageLightbox src={lightboxImage} onClose={() => setLightboxImage(null)} />}
    </div>
  );
};
