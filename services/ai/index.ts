
import { GenConfig, RenderSettings, DesignLayer, TokenUsage } from "../../types";
import { LOOKBOOK_ANGLES } from "../../constants";
import { getSketchToRealityPrompt, getRealisticRenderPrompt, getLookbookPrompt, getVirtualTryOnPrompt, getConceptProductPrompt } from "./prompts";
import { saveImageToStorage, base64ToBlob } from "../storageService";

// --- Helper to strip Data URI scheme prefix ---
const stripBase64Prefix = (base64: string): string => {
  if (base64.includes(',')) {
    return base64.split(',')[1];
  }
  return base64;
};

// Get current user ID safely from localStorage (since this function is called outside React Context)
const getCurrentUserId = () => {
    try {
        const userStr = localStorage.getItem('mentoris_current_user'); // Note: This might be stale if using Supabase exclusively, but kept for IndexedDB key consistency
        // Ideally we should pass userId from the component, but for offline storage keying this is acceptable fallback
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
    
    // 1. Construct Payload
    const payload = {
        model,
        contents,
        type,
        config: {
            imageConfig: {
                aspectRatio: config.aspectRatio,
                imageSize: config.resolution
            }
        }
    };

    // 2. Fetch Server API
    // REFACTORED: Point to Vercel Serverless Function
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
    
    // 4. Save to Client Storage (IndexedDB)
    // We do this on the client side to persist the history locally without re-downloading
    const userId = getCurrentUserId();
    // Try to get userId from Supabase session if possible, otherwise fallback
    // (In a perfect refactor, we'd pass userId as arg)
    
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
      { inlineData: { mimeType: 'image/png', data: stripBase64Prefix(sketchBase64) } }
  ];

  if (referenceMaterialBase64) {
      parts.push({ inlineData: { mimeType: 'image/png', data: stripBase64Prefix(referenceMaterialBase64) } });
  }

  if (styleReferenceBase64) {
      parts.push({ inlineData: { mimeType: 'image/png', data: stripBase64Prefix(styleReferenceBase64) } });
  }

  parts.push({ text: prompt });

  const promises = Array.from({ length: config.count }).map(() => 
    callGenerateAPI('gemini-3-pro-image-preview', { parts: parts }, config, 'sketch')
  );

  try {
    const results = await Promise.all(promises);
    const images = results.map(r => r.url);
    const totalUsage = results.reduce((acc, r) => ({
        promptTokens: acc.promptTokens + r.usage.promptTokens,
        responseTokens: acc.responseTokens + r.usage.responseTokens,
        totalTokens: acc.totalTokens + r.usage.totalTokens,
        imageCount: acc.imageCount + r.usage.imageCount
    }), { promptTokens: 0, responseTokens: 0, totalTokens: 0, imageCount: 0 });

    return { images, usage: totalUsage };
  } catch (error) {
    console.error("Generate from Sketch Error:", error);
    throw error;
  }
};

export const generateRealisticRender = async (
  compositeBase64: string,
  layers: DesignLayer[],
  renderSettings: RenderSettings,
  config: GenConfig
): Promise<{ images: string[], usage: TokenUsage }> => {
  const prompt = getRealisticRenderPrompt(layers, renderSettings, config);

  const promises = Array.from({ length: config.count }).map(() => 
    callGenerateAPI('gemini-3-pro-image-preview', {
      parts: [
        { inlineData: { mimeType: 'image/png', data: stripBase64Prefix(compositeBase64) } },
        { text: prompt }
      ]
    }, config, 'design')
  );

  try {
    const results = await Promise.all(promises);
    const images = results.map(r => r.url);
    const totalUsage = results.reduce((acc, r) => ({
        promptTokens: acc.promptTokens + r.usage.promptTokens,
        responseTokens: acc.responseTokens + r.usage.responseTokens,
        totalTokens: acc.totalTokens + r.usage.totalTokens,
        imageCount: acc.imageCount + r.usage.imageCount
    }), { promptTokens: 0, responseTokens: 0, totalTokens: 0, imageCount: 0 });

    return { images, usage: totalUsage };
  } catch (error) {
    console.error("Realistic Render Error:", error);
    throw error;
  }
};

