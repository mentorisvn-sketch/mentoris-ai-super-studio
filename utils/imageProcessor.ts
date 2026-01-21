import { createClient } from './supabase/client';

const MAX_SIZE_MB = 2;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

interface ProcessedImage {
  url: string;    // Public URL (from Supabase or Blob)
  base64: string; // For AI generation
  file: File;     // Processed File object
}

/**
 * Compresses an image file to be under 2MB while maintaining aspect ratio.
 * Strategy: Reduce JPEG quality first, then resize dimension if absolutely necessary.
 */
export const compressImage = async (file: File): Promise<File> => {
  // 1. If already small enough, return immediately
  if (file.size <= MAX_SIZE_BYTES) return file;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      
      let quality = 0.9;
      let scale = 1.0;
      let resultBlob: Blob | null = null;
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error("Canvas context unavailable"));
        return;
      }

      // Recursive compression function
      const attemptCompression = () => {
        const w = img.width * scale;
        const h = img.height * scale;
        
        canvas.width = w;
        canvas.height = h;
        
        // High quality scaling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, w, h);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Compression failed"));
              return;
            }

            // Success condition
            if (blob.size <= MAX_SIZE_BYTES || (quality <= 0.5 && scale <= 0.5)) {
              // Convert Blob back to File
              const newFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(newFile);
            } else {
              // Retry logic
              if (quality > 0.6) {
                // Phase 1: Reduce Quality only
                quality -= 0.1;
              } else {
                // Phase 2: Reduce Scale (Dimension) + Reset Quality slightly
                scale *= 0.8; 
                quality = 0.8;
              }
              attemptCompression();
            }
          },
          'image/jpeg',
          quality
        );
      };

      attemptCompression();
    };

    img.onerror = (err) => reject(err);
  });
};

/**
 * Converts File to Base64
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Main Orchestrator: Compress -> Upload to Supabase -> Return Data
 */
export const processAndUploadImage = async (file: File, userId: string = 'guest'): Promise<ProcessedImage> => {
  try {
    // 1. Compress
    const processedFile = await compressImage(file);
    
    // 2. Generate Base64 (Required for Gemini API)
    const base64 = await fileToBase64(processedFile);

    // 3. Upload to Supabase (Optimistic - if fails, fallback to local blob url)
    const supabase = createClient();
    const fileName = `${userId}/${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
    
    // Check if Supabase is configured (not placeholder)
    const meta = import.meta as any;
    const sbUrl = (meta.env && meta.env.VITE_SUPABASE_URL) ? meta.env.VITE_SUPABASE_URL : '';
    let publicUrl = "";

    if (sbUrl && !sbUrl.includes('placeholder')) {
        const { data, error } = await supabase.storage
            .from('uploads')
            .upload(fileName, processedFile, {
                cacheControl: '3600',
                upsert: false
            });

        if (!error && data) {
            const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(fileName);
            publicUrl = urlData.publicUrl;
        } else {
            console.warn("Upload failed, falling back to local URL", error);
            publicUrl = URL.createObjectURL(processedFile);
        }
    } else {
        // Mock Mode / Fallback
        publicUrl = URL.createObjectURL(processedFile);
    }

    return {
        url: publicUrl,
        base64: base64,
        file: processedFile
    };

  } catch (error) {
    console.error("Image processing error:", error);
    throw error;
  }
};

// ==========================================
// 🔥 NEW ADDITIONS FOR AI OPTIMIZATION
// ==========================================

export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * 🔥 HÀM NÉN ẢNH THÔNG MINH (SMART COMPRESSION)
 * Giúp giảm dung lượng ảnh input từ vài MB xuống vài trăm KB để gửi qua API.
 * @param base64Str - Chuỗi ảnh gốc
 * @param maxWidth - Chiều rộng tối đa (1536 cho ảnh chính, 1024 cho ảnh phụ)
 * @param quality - Chất lượng nén JPEG (0.1 - 1.0). Mức 0.8-0.9 là rất đẹp.
 */
export const resizeImageBase64 = async (base64Str: string, maxWidth = 1024, quality = 0.8): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      // Tính toán tỉ lệ khung hình
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxWidth) {
          width = Math.round((width * maxWidth) / height);
          height = maxWidth;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Vẽ ảnh lên canvas (làm mịn ảnh khi thu nhỏ)
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
        
        // 🌟 QUAN TRỌNG: Ép về định dạng JPEG để giảm dung lượng tối đa
        const resizedBase64 = canvas.toDataURL('image/jpeg', quality); 
        resolve(resizedBase64);
      } else {
        resolve(base64Str); // Fallback
      }
    };
    img.onerror = () => resolve(base64Str); // Fallback
  });
};
