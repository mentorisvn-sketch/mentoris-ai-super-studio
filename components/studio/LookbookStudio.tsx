
import React, { useState, useRef, useEffect } from 'react';
import { Camera, ChevronRight, MapPin, PersonStanding, User as UserIcon, Download, Maximize2, Plus, X, History, Upload, Scissors, Loader2, Layout, Sparkles, RefreshCcw, Send, Edit3, ChevronDown, ChevronUp } from 'lucide-react';
import { Button, SectionHeader, FileUploader, GenerationSettingsPanel, ImageLightbox, FadeImage } from '../ui';
import { ModelLibraryModal, LookbookBackgroundModal, PoseLibraryModal, HistoryModal } from './Modals';
import { DEFAULT_GEN_CONFIG, LOOKBOOK_ANGLES } from '../../constants';
import { GenConfig, GenerationResult, LibraryAsset } from '../../types';
import { generateLookbook } from '../../services/ai';
import { useApp } from '../../contexts/AppContext';
import { getUserHistory } from '../../services/storageService';
import { toast } from 'sonner';

export const LookbookStudio = () => {
  const { addUsageLog, user } = useApp();
  
  // --- STATE ---
  const [productImage, setProductImage] = useState<string | null>(null);
  const [accessories, setAccessories] = useState<string[]>([]);
  
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  
  // Stores full objects
  const [selectedConcept, setSelectedConcept] = useState<LibraryAsset | null>(null);
  const [selectedPoses, setSelectedPoses] = useState<LibraryAsset[]>([]);
  
  // Custom Prompt State
  const [sceneDescription, setSceneDescription] = useState("");
  const [isPromptExpanded, setIsPromptExpanded] = useState(false); // New: Progressive Disclosure

  // Modals
  const [isModelModalOpen, setModelModalOpen] = useState(false);
  const [isConceptModalOpen, setConceptModalOpen] = useState(false);
  const [isPoseModalOpen, setPoseModalOpen] = useState(false);
  const [isHistoryModalOpen, setHistoryModalOpen] = useState(false);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [regeneratingIndices, setRegeneratingIndices] = useState<number[]>([]);
  const [activeRegenIndex, setActiveRegenIndex] = useState<number | null>(null);
  const [regenNote, setRegenNote] = useState("");

  const [result, setResult] = useState<string[]>([]);
  const [config, setConfig] = useState<GenConfig>(DEFAULT_GEN_CONFIG);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  
  const [recentHistory, setRecentHistory] = useState<{ id: string, url: string }[]>([]);
  const [historyItems, setHistoryItems] = useState<GenerationResult[]>([]);

  const countToGenerate = selectedPoses.length > 0 ? selectedPoses.length : config.count;

  // Pricing Logic (CẬP NHẬT MỚI)
  const calculateCredits = (cfg: GenConfig, count: number) => {
      // Quy ước: 1K=4, 2K=5, 4K=10
      let perImage = 4; 
      
      if (cfg.resolution === '2K') perImage = 5;
      if (cfg.resolution === '4K') perImage = 10;
      
      return perImage * count;
  };

  const estimatedCredits = calculateCredits(config, countToGenerate);

  // --- EFFECTS ---
  useEffect(() => {
    if (selectedPoses.length > 0) {
        setConfig(prev => ({ ...prev, count: selectedPoses.length }));
    }
  }, [selectedPoses.length]);

  useEffect(() => {
      const fetchHistory = async () => {
          if (!user) return;
          try {
              const history = await getUserHistory(user.id);
              const lookbookHistory = history
                  .filter(item => item.record.type === 'lookbook')
                  .slice(0, 50) 
                  .map(h => ({ id: h.id, url: h.url }));
              setRecentHistory(lookbookHistory);
          } catch (e) { console.error(e); }
      };
      
      if (!isGenerating && regeneratingIndices.length === 0) {
          fetchHistory();
      }
  }, [user, isGenerating, regeneratingIndices.length]);

  // --- HANDLERS ---

  const handleOpenProductHistory = async () => {
      if(!user) return;
      try {
         const data = await getUserHistory(user.id);
         setHistoryItems(data.map(d => ({
             id: d.id,
             imageUrl: d.url,
             promptUsed: '',
             type: d.record.type as any,
             createdAt: d.record.createdAt
         })));
         setHistoryModalOpen(true);
      } catch(e) { console.error(e); }
  };

  // Select Concept Handler: Auto-fill Prompt
  const handleSelectConcept = (asset: LibraryAsset) => {
      setSelectedConcept(asset);
      setSceneDescription(asset.prompt_payload); // Sync logic
      setIsPromptExpanded(false); // Auto-collapse to keep UI clean
  };

  // Sync Logic: Detect Manual Edits
  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newVal = e.target.value;
      setSceneDescription(newVal);
      
      // If user edits text and it diverges from the selected preset, detach the preset (Visual Sync)
      if (selectedConcept && newVal !== selectedConcept.prompt_payload) {
          setSelectedConcept(null);
      }
  };

  const removeAccessory = (index: number) => {
      setAccessories(prev => prev.filter((_, i) => i !== index));
  };

  // Generate All
  const handleGenerate = async () => {
    if (!productImage) return toast.error("Vui lòng tải lên ảnh sản phẩm!");

    if (user && user.credits < estimatedCredits) {
        toast.error("Không đủ Credits", { description: `Cần ${estimatedCredits}, bạn có ${user.credits}` });
        return;
    }

    setIsGenerating(true);
    setResult([]);

    try {
        const poseDescriptions = selectedPoses.map(p => p.prompt_payload);
        
        // Use custom prompt if available, otherwise fallback to "Studio lighting"
        const conceptDesc = sceneDescription.trim() || "Professional studio lighting, neutral background.";
        
        const activeConfig = selectedPoses.length > 0 
            ? { ...config, count: selectedPoses.length }
            : config;

        const res = await generateLookbook(
            productImage, 
            modelUrl, 
            accessories, 
            conceptDesc, 
            poseDescriptions, 
            activeConfig
        );
        
        setResult(res.images);

       addUsageLog({
           id: Date.now().toString(),
           timestamp: Date.now(),
           userId: user?.id || 'guest',
           userName: user?.name || 'Guest',
           action: 'LOOKBOOK_GEN',
           modelName: 'gemini-3-pro-image-preview',
           resolution: config.resolution,
           tokens: res.usage,
           cost: res.usage.imageCount * 0.04
       }, estimatedCredits);

       toast.success("Lookbook hoàn tất!", { description: `-${estimatedCredits} Credits` });

    } catch (e) {
        console.error(e);
        toast.error("Lỗi tạo Lookbook");
    } finally {
        setIsGenerating(false);
    }
  };

  // Prepare Regeneration: Open Overlay
  const handleInitRegenerate = (index: number) => {
      setActiveRegenIndex(index);
      setRegenNote(""); 
  };

  // Confirm Regeneration with Note
  const handleConfirmRegenerate = async (index: number) => {
      setActiveRegenIndex(null); 
      if (!productImage) return;
      
      const singleCreditCost = calculateCredits(config, 1);
      if (user && user.credits < singleCreditCost) {
          toast.error("Không đủ Credits");
          return;
      }

      setRegeneratingIndices(prev => [...prev, index]);

      try {
          const conceptDesc = sceneDescription.trim() || "Professional studio lighting";
          let poseDesc = "";
          if (selectedPoses.length > 0) {
               poseDesc = selectedPoses[index].prompt_payload;
          } else {
               poseDesc = LOOKBOOK_ANGLES[index % LOOKBOOK_ANGLES.length];
          }

          const res = await generateLookbook(
              productImage,
              modelUrl,
              accessories,
              conceptDesc,
              [poseDesc], 
              { ...config, count: 1 },
              regenNote 
          );

          if (res.images.length > 0) {
              const newUrl = res.images[0];
              setResult(prev => {
                  const newResult = [...prev];
                  newResult[index] = newUrl;
                  return newResult;
              });

              addUsageLog({
                id: Date.now().toString(),
                timestamp: Date.now(),
                userId: user?.id || 'guest',
                userName: user?.name || 'Guest',
                action: 'LOOKBOOK_REGEN',
                modelName: 'gemini-3-pro-image-preview',
                resolution: config.resolution,
                tokens: res.usage,
                cost: res.usage.imageCount * 0.04
            }, singleCreditCost);
            
            toast.success("Đã tạo lại ảnh");
          }

      } catch (e) {
          console.error("Regeneration failed", e);
          toast.error("Lỗi tạo lại ảnh");
      } finally {
          setRegeneratingIndices(prev => prev.filter(i => i !== index));
      }
  };

  const handleDownload = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `mentoris-lookbook-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const accInputRef = useRef<HTMLInputElement>(null);
  const modelInputRef = useRef<HTMLInputElement>(null);

  // Helper to determine display text for Scene
  const getSceneDisplayText = () => {
      if (selectedConcept) return selectedConcept.title;
      if (sceneDescription && sceneDescription.trim().length > 0) return "Tùy chỉnh (Custom)";
      return "Chọn bối cảnh";
  };

  return (
    <div className="flex flex-col lg:flex-row h-full bg-white overflow-hidden">
       {/* --- LEFT COLUMN: FIXED VIEWPORT --- */}
       <div className="w-full lg:w-[400px] xl:w-[450px] flex-shrink-0 h-full flex flex-col border-r border-gray-200 bg-white z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
          {/* 1. Header */}
          <div className="flex-none p-5 border-b border-gray-100 bg-white z-10">
             <SectionHeader title="Lookbook Studio" subtitle="Face-Lock Technology" />
          </div>

          {/* 2. Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 [&::-webkit-scrollbar]:hidden">
                {/* 1. Main Product */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                   <div className="flex justify-between items-center mb-2">
                       <label className="text-xs font-bold uppercase tracking-wider text-gray-500">1. Sản phẩm chính</label>
                       <button 
                         onClick={handleOpenProductHistory}
                         className="flex items-center gap-1 text-[10px] font-bold bg-gray-100 px-2 py-1 rounded-md hover:bg-black hover:text-white transition-colors"
                       >
                           <History className="w-3 h-3" /> Lịch sử
                       </button>
                   </div>
                   <FileUploader 
                        label="" 
                        image={productImage} 
                        onFileSelect={(url, base64) => setProductImage(base64)} 
                        onRemove={() => setProductImage(null)} 
                        onPreview={() => productImage && setLightboxImage(productImage)}
                    />
                </div>

                {/* 2. Accessories */}
                <div>
                    <div className="flex justify-between items-center mb-2 px-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500">2. Phụ kiện (Accessories)</label>
                        <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-500">{accessories.length} items</span>
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
                            if(file) { const reader = new FileReader(); reader.onload = (ev) => ev.target?.result && setAccessories(prev => [...prev, ev.target!.result as string]); reader.readAsDataURL(file); }
                        }} />
                    </div>
                </div>

                {/* 3. Studio Setup */}
                <div className="space-y-4">
                   <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 pb-2">3. Cấu hình Studio</h3>
                   
                   {/* Model Selection */}
                   <div className="flex flex-col gap-2">
                       <label className="block text-xs font-semibold text-gray-700">Người mẫu (Model)</label>
                       <div className="flex gap-2">
                           <div className="flex-1 flex items-center justify-between p-3 border border-gray-200 rounded-xl hover:border-black transition-all cursor-pointer bg-white" onClick={() => setModelModalOpen(true)}>
                              <div className="flex items-center gap-3">
                                 <div className="w-9 h-9 rounded-full bg-gray-50 border border-gray-200 overflow-hidden flex-shrink-0">
                                    {modelUrl ? <img src={modelUrl} className="w-full h-full object-cover" /> : <UserIcon className="w-4 h-4 m-auto text-gray-400 mt-2" />}
                                 </div>
                                 <div className="min-w-0">
                                     <p className="text-[10px] font-bold text-gray-400 uppercase">Thư viện</p>
                                     <p className="text-xs font-bold text-black truncate">{modelUrl ? 'Đã chọn' : 'Chọn mẫu'}</p>
                                 </div>
                              </div>
                              <ChevronRight className="w-4 h-4 text-gray-400" />
                           </div>
                           <div className="w-12 flex flex-col items-center justify-center border border-gray-200 rounded-xl hover:border-black transition-all cursor-pointer bg-white text-gray-400 hover:text-black" onClick={() => modelInputRef.current?.click()} title="Upload">
                                <Upload className="w-4 h-4" />
                                <input type="file" ref={modelInputRef} className="hidden" accept="image/*" onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if(file) { const reader = new FileReader(); reader.onload = (ev) => setModelUrl(ev.target?.result as string); reader.readAsDataURL(file); }
                                }} />
                           </div>
                       </div>
                   </div>

                   {/* Concept & Prompt */}
                   <div className={`border border-gray-200 rounded-xl overflow-hidden transition-all bg-white ${isPromptExpanded ? 'ring-1 ring-black/10' : ''}`}>
                       <div className="flex items-center justify-between p-3 bg-white hover:bg-gray-50 transition-colors">
                          <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => setConceptModalOpen(true)}>
                             <div className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                                <MapPin className="w-4 h-4 text-gray-400" />
                             </div>
                             <div>
                                 <p className="text-[10px] font-bold text-gray-400 uppercase">Bối cảnh</p>
                                 <p className="text-xs font-bold text-black truncate max-w-[150px]">{getSceneDisplayText()}</p>
                             </div>
                          </div>
                          <div className="flex items-center gap-1 border-l border-gray-100 pl-2">
                             <button onClick={() => setIsPromptExpanded(!isPromptExpanded)} className={`p-1.5 rounded-lg transition-colors ${isPromptExpanded ? 'bg-black text-white' : 'text-gray-400 hover:text-black hover:bg-gray-100'}`} title="Sửa">
                                <Edit3 className="w-3.5 h-3.5" />
                             </button>
                             <button onClick={() => setConceptModalOpen(true)} className="p-1 text-gray-400 hover:text-black">
                                <ChevronRight className="w-4 h-4" />
                             </button>
                          </div>
                       </div>
                       {isPromptExpanded && (
                           <div className="border-t border-gray-200 bg-gray-50 p-3 animate-in slide-in-from-top-2 duration-200">
                               <textarea autoFocus value={sceneDescription} onChange={handlePromptChange} placeholder="Mô tả bối cảnh..." className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs h-20 resize-none outline-none focus:border-black transition-all" />
                           </div>
                       )}
                   </div>

                   {/* Pose Selection */}
                   <div className="flex items-center justify-between p-3 border border-gray-200 rounded-xl hover:border-black transition-all cursor-pointer bg-white" onClick={() => setPoseModalOpen(true)}>
                      <div className="flex items-center gap-3">
                         <div className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                            <PersonStanding className="w-4 h-4 text-gray-400" />
                         </div>
                         <div>
                             <p className="text-[10px] font-bold text-gray-400 uppercase">Dáng chụp</p>
                             <p className="text-xs font-bold text-black">{selectedPoses.length > 0 ? `${selectedPoses.length} dáng` : 'Tự động'}</p>
                         </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                   </div>
                </div>

                <div className="pb-4">
                    <GenerationSettingsPanel config={config} onChange={setConfig} isPoseSelectionActive={selectedPoses.length > 0} />
                </div>
          </div>

          {/* 3. Footer */}
          <div className="flex-none p-5 border-t border-gray-100 bg-white shadow-[0_-4px_10px_rgba(0,0,0,0.03)] z-30">
                <Button onClick={handleGenerate} loading={isGenerating} className="w-full h-12 text-base shadow-xl rounded-xl">
                    {isGenerating ? 'Đang xử lý...' : 'Chụp Lookbook'} <Camera className="w-5 h-5 ml-1" />
                </Button>
                <div className="flex items-center justify-center gap-2 mt-3 text-[10px] text-gray-400 font-medium">
                    <span className="bg-black text-white px-2 py-0.5 rounded">{estimatedCredits} credits</span>
                    <span className="font-bold text-green-600">Enterprise Mode</span>
                </div>
          </div>
       </div>

       {/* --- RIGHT COLUMN: RESULTS --- */}
       <div className="flex-1 h-full bg-gray-50/50 overflow-y-auto p-4 md:p-8">
            <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">4. Lookbook Output</h3>
                    {result.length > 0 && !isGenerating && <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">Hoàn thành: {result.length} ảnh</span>}
                </div>
                
                {(isGenerating || result.length > 0) ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
                        {Array.from({ length: Math.max(countToGenerate, result.length) }).map((_, idx) => {
                            const isThisGenerating = isGenerating || regeneratingIndices.includes(idx);
                            const isThisActiveRegen = activeRegenIndex === idx;
                            const hasResult = result[idx] && !isThisGenerating;

                            return (
                                <div key={idx} className="relative aspect-[3/4] bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100 group animate-in zoom-in duration-300">
                                    {isThisGenerating && (
                                        <div className="absolute inset-0 bg-white z-20 flex flex-col items-center justify-center text-center p-4">
                                            <div className="relative z-10 flex flex-col items-center gap-3">
                                                <div className="relative">
                                                    <div className="absolute inset-0 bg-blue-100 rounded-full blur-lg animate-ping"></div>
                                                    <Scissors className="w-8 h-8 text-black animate-bounce relative z-10" />
                                                </div>
                                                <p className="text-xs font-bold text-black animate-pulse">
                                                    {regeneratingIndices.includes(idx) ? 'Đang sửa...' : 'Đang chụp...'}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Regeneration Overlay Input */}
                                    {isThisActiveRegen && (
                                        <div className="absolute inset-0 z-30 bg-black/80 backdrop-blur-sm p-4 flex flex-col justify-center animate-in fade-in duration-200">
                                            <h4 className="text-white text-xs font-bold mb-2 flex items-center gap-2">
                                                <Sparkles className="w-3 h-3 text-yellow-400" /> Ghi chú điều chỉnh
                                            </h4>
                                            <textarea autoFocus value={regenNote} onChange={(e) => setRegenNote(e.target.value)} placeholder="VD: Đổi tay áo xắn lên..." className="w-full bg-white/10 border border-white/20 rounded-lg p-2 text-white text-xs placeholder:text-gray-500 outline-none focus:border-white/50 mb-3 h-20 resize-none" />
                                            <div className="flex gap-2">
                                                <button onClick={() => setActiveRegenIndex(null)} className="flex-1 py-2 bg-white/10 text-white rounded-lg text-xs font-bold hover:bg-white/20">Hủy</button>
                                                <button onClick={() => handleConfirmRegenerate(idx)} className="flex-1 py-2 bg-[#66E91E] text-black rounded-lg text-xs font-bold hover:bg-[#5cd41b]">Tạo lại</button>
                                            </div>
                                        </div>
                                    )}

                                    {hasResult && <FadeImage src={result[idx]} className="w-full h-full object-cover" />}

                                    {hasResult && !isThisActiveRegen && (
                                        <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 z-30">
                                            <button onClick={() => handleInitRegenerate(idx)} className="p-2 bg-black text-white rounded-full shadow-md hover:bg-gray-800 transition-colors" title="Tạo lại"><RefreshCcw className="w-4 h-4" /></button>
                                            <button onClick={() => handleDownload(result[idx])} className="p-2 bg-white rounded-full shadow-md hover:bg-black hover:text-white transition-colors" title="Tải xuống"><Download className="w-4 h-4" /></button>
                                            <button onClick={() => setLightboxImage(result[idx])} className="p-2 bg-white rounded-full shadow-md hover:bg-black hover:text-white transition-colors" title="Xem"><Maximize2 className="w-4 h-4" /></button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="aspect-[16/9] bg-white rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-300">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <Camera className="w-8 h-8 opacity-40" />
                        </div>
                        <p className="text-sm font-medium text-gray-400">Khu vực hiển thị kết quả</p>
                        <p className="text-xs text-gray-300 mt-1">Chọn sản phẩm & người mẫu để bắt đầu chụp</p>
                    </div>
                )}
            </div>

            {/* Recent History */}
            {recentHistory.length > 0 && (
                 <div className="max-w-5xl mx-auto mt-12 pt-8 border-t border-gray-200">
                     <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-6 flex items-center gap-2">
                         <Layout className="w-4 h-4" /> Đã chụp gần đây
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

       {/* Modals */}
       <ModelLibraryModal isOpen={isModelModalOpen} onClose={() => setModelModalOpen(false)} onSelect={setModelUrl} />
       <LookbookBackgroundModal isOpen={isConceptModalOpen} onClose={() => setConceptModalOpen(false)} selectedId={selectedConcept?.id || ''} onSelect={handleSelectConcept} />
       <PoseLibraryModal isOpen={isPoseModalOpen} onClose={() => setPoseModalOpen(false)} selectedPoseIds={selectedPoses.map(p => p.id)} onTogglePose={(pose) => { setSelectedPoses(prev => { const exists = prev.find(p => p.id === pose.id); if (exists) return prev.filter(p => p.id !== pose.id); return [...prev, pose]; }); }} />
       <HistoryModal isOpen={isHistoryModalOpen} onClose={() => setHistoryModalOpen(false)} history={historyItems} onSelect={setProductImage} />
       
       {lightboxImage && <ImageLightbox src={lightboxImage} onClose={() => setLightboxImage(null)} />}
    </div>
  );
};
