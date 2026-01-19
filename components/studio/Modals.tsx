
import React, { useState, useEffect, useMemo } from 'react';
import { X, Shield, Monitor, Check, Info, History, Camera, Zap, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { PACKAGES, MOCK_ASSETS } from '../../constants';
import { GenerationResult, Asset, LibraryAsset } from '../../types';
import { urlToBase64 } from '../../services/storageService';
import { fetchLibraryAssets } from '../../utils/libraryService';

// --- Pricing Details Modal ---
export const PricingDetailsModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
       <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-200">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
             <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-black" />
                <h3 className="text-lg font-bold">Chi tiết Gói Giải Pháp Enterprise</h3>
             </div>
             <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X className="w-5 h-5"/></button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-8 text-sm text-gray-700 space-y-8">
             <section>
                <h4 className="font-bold text-black text-lg mb-4 flex items-center gap-2">
                    <Monitor className="w-5 h-5" /> 1. SỨC MẠNH CÔNG NGHỆ (CORE TECHNOLOGY)
                </h4>
                <ul className="grid gap-3 pl-2">
                    <li className="flex gap-3 items-start p-3 bg-gray-50 rounded-lg">
                        <Check className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
                        <div>
                            <strong className="block text-black mb-1">Model Nano Banana Pro™</strong>
                            Render hình ảnh chất lượng điện ảnh (Cinematic) với độ phân giải linh hoạt 1K, 2K, đến 4K Ultra HD.
                        </div>
                    </li>
                    <li className="flex gap-3 items-start p-3 bg-gray-50 rounded-lg">
                        <Check className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
                        <div>
                            <strong className="block text-black mb-1">Tốc độ Fast Pass ⚡</strong>
                            Luồng xử lý GPU ưu tiên (Priority Queue), đảm bảo phản hồi tức thì ngay cả trong giờ cao điểm.
                        </div>
                    </li>
                </ul>
             </section>
          </div>
          <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
             <Button variant="primary" onClick={onClose} className="px-8 py-2 h-auto text-sm">Đóng</Button>
          </div>
       </div>
    </div>
  );
};

