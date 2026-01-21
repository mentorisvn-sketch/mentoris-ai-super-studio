import { GenConfig, RenderSettings, DesignLayer, TokenUsage } from "../../types";
import { LOOKBOOK_ANGLES } from "../../constants";
import { getSketchToRealityPrompt, getRealisticRenderPrompt, getLookbookPrompt, getVirtualTryOnPrompt, getConceptProductPrompt } from "./prompts";
import { resizeImageBase64 } from "../../utils/imageProcessor";
import { createClient } from "../../utils/supabase/client"; // 🔥 Import Supabase Client để lấy Token

// Helper function
const stripBase64Prefix = (base64: string): string => {
  if (base64.includes(',')) return base64.split(',')[1];
  return base64;
};

// --- NEW API WRAPPER (SECURE) ---
const callGenerateAPI = async (
    model: string,
    contents: any,
    config: GenConfig,
    type: string
): Promise<{ url: string, remainingCredits: number, usage: TokenUsage }> => {
    
    // 1. Lấy Auth Token (Quan trọng)
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    if (!token) {
        throw new Error("Vui lòng đăng nhập để sử dụng tính năng này.");
    }

    // 2. Prepare Payload
    const payload = {
        model,
        contents,
        type,
        config: {
            count: 1, 
            resolution: config.resolution, 
            aspectRatio: config.aspectRatio 
        }
    };

    // 3. Call Server API
    const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // 🔥 Gửi Token đi
        },
        body: JSON.stringify(payload),
    });

    // 4. Handle Errors
    if (!response.ok) {
        let errorMessage = `Server Error: ${response.status}`;
        try {
            const err = await response.json();
            errorMessage = err.error || errorMessage;
        } catch(e) {}
        
        // Handle specific codes
        if (response.status === 402) throw new Error("Không đủ Credits. Vui lòng nạp thêm.");
        if (response.status === 401) throw new Error("Phiên đăng nhập hết hạn. Vui lòng login lại.");
        
        throw new Error(errorMessage);
    }

    // 5. Parse Result (New Format)
    const result = await response.json();
    
    // Server trả về: { success, imageUrl, remainingCredits, meta }
    return {
        url: result.imageUrl,
        remainingCredits: result.remainingCredits, // Số dư mới nhất từ DB
        usage: {
            promptTokens: 0,
            responseTokens: 0,
            totalTokens: 0,
            imageCount: 1
        }
    };
};

// 🔥 Safe Batch Execution
// Trả về danh sách ảnh và số dư mới nhất (của request cuối cùng thành công)
const executeSafeBatch = async (promises: Promise<any>[]) => {
    const results = await Promise.all(
        promises.map(p => p.catch(e => {
            console.error("Single generation failed:", e);
            return null; 
        }))
    );

    const validResults = results.filter(r => r !== null);

    if (validResults.length === 0 && promises.length > 0) {
        throw new Error("Tất cả ảnh đều tạo thất bại.");
    }

    const images = validResults.map(r => r.url);
    
    // Lấy số dư của request cuối cùng thành công (để update UI chính xác nhất)
    const lastResult = validResults[validResults.length - 1];
    const newBalance = lastResult ? lastResult.remainingCredits : undefined;

    return { 
        images, 
        newBalance, // Trả về số dư để UI update
        usage: { imageCount: validResults.length } 
    };
}

// =================================================================
// CÁC HÀM GENERATE (Logic giữ nguyên, chỉ thay đổi luồng xử lý ảnh)
// =================================================================

// 1. SKETCH
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
) => {
  const resizedSketch = await resizeImageBase64(sketchBase64, 1024, 0.8);
  const resizedRef = referenceMaterialBase64 ? await resizeImageBase64(referenceMaterialBase64, 1024, 0.8) : null;
  const resizedStyle = styleReferenceBase64 ? await resizeImageBase64(styleReferenceBase64, 1024, 0.8) : null;

  const prompt = getSketchToRealityPrompt(category, material, color, useSketchColors, description, config, !!referenceMaterialBase64, !!styleReferenceBase64, outputMode);
  
  let parts: any[] = [{ inlineData: { mimeType: 'image/jpeg', data: stripBase64Prefix(resizedSketch) } }];
  if (resizedRef) parts.push({ inlineData: { mimeType: 'image/jpeg', data: stripBase64Prefix(resizedRef) } });
  if (resizedStyle) parts.push({ inlineData: { mimeType: 'image/jpeg', data: stripBase64Prefix(resizedStyle) } });
  parts.push({ text: prompt });

  const promises = Array.from({ length: config.count }).map(() => 
    callGenerateAPI('gemini-3-pro-image-preview', { parts }, config, 'sketch')
  );

  return executeSafeBatch(promises);
};