export const generateLookbook = async (
  productBase64: string,
  modelReferenceBase64: string | null,
  accessoriesBase64s: string[], 
  concept: string,
  selectedPoseDescriptions: string[] | undefined,
  config: GenConfig,
  refineInstruction: string = "" 
): Promise<{ images: string[], usage: TokenUsage }> => {
  
  const countToGenerate = selectedPoseDescriptions && selectedPoseDescriptions.length > 0 
    ? selectedPoseDescriptions.length 
    : config.count;

  const promises = Array.from({ length: countToGenerate }).map((_, index) => {
    const angleDesc = selectedPoseDescriptions && selectedPoseDescriptions.length > 0
        ? selectedPoseDescriptions[index] 
        : LOOKBOOK_ANGLES[index % LOOKBOOK_ANGLES.length];

    const parts: any[] = [
       { inlineData: { mimeType: 'image/png', data: stripBase64Prefix(productBase64) } }
    ];
    
    if (modelReferenceBase64) {
       parts.push({ inlineData: { mimeType: 'image/png', data: stripBase64Prefix(modelReferenceBase64) } });
    }

    accessoriesBase64s.forEach(acc => {
       parts.push({ inlineData: { mimeType: 'image/png', data: stripBase64Prefix(acc) } });
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

  try {
    const results = await Promise.all(promises);
    const images = results.map(r => r.url);
    const totalUsage = results.reduce((acc, r) => ({
        promptTokens: acc.promptTokens + r.usage.promptTokens,
        responseTokens: acc.responseTokens + r.usage.responseTokens,
        totalTokens: acc.totalTokens + r.usage.totalTokens,
        imageCount: acc.imageCount + r.usage.imageCount
    }), { promptTokens: 0, responseTokens: 0, totalTokens: 0, imageCount: 0 });

    return { images, usage: totalUsage };
  } catch (error) {
    console.error("Lookbook Error:", error);
    throw error;
  }
};

export const generateVirtualTryOn = async (
  modelBase64: string,
  garmentBase64: string,
  accessoriesBase64s: string[],
  backgroundMode: 'original' | 'change',
  backgroundDescription: string,
  config: GenConfig
): Promise<{ images: string[], usage: TokenUsage }> => {
  const prompt = getVirtualTryOnPrompt(backgroundMode, backgroundDescription, accessoriesBase64s.length > 0);

  const parts: any[] = [
    { inlineData: { mimeType: 'image/png', data: stripBase64Prefix(modelBase64) } }
  ];

  parts.push({ inlineData: { mimeType: 'image/png', data: stripBase64Prefix(garmentBase64) } });

  accessoriesBase64s.forEach(acc => {
    parts.push({ inlineData: { mimeType: 'image/png', data: stripBase64Prefix(acc) } });
  });

  parts.push({ text: prompt });

  const promises = Array.from({ length: config.count }).map(() => 
    callGenerateAPI('gemini-3-pro-image-preview', { parts }, config, 'try-on')
  );

  try {
    const results = await Promise.all(promises);
    const images = results.map(r => r.url);
    const totalUsage = results.reduce((acc, r) => ({
        promptTokens: acc.promptTokens + r.usage.promptTokens,
        responseTokens: acc.responseTokens + r.usage.responseTokens,
        totalTokens: acc.totalTokens + r.usage.totalTokens,
        imageCount: acc.imageCount + r.usage.imageCount
    }), { promptTokens: 0, responseTokens: 0, totalTokens: 0, imageCount: 0 });

    return { images, usage: totalUsage };
  } catch (error) {
    console.error("Try-On Error:", error);
    throw error;
  }
};

export const generateConceptProduct = async (
  productBase64: string,
  styleRefBase64: string | null,
  promptDescription: string,
  config: GenConfig
): Promise<{ images: string[], usage: TokenUsage }> => {
  const prompt = getConceptProductPrompt(promptDescription, !!styleRefBase64, config);

  const parts: any[] = [
      { inlineData: { mimeType: 'image/png', data: stripBase64Prefix(productBase64) } }
  ];

  if (styleRefBase64) {
      parts.push({ inlineData: { mimeType: 'image/png', data: stripBase64Prefix(styleRefBase64) } });
  }

  parts.push({ text: prompt });

  const promises = Array.from({ length: config.count }).map(() => 
    callGenerateAPI('gemini-3-pro-image-preview', { parts }, config, 'concept-product')
  );

  try {
    const results = await Promise.all(promises);
    const images = results.map(r => r.url);
    const totalUsage = results.reduce((acc, r) => ({
        promptTokens: acc.promptTokens + r.usage.promptTokens,
        responseTokens: acc.responseTokens + r.usage.responseTokens,
        totalTokens: acc.totalTokens + r.usage.totalTokens,
        imageCount: acc.imageCount + r.usage.imageCount
    }), { promptTokens: 0, responseTokens: 0, totalTokens: 0, imageCount: 0 });

    return { images, usage: totalUsage };
  } catch (error) {
    console.error("Concept Gen Error:", error);
    throw error;
  }
};
