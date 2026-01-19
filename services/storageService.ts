
import { StoredImage } from "../types";

const DB_NAME = 'MentorisDB';
const DB_VERSION = 1;
const STORE_NAME = 'generated_images';

// Helper to open DB
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error("IndexedDB error:", event);
      reject("Could not open database");
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        objectStore.createIndex("userId", "userId", { unique: false });
        objectStore.createIndex("createdAt", "createdAt", { unique: false });
      }
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };
  });
};

// Convert Base64 to Blob
export const base64ToBlob = (base64: string, mimeType: string = 'image/png'): Blob => {
  // Check if base64 contains the prefix (data:image/...) and strip it if necessary for atob
  const byteCharacters = atob(base64.includes(',') ? base64.split(',')[1] : base64);
  const byteNumbers = new Array(byteCharacters.length);
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
};

// NEW UTILITY: Convert URL (Blob or Remote) to Base64
export const urlToBase64 = async (url: string): Promise<string> => {
  // 1. If already Base64, return immediately
  if (url.startsWith('data:')) return url;

  try {
    let fetchUrl = url;
    
    // 2. If it's a remote URL (http/https), use Proxy to bypass CORS
    if (url.startsWith('http')) {
        // wsrv.nl is a free, open image proxy that adds CORS headers
        fetchUrl = `https://wsrv.nl/?url=${encodeURIComponent(url)}&output=png`;
    }

    // 3. Fetch the image (works for Blob URLs natively, and Proxy URLs)
    const response = await fetch(fetchUrl);
    const blob = await response.blob();

    // 4. Convert Blob to Base64 via FileReader
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error converting URL to Base64:", error);
    // Fallback: return original URL (might fail later but better than crashing here)
    return url;
  }
};

// Save Image
export const saveImageToStorage = async (
  base64Data: string,
  userId: string,
  type: 'sketch' | 'lookbook' | 'design' | 'try-on' | 'concept-product',
  metadata: { resolution: string; aspectRatio: string },
  prompt: string = ""
): Promise<string> => {
  try {
    const db = await openDB();
    const blob = base64ToBlob(base64Data);
    const id = crypto.randomUUID();

    const record: StoredImage = {
      id,
      userId,
      blob,
      type,
      prompt,
      createdAt: Date.now(),
      metadata
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.add(record);

      request.onsuccess = () => resolve(id);
      
      request.onerror = (event: any) => {
        if (event.target.error.name === 'QuotaExceededError') {
          reject(new Error("Storage Full"));
        } else {
          reject(event.target.error);
        }
      };
    });
  } catch (error) {
    console.error("Save Image Error:", error);
    throw error;
  }
};

// Get User History
export const getUserHistory = async (userId: string): Promise<{ id: string, url: string, record: StoredImage }[]> => {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index("createdAt");
    // Get all records, we will filter by UserID manually or use index range if needed.
    // Since we want newest first, we iterate backwards.
    const request = index.openCursor(null, 'prev');
    
    const results: { id: string, url: string, record: StoredImage }[] = [];

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        const record = cursor.value as StoredImage;
        if (record.userId === userId) {
             const url = URL.createObjectURL(record.blob);
             results.push({ id: record.id, url, record });
        }
        cursor.continue();
      } else {
        resolve(results);
      }
    };

    request.onerror = () => reject("Failed to fetch history");
  });
};

// Delete Image
export const deleteImageFromStorage = async (id: string): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject("Failed to delete image");
  });
};

// Get Single Blob URL (Optional usage)
export const getImageBlobUrl = async (id: string): Promise<string | null> => {
    const db = await openDB();
    return new Promise((resolve) => {
        const transaction = db.transaction([STORE_NAME], "readonly");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(id);

        request.onsuccess = () => {
            const record = request.result as StoredImage;
            if (record) {
                resolve(URL.createObjectURL(record.blob));
            } else {
                resolve(null);
            }
        };
    });
};
