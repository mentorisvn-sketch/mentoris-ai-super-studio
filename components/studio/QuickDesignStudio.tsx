
import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, Layers, Download, MousePointer2, Type, Image as ImageIcon, 
  Trash2, RotateCw, X, Sparkles, ZoomIn, ZoomOut, RefreshCcw, 
  Check, Hand, AlignLeft, AlignCenter, AlignRight, GripVertical,
  Lock, Unlock, Eye, EyeOff, Sun, Contrast, Droplets, ArrowUp, ArrowDown, 
  Sliders, Palette, ImagePlus, Wand2, Ratio
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/Button';

// --- TYPES ---
interface LayerFilters {
    brightness: number;
    contrast: number;
    saturation: number;
}

interface DesignLayer {
  id: string;
  type: 'image' | 'text'; // Removed 'icon'
  content: string; 
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scale: number;
  opacity: number;
  zIndex: number;
  visible: boolean;
  locked: boolean;
  // Metadata for text
  color?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  textAlign?: 'left' | 'center' | 'right';
  // Metadata for image
  filters?: LayerFilters;
}

interface BaseImage {
  url: string;
  width: number;
  height: number;
}

const FONTS = [
    { name: 'Inter', family: 'Inter, sans-serif' },
    { name: 'Playfair', family: 'Playfair Display, serif' },
    { name: 'Roboto', family: 'Roboto, sans-serif' },
    { name: 'Montserrat', family: 'Montserrat, sans-serif' },
    { name: 'Merriweather', family: 'Merriweather, serif' },
    { name: 'Lobster', family: 'cursive' },
];

