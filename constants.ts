import { Product, ColorDefinition, Asset, GenConfig, Pose, User } from './types';

// =============================================================================
// 1. CẤU HÌNH TÀI CHÍNH & BẢNG GIÁ MỚI (NEW UPDATE)
// =============================================================================

// Tỷ giá quy đổi: 1 Credit = 1.000 VNĐ
export const CREDIT_EXCHANGE_RATE = 1000;

// Bảng giá dịch vụ (Số credits bị trừ cho mỗi lần tạo ảnh)
export const SERVICE_COSTS = {
  SKETCH_1K: 4,    // 4 Credits = 4.000 VNĐ (Phác thảo - 1K)
  DESIGN_2K: 5,    // 5 Credits = 5.000 VNĐ (Quick Design - 2K)
  LOOKBOOK_4K: 10, // 10 Credits = 10.000 VNĐ (Lookbook/Try-on - 4K)
};

// Các gói nạp tiền (Hiển thị trong Admin & Modal nạp tiền)
export const TOPUP_PACKAGES = [
  {
    id: 'starter',
    price: 500000,        // 500.000 VNĐ
    credits: 500,         // 500 Credits
    bonus: 0,
    label: 'Starter',
    desc: 'Gói trải nghiệm cơ bản (Quy đổi: ~100 ảnh 2K)'
  },
  {
    id: 'pro_creator',
    price: 2999000,       // 2.999.000 VNĐ
    credits: 3000,        // 3.000 Credits
    bonus: 0,             // Giá ưu đãi tốt hơn mua lẻ
    label: 'Pro Creator',
    desc: 'Dành cho nhà sáng tạo chuyên nghiệp (Quy đổi: ~600 ảnh 2K)',
    recommended: true     // Gói khuyên dùng
  },
  {
    id: 'business',
    price: 10000000,      // 10.000.000 VNĐ
    credits: 10000,       // 10.000 Credits
    bonus: 0,
    label: 'Business',
    desc: 'Giải pháp tối ưu cho Doanh nghiệp (Quy đổi: ~2.000 ảnh 2K)'
  },
];

// =============================================================================
// 2. DỮ LIỆU HỆ THỐNG (GIỮ NGUYÊN KHÔNG THAY ĐỔI)
// =============================================================================

export const EXTENDED_CATEGORIES = {
  men: [
    { id: 'm_tshirt', name: 'Áo Thun (T-Shirt)' },
    { id: 'm_polo', name: 'Áo Polo' },
    { id: 'm_shirt', name: 'Sơ mi (Dress Shirt)' },
    { id: 'm_flannel', name: 'Sơ mi Dạ (Flannel)' },
    { id: 'm_hoodie', name: 'Áo Hoodie' },
    { id: 'm_sweatshirt', name: 'Áo Nỉ (Sweatshirt)' },
    { id: 'm_sweater', name: 'Áo Len (Sweater)' },
    { id: 'm_cardigan', name: 'Áo Cardigan' },
    { id: 'm_blazer', name: 'Áo Blazer / Vest' },
    { id: 'm_bomber', name: 'Áo Khoác Bomber' },
    { id: 'm_varsity', name: 'Áo Khoác Varsity' },
    { id: 'm_denim_jacket', name: 'Áo Khoác Jeans' },
    { id: 'm_leather_jacket', name: 'Áo Khoác Da (Biker)' },
    { id: 'm_trench_coat', name: 'Áo Măng tô (Trench Coat)' },
    { id: 'm_shorts', name: 'Quần Short' },
    { id: 'm_chinos', name: 'Quần Chinos / Kaki' },
    { id: 'm_trousers', name: 'Quần Âu (Trousers)' },
    { id: 'm_jeans', name: 'Quần Jeans (Denim)' },
    { id: 'm_joggers', name: 'Quần Jogger' },
    { id: 'm_cargopants', name: 'Quần Túi Hộp (Cargo)' },
  ],
  women: [
    { id: 'w_dress', name: 'Váy Liền (Dress)' },
    { id: 'w_maxi', name: 'Váy Maxi' },
    { id: 'w_bodycon', name: 'Váy Bodycon' },
    { id: 'w_skirt_a', name: 'Chân Váy Chữ A' },
    { id: 'w_skirt_pencil', name: 'Chân Váy Bút Chì' },
    { id: 'w_skirt_pleated', name: 'Chân Váy Xếp Ly' },
    { id: 'w_blouse', name: 'Áo Kiểu (Blouse)' },
    { id: 'w_croptop', name: 'Áo Croptop' },
    { id: 'w_tanktop', name: 'Áo Hai Dây / Tanktop' },
    { id: 'w_corset', name: 'Áo Corset' },
    { id: 'w_blazer', name: 'Áo Blazer Nữ' },
    { id: 'w_tweed', name: 'Áo Khoác Tweed' },
    { id: 'w_cardigan', name: 'Áo Cardigan Len' },
    { id: 'w_legging', name: 'Quần Legging' },
    { id: 'w_wideleg', name: 'Quần Ống Rộng (Wide Leg)' },
    { id: 'w_shorts', name: 'Quần Short Nữ' },
    { id: 'w_jeans', name: 'Quần Jeans Nữ' },
    { id: 'w_jumpsuit', name: 'Jumpsuit (Đồ Bay)' },
    { id: 'w_kimono', name: 'Áo Khoác Kimono' },
    { id: 'w_ao_dai', name: 'Áo Dài Cách Tân' },
  ]
};

