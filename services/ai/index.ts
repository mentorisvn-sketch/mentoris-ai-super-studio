import { GenConfig, RenderSettings, DesignLayer, TokenUsage } from "../../types";
import { LOOKBOOK_ANGLES } from "../../constants";
import { getSketchToRealityPrompt, getRealisticRenderPrompt, getLookbookPrompt, getVirtualTryOnPrompt, getConceptProductPrompt } from "./prompts";
import { saveImageToStorage, base64ToBlob } from "../storageService";
import { resizeImageBase64, blobToBase64 } from "../../utils/imageProcessor"; // Import thêm các hàm mới

// --- Helper to strip Data URI scheme prefix ---
const stripBase64Prefix = (base64: string): string => {
  if (base64.includes(',')) {
    return base64.split(',')[1];
  }
  return base64;
};

// Get current user ID safely
const getCurrentUserId = () => {
    try {
        const userStr = localStorage.getItem('mentoris_current_user'); 
        if (userStr) return JSON.parse(userStr).id;
    } catch(e) {}
    return 'guest';
};

// --- NEW: API Route Wrapper ---
const callGenerateAPI = async (
    model: string,
    contents: any,
    config: GenConfig,
    type: string
): Promise<{ url: string, usage: TokenUsage }> => {
    
    // 1. Construct Payload (CẤU TRÚC LẠI PAYLOAD CHUẨN)
    const payload = {
        model,
        contents,
        type,
        config: {
            // 🔥 QUAN TRỌNG: Chỉ gửi count = 1 vì hàm này được gọi trong vòng lặp
            count: 1, 
            // Gửi resolution để Server tính tiền (1K/2K/4K)
            resolution: config.resolution, 
            // Gửi aspectRatio để AI xử lý (16:9, 1:1...)
            aspectRatio: config.aspectRatio 
        }
    };

    // 2. Fetch Server API
    const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || `Server Error: ${response.status}`);
    }

    const result = await response.json();

    // 3. Process Result (Base64)
    const base64Data = result.data;
    
    // 4. Save to Client Storage
    const userId = getCurrentUserId();
    
    try {
        await saveImageToStorage(base64Data, userId, type as any, {
            resolution: config.resolution,
            aspectRatio: config.aspectRatio
        });
    } catch (e) {
        console.error("Failed to save to history DB:", e);
    }

    // 5. Create Blob URL for display
    const blob = base64ToBlob(base64Data);
    const blobUrl = URL.createObjectURL(blob);

    return {
        url: blobUrl,
        usage: {
            promptTokens: result.usage?.promptTokens || 0,
            responseTokens: result.usage?.responseTokens || 0,
            totalTokens: result.usage?.totalTokens || 0,
            imageCount: 1
        }
    };
};

// 🔥 HÀM XỬ LÝ SONG SONG AN TOÀN (Safe Parallel)
// Giúp không bị lỗi "chết chùm" nếu 1 ảnh thất bại
const executeSafeBatch = async (promises: Promise<any>[]) => {
    const results = await Promise.all(
        promises.map(p => p.catch(e => {
            console.error("Single generation failed:", e);
            return null; // Trả về null nếu lỗi
        }))
    );

    // Lọc bỏ các kết quả lỗi
    const validResults = results.filter(r => r !== null);

    if (validResults.length === 0 && promises.length > 0) {
        throw new Error("Tất cả ảnh đều tạo thất bại. Vui lòng kiểm tra lại đầu vào hoặc thử lại sau.");
    }

    const images = validResults.map(r => r.url);
    const totalUsage = validResults.reduce((acc, r) => ({
        promptTokens: acc.promptTokens + r.usage.promptTokens,
        responseTokens: acc.responseTokens + r.usage.responseTokens,
        totalTokens: acc.totalTokens + r.usage.totalTokens,
        imageCount: acc.imageCount + r.usage.imageCount
    }), { promptTokens: 0, responseTokens: 0, totalTokens: 0, imageCount: 0 });

    return { images, usage: totalUsage };
}