export const QuickDesignStudio = () => {
  // --- STATE ---
  // 1. Core Data
  const [baseImage, setBaseImage] = useState<BaseImage | null>(null);
  const [layers, setLayers] = useState<DesignLayer[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);

  // 2. Viewport
  const [viewState, setViewState] = useState({ scale: 0.5, x: 0, y: 0 });
  const [tool, setTool] = useState<'select' | 'hand'>('select');
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 3. Interaction
  const [isPanning, setIsPanning] = useState(false);
  const [isDraggingLayer, setIsDraggingLayer] = useState(false);
  const [interactionMode, setInteractionMode] = useState<'move' | 'resize' | 'rotate' | null>(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [initialLayerState, setInitialLayerState] = useState<DesignLayer | null>(null);

  // 4. AI State (Expanded for V13)
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiConfig, setAiConfig] = useState<{ res: '1K' | '2K' | '4K', ratio: string }>({ res: '1K', ratio: '1:1' });
  const [aiCreativity, setAiCreativity] = useState(75); // New Slider
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);

  // --- HELPERS ---
  const getSelectedLayer = () => layers.find(l => l.id === selectedLayerId);

  const moveLayerOrder = (direction: 'up' | 'down') => {
      if (!selectedLayerId) return;
      const index = layers.findIndex(l => l.id === selectedLayerId);
      if (index === -1) return;

      const newLayers = [...layers];
      if (direction === 'up' && index < layers.length - 1) {
          [newLayers[index], newLayers[index + 1]] = [newLayers[index + 1], newLayers[index]];
      } else if (direction === 'down' && index > 0) {
          [newLayers[index], newLayers[index - 1]] = [newLayers[index - 1], newLayers[index]];
      }
      setLayers(newLayers);
  };

  const updateLayerFilter = (type: keyof LayerFilters, value: number) => {
      setLayers(prev => prev.map(l => {
          if (l.id !== selectedLayerId) return l;
          const currentFilters = l.filters || { brightness: 100, contrast: 100, saturation: 100 };
          return { ...l, filters: { ...currentFilters, [type]: value } };
      }));
  };

  // --- HANDLERS ---
  const handleBaseUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        setBaseImage({ url, width: img.naturalWidth, height: img.naturalHeight });
        if (containerRef.current) {
           const containerW = containerRef.current.clientWidth;
           const containerH = containerRef.current.clientHeight;
           const scale = Math.min((containerW - 100) / img.naturalWidth, (containerH - 100) / img.naturalHeight, 0.8);
           setViewState({
               scale: scale,
               x: (containerW - img.naturalWidth * scale) / 2,
               y: (containerH - img.naturalHeight * scale) / 2
           });
        }
      };
      img.src = url;
    }
  };

  const handleLayerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && baseImage) {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
          const aspectRatio = img.naturalWidth / img.naturalHeight;
          const defaultWidth = 300;
          const calculatedHeight = defaultWidth / aspectRatio;

          const newLayer: DesignLayer = {
            id: `img_${Date.now()}`,
            type: 'image',
            content: url,
            x: baseImage.width / 2 - defaultWidth / 2,
            y: baseImage.height / 2 - calculatedHeight / 2,
            width: defaultWidth,
            height: calculatedHeight,
            rotation: 0,
            scale: 1,
            opacity: 1,
            zIndex: 1,
            visible: true,
            locked: false,
            filters: { brightness: 100, contrast: 100, saturation: 100 }
          };
          setLayers(prev => [...prev, newLayer]);
          setSelectedLayerId(newLayer.id);
      };
      img.src = url;
    }
  };

  const addText = () => {
    if (!baseImage) return toast.error("Vui lòng tải ảnh gốc trước!");
    const newLayer: DesignLayer = {
      id: `text_${Date.now()}`,
      type: 'text',
      content: 'NEW TEXT',
      x: baseImage.width / 2 - 150,
      y: baseImage.height / 2 - 30,
      width: 300,
      height: 60,
      rotation: 0,
      scale: 1,
      opacity: 1,
      zIndex: 1,
      visible: true,
      locked: false,
      color: '#000000',
      fontSize: 48,
      fontWeight: 'bold',
      fontFamily: 'Inter, sans-serif',
      textAlign: 'center'
    };
    setLayers(prev => [...prev, newLayer]);
    setSelectedLayerId(newLayer.id);
  };

  const addAiResultToCanvas = () => {
      if (!aiResult || !baseImage) return;
      const img = new Image();
      img.onload = () => {
          const newLayer: DesignLayer = {
            id: `ai_${Date.now()}`,
            type: 'image',
            content: aiResult,
            x: baseImage.width / 2 - 150,
            y: baseImage.height / 2 - 150,
            width: 300,
            height: 300,
            rotation: 0,
            scale: 1,
            opacity: 1,
            zIndex: 1,
            visible: true,
            locked: false,
            filters: { brightness: 100, contrast: 100, saturation: 100 }
          };
          setLayers(prev => [...prev, newLayer]);
          setSelectedLayerId(newLayer.id);
          setAiResult(null);
          toast.success("Đã thêm ảnh AI vào thiết kế");
      };
      img.src = aiResult;
  };

  // --- INTERACTION LOGIC (unchanged) ---
  const handleWheel = (e: React.WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          const zoomSensitivity = 0.001;
          const newScale = Math.min(Math.max(0.1, viewState.scale - e.deltaY * zoomSensitivity), 5);
          setViewState(prev => ({ ...prev, scale: newScale }));
      } else {
          setViewState(prev => ({ ...prev, x: prev.x - e.deltaX, y: prev.y - e.deltaY }));
      }
  };

  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if (e.code === 'Space' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
              e.preventDefault();
              setTool('hand');
          }
          if ((e.key === 'Delete' || e.key === 'Backspace') && selectedLayerId) {
              if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
              setLayers(prev => prev.filter(l => l.id !== selectedLayerId));
              setSelectedLayerId(null);
          }
      };
      const handleKeyUp = (e: KeyboardEvent) => {
          if (e.code === 'Space') setTool('select');
      };
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
      return () => {
          window.removeEventListener('keydown', handleKeyDown);
          window.removeEventListener('keyup', handleKeyUp);
      };
  }, [selectedLayerId]);

  const handleMouseDown = (e: React.MouseEvent, layerId?: string, mode?: 'move' | 'resize' | 'rotate') => {
      if (e.button === 1 || tool === 'hand') {
          setIsPanning(true);
          setLastMousePos({ x: e.clientX, y: e.clientY });
          e.preventDefault();
          return;
      }

      if (layerId && mode) {
          e.stopPropagation();
          const layer = layers.find(l => l.id === layerId);
          if (!layer || layer.locked) return;

          setSelectedLayerId(layerId);
          setIsDraggingLayer(true);
          setInteractionMode(mode);
          setStartPos({ x: e.clientX, y: e.clientY });
          setLastMousePos({ x: e.clientX, y: e.clientY });
          setInitialLayerState({ ...layer });
      } else {
          setSelectedLayerId(null);
      }
  };

  const handleGlobalMouseMove = (e: React.MouseEvent) => {
      const dx = e.clientX - lastMousePos.x;
      const dy = e.clientY - lastMousePos.y;

      if (isPanning) {
          setViewState(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
          setLastMousePos({ x: e.clientX, y: e.clientY });
          return;
      }

      if (isDraggingLayer && initialLayerState && interactionMode) {
          const scaledDx = dx / viewState.scale;
          const scaledDy = dy / viewState.scale;
          const totalDx = (e.clientX - startPos.x) / viewState.scale;
          
          setLayers(prev => prev.map(l => {
              if (l.id !== initialLayerState.id) return l;
              if (interactionMode === 'move') return { ...l, x: l.x + scaledDx, y: l.y + scaledDy }; 
              if (interactionMode === 'resize') {
                  const newWidth = Math.max(20, initialLayerState.width + totalDx);
                  const ratio = initialLayerState.height / initialLayerState.width;
                  return { ...l, width: newWidth, height: newWidth * ratio };
              }
              if (interactionMode === 'rotate') return { ...l, rotation: initialLayerState.rotation + totalDx };
              return l;
          }));
          setLastMousePos({ x: e.clientX, y: e.clientY });
      }
  };

  const handleMouseUp = () => {
      setIsPanning(false);
      setIsDraggingLayer(false);
      setInteractionMode(null);
      setInitialLayerState(null);
  };

  // --- EXPORT ---
  const handleExport = async () => {
    if (!baseImage) return;
    const toastId = toast.loading("Đang render ảnh 4K...");
    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error("Canvas failed");

        canvas.width = baseImage.width;
        canvas.height = baseImage.height;

        const baseImgEl = new Image();
        baseImgEl.crossOrigin = "anonymous";
        baseImgEl.src = baseImage.url;
        await new Promise(r => baseImgEl.onload = r);
        ctx.drawImage(baseImgEl, 0, 0);

        for (const layer of layers) {
            if (!layer.visible) continue;
            ctx.save();
            const cx = layer.x + layer.width / 2;
            const cy = layer.y + layer.height / 2;
            ctx.translate(cx, cy);
            ctx.rotate((layer.rotation * Math.PI) / 180);
            ctx.globalAlpha = layer.opacity;
            
            if (layer.filters) {
                ctx.filter = `brightness(${layer.filters.brightness}%) contrast(${layer.filters.contrast}%) saturate(${layer.filters.saturation}%)`;
            }

            if (layer.type === 'image') {
                const img = new Image();
                img.crossOrigin = "anonymous";
                img.src = layer.content;
                await new Promise(r => img.onload = r);
                ctx.drawImage(img, -layer.width / 2, -layer.height / 2, layer.width, layer.height);
            } else {
                ctx.filter = 'none';
                ctx.font = `${layer.fontWeight || 'normal'} ${layer.fontSize}px ${layer.fontFamily}`;
                ctx.fillStyle = layer.color || '#000';
                ctx.textAlign = layer.textAlign || 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(layer.content, 0, 0);
            }
            ctx.restore();
        }

        canvas.toBlob((blob) => {
            if (blob) {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `Design_${Date.now()}.png`;
                link.click();
                toast.dismiss(toastId);
                toast.success("Đã tải xuống ảnh 4K!");
            }
        });
    } catch (e) { toast.error("Lỗi xuất ảnh"); }
  };

  const handleAIGenerate = () => {
      if(!aiPrompt) return toast.error("Vui lòng nhập ý tưởng!");
      setIsAiProcessing(true);
      setTimeout(() => { 
          setIsAiProcessing(false); 
          setAiResult("https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop");
          toast.success("AI đã tạo ảnh!"); 
      }, 2500);
  };

  // --- RENDER ---
  return (
    <div className="relative w-full h-full bg-slate-100 overflow-hidden font-sans text-slate-900 select-none">
        
        {/* =======================
            1. LEFT FLOATING PANELS (REFACTORED V13)
           ======================= */}
        <div className="fixed left-4 top-20 bottom-6 w-80 flex flex-col gap-4 pointer-events-none z-30">
            
            {/* BLOCK 1: ASSETS TOOLBOX (Compact) */}
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 pointer-events-auto flex flex-col overflow-hidden animate-in slide-in-from-left-4 duration-500 shrink-0">
                <div className="p-4 border-b border-gray-100 bg-white/50 flex justify-between items-center">
                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Toolbox</h3>
                </div>
                
                <div className="p-4 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                        <label className="flex flex-col items-center justify-center h-20 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl cursor-pointer transition-all group">
                            <Upload className="w-5 h-5 text-blue-600 mb-1 group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] font-bold text-blue-700">Tải Nền</span>
                            <input type="file" className="hidden" accept="image/*" onChange={handleBaseUpload} />
                        </label>
                        <label className="flex flex-col items-center justify-center h-20 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl cursor-pointer transition-all group">
                            <Layers className="w-5 h-5 text-purple-600 mb-1 group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] font-bold text-purple-700">Tải Layer</span>
                            <input type="file" className="hidden" accept="image/*" onChange={handleLayerUpload} />
                        </label>
                    </div>
                    <button onClick={addText} className="w-full py-3 border border-gray-200 hover:border-black hover:bg-gray-50 rounded-xl text-xs font-bold flex items-center justify-center gap-2 text-gray-600 hover:text-black transition-all">
                        <Type className="w-4 h-4" /> Thêm Văn Bản
                    </button>
                </div>
            </div>

            {/* BLOCK 2: AI CREATIVE SUITE (Expanded) */}
            <div className="flex-1 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 pointer-events-auto flex flex-col p-5 animate-in slide-in-from-left-4 duration-700 relative overflow-hidden h-full">
                <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
                    <div className="p-1.5 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg shadow-sm"><Sparkles className="w-4 h-4 text-white" /></div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-gray-800">AI Creative Suite</h3>
                </div>
                
                {/* AI Result Pop-out */}
                {aiResult && (
                    <div className="absolute inset-0 z-20 bg-white/95 backdrop-blur flex flex-col p-4 animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="text-xs font-bold text-green-600 flex items-center gap-1"><Check className="w-3 h-3"/> Hoàn tất</h4>
                            <button onClick={() => setAiResult(null)} className="p-1 hover:bg-gray-100 rounded-full"><X className="w-4 h-4 text-gray-400"/></button>
                        </div>
                        <div className="flex-1 rounded-lg overflow-hidden border border-gray-200 mb-3 bg-gray-50 relative group">
                            <img src={aiResult} className="w-full h-full object-contain" />
                        </div>
                        <Button onClick={addAiResultToCanvas} className="w-full py-2 text-xs bg-black text-white hover:bg-gray-800">
                            <ImagePlus className="w-3 h-3 mr-2" /> Thêm vào Canvas
                        </Button>
                    </div>
                )}

                <div className="flex-1 flex flex-col gap-4">
                    {/* Prompt Input */}
                    <div className="flex-1 relative">
                        <textarea 
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            placeholder="Mô tả ý tưởng chi tiết: Ánh sáng neon, nền bê tông thô, phong cách cyberpunk..." 
                            className="w-full h-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-xs resize-none outline-none focus:border-purple-500 focus:bg-white transition-all focus:ring-2 focus:ring-purple-500/10"
                        />
                        <Wand2 className="absolute bottom-3 right-3 w-4 h-4 text-purple-400 pointer-events-none" />
                    </div>
                    
                    {/* Controls Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5 flex items-center gap-1"><Ratio className="w-3 h-3"/> Tỉ lệ khung hình</label>
                            <select 
                                value={aiConfig.ratio}
                                onChange={(e) => setAiConfig(prev => ({ ...prev, ratio: e.target.value }))}
                                className="w-full py-2 px-3 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold outline-none focus:border-purple-500"
                            >
                                <option value="1:1">1:1 (Vuông)</option>
                                <option value="4:3">4:3 (Ngang)</option>
                                <option value="16:9">16:9 (Rộng)</option>
                                <option value="9:16">9:16 (Story)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Độ phân giải</label>
                            <div className="flex bg-gray-100 rounded-lg p-1">
                                {['1K', '2K', '4K'].map(res => (
                                    <button 
                                        key={res} 
                                        onClick={() => setAiConfig(prev => ({ ...prev, res: res as any }))}
                                        className={`flex-1 py-1 text-[9px] font-bold rounded-md transition-all ${aiConfig.res === res ? 'bg-white shadow-sm text-black' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        {res}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Creativity Slider */}
                    <div>
                        <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-2">
                            <span>Sáng tạo (Creativity)</span>
                            <span className="text-purple-600">{aiCreativity}%</span>
                        </div>
                        <input 
                            type="range" min="0" max="100" 
                            value={aiCreativity} 
                            onChange={(e) => setAiCreativity(parseInt(e.target.value))} 
                            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600" 
                        />
                    </div>

                    <Button 
                        onClick={handleAIGenerate} 
                        loading={isAiProcessing} 
                        className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-xl shadow-lg shadow-purple-500/30 border-none text-sm mt-auto"
                    >
                        {isAiProcessing ? 'Đang sáng tạo...' : '✨ GEN AI'}
                    </Button>
                </div>
            </div>
        </div>


        {/* =======================
            2. CENTER STAGE (CANVAS)
           ======================= */}
        <div 
            ref={containerRef}
            className={`absolute inset-0 z-10 overflow-hidden ${tool === 'hand' || isPanning ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
            onWheel={handleWheel}
            onMouseDown={(e) => handleMouseDown(e)}
            onMouseMove={handleGlobalMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            <div 
                className="absolute inset-0 pointer-events-none opacity-[0.05]" 
                style={{ 
                    backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', 
                    backgroundSize: `${20 * viewState.scale}px ${20 * viewState.scale}px`,
                    backgroundPosition: `${viewState.x}px ${viewState.y}px`
                }}
            />

            <div 
                className="absolute top-0 left-0 transform-gpu origin-top-left transition-transform duration-75 ease-linear will-change-transform"
                style={{ transform: `translate(${viewState.x}px, ${viewState.y}px) scale(${viewState.scale})` }}
            >
                {baseImage ? (
                    <div className="relative shadow-2xl shadow-black/20 bg-white" style={{ width: baseImage.width, height: baseImage.height }}>
                        <img src={baseImage.url} className="w-full h-full object-contain select-none pointer-events-none" />
                        {layers.map(layer => layer.visible && (
                            <div
                                key={layer.id}
                                onMouseDown={(e) => handleMouseDown(e, layer.id, 'move')}
                                className={`absolute group cursor-move select-none ${selectedLayerId === layer.id ? 'ring-1 ring-blue-500 z-50' : 'hover:ring-1 hover:ring-blue-300'}`}
                                style={{
                                    left: layer.x, top: layer.y, width: layer.width, height: layer.height,
                                    transform: `rotate(${layer.rotation}deg)`,
                                    zIndex: layer.zIndex, 
                                    opacity: layer.opacity,
                                    pointerEvents: layer.locked ? 'none' : 'auto',
                                    filter: layer.filters ? `brightness(${layer.filters.brightness}%) contrast(${layer.filters.contrast}%) saturate(${layer.filters.saturation}%)` : 'none'
                                }}
                            >
                                {layer.type === 'image' ? (
                                    <img src={layer.content} className="w-full h-full object-contain pointer-events-none" />
                                ) : (
                                    <div className="w-full h-full flex items-center whitespace-pre-wrap leading-tight" style={{ 
                                        color: layer.color, fontSize: layer.fontSize, fontFamily: layer.fontFamily, 
                                        fontWeight: layer.fontWeight, textAlign: layer.textAlign,
                                        justifyContent: layer.textAlign === 'center' ? 'center' : layer.textAlign === 'right' ? 'flex-end' : 'flex-start'
                                    }}>{layer.content}</div>
                                )}

                                {selectedLayerId === layer.id && !layer.locked && (
                                    <div className="absolute -inset-2 pointer-events-none">
                                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-white border border-blue-500 rounded-full cursor-nwse-resize pointer-events-auto shadow-sm" onMouseDown={(e) => handleMouseDown(e, layer.id, 'resize')} />
                                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-6 h-6 bg-white border border-blue-500 rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing pointer-events-auto shadow-sm" onMouseDown={(e) => handleMouseDown(e, layer.id, 'rotate')}><RotateCw className="w-3 h-3 text-blue-600" /></div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="w-[500px] h-[500px] bg-white/50 backdrop-blur border-2 border-dashed border-gray-300 rounded-3xl flex flex-col items-center justify-center text-gray-400" style={{ transform: 'translate(calc(50vw - 250px), calc(50vh - 250px))' }}>
                        <ImageIcon className="w-16 h-16 mb-4 opacity-20" />
                        <p className="text-sm font-medium">Kéo thả hoặc Upload để bắt đầu</p>
                    </div>
                )}
            </div>
        </div>


        {/* =======================
            3. RIGHT FLOATING PANELS (CONFIG & LAYERS)
           ======================= */}
        <div className="fixed right-4 top-20 bottom-6 w-72 flex flex-col gap-4 pointer-events-none z-30">
            
            {/* BLOCK 1: CONFIG PANEL */}
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 pointer-events-auto flex flex-col animate-in slide-in-from-right-4 duration-500 shrink-0 max-h-[50%] overflow-y-auto custom-scrollbar">
                <div className="p-4 border-b border-gray-100 bg-white/50 sticky top-0 backdrop-blur-md z-10">
                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">
                        {getSelectedLayer() ? 'Layer Properties' : 'Canvas Settings'}
                    </h3>
                </div>
                <div className="p-4 space-y-5">
                    {getSelectedLayer() ? (
                        <>
                            {/* Actions Row */}
                            <div className="flex gap-2">
                                <button onClick={() => setLayers(prev => prev.map(l => l.id === selectedLayerId ? { ...l, locked: !l.locked } : l))} className={`flex-1 py-2 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 transition-colors ${getSelectedLayer()!.locked ? 'bg-red-50 text-red-600 border-red-100' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}>
                                    {getSelectedLayer()!.locked ? <Lock className="w-3 h-3"/> : <Unlock className="w-3 h-3"/>}
                                </button>
                                <button onClick={() => { setLayers(prev => prev.filter(l => l.id !== selectedLayerId)); setSelectedLayerId(null); }} className="p-2 bg-white text-red-500 rounded-lg hover:bg-red-50 border border-gray-200 transition-colors shadow-sm"><Trash2 className="w-4 h-4"/></button>
                            </div>

                            {/* Common: Opacity */}
                            <div>
                                <label className="flex justify-between text-[10px] font-bold text-gray-400 mb-2">Opacity <span>{Math.round(getSelectedLayer()!.opacity * 100)}%</span></label>
                                <input type="range" min="0" max="1" step="0.1" value={getSelectedLayer()!.opacity} onChange={(e) => setLayers(prev => prev.map(l => l.id === selectedLayerId ? { ...l, opacity: parseFloat(e.target.value) } : l))} className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black" />
                            </div>

                            {/* Image Adjustments (Filters) */}
                            {getSelectedLayer()?.type === 'image' && (
                                <div className="pt-4 border-t border-gray-100 space-y-4 animate-in fade-in">
                                    <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                                        <Sliders className="w-3 h-3" /> Image Adjustments
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-1"><span className="flex items-center gap-1"><Sun className="w-3 h-3"/> Brightness</span> <span>{getSelectedLayer()!.filters?.brightness}%</span></div>
                                            <input type="range" min="0" max="200" value={getSelectedLayer()!.filters?.brightness} onChange={(e) => updateLayerFilter('brightness', parseInt(e.target.value))} className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-1"><span className="flex items-center gap-1"><Contrast className="w-3 h-3"/> Contrast</span> <span>{getSelectedLayer()!.filters?.contrast}%</span></div>
                                            <input type="range" min="0" max="200" value={getSelectedLayer()!.filters?.contrast} onChange={(e) => updateLayerFilter('contrast', parseInt(e.target.value))} className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500" />
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-1"><span className="flex items-center gap-1"><Droplets className="w-3 h-3"/> Saturation</span> <span>{getSelectedLayer()!.filters?.saturation}%</span></div>
                                            <input type="range" min="0" max="200" value={getSelectedLayer()!.filters?.saturation} onChange={(e) => updateLayerFilter('saturation', parseInt(e.target.value))} className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Text Color */}
                            {getSelectedLayer()?.type === 'text' && (
                                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                    <span className="text-xs font-bold text-gray-600 flex items-center gap-2"><Palette className="w-3 h-3"/> Màu sắc</span>
                                    <input type="color" value={getSelectedLayer()!.color} onChange={(e) => setLayers(prev => prev.map(l => l.id === selectedLayerId ? { ...l, color: e.target.value } : l))} className="w-8 h-8 rounded-lg border border-gray-200 p-0 overflow-hidden cursor-pointer" />
                                </div>
                            )}

                            {/* Text Editor */}
                            {getSelectedLayer()?.type === 'text' && (
                                <div className="space-y-3 pt-2 border-t border-gray-100">
                                    <textarea value={getSelectedLayer()!.content} onChange={(e) => setLayers(prev => prev.map(l => l.id === selectedLayerId ? { ...l, content: e.target.value } : l))} className="w-full p-2 text-xs border border-gray-200 rounded-lg bg-gray-50 focus:bg-white outline-none focus:border-black h-16 resize-none transition-colors" />
                                    <div className="flex gap-2">
                                        <select onChange={(e) => { const f = FONTS.find(f => f.name === e.target.value); if(f) setLayers(prev => prev.map(l => l.id === selectedLayerId ? { ...l, fontFamily: f.family } : l)) }} className="flex-1 h-8 text-xs border border-gray-200 rounded-lg bg-gray-50 outline-none px-1 font-medium">
                                            {FONTS.map(f => <option key={f.name} value={f.name}>{f.name}</option>)}
                                        </select>
                                        <input type="number" value={getSelectedLayer()!.fontSize} onChange={(e) => setLayers(prev => prev.map(l => l.id === selectedLayerId ? { ...l, fontSize: parseInt(e.target.value) } : l))} className="w-16 h-8 text-xs border border-gray-200 rounded-lg bg-gray-50 text-center outline-none font-bold" />
                                    </div>
                                    <div className="flex bg-gray-100 p-1 rounded-lg">
                                        {['left', 'center', 'right'].map((align) => (
                                            <button key={align} onClick={() => setLayers(prev => prev.map(l => l.id === selectedLayerId ? { ...l, textAlign: align as any } : l))} className={`flex-1 p-1 rounded ${getSelectedLayer()!.textAlign === align ? 'bg-white shadow-sm text-black' : 'text-gray-400'}`}>
                                                {align === 'left' ? <AlignLeft className="w-3 h-3 mx-auto"/> : align === 'center' ? <AlignCenter className="w-3 h-3 mx-auto"/> : <AlignRight className="w-3 h-3 mx-auto"/>}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-10 text-gray-400 text-xs">
                            <p>Chưa chọn layer nào.</p>
                            <p className="mt-1 opacity-70">Nhấp vào layer để chỉnh sửa.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* BLOCK 2: LAYERS LIST */}
            <div className="flex-1 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 pointer-events-auto flex flex-col overflow-hidden animate-in slide-in-from-right-4 duration-700">
                <div className="p-4 border-b border-gray-100 bg-white/50 flex justify-between items-center">
                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Layers</h3>
                    <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-500 font-bold">{layers.length}</span>
                </div>
                <div className="flex-1 overflow-y-auto p-2 custom-scrollbar space-y-1">
                    {layers.slice().reverse().map((layer, idx) => {
                        const realIndex = layers.length - 1 - idx;
                        return (
                        <div 
                            key={layer.id}
                            onClick={() => setSelectedLayerId(layer.id)}
                            className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer text-xs border transition-all group relative ${selectedLayerId === layer.id ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm z-10' : 'bg-transparent border-transparent hover:bg-gray-50 hover:border-gray-100 text-gray-600'}`}
                        >
                            {/* Layer Type Icon */}
                            <div className="w-6 h-6 bg-white border border-gray-200 rounded flex items-center justify-center text-gray-400 overflow-hidden shadow-sm flex-shrink-0">
                                {layer.type === 'text' ? <Type className="w-3 h-3"/> : <img src={layer.content} className="w-full h-full object-cover"/>}
                            </div>
                            
                            {/* Name */}
                            <span className="flex-1 truncate font-medium">{layer.type === 'text' ? layer.content : `Layer ${realIndex + 1}`}</span>
                            
                            {/* Sort Actions */}
                            <div className={`flex items-center gap-1 ${selectedLayerId === layer.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                                <button onClick={(e) => { e.stopPropagation(); moveLayerOrder('up'); }} disabled={realIndex === layers.length - 1} className="p-1 hover:bg-black/10 rounded disabled:opacity-30"><ArrowUp className="w-3 h-3"/></button>
                                <button onClick={(e) => { e.stopPropagation(); moveLayerOrder('down'); }} disabled={realIndex === 0} className="p-1 hover:bg-black/10 rounded disabled:opacity-30"><ArrowDown className="w-3 h-3"/></button>
                            </div>

                            {/* Visibility */}
                            <button onClick={(e) => { e.stopPropagation(); setLayers(prev => prev.map(l => l.id === layer.id ? { ...l, visible: !l.visible } : l)) }} className="text-gray-300 hover:text-black p-1">
                                {layer.visible ? <Eye className="w-3 h-3"/> : <EyeOff className="w-3 h-3"/>}
                            </button>
                        </div>
                    )})}
                    {layers.length === 0 && <p className="text-center text-xs text-gray-300 py-10 italic">Danh sách trống</p>}
                </div>
            </div>
        </div>


        {/* =======================
            4. BOTTOM TOOLBAR
           ======================= */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-200 p-2 flex items-center gap-2 z-40 transition-transform hover:-translate-y-1">
            <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
                <button onClick={() => setTool('select')} className={`p-3 rounded-full transition-colors ${tool === 'select' ? 'bg-black text-white shadow-md' : 'text-gray-500 hover:bg-gray-100 hover:text-black'}`}><MousePointer2 className="w-5 h-5"/></button>
                <button onClick={() => setTool('hand')} className={`p-3 rounded-full transition-colors ${tool === 'hand' ? 'bg-black text-white shadow-md' : 'text-gray-500 hover:bg-gray-100 hover:text-black'}`}><Hand className="w-5 h-5"/></button>
            </div>

            <div className="flex items-center gap-1 border-r border-gray-200 pr-2 pl-2">
                <button onClick={() => setViewState(prev => ({ ...prev, scale: Math.max(0.1, prev.scale - 0.1) }))} className="p-3 text-gray-500 hover:text-black hover:bg-gray-100 rounded-full"><ZoomOut className="w-5 h-5"/></button>
                <span className="text-xs font-bold w-12 text-center select-none text-gray-600">{Math.round(viewState.scale * 100)}%</span>
                <button onClick={() => setViewState(prev => ({ ...prev, scale: Math.min(5, prev.scale + 0.1) }))} className="p-3 text-gray-500 hover:text-black hover:bg-gray-100 rounded-full"><ZoomIn className="w-5 h-5"/></button>
            </div>
            
            <button onClick={() => { if(baseImage) setViewState({ scale: 0.5, x: 0, y: 0 }); }} className="p-3 text-gray-500 hover:text-black hover:bg-gray-100 rounded-full" title="Reset View"><RefreshCcw className="w-5 h-5" /></button>

            <div className="w-px h-6 bg-gray-200 mx-1"></div>

            <button onClick={handleExport} className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full font-bold text-sm flex items-center gap-2 hover:shadow-lg hover:shadow-purple-500/30 transition-all hover:scale-105 active:scale-95">
                <Download className="w-4 h-4" /> Tải ảnh gốc (4K)
            </button>
        </div>

    </div>
  );
};