export const EXTENDED_MATERIALS = [
  { id: 'cotton_combed', name: 'Cotton 100% (Combed)', desc: 'Sợi bông chải kỹ, bề mặt lì, mịn, thấm hút tốt.' },
  { id: 'cotton_pique', name: 'Vải Cá Sấu (Pique)', desc: 'Dệt mắt lưới to, thoáng khí, đứng form (thường dùng cho Polo).' },
  { id: 'linen', name: 'Vải Đũi (Linen)', desc: 'Chất liệu tự nhiên, thô mộc, thoáng mát, có nếp nhăn đặc trưng.' },
  { id: 'silk_satin', name: 'Lụa Satin', desc: 'Bề mặt bóng loáng, mềm rủ, sang trọng, bắt sáng cao.' },
  { id: 'silk_chiffon', name: 'Chiffon / Voan', desc: 'Mỏng, nhẹ, bay bổng, hơi trong suốt.' },
  { id: 'denim_raw', name: 'Raw Denim', desc: 'Vải bò thô, cứng, màu chàm đậm, thớ dệt chéo rõ nét.' },
  { id: 'denim_washed', name: 'Washed Denim', desc: 'Vải bò đã qua xử lý, mềm hơn, màu bạc (faded).' },
  { id: 'leather_smooth', name: 'Da Trơn (Smooth Leather)', desc: 'Bề mặt da lì hoặc bóng nhẹ, không thấm nước, cứng cáp.' },
  { id: 'leather_suede', name: 'Da Lộn (Suede)', desc: 'Bề mặt nhung mịn, cảm giác ấm áp, không bóng.' },
  { id: 'wool', name: 'Len (Wool)', desc: 'Sợi lông cừu, bề mặt xù nhẹ, ấm áp.' },
  { id: 'cashmere', name: 'Cashmere', desc: 'Len cao cấp, cực kỳ mềm mịn, nhẹ và giữ nhiệt tốt.' },
  { id: 'tweed', name: 'Vải Tweed', desc: 'Dệt từ len thô, kết cấu dày, vân dệt rõ ràng, sang trọng.' },
  { id: 'velvet', name: 'Nhung (Velvet)', desc: 'Bề mặt lông ngắn dày đặc, bóng sang trọng, thay đổi màu theo góc nhìn.' },
  { id: 'corduroy', name: 'Nhung Tăm (Corduroy)', desc: 'Vải nhung có các đường gân dọc nổi, phong cách cổ điển.' },
  { id: 'polyester_sport', name: 'Thun Lạnh (Poly Sport)', desc: 'Mịn, trơn, bóng nhẹ, co giãn, dùng cho đồ thể thao.' },
  { id: 'mesh', name: 'Vải Lưới (Mesh)', desc: 'Cấu trúc lỗ thoáng khí, thường dùng làm lớp lót hoặc phối thể thao.' },
  { id: 'lace', name: 'Ren (Lace)', desc: 'Hoa văn đục lỗ tinh xảo, nữ tính, quyến rũ.' },
  { id: 'organza', name: 'Tơ Sống (Organza)', desc: 'Mỏng, cứng, trong suốt, giữ phom tốt, tạo độ phồng.' },
  { id: 'khaki', name: 'Kaki (Khaki)', desc: 'Vải dệt chéo, dày dặn, cứng form, bền bỉ.' },
  { id: 'french_terry', name: 'Nỉ Da Cá (French Terry)', desc: 'Mặt ngoài mịn, mặt trong dệt vòng (loops), dày vừa phải.' },
];