export const generateFromSketch = async (
  sketchBase64: string,
  referenceMaterialBase64: string | null,
  styleReferenceBase64: string | null,
  category: string,
  material: string,
  color: string,
  useSketchColors: boolean,
  description: string,
  config: GenConfig,
  outputMode: 'flatlay' | '3d' = '3d'
): Promise<{ images: string[], usage: TokenUsage }> => {
  
  // 🔥 Nén ảnh đầu vào xuống 1024px để an toàn
  const resizedSketch = await resizeImageBase64(sketchBase64, 1024, 0.8);
  const resizedRef = referenceMaterialBase64 ? await resizeImageBase64(referenceMaterialBase64, 1024, 0.8) : null;
  const resizedStyle = styleReferenceBase64 ? await resizeImageBase64(styleReferenceBase64, 1024, 0.8) : null;

  const prompt = getSketchToRealityPrompt(
      category, 
      material, 
      color, 
      useSketchColors, 
      description, 
      config, 
      !!referenceMaterialBase64,
      !!styleReferenceBase64,
      outputMode
  );

  let parts: any[] = [
      { inlineData: { mimeType: 'image/jpeg', data: stripBase64Prefix(resizedSketch) } }
  ];

  if (resizedRef) {
      parts.push({ inlineData: { mimeType: 'image/jpeg', data: stripBase64Prefix(resizedRef) } });
  }

  if (resizedStyle) {
      parts.push({ inlineData: { mimeType: 'image/jpeg', data: stripBase64Prefix(resizedStyle) } });
  }

  parts.push({ text: prompt });

  const promises = Array.from({ length: config.count }).map(() => 
    callGenerateAPI('gemini-3-pro-image-preview', { parts: parts }, config, 'sketch')
  );

  return executeSafeBatch(promises);
};

export const generateRealisticRender = async (
  compositeBase64: string,
  layers: DesignLayer[],
  renderSettings: RenderSettings,
  config: GenConfig
): Promise<{ images: string[], usage: TokenUsage }> => {
  
  const resizedComposite = await resizeImageBase64(compositeBase64, 1024, 0.8);

  const prompt = getRealisticRenderPrompt(layers, renderSettings, config);

  const promises = Array.from({ length: config.count }).map(() => 
    callGenerateAPI('gemini-3-pro-image-preview', {
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: stripBase64Prefix(resizedComposite) } },
        { text: prompt }
      ]
    }, config, 'design')
  );

  return executeSafeBatch(promises);
};

