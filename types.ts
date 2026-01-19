
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

export type SubscriptionTier = 'free' | 'basic' | 'pro' | 'enterprise';

// REFACTORED: Matches Supabase 'profiles' table
export interface User {
  id: string; // UUID from Supabase Auth
  email: string;
  name: string; // Mapped from 'full_name' in DB
  role: 'admin' | 'customer';
  avatar: string; // Mapped from 'avatar_url' in DB
  credits: number;
  subscriptionTier: SubscriptionTier;
  isActive: boolean;
  permissions: string[]; // Logic handled in frontend based on Tier/Role
  allowedResolutions?: string[]; // New: AI Quality Access (Array)
  usageStats?: {
    totalImages: number;
    totalSpend: number;
  };
}

// NEW: Transaction History Interface
export interface CreditTransaction {
  id: string;
  userId: string;
  amount: number; // Positive (Top-up) or Negative (Usage)
  type: 'usage' | 'top_up' | 'bonus' | 'refund';
  description: string;
  status: 'completed' | 'pending' | 'failed';
  timestamp: number;
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

export type DesignTab = 'resources' | 'sketch' | 'quick-design' | 'lookbook' | 'try-on' | 'concept-product' | 'history';

export interface GenerationResult {
  id: string;
  imageUrl: string;
  promptUsed: string;
  type: 'product' | 'lookbook';
  createdAt: number;
}

// AI API Types
export interface AIServiceResponse {
  success: boolean;
  data?: string; // Image URL or Text
  error?: string;
}

export interface GenConfig {
  resolution: '1K' | '2K' | '4K';
  count: number;
  aspectRatio: '1:1' | '3:4' | '4:3' | '16:9' | '9:16';
}

// New Types for Full System
export interface Asset {
  id: string;
  name: string;
  url: string;
  type: 'base' | 'texture' | 'graphic' | 'model';
}

// NEW: Standardized Library Asset for Service Pattern
export interface LibraryAsset {
  id: string;
  type: 'POSE' | 'SCENE' | 'CONCEPT';
  category: string; // e.g., 'Studio', 'Outdoor', 'Standing'
  title: string;
  description: string; // Display text
  prompt_payload: string; // The actual instruction sent to AI
  thumbnail_url?: string;
}

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
  // New properties
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
  desc: string; // Instructions for AI
  image: string; // Placeholder URL
}

export interface TokenUsage {
  promptTokens: number;
  responseTokens: number;
  totalTokens: number;
  imageCount: number;
}

export interface UsageLog {
  id: string;
  timestamp: number;
  userId: string;
  userName: string;
  action: string;
  modelName: string;
  resolution?: '1K' | '2K' | '4K'; // Added for detailed analytics
  tokens: TokenUsage;
  cost: number;
}

// IndexedDB Storage Types
export interface StoredImage {
  id: string; // UUID
  userId: string;
  blob: Blob; // Binary Data
  thumbnail?: Blob; // Optional thumbnail
  type: 'sketch' | 'lookbook' | 'design' | 'try-on' | 'concept-product';
  prompt?: string;
  createdAt: number;
  metadata: {
    resolution: string;
    aspectRatio: string;
  };
}