export const CATEGORIES = [
  { id: 'tshirt', name: 'Áo Thun (T-Shirt)' },
  { id: 'polo', name: 'Áo Polo' },
  { id: 'shirt', name: 'Sơ mi (Casual/Dress Shirt)' },
  { id: 'hoodie', name: 'Áo Hoodie' },
  { id: 'sweatshirt', name: 'Áo Nỉ (Sweatshirt)' },
  { id: 'sweater', name: 'Áo Len (Sweater)' },
  { id: 'blazer', name: 'Áo Blazer / Vest' },
  { id: 'jacket', name: 'Áo Khoác (Bomber/Harrington)' },
  { id: 'windbreaker', name: 'Áo Gió' },
  { id: 'shorts', name: 'Quần Short' },
  { id: 'trousers', name: 'Quần Âu / Chinos' },
  { id: 'jeans', name: 'Quần Jeans (Denim)' },
  { id: 'joggers', name: 'Quần Jogger' },
  { id: 'tanktop', name: 'Áo Ba Lỗ (Tank Top)' },
];

export const MATERIALS = [
  { id: 'cotton_100', name: 'Cotton 100% (Lì)', desc: 'Tự nhiên, thoáng khí, bề mặt lì mềm mịn.' },
  { id: 'pique', name: 'Vải Cá sấu (Pique)', desc: 'Có kết cấu hạt, thoáng khí, đứng form (thường dùng cho Polo).' },
  { id: 'poly_cool', name: 'Thun lạnh (Poly Coolmax)', desc: 'Mịn, bóng nhẹ, rủ, phong cách thể thao.' },
  { id: 'french_terry', name: 'Nỉ da cá (French Terry)', desc: 'Dày dặn, mặt trong dệt vòng, giữ form tốt.' },
  { id: 'fleece', name: 'Nỉ bông (Fleece)', desc: 'Dày, ấm, bề mặt hơi xù nhẹ.' },
  { id: 'denim', name: 'Vải Bò (Denim)', desc: 'Dày, cứng, thớ dệt chéo đặc trưng.' },
  { id: 'linen', name: 'Vải Đũi (Linen)', desc: 'Thô, thoáng mát, có nếp nhăn tự nhiên.' },
  { id: 'silk', name: 'Lụa (Silk)', desc: 'Bóng, mềm mại, sang trọng, rủ.' },
  { id: 'corduroy', name: 'Nhung tăm (Corduroy)', desc: 'Có các đường gân nổi dọc, phong cách cổ điển.' },
  { id: 'leather', name: 'Da (Leather)', desc: 'Bóng hoặc lì, cứng cáp, không thấm nước.' },
  { id: 'nylon', name: 'Vải Gió (Nylon/Polyester)', desc: 'Đanh, bề mặt giấy, bắt sáng mạnh, chống nước.' },
  { id: 'wool', name: 'Len (Wool)', desc: 'Bề mặt lông mịn, ấm áp.' },
  { id: 'flannel', name: 'Dạ (Flannel)', desc: 'Mềm, xù nhẹ, thường có họa tiết caro.' },
  { id: 'mesh', name: 'Vải Lưới (Mesh)', desc: 'Có lỗ thoáng khí, dùng cho đồ thể thao.' },
];

export const CONCEPT_CATEGORIES = [
  { id: 'lifestyle', name: 'Luxury Lifestyle' },
  { id: 'structural', name: 'Structural & Form' },
  { id: 'artistic', name: 'Artistic & Minimalist' },
  { id: 'tet', name: 'Tết Collection' },
];

export const CONCEPTS = [
  { 
    id: 'gentlemans_lounge', 
    category: 'lifestyle', 
    name: 'Gentleman\'s Lounge', 
    desc: 'Sản phẩm đặt trên ghế Sofa da thật màu nâu tối (Dark Leather), texture da bóng nhẹ, ánh sáng vàng ấm quyền lực.' 
  },
  {
    id: 'modern_office',
    category: 'lifestyle',
    name: 'Modern Office',
    desc: 'Bright, airy modern office space with glass walls, natural daylight, and minimalist furniture.'
  },
  {
    id: 'concrete_minimal',
    category: 'structural',
    name: 'Concrete Minimal',
    desc: 'Raw concrete walls, sharp shadows, high contrast lighting, emphasizing form and texture.'
  },
  {
    id: 'art_gallery',
    category: 'artistic',
    name: 'Art Gallery',
    desc: 'Clean white space with soft diffused lighting, product placed on a white pedestal like a sculpture.'
  },
  {
    id: 'tet_traditional',
    category: 'tet',
    name: 'Traditional Tết',
    desc: 'Warm red and gold tones, apricot blossoms (Mai), lanterns, festive atmosphere.'
  }
];