// --- 3. LOOKBOOK (ĐÃ TỐI ƯU RIÊNG CHO CHẤT LƯỢNG SẢN PHẨM) ---
export const generateLookbook = async (
  productBase64: string,
  modelReferenceBase64: string | null,
  accessoriesBase64s: string[], 
  concept: string,
  selectedPoseDescriptions: string[] | undefined,
  config: GenConfig,
  refineInstruction: string = "" 
): Promise<{ images: string[], usage: TokenUsage }> => {
  
  // 🎯 CHIẾN LƯỢC NÉN THÔNG MINH
  
  // 1. Ảnh Sản Phẩm (QUAN TRỌNG NHẤT): Giữ nét cao (1536px, 0.9)
  const resizedProduct = await resizeImageBase64(productBase64, 1536, 0.9);
  
  // 2. Ảnh Mẫu Tham Khảo: Nén mạnh tay (1024px, 0.7)
  const resizedModel = modelReferenceBase64 ? await resizeImageBase64(modelReferenceBase64, 1024, 0.7) : null;
  
  // 3. Ảnh Phụ Kiện: Nén mạnh tay
  const resizedAccessories = await Promise.all(
      accessoriesBase64s.map(img => resizeImageBase64(img, 1024, 0.7))
  );

  const countToGenerate = selectedPoseDescriptions && selectedPoseDescriptions.length > 0 
    ? selectedPoseDescriptions.length 
    : config.count;

  const promises = Array.from({ length: countToGenerate }).map((_, index) => {
    const angleDesc = selectedPoseDescriptions && selectedPoseDescriptions.length > 0
        ? selectedPoseDescriptions[index] 
        : LOOKBOOK_ANGLES[index % LOOKBOOK_ANGLES.length];

    const parts: any[] = [
       { inlineData: { mimeType: 'image/jpeg', data: stripBase64Prefix(resizedProduct) } }
    ];
    
    if (resizedModel) {
       parts.push({ inlineData: { mimeType: 'image/jpeg', data: stripBase64Prefix(resizedModel) } });
    }

    resizedAccessories.forEach(acc => {
       parts.push({ inlineData: { mimeType: 'image/jpeg', data: stripBase64Prefix(acc) } });
    });

    const prompt = getLookbookPrompt(
        concept, 
        angleDesc, 
        accessoriesBase64s.length > 0, 
        !!modelReferenceBase64,
        "Professional Fashion Model",
        refineInstruction 
    );
    
    parts.push({ text: prompt });

    return callGenerateAPI('gemini-3-pro-image-preview', { parts }, config, 'lookbook');
  });

  return executeSafeBatch(promises);
};

export const generateVirtualTryOn = async (
  modelBase64: string,
  garmentBase64: string,
  accessoriesBase64s: string[],
  backgroundMode: 'original' | 'change',
  backgroundDescription: string,
  config: GenConfig
): Promise<{ images: string[], usage: TokenUsage }> => {
  
  // Try-on cần giữ form dáng tốt hơn chút (1280px)
  const resizedModel = await resizeImageBase64(modelBase64, 1280, 0.85);
  const resizedGarment = await resizeImageBase64(garmentBase64, 1280, 0.85);
  const resizedAccessories = await Promise.all(accessoriesBase64s.map(img => resizeImageBase64(img, 1024, 0.7)));

  const prompt = getVirtualTryOnPrompt(backgroundMode, backgroundDescription, accessoriesBase64s.length > 0);

  const parts: any[] = [
    { inlineData: { mimeType: 'image/jpeg', data: stripBase64Prefix(resizedModel) } }
  ];

  parts.push({ inlineData: { mimeType: 'image/jpeg', data: stripBase64Prefix(resizedGarment) } });

  resizedAccessories.forEach(acc => {
    parts.push({ inlineData: { mimeType: 'image/jpeg', data: stripBase64Prefix(acc) } });
  });

  parts.push({ text: prompt });

  const promises = Array.from({ length: config.count }).map(() => 
    callGenerateAPI('gemini-3-pro-image-preview', { parts }, config, 'try-on')
  );

  return executeSafeBatch(promises);
};

export const generateConceptProduct = async (
  productBase64: string,
  styleRefBase64: string | null,
  promptDescription: string,
  config: GenConfig
): Promise<{ images: string[], usage: TokenUsage }> => {
  
  const resizedProduct = await resizeImageBase64(productBase64, 1024, 0.8);
  const resizedStyle = styleRefBase64 ? await resizeImageBase64(styleRefBase64, 1024, 0.8) : null;

  const prompt = getConceptProductPrompt(promptDescription, !!styleRefBase64, config);

  const parts: any[] = [
      { inlineData: { mimeType: 'image/jpeg', data: stripBase64Prefix(resizedProduct) } }
  ];

  if (resizedStyle) {
      parts.push({ inlineData: { mimeType: 'image/jpeg', data: stripBase64Prefix(resizedStyle) } });
  }

  parts.push({ text: prompt });

  const promises = Array.from({ length: config.count }).map(() => 
    callGenerateAPI('gemini-3-pro-image-preview', { parts }, config, 'concept-product')
  );

  return executeSafeBatch(promises);
};