// --- Pricing Modal (Enterprise Solution) ---
export const PricingModal = ({ isOpen, onClose, onSelectPackage }: { isOpen: boolean, onClose: () => void, onSelectPackage: (pkg: any) => void }) => {
  const [showDetails, setShowDetails] = useState(false);
  const pkg = PACKAGES[0];

  if (!isOpen) return null;

  return (
    <>
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200 overflow-y-auto">
       <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-6xl flex flex-col md:flex-row overflow-hidden max-h-[90vh] relative">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-gray-100 hover:bg-gray-200 rounded-full z-20 text-black transition-colors"><X className="w-5 h-5"/></button>

          {/* LEFT SIDE - BLACK */}
          <div className="md:w-5/12 bg-black text-white p-10 flex flex-col justify-between relative overflow-hidden group">
             {/* Background Effect */}
             <div className="absolute inset-0 opacity-30 bg-[url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay group-hover:scale-105 transition-transform duration-1000"></div>
             <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
             
             <div className="relative z-10">
                <div className="w-14 h-14 bg-white text-black flex items-center justify-center font-bold text-2xl mb-8 rounded-2xl shadow-lg">M</div>
                
                <h2 className="text-4xl font-bold tracking-tighter mb-4 leading-tight">MENTORIS<br/>SUPER STUDIO</h2>
                <div className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-lg text-[10px] font-bold tracking-[0.2em] uppercase border border-white/10">ENTERPRISE EDITION</div>
             </div>

             <div className="relative z-10 mt-12 md:mt-0">
                 <p className="text-gray-400 text-xs uppercase tracking-widest font-bold mb-3">Đăng ký tháng</p>
                 <div className="flex items-baseline gap-3">
                     <span className="text-6xl font-black tracking-tighter">10tr</span>
                     <span className="text-base text-gray-400 font-medium">VNĐ / tháng</span>
                 </div>
                 <p className="text-xs text-gray-400 italic mt-2 font-medium bg-white/10 w-fit px-3 py-1 rounded-full border border-white/5">
                    (Chỉ bằng chi phí thuê 1 mẫu chụp ảnh trong 2 giờ)
                 </p>
                 <p className="text-[10px] text-gray-600 mt-6 font-bold uppercase tracking-wider">*Đã bao gồm VAT</p>
             </div>
          </div>

          {/* RIGHT SIDE - WHITE */}
          <div className="md:w-7/12 p-8 md:p-12 bg-white flex flex-col overflow-y-auto">
             <div className="flex-1">
                <p className="text-gray-600 mb-8 leading-relaxed font-light text-base md:pr-10">
                    Biến bản phác thảo thành doanh thu. Hệ thống <strong>Mentoris AI Core</strong> giúp đội ngũ của bạn cắt giảm 90% quy trình sản xuất hình ảnh truyền thống.
                </p>
                
                <ul className="space-y-6 mb-10">
                    <li className="flex items-start gap-4">
                        <div className="bg-green-100 p-2 rounded-full text-green-600 mt-0.5 flex-shrink-0"><Check className="w-4 h-4" /></div>
                        <div>
                            <strong className="block text-black text-sm mb-1">R&D Tốc độ Siêu thanh (x100 lần)</strong>
                            <span className="text-xs text-gray-500 leading-relaxed block">Chuyển đổi tức thì từ phác thảo sơ sài (Sketch) sang ảnh sản phẩm thực tế. Duyệt mẫu không cần chờ may.</span>
                        </div>
                    </li>
                    <li className="flex items-start gap-4">
                        <div className="bg-green-100 p-2 rounded-full text-green-600 mt-0.5 flex-shrink-0"><Camera className="w-4 h-4" /></div>
                        <div>
                            <strong className="block text-black text-sm mb-1">Tự chủ Lookbook & Marketing</strong>
                            <span className="text-xs text-gray-500 leading-relaxed block">Tự tạo bộ ảnh Lookbook 4K chuẩn Studio & Thương mại điện tử. Tiết kiệm hàng trăm triệu chi phí thuê mẫu, studio, nhiếp ảnh mỗi năm.</span>
                        </div>
                    </li>
                    <li className="flex items-start gap-4">
                        <div className="bg-green-100 p-2 rounded-full text-green-600 mt-0.5 flex-shrink-0"><Zap className="w-4 h-4 fill-current" /></div>
                        <div>
                            <strong className="block text-black text-sm mb-1">Tiên phong vị thế "AI First" - Bước tiến vượt xa đối thủ</strong>
                            <span className="text-xs text-gray-500 leading-relaxed block">Biến công nghệ thành vũ khí cạnh tranh độc quyền. Giúp thương hiệu bứt tốc và bỏ xa đối thủ trên đường đua thị trường ngay hôm nay.</span>
                        </div>
                    </li>
                    <li className="flex items-start gap-4">
                        <div className="bg-green-100 p-2 rounded-full text-green-600 mt-0.5 flex-shrink-0"><Sparkles className="w-4 h-4" /></div>
                        <div>
                            <strong className="block text-black text-sm mb-1">Sáng tạo & Thử nghiệm không giới hạn</strong>
                            <span className="text-xs text-gray-500 leading-relaxed block">Thoải mái tạo hàng trăm biến thể (mix-match) về chất liệu, bối cảnh, người mẫu mà không tốn chi phí sản xuất mẫu thật.</span>
                        </div>
                    </li>
                </ul>

                <div className="flex flex-col sm:flex-row items-center gap-4 mt-auto">
                   <Button 
                      variant="primary" 
                      className="w-full py-4 text-sm font-bold shadow-xl bg-black text-white hover:bg-gray-800 rounded-xl"
                      onClick={() => { onSelectPackage(pkg); onClose(); }}
                   >
                      Đặt lịch Demo Giải pháp <ArrowRight className="w-4 h-4 ml-2" />
                   </Button>
                   <p className="text-xs text-gray-400 font-medium whitespace-nowrap">Nâng cấp phòng thiết kế của bạn ngày hôm nay!</p>
                </div>
             </div>
          </div>
       </div>
    </div>
    <PricingDetailsModal isOpen={showDetails} onClose={() => setShowDetails(false)} />
    </>
  );
};

// --- History Modal ---
export const HistoryModal = ({ isOpen, onClose, history, onSelect }: { isOpen: boolean, onClose: () => void, history: GenerationResult[], onSelect: (url: string) => void }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
       <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white z-10">
             <div>
                <h3 className="text-xl font-bold">Lịch Sử Thiết Kế</h3>
             </div>
             <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-6 h-6"/></button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
             {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <History className="w-12 h-12 mb-2 opacity-20" />
                    <p>Chưa có lịch sử.</p>
                </div>
             ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   {history.map((item) => (
                      <div 
                        key={item.id} 
                        onClick={async () => { 
                           // Convert blob/url to base64 before selecting
                           const base64 = await urlToBase64(item.imageUrl);
                           onSelect(base64); 
                           onClose(); 
                        }}
                        className="cursor-pointer group relative aspect-[3/4] rounded-lg overflow-hidden border border-gray-200 hover:border-black transition-all hover:scale-105 hover:shadow-lg"
                      >
                         <img src={item.imageUrl} className="w-full h-full object-cover" />
                      </div>
                   ))}
                </div>
             )}
          </div>
       </div>
    </div>
  );
};

