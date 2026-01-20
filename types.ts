// ==========================================
// 1. PRODUCT & E-COMMERCE TYPES
// ==========================================

export interface ColorDefinition {
  name: string;
  image: string; // URL for the color preview or texture
  hex: string;
}

export interface ProductVariant {
  id: string;
  sku: string;
  color: string;
  size: string;
  price: number;
  originalPrice: number;
  stock: number;
  image: string; 
}

export interface Product {
  id: string;
  name: string;
  category: string;
  categoryId: string;
  price: number;
  originalPrice?: number;
  description: string;
  is_visible: boolean;
  sizes: string[];
  colors: string[];
  colorDefinitions: ColorDefinition[]; 
  variants: ProductVariant[];
  images: string[]; 
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

// ==========================================
// 2. USER & ADMIN MANAGEMENT TYPES (UPDATED)
// ==========================================

export type SubscriptionTier = 'free' | 'basic' | 'pro' | 'enterprise';

// ✅ USER INTERFACE (CẬP NHẬT FULL QUYỀN QUẢN TRỊ)
export interface User {
  id: string; // UUID from Supabase Auth
  email: string;
  name: string; // Mapped from 'full_name'
  role: 'admin' | 'customer';
  avatar: string; // Mapped from 'avatar_url'
  credits: number; // Số dư hiện tại
  subscriptionTier: SubscriptionTier;
  isActive: boolean;
  permissions: string[]; // Logic frontend quyết định user được làm gì

  // 🔥 CÁC TRƯỜNG MỚI (ADMIN QUẢN LÝ)
  phone?: string;              // Số điện thoại (Zalo)
  allowedResolutions: string[]; // Chất lượng ảnh được phép ['1K', '2K', '4K']
  totalUsage: number;          // Tổng credits đã dùng từ trước tới nay
  totalPaid: number;           // Tổng tiền đã nạp vào hệ thống
  lastSeen?: string;           // Thời gian online lần cuối (ISO String)

  // Giữ lại để tương thích ngược (nếu code cũ có dùng)
  usageStats?: {
    totalImages: number;
    totalSpend: number;
  };
}

// TRANSACTION HISTORY
export interface CreditTransaction {
  id: string;
  userId: string;
  amount: number; // Positive (Top-up) or Negative (Usage)
  type: 'usage' | 'top_up' | 'bonus' | 'refund';
  description: string;
  status: 'completed' | 'pending' | 'failed';
  timestamp: number;
}

// ==========================================
// 3. STUDIO & DESIGN TYPES
// ==========================================

export type DesignTab = 'resources' | 'sketch' | 'quick-design' | 'lookbook' | 'try-on' | 'concept-product' | 'history';

export interface GenerationResult {
  id: string;
  imageUrl: string;
  promptUsed: string;
  type: 'product' | 'lookbook';
  createdAt: number;
}

export interface GenConfig {
  resolution: '1K' | '2K' | '4K';
  count: number;
  aspectRatio: '1:1' | '3:4' | '4:3' | '16:9' | '9:16';
}

// ASSETS
export interface Asset {
  id: string;
  name: string;
  url: string;
  type: 'base' | 'texture' | 'graphic' | 'model';
}

export interface LibraryAsset {
  id: string;
  type: 'POSE' | 'SCENE' | 'CONCEPT';
  category: string; // e.g., 'Studio', 'Outdoor', 'Standing'
  title: string;
  description: string; // Display text
  prompt_payload: string; // The actual instruction sent to AI
  thumbnail_url?: string;
}

// CANVAS LAYERS
export type PrintType = 'normal' | 'high_density' | 'heat_transfer' | 'embroidery' | 'decal' | 'screen' | 'rubber_press';

export interface LayerFilters {
  brightness: number; // 100 is default
  contrast: number;   // 100 is default
  saturation: number; // 100 is default
}

export interface DesignLayer {
  id: string;
  type: 'base' | 'graphic';
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number; // degrees
  zIndex: number;
  printType: PrintType;
  filters: LayerFilters;
}

export interface RenderSettings {
  materialMode: 'original' | 'custom';
  customMaterialDescription: string;
}

export interface Pose {
  id: string;
  category: string;
  name: string;
  desc: string; 
  image: string; 
}

// ==========================================
// 4. LOGGING & ANALYTICS TYPES
// ==========================================

export interface TokenUsage {
  promptTokens: number;
  responseTokens: number;
  totalTokens: number;
  imageCount: number;
}

export interface UsageLog {
  id: string;