// 2. REALISTIC RENDER
export const generateRealisticRender = async (
  compositeBase64: string,
  layers: DesignLayer[],
  renderSettings: RenderSettings,
  config: GenConfig
) => {
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

// 3. LOOKBOOK
export const generateLookbook = async (
  productBase64: string,
  modelReferenceBase64: string | null,
  accessoriesBase64s: string[], 
  concept: string,
  selectedPoseDescriptions: string[] | undefined,
  config: GenConfig,
  refineInstruction: string = "" 
) => {
  const resizedProduct = await resizeImageBase64(productBase64, 1536, 0.9);
  const resizedModel = modelReferenceBase64 ? await resizeImageBase64(modelReferenceBase64, 1024, 0.7) : null;
  const resizedAccessories = await Promise.all(accessoriesBase64s.map(img => resizeImageBase64(img, 1024, 0.7)));

  const countToGenerate = selectedPoseDescriptions && selectedPoseDescriptions.length > 0 
    ? selectedPoseDescriptions.length : config.count;

  const promises = Array.from({ length: countToGenerate }).map((_, index) => {
    const angleDesc = selectedPoseDescriptions && selectedPoseDescriptions.length > 0
        ? selectedPoseDescriptions[index] : LOOKBOOK_ANGLES[index % LOOKBOOK_ANGLES.length];

    const parts: any[] = [{ inlineData: { mimeType: 'image/jpeg', data: stripBase64Prefix(resizedProduct) } }];
    if (resizedModel) parts.push({ inlineData: { mimeType: 'image/jpeg', data: stripBase64Prefix(resizedModel) } });
    resizedAccessories.forEach(acc => parts.push({ inlineData: { mimeType: 'image/jpeg', data: stripBase64Prefix(acc) } }));
    parts.push({ text: getLookbookPrompt(concept, angleDesc, accessoriesBase64s.length > 0, !!modelReferenceBase64, "Professional Fashion Model", refineInstruction) });

    return callGenerateAPI('gemini-3-pro-image-preview', { parts }, config, 'lookbook');
  });

  return executeSafeBatch(promises);
};

// 4. VIRTUAL TRY-ON
export const generateVirtualTryOn = async (
  modelBase64: string,
  garmentBase64: string,
  accessoriesBase64s: string[],
  backgroundMode: 'original' | 'change',
  backgroundDescription: string,
  config: GenConfig
) => {
  const resizedModel = await resizeImageBase64(modelBase64, 1280, 0.85);
  const resizedGarment = await resizeImageBase64(garmentBase64, 1280, 0.85);
  const resizedAccessories = await Promise.all(accessoriesBase64s.map(img => resizeImageBase64(img, 1024, 0.7)));

  const prompt = getVirtualTryOnPrompt(backgroundMode, backgroundDescription, accessoriesBase64s.length > 0);
  const parts: any[] = [{ inlineData: { mimeType: 'image/jpeg', data: stripBase64Prefix(resizedModel) } }];
  parts.push({ inlineData: { mimeType: 'image/jpeg', data: stripBase64Prefix(resizedGarment) } });
  resizedAccessories.forEach(acc => parts.push({ inlineData: { mimeType: 'image/jpeg', data: stripBase64Prefix(acc) } }));
  parts.push({ text: prompt });

  const promises = Array.from({ length: config.count }).map(() => 
    callGenerateAPI('gemini-3-pro-image-preview', { parts }, config, 'try-on')
  );

  return executeSafeBatch(promises);
};

// 5. CONCEPT PRODUCT
export const generateConceptProduct = async (
  productBase64: string,
  styleRefBase64: string | null,
  promptDescription: string,
  config: GenConfig
) => {
  const resizedProduct = await resizeImageBase64(productBase64, 1024, 0.8);
  const resizedStyle = styleRefBase64 ? await resizeImageBase64(styleRefBase64, 1024, 0.8) : null;

  const prompt = getConceptProductPrompt(promptDescription, !!styleRefBase64, config);
  const parts: any[] = [{ inlineData: { mimeType: 'image/jpeg', data: stripBase64Prefix(resizedProduct) } }];
  if (resizedStyle) parts.push({ inlineData: { mimeType: 'image/jpeg', data: stripBase64Prefix(resizedStyle) } });
  parts.push({ text: prompt });

  const promises = Array.from({ length: config.count }).map(() => 
    callGenerateAPI('gemini-3-pro-image-preview', { parts }, config, 'concept-product')
  );

  return executeSafeBatch(promises);
};