// --- Model Library ---
export const ModelLibraryModal = ({ isOpen, onClose, onSelect }: { isOpen: boolean, onClose: () => void, onSelect: (url: string) => void }) => {
    const [models, setModels] = useState<Asset[]>([]);

    useEffect(() => {
        if (isOpen) {
            try {
                const saved = localStorage.getItem('mentoris_assets_v1');
                const assets = saved ? JSON.parse(saved) : MOCK_ASSETS;
                setModels(assets.filter((a: Asset) => a.type === 'model'));
            } catch (e) {
                console.error("Error loading models", e);
            }
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white z-10">
                    <h3 className="text-xl font-bold">Thư Viện Người Mẫu</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-6 h-6"/></button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    {models.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <p>Chưa có người mẫu nào trong kho.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {models.map((asset) => (
                                <div 
                                    key={asset.id} 
                                    onClick={async () => { 
                                       // Convert proxy fetch to base64
                                       const base64 = await urlToBase64(asset.url);
                                       onSelect(base64); 
                                       onClose(); 
                                    }}
                                    className="cursor-pointer group relative aspect-[3/4] rounded-lg overflow-hidden border border-gray-200 hover:border-black transition-all hover:scale-105 hover:shadow-lg"
                                >
                                    <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- REFACTORED: Concept Library (Service Pattern) ---
export const ConceptLibraryModal = ({ isOpen, onClose, selectedId, onSelect }: { isOpen: boolean, onClose: () => void, selectedId: string, onSelect: (asset: LibraryAsset) => void }) => {
  const [concepts, setConcepts] = useState<LibraryAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('');

  useEffect(() => {
      if (isOpen) {
          setLoading(true);
          fetchLibraryAssets('CONCEPT').then(data => {
              setConcepts(data);
              // Set first category as active
              if (data.length > 0) setActiveCategory(data[0].category);
              setLoading(false);
          });
      }
  }, [isOpen]);

  const categories = useMemo(() => Array.from(new Set(concepts.map(c => c.category))), [concepts]);
  const filteredConcepts = concepts.filter(c => c.category === activeCategory);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
       <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white z-10">
             <h3 className="text-xl font-bold">Thư Viện Ý Tưởng (Concept)</h3>
             <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-6 h-6"/></button>
          </div>
          
          {/* Added: [&::-webkit-scrollbar]:hidden and style scrollbarWidth: 'none' */}
          <div className="px-6 border-b border-gray-100 bg-gray-50 flex gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
             {loading ? (
                 <div className="flex gap-2 py-4">
                     {[1,2,3].map(i => <div key={i} className="w-24 h-8 bg-gray-200 rounded animate-pulse"></div>)}
                 </div>
             ) : categories.map(cat => (
               <button
                 key={cat}
                 onClick={() => setActiveCategory(cat)}
                 className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeCategory === cat ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
               >
                 {cat}
               </button>
             ))}
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
             {loading ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                     {[1,2,3,4,5,6].map(i => (
                         <div key={i} className="aspect-video bg-gray-200 rounded-lg animate-pulse"></div>
                     ))}
                 </div>
             ) : (
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {filteredConcepts.map(concept => (
                       <div 
                         key={concept.id}
                         onClick={() => { onSelect(concept); onClose(); }}
                         className={`group p-4 bg-white border rounded-lg cursor-pointer transition-all hover:shadow-md relative ${selectedId === concept.id ? 'border-black ring-1 ring-black' : 'border-gray-200 hover:border-gray-300'}`}
                       >
                          <h4 className="font-bold text-sm mb-1">{concept.title}</h4>
                          <p className="text-xs text-gray-500 line-clamp-2">{concept.description}</p>
                       </div>
                    ))}
                 </div>
             )}
          </div>
       </div>
    </div>
  );
};

// --- REFACTORED: Lookbook Background Library (Service Pattern) ---
export const LookbookBackgroundModal = ({ isOpen, onClose, selectedId, onSelect }: { isOpen: boolean, onClose: () => void, selectedId: string, onSelect: (asset: LibraryAsset) => void }) => {
  const [scenes, setScenes] = useState<LibraryAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('');

  useEffect(() => {
      if (isOpen) {
          setLoading(true);
          fetchLibraryAssets('SCENE').then(data => {
              setScenes(data);
              if (data.length > 0) setActiveCategory(data[0].category);
              setLoading(false);
          });
      }
  }, [isOpen]);

  const categories = useMemo(() => Array.from(new Set(scenes.map(c => c.category))), [scenes]);
  const filteredBGs = scenes.filter(c => c.category === activeCategory);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
       <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white z-10">
             <h3 className="text-xl font-bold">Thư Viện Bối Cảnh (Lookbook)</h3>
             <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-6 h-6"/></button>
          </div>
          
          {/* Added: [&::-webkit-scrollbar]:hidden and style scrollbarWidth: 'none' */}
          <div className="px-6 border-b border-gray-100 bg-gray-50 flex gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
             {loading ? (
                 <div className="flex gap-2 py-4">
                     {[1,2,3].map(i => <div key={i} className="w-24 h-8 bg-gray-200 rounded animate-pulse"></div>)}
                 </div>
             ) : categories.map(cat => (
               <button
                 key={cat}
                 onClick={() => setActiveCategory(cat)}
                 className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeCategory === cat ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
               >
                 {cat}
               </button>
             ))}
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
             {loading ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                     {[1,2,3,4,5,6].map(i => (
                         <div key={i} className="aspect-video bg-gray-200 rounded-lg animate-pulse"></div>
                     ))}
                 </div>
             ) : (
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {filteredBGs.map(bg => (
                       <div 
                         key={bg.id}
                         onClick={() => { onSelect(bg); onClose(); }}
                         className={`group p-4 bg-white border rounded-lg cursor-pointer transition-all hover:shadow-md relative ${selectedId === bg.id ? 'border-black ring-1 ring-black' : 'border-gray-200 hover:border-gray-300'}`}
                       >
                          <h4 className="font-bold text-sm mb-1">{bg.title}</h4>
                          <p className="text-xs text-gray-500 line-clamp-2">{bg.description}</p>
                       </div>
                    ))}
                 </div>
             )}
          </div>
       </div>
    </div>
  );
};