export const COLORS: ColorDefinition[] = [
  { name: 'Đen Huyền Bí', image: '', hex: '#000000' },
  { name: 'Trắng Tinh Khôi', image: '', hex: '#FFFFFF' },
  { name: 'Xanh Navy', image: '', hex: '#1A237E' },
  { name: 'Xám Chì', image: '', hex: '#37474F' },
  { name: 'Xanh Lục Bảo', image: '', hex: '#004D40' },
  { name: 'Đỏ Rượu Vang', image: '', hex: '#880E4F' },
];

export const RESOLUTIONS = ['1K', '2K', '4K'];
export const COUNTS = [1, 2, 3, 4, 5, 6];
// CẬP NHẬT DANH SÁCH TỈ LỆ KHUNG HÌNH ĐẦY ĐỦ
export const ASPECT_RATIOS = [
  { id: '21:9', label: 'Cinema', width: 1536, height: 640 }, // Mới
  { id: '16:9', label: 'Landscape', width: 1344, height: 768 },
  { id: '3:2', label: 'Photo', width: 1216, height: 832 },   // Mới
  { id: '4:3', label: 'Tablet', width: 1152, height: 896 },
  { id: '1:1', label: 'Square', width: 1024, height: 1024 },
  { id: '3:4', label: 'Portrait', width: 896, height: 1152 },
  { id: '2:3', label: 'Standard', width: 832, height: 1216 }, // Mới
  { id: '4:5', label: 'Instagram', width: 816, height: 1024 }, // Mới
  { id: '9:16', label: 'Mobile', width: 768, height: 1344 },
];

export const LOOKBOOK_ANGLES = [
  "Full Body Shot: Standing confident pose, showing the entire outfit from head to toe.",
  "Medium Shot (Waist Up): Focus on the upper body fit, styling, and layering.",
  "Close-Up Detail: Extreme close-up focusing on fabric texture, collar, or logo details.",
  "Low Angle (Hero Shot): Camera looking up slightly to create a powerful, masculine stature.",
  "Lifestyle Context: Sitting or leaning naturally, engaging with the environment (e.g., checking watch, holding coffee).",
  "Side/Back Profile: Showing the fit from the side or back to display silhouette and cut."
];

export const POSE_CATEGORIES = [
  { id: 'full_body', name: 'Toàn thân (Full Body)' },
  { id: 'half_body', name: 'Bán thân (Half Body)' },
  { id: 'sitting', name: 'Dáng ngồi (Sitting)' },
  { id: 'walking', name: 'Dáng đi (Walking)' },
];

export const POSES: Pose[] = [
    { 
        id: 'pose_stand_basic', 
        category: 'full_body', 
        name: 'Standing Basic', 
        desc: 'Full body shot, model standing straight, arms relaxed by sides, facing camera.', 
        image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=300&auto=format&fit=crop' 
    },
    { 
        id: 'pose_walk_forward', 
        category: 'walking', 
        name: 'Walking Forward', 
        desc: 'Full body shot, model walking towards the camera, dynamic movement in fabric.', 
        image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=300&auto=format&fit=crop' 
    },
    { 
        id: 'pose_sit_stool', 
        category: 'sitting', 
        name: 'Sitting on Stool', 
        desc: 'Model sitting on a high stool, one leg extended, relaxed pose.', 
        image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop' 
    },
     { 
        id: 'pose_half_crossed', 
        category: 'half_body', 
        name: 'Arms Crossed', 
        desc: 'Waist-up shot, model with arms crossed, confident expression.', 
        image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=300&auto=format&fit=crop' 
    },
    {
        id: 'pose_leaning',
        category: 'full_body',
        name: 'Leaning Against Wall',
        desc: 'Model leaning back against a wall, one leg slightly bent, relaxed vibe.',
        image: 'https://images.unsplash.com/photo-1488161628813-99425260bddc?q=80&w=300&auto=format&fit=crop'
    }
];

export const LOOKBOOK_BG_CATEGORIES = [
    { id: 'studio', name: 'Studio' },
    { id: 'outdoor', name: 'Ngoài trời (Outdoor)' },
    { id: 'interior', name: 'Trong nhà (Interior)' },
    { id: 'abstract', name: 'Trừu tượng (Abstract)' },
];

