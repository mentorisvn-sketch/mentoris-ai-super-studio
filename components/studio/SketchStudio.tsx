import React, { useState, useRef, useEffect } from 'react';
import { Wand2, Download, Maximize2, ImageIcon, Lightbulb, X, Search, Loader2, Sparkles, Palette, Pipette, FileText, Layout, Shirt, Layers, Box } from 'lucide-react';
import { Button, SectionHeader, FileUploader, GenerationSettingsPanel, ImageLightbox, FadeImage } from '../ui';
import { CATEGORIES, MATERIALS, COLORS, DEFAULT_GEN_CONFIG, EXTENDED_CATEGORIES, EXTENDED_MATERIALS } from '../../constants';
import { GenConfig, StoredImage } from '../../types';
import { generateFromSketch } from '../../services/ai';
import { useApp } from '../../contexts/AppContext';
import { getUserHistory } from '../../services/storageService';
import { toast } from 'sonner';

export const SketchStudio = () => {
  // 🔥 Thêm syncCredits
  const { addUsageLog, user, syncCredits } = useApp();
  
  // States for Inputs
  const [sketch, setSketch] = useState<string | null>(null);
  const [refMaterial, setRefMaterial] = useState<string | null>(null);
  const [styleRef, setStyleRef] = useState<string | null>(null); 
  
  const [config, setConfig] = useState<GenConfig>(DEFAULT_GEN_CONFIG);
  
  // Text Inputs
  const [category, setCategory] = useState(CATEGORIES[0].name);
  const [material, setMaterial] = useState(MATERIALS[0].name);
  const [description, setDescription] = useState(""); 
  
  // New: Output Mode State
  const [outputMode, setOutputMode] = useState<'flatlay' | '3d'>('3d');

  // Color State Management
  const [colorMode, setColorMode] = useState<'custom' | 'sketch'>('sketch');
  const [customColor, setCustomColor] = useState(COLORS[0].hex);
  
  // Modals for Suggestions
  const [showCatSuggestions, setShowCatSuggestions] = useState(false);
  const [showMatSuggestions, setShowMatSuggestions] = useState(false);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string[]>([]);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Recent History Local State
  const [recentHistory, setRecentHistory] = useState<{ id: string, url: string }[]>([]);
  
  // Close suggestions when clicking outside
  const catRef = useRef<HTMLDivElement>(null);
  const matRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(event.target as Node)) setShowCatSuggestions(false);
      if (matRef.current && !matRef.current.contains(event.target as Node)) setShowMatSuggestions(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch Local History for Sketch only
  useEffect(() => {
      const fetchHistory = async () => {
          if (!user) return;
          try {
              const history = await getUserHistory(user.id);
              const sketchHistory = history
                  .filter(item => item.record.type === 'sketch')
                  .slice(0, 50) 
                  .map(h => ({ id: h.id, url: h.url }));
              setRecentHistory(sketchHistory);
          } catch (e) { console.error(e); }
      };
      
      if (!isGenerating) {
          fetchHistory();
      }
  }, [user, isGenerating]);

  // Pricing Logic (Display Only)
  const calculateEstimatedCredits = (cfg: GenConfig) => {
      let perImage = 4;
      if (cfg.resolution === '2K') perImage = 5;
      if (cfg.resolution === '4K') perImage = 10;
      return perImage * cfg.count;
  };

  const estimatedCredits = calculateEstimatedCredits(config);

  const handleGenerate = async () => {
    if (!sketch) return toast.error("Vui lòng tải lên bản phác thảo!");
    
    // Check Client-side (Optional but good UX)
    if (user && user.credits < estimatedCredits) {
        toast.error("Không đủ Credits", { description: `Cần khoảng ${estimatedCredits}, bạn có ${user.credits}` });
        return;
    }

    setIsGenerating(true);
    setResult([]); 
    
    try {
       const useSketchColors = colorMode === 'sketch';
       
       // 1. Call API (Server handles payment & upload)
       const res = await generateFromSketch(
           sketch, 
           refMaterial, 
           styleRef, 
           category, 
           material, 
           customColor, 
           useSketchColors, 
           description, 
           config,
           outputMode 
        );
       
       setResult(res.images);
       
       // 2. Log UI (Cost = 0 here, server handled it)
       addUsageLog({
           id: Date.now().toString(),
           timestamp: Date.now(),
           userId: user?.id || 'guest',
           userName: user?.name || 'Guest',
           action: 'SKETCH_TO_REALITY',
           modelName: 'gemini-3-pro-image-preview',
           resolution: config.resolution,
           tokens: res.usage,
           cost: 0 
       });

       // 3. Sync Balance
       if (res.newBalance !== undefined) {
           syncCredits(res.newBalance);
       }

       toast.success("Đã tạo xong thiết kế!");

    } catch (e: any) {
       console.error(e);
       toast.error("Lỗi tạo ảnh", { description: e.message || "Vui lòng thử lại" });
    } finally {
       setIsGenerating(false);
    }
  };

  const handleDownload = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `mentoris-design-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Đã tải xuống");
  };

  return (
    <div className="flex flex-col lg:flex-row h-full bg-white overflow-hidden">
        {/* --- LEFT COLUMN: FIXED INPUTS (App-like) --- */}
        <div className="w-full lg:w-[400px] xl:w-[450px] flex-shrink-0 h-full flex flex-col border-r border-gray-200 bg-white z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
            
            {/* 1. Sticky Header */}
            <div className="flex-none p-5 border-b border-gray-100 bg-white z-10">
                <SectionHeader title="Phác Thảo AI" subtitle="Sketch to Reality" />
            </div>

            {/* 2. Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 [&::-webkit-scrollbar]:hidden">
                {/* Upload Section */}
                <div className="space-y-4">
                    <FileUploader 
                        label="1. Bản phác thảo (Sketch)" 
                        image={sketch} 
                        onFileSelect={(url, base64) => setSketch(base64)} 
                        onRemove={() => setSketch(null)}
                        onPreview={() => sketch && setLightboxImage(sketch)}
                    />
                    
                    <div className="pt-2 border-t border-gray-100">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Tùy chọn nâng cao</p>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <FileUploader 
                                    label="Chất liệu (Material)" 
                                    image={refMaterial} 
                                    onFileSelect={(url, base64) => setRefMaterial(base64)} 
                                    onRemove={() => setRefMaterial(null)}
                                    onPreview={() => refMaterial && setLightboxImage(refMaterial)} 
                                />
                            </div>
                            <div>
                                <FileUploader 
                                    label="Kiểu dáng (Style)" 
                                    image={styleRef} 
                                    onFileSelect={(url, base64) => setStyleRef(base64)} 
                                    onRemove={() => setStyleRef(null)}
                                    onPreview={() => styleRef && setLightboxImage(styleRef)} 
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Details Section */}
                <div className="space-y-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 pb-2">2. Chi tiết thiết kế</h3>
                    
                    {/* Output Style */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-2">Phong cách ảnh đầu ra</label>
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                            <button onClick={() => setOutputMode('3d')} className={`flex-1 py-2 text-xs font-bold rounded-md flex items-center justify-center gap-2 transition-all ${outputMode === '3d' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-black'}`}>
                                <Shirt className="w-4 h-4" /> 3D / Model
                            </button>
                            <button onClick={() => setOutputMode('flatlay')} className={`flex-1 py-2 text-xs font-bold rounded-md flex items-center justify-center gap-2 transition-all ${outputMode === 'flatlay' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-black'}`}>
                                <Layers className="w-4 h-4" /> Flatlay
                            </button>
                        </div>
                    </div>

                    {/* Category Input */}
                    <div className="relative" ref={catRef}>
                        <label className="block text-xs font-semibold text-gray-700 mb-2 flex justify-between">
                            Loại trang phục
                            <button onClick={() => setShowCatSuggestions(!showCatSuggestions)} className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-[10px] bg-blue-50 px-2 py-0.5 rounded-full"><Lightbulb className="w-3 h-3" /> Gợi ý</button>
                        </label>
                        <input type="text" value={category} onChange={e => setCategory(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-black/5 transition-all font-medium focus:bg-white" placeholder="VD: Áo thun Oversized..." />
                        {showCatSuggestions && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 z-20 max-h-60 overflow-y-auto p-4 animate-in fade-in zoom-in duration-200">
                                <div className="mb-4">
                                    <h4 className="text-xs font-bold uppercase text-gray-400 mb-2">Nam</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {EXTENDED_CATEGORIES.men.map(c => <button key={c.id} onClick={() => { setCategory(c.name); setShowCatSuggestions(false); }} className="px-3 py-1.5 bg-gray-50 hover:bg-black hover:text-white rounded-lg text-xs transition-colors border border-gray-100">{c.name}</button>)}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold uppercase text-gray-400 mb-2">Nữ</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {EXTENDED_CATEGORIES.women.map(c => <button key={c.id} onClick={() => { setCategory(c.name); setShowCatSuggestions(false); }} className="px-3 py-1.5 bg-gray-50 hover:bg-black hover:text-white rounded-lg text-xs transition-colors border border-gray-100">{c.name}</button>)}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Material Input */}
                    <div className="relative" ref={matRef}>
                        <label className="block text-xs font-semibold text-gray-700 mb-2 flex justify-between">
                            Chất liệu vải
                            <button onClick={() => setShowMatSuggestions(!showMatSuggestions)} className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-[10px] bg-blue-50 px-2 py-0.5 rounded-full"><Lightbulb className="w-3 h-3" /> Gợi ý</button>
                        </label>
                        <input type="text" value={material} onChange={e => setMaterial(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-black/5 transition-all font-medium focus:bg-white" placeholder="VD: Cotton 100%, Lụa..." />
                        {showMatSuggestions && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 z-20 max-h-60 overflow-y-auto p-2 animate-in fade-in zoom-in duration-200">
                                {EXTENDED_MATERIALS.map(m => (
                                    <button key={m.id} onClick={() => { setMaterial(m.name); setShowMatSuggestions(false); }} className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg group transition-colors">
                                        <p className="text-sm font-bold text-gray-800 group-hover:text-black">{m.name}</p>
                                        <p className="text-[10px] text-gray-400 line-clamp-1">{m.desc}</p>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Color Picker */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-2">Màu sắc chủ đạo</label>
                        <div className="flex bg-gray-100 p-1 rounded-lg mb-3">
                            <button onClick={() => setColorMode('sketch')} className={`flex-1 py-1.5 text-xs font-bold rounded-md flex items-center justify-center gap-2 transition-all ${colorMode === 'sketch' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-black'}`}><Pipette className="w-3 h-3" /> Theo bản vẽ</button>
                            <button onClick={() => setColorMode('custom')} className={`flex-1 py-1.5 text-xs font-bold rounded-md flex items-center justify-center gap-2 transition-all ${colorMode === 'custom' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-black'}`}><Palette className="w-3 h-3" /> Tự chọn màu</button>
                        </div>
                        {colorMode === 'custom' && (
                            <div className="flex items-center gap-3 animate-in fade-in">
                                <input type="color" value={customColor} onChange={(e) => setCustomColor(e.target.value)} className="w-8 h-8 rounded-full border-none cursor-pointer p-0 overflow-hidden" />
                                <span className="font-mono text-xs font-bold uppercase">{customColor}</span>
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-2 flex items-center gap-2"><FileText className="w-3 h-3" /> Mô tả bổ sung</label>
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Chi tiết tay áo, đường chỉ may..." className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-black/5 transition-all font-medium h-20 resize-none focus:bg-white" />
                    </div>
                </div>

                <div className="pb-4">
                    <GenerationSettingsPanel config={config} onChange={setConfig} isPoseSelectionActive={false} />
                </div>
            </div>

            {/* 3. Sticky Footer (Action) */}
            <div className="flex-none p-5 border-t border-gray-100 bg-white shadow-[0_-4px_10px_rgba(0,0,0,0.03)] z-30">
                <Button onClick={handleGenerate} loading={isGenerating} className="w-full h-12 text-base shadow-xl rounded-xl">
                    {isGenerating ? 'Đang vẽ...' : 'Tạo Thiết Kế'} <Wand2 className="w-5 h-5 ml-1" />
                </Button>
                <div className="flex items-center justify-center gap-2 mt-3 text-[10px] text-gray-400 font-medium">
                    <span className="bg-black text-white px-2 py-0.5 rounded">{estimatedCredits} credits (Ước tính)</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span>Model: Nano Banana Pro™</span>
                </div>
            </div>
        </div>

        {/* --- RIGHT COLUMN: RESULTS (Scrollable) --- */}
        <div className="flex-1 h-full bg-gray-50/50 overflow-y-auto p-4 md:p-8">
             {/* Current Generation Result */}
             <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">3. Kết quả (Preview)</h3>
                    {result.length > 0 && !isGenerating && <span className="text-xs text-green-600 font-bold bg-green-50 px-3 py-1 rounded-full border border-green-100">Hoàn tất</span>}
                </div>
                
                {(isGenerating || result.length > 0) ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {isGenerating ? (
                        Array.from({ length: config.count }).map((_, idx) => (
                            <div key={`loading-${idx}`} className="relative aspect-[3/4] bg-white rounded-2xl overflow-hidden border border-gray-200 animate-pulse flex flex-col items-center justify-center shadow-sm">
                                <Loader2 className="w-8 h-8 text-gray-300 animate-spin mb-2" />
                                <span className="text-xs text-gray-400 font-medium">Đang vẽ...</span>
                            </div>
                        ))
                    ) : (
                        result.map((img, idx) => (
                        <div key={idx} className="relative aspect-[3/4] bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100 group transition-transform hover:-translate-y-1">
                            <FadeImage src={img} className="w-full h-full object-cover" />
                            <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-200">
                                <button onClick={() => handleDownload(img)} className="p-2 bg-white rounded-full shadow-lg hover:bg-black hover:text-white transition-colors" title="Tải xuống"><Download className="w-4 h-4" /></button>
                                <button onClick={() => setLightboxImage(img)} className="p-2 bg-white rounded-full shadow-lg hover:bg-black hover:text-white transition-colors" title="Xem chi tiết"><Maximize2 className="w-4 h-4" /></button>
                            </div>
                        </div>
                        ))
                    )}
                </div>
                ) : (
                <div className="aspect-[16/9] bg-white rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-300">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <ImageIcon className="w-8 h-8 opacity-40" />
                    </div>
                    <p className="text-sm font-medium text-gray-400">Khu vực hiển thị kết quả</p>
                    <p className="text-xs text-gray-300 mt-1">Vui lòng cấu hình và nhấn "Tạo Thiết Kế"</p>
                </div>
                )}
             </div>

             {/* Recent History Section */}
             {recentHistory.length > 0 && (
                 <div className="max-w-5xl mx-auto mt-12 pt-8 border-t border-gray-200">
                     <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-6 flex items-center gap-2">
                         <Layout className="w-4 h-4" /> Đã tạo gần đây (Sketch)
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
       
      {/* Lightbox Modal */}
      {lightboxImage && (
          <ImageLightbox src={lightboxImage} onClose={() => setLightboxImage(null)} />
      )}
    </div>
  );
};