// --- REFACTORED: Pose Library (UI Update: No Images, Text Only Cards) ---
export const PoseLibraryModal = ({ isOpen, onClose, selectedPoseIds, onTogglePose }: { isOpen: boolean, onClose: () => void, selectedPoseIds: string[], onTogglePose: (pose: LibraryAsset) => void }) => {
  const [poses, setPoses] = useState<LibraryAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('');

  useEffect(() => {
      if (isOpen) {
          setLoading(true);
          fetchLibraryAssets('POSE').then(data => {
              setPoses(data);
              if (data.length > 0) setActiveCategory(data[0].category);
              setLoading(false);
          });
      }
  }, [isOpen]);

  const categories = useMemo(() => Array.from(new Set(poses.map(c => c.category))), [poses]);
  const filteredPoses = poses.filter(p => p.category === activeCategory);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
       <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white z-10">
             <div>
                <h3 className="text-xl font-bold">Thư Viện Dáng (Pose Library)</h3>
             </div>
             <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-6 h-6"/></button>
          </div>
          
          {/* Added: [&::-webkit-scrollbar]:hidden and style scrollbarWidth: 'none' */}
          <div className="px-6 border-b border-gray-100 bg-gray-50 flex gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
             {loading ? (
                 <div className="flex gap-2 py-4">
                     {[1,2,3].map(i => <div key={i} className="w-24 h-8 bg-gray-200 rounded animate-pulse"></div>)}
                 </div>
             ) : categories.map(cat => (
               <button
                 key={cat}
                 onClick={() => setActiveCategory(cat)}
                 className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeCategory === cat ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
               >
                 {cat}
               </button>
             ))}
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
             {loading ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                     {[1,2,3,4,5,6].map(i => (
                         <div key={i} className="aspect-video bg-gray-200 rounded-lg animate-pulse"></div>
                     ))}
                 </div>
             ) : (
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {filteredPoses.map(pose => {
                       const isSelected = selectedPoseIds.includes(pose.id);
                       return (
                       <div 
                         key={pose.id}
                         onClick={() => {
                            if (isSelected || selectedPoseIds.length < 6) {
                                onTogglePose(pose);
                            } else {
                                alert("Bạn chỉ được chọn tối đa 6 dáng.");
                            }
                         }}
                         className={`group p-4 bg-white border rounded-lg cursor-pointer transition-all hover:shadow-md relative flex flex-col justify-between ${isSelected ? 'border-black ring-1 ring-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}
                       >
                          <div>
                              <div className="flex justify-between items-start mb-1">
                                  <h4 className="font-bold text-sm">{pose.title}</h4>
                                  {isSelected && <Check className="w-4 h-4 text-black" />}
                              </div>
                              <p className="text-xs text-gray-500 line-clamp-3">{pose.description}</p>
                          </div>
                       </div>
                       );
                    })}
                 </div>
             )}
          </div>
          <div className="p-4 border-t border-gray-100 bg-white flex justify-end">
             <Button onClick={onClose} className="px-8">Xong ({selectedPoseIds.length})</Button>
          </div>
       </div>
    </div>
  );
};