export const LOOKBOOK_BACKGROUNDS = [
    { 
        id: 'bg_studio_white', 
        category: 'studio', 
        name: 'Studio White', 
        desc: 'Professional studio lighting with a seamless white background.' 
    },
    { 
        id: 'bg_studio_grey', 
        category: 'studio', 
        name: 'Concrete Grey', 
        desc: 'Minimalist concrete wall studio background with soft shadows.' 
    },
    { 
        id: 'bg_paris_street', 
        category: 'outdoor', 
        name: 'Paris Street', 
        desc: 'Blurred street of Paris in the background, daytime, fashion week vibe.' 
    },
    { 
        id: 'bg_luxury_lobby', 
        category: 'interior', 
        name: 'Luxury Lobby', 
        desc: 'High-end hotel lobby with warm lighting and marble floors.' 
    },
    { 
        id: 'bg_neon', 
        category: 'abstract', 
        name: 'Neon Cyberpunk', 
        desc: 'Dark background with neon blue and pink rim lighting.' 
    },
];

export const PRINT_TYPES = [
  { id: 'normal', name: 'Mặc định (In thường)', desc: 'In phẳng, mực thấm vào thớ vải, không có độ nổi.' },
  { id: 'high_density', name: 'In Cao Thành', desc: 'Nổi khối vuông thành sắc cạnh, độ dày > 0.5mm, bề mặt lì phẳng.' },
  { id: 'heat_transfer', name: 'In Ép Nhiệt (PET)', desc: 'Màng in mỏng, bề mặt mịn, hơi bóng nhẹ, chi tiết sắc nét.' },
  { id: 'embroidery', name: 'Hình Thêu', desc: 'Tạo bởi các sợi chỉ, có kết cấu sợi thực tế, bắt sáng trên từng sợi chỉ.' },
  { id: 'decal', name: 'In Decal', desc: 'Mặt nhựa bóng (Glossy) hoặc lì (Matte), cảm giác như dán một lớp vật liệu lên.' },
  { id: 'screen', name: 'In Lưới (Lụa)', desc: 'Lớp mực dày vừa phải, bề mặt hơi sần theo chất liệu vải, màu sắc rực rỡ.' },
  { id: 'rubber_press', name: 'In Ép Cao Su', desc: 'Bề mặt cao su lì (Matte rubber), độ nổi khối mềm mại, cảm giác đàn hồi.' },
];

export const DEFAULT_GEN_CONFIG: GenConfig = {
  resolution: '2K',
  count: 1,
  aspectRatio: '3:4'
};

export const PACKAGES = [
  {
    id: 'enterprise',
    name: 'MENTORIS AI ENTERPRISE',
    priceVND: '10.000.000',
    description: "Sở hữu 'Super Studio' ngay tại văn phòng với Mentoris AI Enterprise – giải pháp R&D toàn diện giúp doanh nghiệp nghiên cứu, thiết kế và xây dựng bộ sưu tập thời trang siêu tốc với hiệu suất gấp 50 lần nhân sự thông thường. Bằng cách tự động hóa hoàn toàn dây chuyền sản xuất hình ảnh hoạt động 24/7, chúng tôi giúp bạn cắt giảm 90% chi phí mẫu thử và tăng tốc độ ra mắt thị trường gấp 100 lần, sẵn sàng tung ra hàng nghìn Lookbook thương mại chuẩn quốc tế ngay khi xu hướng vừa chớm nở.",
    recommended: true
  }
];

// ... (Giữ nguyên các phần trên)

export const MOCK_USER: User = {
  id: 'u1',
  name: 'Super Admin Developer',
  email: 'dev@mentoris.ai',
  role: 'admin', 
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dev',
  credits: 9999999, 
  subscriptionTier: 'enterprise', 
  isActive: true,
  permissions: ['all'], 
  usageStats: {
    totalImages: 0,
    totalSpend: 0
  }
};

// 🔥 THÊM 2 BIẾN NÀY ĐỂ FIX LỖI BUILD:
export const MOCK_USERS: User[] = [MOCK_USER];

export const MOCK_LOGS: any[] = [
  {
    id: 'log_init',
    timestamp: Date.now(),
    userId: 'system',
    userName: 'System',
    action: 'SYSTEM_INIT',
    modelName: 'system',
    resolution: 'N/A',
    tokens: {},
    cost: 0
  }
];

export const MOCK_ASSETS: Asset[] = [
    {
        id: 'model_1',
        name: 'Asian Male Model',
        type: 'model',
        url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=300&auto=format&fit=crop'
    },
    {
        id: 'model_2',
        name: 'Caucasian Male',
        type: 'model',
        url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop'
    }
];

export const PRICING = {
    INPUT_TOKEN_PRICE_PER_MILLION: 2.50,
    OUTPUT_TOKEN_PRICE_PER_MILLION: 10.00,
    IMAGE_PRICE_PER_UNIT: 0.04,
};

export const EXCHANGE_RATE = 26500;
