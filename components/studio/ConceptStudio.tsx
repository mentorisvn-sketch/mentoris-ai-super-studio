import React, { useState, useEffect } from 'react';
import { Aperture, Download, Maximize2, Loader2, Sparkles, Image as ImageIcon, Lightbulb, Edit3 } from 'lucide-react';
import { Button, SectionHeader, FileUploader, GenerationSettingsPanel, ImageLightbox, FadeImage } from '../ui';
import { DEFAULT_GEN_CONFIG } from '../../constants';
import { GenConfig, LibraryAsset } from '../../types';
import { generateConceptProduct } from '../../services/ai';
import { useApp } from '../../contexts/AppContext';
import { getUserHistory } from '../../services/storageService';
import { ConceptLibraryModal } from './Modals';
import { toast } from 'sonner';

export const ConceptStudio = () => {
    // 🔥 Thêm syncCredits
    const { addUsageLog, user, syncCredits } = useApp();
    
    // ===========================================================================
    // 1. STATE MANAGEMENT
    // ===========================================================================
    
    const [productImage, setProductImage] = useState<string | null>(null);
    const [styleRef, setStyleRef] = useState<string | null>(null);
    const [prompt, setPrompt] = useState("");
    
    const [isConceptModalOpen, setConceptModalOpen] = useState(false);
    
    const [config, setConfig] = useState<GenConfig>(DEFAULT_GEN_CONFIG);
    const [isGenerating, setIsGenerating] = useState(false);
    const [result, setResult] = useState<string[]>([]);
    const [lightboxImage, setLightboxImage] = useState<string | null>(null);
    const [recentHistory, setRecentHistory] = useState<{ id: string, url: string }[]>([]);

    // ===========================================================================
    // 2. DATA FETCHING
    // ===========================================================================
    useEffect(() => {
        const fetchHistory = async () => {
            if (!user) return;
            try {
                const history = await getUserHistory(user.id);
                const conceptHistory = history
                    .filter(item => item.record.type === 'concept-product')
                    .slice(0, 50)
                    .map(h => ({ id: h.id, url: h.url }));
                setRecentHistory(conceptHistory);
            } catch (e) { console.error(e); }
        };
        if (!isGenerating) fetchHistory();
    }, [user, isGenerating]);

    // ===========================================================================
    // 3. PRICING LOGIC (ESTIMATION ONLY)
    // ===========================================================================
    
    // Chỉ dùng để hiển thị ước tính, không dùng để trừ tiền
    const calculateEstimatedCredits = (cfg: GenConfig) => {
        let perImage = 4; 
        if (cfg.resolution === '2K') perImage = 5;  
        if (cfg.resolution === '4K') perImage = 10; 
        return perImage * cfg.count;
    };

    const estimatedCredits = calculateEstimatedCredits(config);

    // ===========================================================================
    // 4. MAIN HANDLERS
    // ===========================================================================

    const handleGenerate = async () => {
        if (!productImage) return toast.error("Vui lòng tải lên ảnh sản phẩm!");
        if (!prompt && !styleRef) return toast.error("Vui lòng nhập mô tả hoặc ảnh tham chiếu!");

        // Check sơ bộ ở Client
        if (user && user.credits < estimatedCredits) {
             toast.error("Không đủ Credits", { description: `Cần khoảng ${estimatedCredits}, bạn có ${user.credits}` });
             return;
        }

        setIsGenerating(true);
        setResult([]);

        try {
            // 1. Gọi AI (Server xử lý toàn bộ)
            const res = await generateConceptProduct(
                productImage,
                styleRef,
                prompt,
                config
            );
            
            setResult(res.images);

            // 2. Log UI (Không trừ tiền ở Client)
            addUsageLog({
                id: Date.now().toString(),
                timestamp: Date.now(),
                userId: user?.id || 'guest',
                userName: user?.name || 'Guest',
                action: 'CONCEPT_GEN',
                modelName: 'gemini-3-pro-image-preview',
                resolution: config.resolution,
                tokens: res.usage,
                cost: 0 // Client để 0
            }); // Bỏ tham số creditsToDeduct
            
            // 3. 🔥 Cập nhật số dư từ Server
            if (res.newBalance !== undefined) {
                syncCredits(res.newBalance);
            }

            toast.success("Concept hoàn tất!");
        } catch (e: any) {
            console.error(e);
            toast.error("Lỗi tạo ảnh concept.", { description: e.message });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownload = (url: string) => {
        const link = document.createElement('a');
        link.href = url;
        link.download = `mentoris-concept-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleSelectConcept = (asset: LibraryAsset) => {
        setPrompt(asset.prompt_payload);
    };

    // ===========================================================================
    // 5. RENDER UI
    // ===========================================================================
    return (
        <div className="flex flex-col lg:flex-row h-full bg-white overflow-hidden">
            {/* --- LEFT COLUMN: INPUTS & SETTINGS --- */}
            <div className="w-full lg:w-[400px] xl:w-[450px] flex-shrink-0 h-full flex flex-col border-r border-gray-200 bg-white z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
                <div className="flex-none p-5 border-b border-gray-100 bg-white z-10">
                    <SectionHeader title="Concept Studio" subtitle="Quảng cáo & Thương mại" />
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-6 [&::-webkit-scrollbar]:hidden">
                    {/* 1. Subject */}
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">1. Sản phẩm (Subject)</label>
                            </div>
                            <FileUploader 
                            label="" 
                            image={productImage} 
                            onFileSelect={(url, base64) => setProductImage(base64)} 
                            onRemove={() => setProductImage(null)}
                            onPreview={() => productImage && setLightboxImage(productImage)}
                        />
                    </div>

                    {/* 2. Style Ref */}
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">2. Tham chiếu Style</label>
                            </div>
                            <FileUploader 
                            label="" 
                            image={styleRef} 
                            onFileSelect={(url, base64) => setStyleRef(base64)} 
                            onRemove={() => setStyleRef(null)}
                            onPreview={() => styleRef && setLightboxImage(styleRef)}
                        />
                        <p className="text-[10px] text-gray-400 mt-2">Học ánh sáng, bố cục và màu sắc từ ảnh này.</p>
                    </div>

                    {/* 3. Concept Prompt */}
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">3. Mô tả ý tưởng</label>
                            <button 
                                onClick={() => setConceptModalOpen(true)}
                                className="flex items-center gap-1 text-[10px] font-bold bg-gray-100 px-2 py-1 rounded-md hover:bg-black hover:text-white transition-colors"
                            >
                                <Lightbulb className="w-3 h-3" /> Gợi ý
                            </button>
                            </div>
                            <div className="relative">
                                <textarea 
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Mô tả chi tiết bối cảnh, ánh sáng, vật liệu nền, đạo cụ..."
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm h-32 resize-none outline-none focus:ring-1 focus:ring-black/20 focus:border-black transition-all placeholder:text-gray-400"
                                />
                                <Edit3 className="absolute bottom-3 right-3 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                    </div>

                    {/* 4. Generation Settings */}
                    <div className="pb-4">
                        <GenerationSettingsPanel config={config} onChange={setConfig} isPoseSelectionActive={false} />
                    </div>
                </div>

                {/* Footer Action Button */}
                <div className="flex-none p-5 border-t border-gray-100 bg-white shadow-[0_-4px_10px_rgba(0,0,0,0.03)] z-30">
                    <Button onClick={handleGenerate} loading={isGenerating} className="w-full h-12 text-base shadow-xl rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white">
                        {isGenerating ? 'Đang sáng tạo...' : 'Tạo Concept'} <Aperture className="w-5 h-5 ml-1" />
                    </Button>
                    <div className="flex items-center justify-center gap-2 mt-3 text-[10px] text-gray-400 font-medium">
                        <span className="bg-black text-white px-2 py-0.5 rounded">{estimatedCredits} credits (Ước tính)</span>
                    </div>
                </div>
            </div>

            {/* --- RIGHT COLUMN: RESULTS GALLERY --- */}
            <div className="flex-1 h-full bg-gray-50/50 overflow-y-auto p-4 md:p-8">
                <div className="max-w-5xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">4. Kết quả Concept</h3>
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
                                <ImageIcon className="w-8 h-8 opacity-40" />
                            </div>
                            <p className="text-sm font-medium text-gray-400">Khu vực hiển thị kết quả</p>
                        </div>
                    )}
                </div>
                
                {recentHistory.length > 0 && (
                    <div className="max-w-5xl mx-auto mt-12 pt-8 border-t border-gray-200">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-6 flex items-center gap-2">
                            <Sparkles className="w-4 h-4" /> Đã tạo gần đây
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
            
            {/* --- MODALS --- */}
            <ConceptLibraryModal isOpen={isConceptModalOpen} onClose={() => setConceptModalOpen(false)} selectedId={""} onSelect={handleSelectConcept} />
            {lightboxImage && <ImageLightbox src={lightboxImage} onClose={() => setLightboxImage(null)} />}
        </div>
    );
};
