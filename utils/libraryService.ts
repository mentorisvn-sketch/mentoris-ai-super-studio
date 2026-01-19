
import { createClient } from "./supabase/client";
import { LibraryAsset } from "../types";

// --- CONSTANTS FOR DATA GENERATION ---
const THUMBNAIL_PLACEHOLDER = "https://placehold.co/600x800/F3F4F6/1F2937.png?text=Mentoris+Asset";

// 1. SCENE DATA SEEDS (BỐI CẢNH)
const SCENE_SEEDS = {
    'Studio': {
        backgrounds: [
            { vi: 'Phông Trắng Vô Cực', en: 'Infinite White' },
            { vi: 'Tường Bê Tông Xám', en: 'Concrete Grey Wall' },
            { vi: 'Vải Canvas Nghệ Thuật', en: 'Textured Canvas Backdrop' },
            { vi: 'Phông Đen Mờ', en: 'Dark Matte Black' },
            { vi: 'Phông Màu Be (Muslin)', en: 'Beige Muslin Backdrop' }
        ],
        lights: [
            { vi: 'Ánh sáng Softbox Mịn', en: 'Softbox Lighting' },
            { vi: 'Ánh sáng Viền Sắc Nét', en: 'Hard Rim Light' },
            { vi: 'Bóng Đổ Cây (Gobo)', en: 'Gobo Tree Shadows' },
            { vi: 'Đèn Spotlight Điện Ảnh', en: 'Cinematic Spotlight' },
            { vi: 'Ánh Sáng Cửa Sổ Tự Nhiên', en: 'Diffused Window Light' }
        ],
        details: [
            { vi: 'Setup tối giản', en: 'Minimalist setup' },
            { vi: 'Bục đứng nổi', en: 'Floating podium' },
            { vi: 'Đạo cụ hình khối', en: 'Geometric props' },
            { vi: 'Sàn bóng phản chiếu', en: 'Clean floor reflection' },
            { vi: 'Phong cách công nghiệp', en: 'Industrial vibe' }
        ]
    },
    'Đường Phố': {
        backgrounds: [
            { vi: 'Quán Cafe Paris', en: 'Parisian Cafe' },
            { vi: 'Ngã Tư New York', en: 'NYC Crosswalk' },
            { vi: 'Hẻm Neon Tokyo', en: 'Tokyo Neon Alley' },
            { vi: 'Tường Gạch Cổ Điển', en: 'Brick Wall Grunge' },
            { vi: 'Tòa Nhà Kính Hiện Đại', en: 'Modern Glass Building' }
        ],
        lights: [
            { vi: 'Nắng Vàng (Golden Hour)', en: 'Golden Hour Sun' },
            { vi: 'Trời Râm Mát', en: 'Overcast Soft Light' },
            { vi: 'Bokeh Đêm Thành Phố', en: 'City Night Bokeh' },
            { vi: 'Nắng Gắt Giữa Trưa', en: 'Harsh Mid-day Sun' },
            { vi: 'Ánh Đèn Đường', en: 'Streetlamp Glow' }
        ],
        details: [
            { vi: 'Người đi đường mờ ảo', en: 'Blurry passersby background' },
            { vi: 'Mặt đường ướt mưa', en: 'Wet pavement reflection' },
            { vi: 'Xe cổ phía sau', en: 'Vintage car background' },
            { vi: 'Nghệ thuật Graffiti', en: 'Graffiti art wall' },
            { vi: 'Cửa xuống tàu điện ngầm', en: 'Subway entrance' }
        ]
    },
    'Thiên Nhiên': {
        backgrounds: [
            { vi: 'Bãi Biển Nhiệt Đới', en: 'Tropical Beach' },
            { vi: 'Rừng Thông Sâu Thẳm', en: 'Deep Forest' },
            { vi: 'Cồn Cát Sa Mạc', en: 'Sand Dunes' },
            { vi: 'Đồng Cỏ Lau', en: 'Alpine Meadow' },
            { vi: 'Vách Đá Hùng Vĩ', en: 'Rocky Cliff' }
        ],
        lights: [
            { vi: 'Nắng Xuyên Kẽ Lá', en: 'Dappled Sunlight' },
            { vi: 'Bình Minh Rực Rỡ', en: 'Sunrise Glow' },
            { vi: 'Sương Mù Mờ Ảo', en: 'Moody Fog' },
            { vi: 'Nắng Trong Veo', en: 'High Noon Brightness' },
            { vi: 'Hoàng Hôn Ngược Sáng', en: 'Sunset Silhouette' }
        ],
        details: [
            { vi: 'Bóng dừa đổ dài', en: 'Palm shadows' },
            { vi: 'Hoa dại nở rộ', en: 'Wildflowers' },
            { vi: 'Sóng biển rì rào', en: 'Ocean spray' },
            { vi: 'Gỗ lũa khô', en: 'Dry driftwood' },
            { vi: 'Đá phủ rêu', en: 'Mossy rocks' }
        ]
    },
    'Luxury/Indoor': {
        backgrounds: [
            { vi: 'Phòng Khách Penthouse', en: 'Penthouse Living Room' },
            { vi: 'Sảnh Khách Sạn Đá Marble', en: 'Marble Hotel Lobby' },
            { vi: 'Sân Khấu Rèm Nhung', en: 'Velvet Curtain Stage' },
            { vi: 'Thư Viện Cổ Điển', en: 'Classic Library' },
            { vi: 'Bảo Tàng Nghệ Thuật', en: 'Modern Art Museum' }
        ],
        lights: [
            { vi: 'Đèn Chùm Ấm Áp', en: 'Warm Chandelier' },
            { vi: 'Ánh Sáng Gallery Lạnh', en: 'Cool Gallery Light' },
            { vi: 'Ánh Lửa Lò Sưởi', en: 'Fireplace Glow' },
            { vi: 'Đèn Led Kiến Trúc', en: 'Architectural Strip Light' },
            { vi: 'Ánh Sáng Tâm Trạng (Mood)', en: 'Mood Lighting' }
        ],
        details: [
            { vi: 'Sofa da thật', en: 'Leather sofa' },
            { vi: 'Chi tiết mạ vàng', en: 'Gold accents' },
            { vi: 'Thảm Ba Tư', en: 'Persian rug' },
            { vi: 'Tượng điêu khắc trừu tượng', en: 'Abstract sculpture' },
            { vi: 'Đàn Piano lớn', en: 'Grand piano' }
        ]
    }
};

// 2. POSE DATA SEEDS (DÁNG)
const POSE_SEEDS = {
    'Toàn Thân (Full Body)': {
        actions: [
            { vi: 'Bước đi tự tin', en: 'Walking forward' },
            { vi: 'Đứng thẳng quyền lực', en: 'Standing confident' },
            { vi: 'Dựa lưng vào tường', en: 'Leaning against wall' },
            { vi: 'Ngồi ghế cao', en: 'Sitting on stool' },
            { vi: 'Quay lưng nhìn lại', en: 'Turning back' }
        ],
        styles: [
            { vi: 'Thần thái thoải mái', en: 'Relaxed vibe' },
            { vi: 'Dáng Fashion', en: 'Fashion strut' },
            { vi: 'Thanh lịch sang trọng', en: 'Elegant stance' }
        ]
    },
    'Thân Trên (Upper Body)': {
        actions: [
            { vi: 'Khoanh tay trước ngực', en: 'Arms crossed' },
            { vi: 'Tay chạm cằm', en: 'Hand on chin' },
            { vi: 'Chỉnh cổ áo', en: 'Adjusting collar' },
            { vi: 'Tay đút túi quần', en: 'Hands in pockets' },
            { vi: 'Vuốt tóc nhẹ', en: 'Touching hair' }
        ],
        styles: [
            { vi: 'Biểu cảm nghiêm túc', en: 'Serious expression' },
            { vi: 'Cười thân thiện', en: 'Friendly smile' },
            { vi: 'Ánh mắt bí ẩn', en: 'Mysterious look' }
        ]
    },
    'Thân Dưới (Lower Body)': {
        actions: [
            { vi: 'Sải bước dài', en: 'Walking stride' },
            { vi: 'Đứng tách chân', en: 'Standing feet apart' },
            { vi: 'Ngồi vắt chân', en: 'Sitting cross-legged' },
            { vi: 'Tư thế chạy', en: 'Running start' },
            { vi: 'Khoe giày', en: 'Showcasing shoes' }
        ],
        styles: [
            { vi: 'Tập trung chi tiết quần', en: 'Detail on pants' },
            { vi: 'Tập trung giày dép', en: 'Focus on footwear' },
            { vi: 'Độ rủ vải tự nhiên', en: 'Fabric drape focus' }
        ]
    },
    'Dáng Thể Thao (Sport/Dynamic)': {
        actions: [
            { vi: 'Bật nhảy trên không', en: 'Mid-air jump' },
            { vi: 'Chạy nước rút', en: 'Sprinting' },
            { vi: 'Tư thế Yoga/Stretch', en: 'Yoga stretch' },
            { vi: 'Thế thủ Boxing', en: 'Boxing stance' },
            { vi: 'Nghỉ sau khi tập', en: 'Post-workout rest' }
        ],
        styles: [
            { vi: 'Năng lượng bùng nổ', en: 'High energy' },
            { vi: 'Tập trung cao độ', en: 'Intense focus' },
            { vi: 'Hiệu ứng mờ chuyển động', en: 'Motion blur' }
        ]
    },
    'Cận Cảnh (Close-up)': {
        actions: [
            { vi: 'Cận cảnh Logo', en: 'Focus on logo' },
            { vi: 'Macro chất liệu vải', en: 'Fabric texture macro' },
            { vi: 'Chi tiết cúc áo', en: 'Button detail' },
            { vi: 'Đường may mũi chỉ', en: 'Stitching pattern' },
            { vi: 'Điểm nhấn phụ kiện', en: 'Accessory highlight' }
        ],
        styles: [
            { vi: 'Nhiếp ảnh Macro', en: 'Macro photography' },
            { vi: 'Trừu tượng nghệ thuật', en: 'Abstract composition' },
            { vi: 'Ánh sáng tôn vinh chất liệu', en: 'Light play on material' }
        ]
    }
};

// 3. CONCEPT DATA SEEDS (Ý TƯỞNG)
const CONCEPT_SEEDS = {
    'Luxury Lifestyle': {
        themes: [
            { vi: 'Câu lạc bộ Quý ông', en: 'Gentlemans Club' },
            { vi: 'Văn phòng Cao cấp', en: 'High-end Office' },
            { vi: 'Chuyên cơ riêng', en: 'Private Jet Interior' },
            { vi: 'Du thuyền hạng sang', en: 'Yacht Deck' }
        ],
        elements: [
            { vi: 'Ly rượu Whiskey', en: 'Whiskey glass' },
            { vi: 'Máy tính Macbook', en: 'Macbook Pro' },
            { vi: 'Rượu Champagne', en: 'Champagne bottle' },
            { vi: 'Đồng hồ hiệu', en: 'Designer watch' }
        ]
    },
    'Structural & Form': {
        themes: [
            { vi: 'Kiến trúc Bauhaus', en: 'Bauhaus Architecture' },
            { vi: 'Bê tông thô (Brutalist)', en: 'Brutalist Concrete' },
            { vi: 'Bóng đổ hình học', en: 'Geometric Shadows' },
            { vi: 'Lơ lửng không trọng lực', en: 'Suspended Gravity' }
        ],
        elements: [
            { vi: 'Góc cạnh sắc nét', en: 'Sharp angles' },
            { vi: 'Vật liệu thô', en: 'Raw materials' },
            { vi: 'Khối kính', en: 'Glass blocks' },
            { vi: 'Dầm thép', en: 'Steel beams' }
        ]
    },
    'Artistic & Minimalist': {
        themes: [
            { vi: 'Triển lãm Trừu tượng', en: 'Abstract Gallery' },
            { vi: 'Không gian Đơn sắc', en: 'Monochrome Void' },
            { vi: 'Giấc mơ Siêu thực', en: 'Surreal Dream' },
            { vi: 'Gradient màu Pastel', en: 'Pastel Gradient' }
        ],
        elements: [
            { vi: 'Hình khối trôi nổi', en: 'Floating shapes' },
            { vi: 'Sương mù mềm', en: 'Soft fog' },
            { vi: 'Gương phản chiếu', en: 'Mirrors' },
            { vi: 'Ánh sáng lăng kính', en: 'Prism light' }
        ]
    },
    'Tết Collection': {
        themes: [
            { vi: 'Nhà Cổ Truyền Thống', en: 'Traditional House' },
            { vi: 'Chợ Hoa Xuân', en: 'Flower Market' },
            { vi: 'Phố Lồng Đèn Đỏ', en: 'Red Lantern Street' },
            { vi: 'Sân Đình', en: 'Temple Courtyard' }
        ],
        elements: [
            { vi: 'Cành Đào/Mai', en: 'Peach blossoms' },
            { vi: 'Bao Lì Xì', en: 'Lucky envelopes' },
            { vi: 'Nhang Trầm', en: 'Incense smoke' },
            { vi: 'Câu Đối Đỏ', en: 'Calligraphy scroll' }
        ]
    }
};

// --- DATA GENERATOR FUNCTION ---
const generateMockData = (): { poses: LibraryAsset[], scenes: LibraryAsset[], concepts: LibraryAsset[] } => {
    const scenes: LibraryAsset[] = [];
    const poses: LibraryAsset[] = [];
    const concepts: LibraryAsset[] = [];

    // GENERATE SCENES (20 per category)
    Object.entries(SCENE_SEEDS).forEach(([category, data]) => {
        for (let i = 0; i < 20; i++) {
            const bg = data.backgrounds[i % data.backgrounds.length];
            const light = data.lights[i % data.lights.length];
            const detail = data.details[i % data.details.length];
            
            const variation = i > 4 ? `(Var ${i+1})` : ''; 
            
            scenes.push({
                id: `scene_${category}_${i}`,
                type: 'SCENE',
                category: category,
                title: `${bg.vi} ${variation}`.trim(),
                description: `Không gian: ${bg.vi}. Ánh sáng: ${light.vi}. Chi tiết: ${detail.vi}.`,
                prompt_payload: `Professional fashion photography background. ${bg.en}, ${light.en}, ${detail.en}. Photorealistic 8k, depth of field, commercial aesthetic.`,
                thumbnail_url: THUMBNAIL_PLACEHOLDER
            });
        }
    });

    // GENERATE POSES (15 per category)
    Object.entries(POSE_SEEDS).forEach(([category, data]) => {
        for (let i = 0; i < 15; i++) {
            const action = data.actions[i % data.actions.length];
            const style = data.styles[i % data.styles.length];

            poses.push({
                id: `pose_${category}_${i}`,
                type: 'POSE',
                category: category,
                title: `${action.vi}`,
                description: `Tư thế: ${action.vi}. Phong cách: ${style.vi}.`,
                prompt_payload: `${category} shot. Model action: ${action.en}. Vibe: ${style.en}. High fashion posing, natural anatomy.`,
                thumbnail_url: THUMBNAIL_PLACEHOLDER
            });
        }
    });

    // GENERATE CONCEPTS (10 per category)
    Object.entries(CONCEPT_SEEDS).forEach(([category, data]) => {
        for (let i = 0; i < 10; i++) {
            const theme = data.themes[i % data.themes.length];
            const element = data.elements[i % data.elements.length];

            concepts.push({
                id: `concept_${category}_${i}`,
                type: 'CONCEPT',
                category: category,
                title: `${theme.vi}`,
                description: `Concept chủ đạo: ${theme.vi} kết hợp với ${element.vi}.`,
                prompt_payload: `Art Direction: ${theme.en}. Product placement: Central. Props: ${element.en}. High end commercial photography, dramatic lighting, 8k resolution.`,
                thumbnail_url: THUMBNAIL_PLACEHOLDER
            });
        }
    });

    return { poses, scenes, concepts };
};

// Generate data once
const { poses: MOCK_POSES, scenes: MOCK_SCENES, concepts: MOCK_CONCEPTS } = generateMockData();

// --- SERVICE FUNCTION ---

export const fetchLibraryAssets = async (type: 'POSE' | 'SCENE' | 'CONCEPT'): Promise<LibraryAsset[]> => {
    const supabase = createClient();
    
    // Artificial Delay for UX testing (Skeleton showcase)
    await new Promise(resolve => setTimeout(resolve, 600));

    try {
        // 1. Try to fetch from Supabase
        const { data, error } = await supabase
            .from('library_assets')
            .select('*')
            .eq('type', type)
            .eq('is_active', true);

        // If Supabase table exists and returns data, use it
        if (!error && data && data.length > 0) {
            return data as LibraryAsset[];
        }

        // 2. Fallback to Mock Data
        switch (type) {
            case 'POSE': return MOCK_POSES;
            case 'SCENE': return MOCK_SCENES;
            case 'CONCEPT': return MOCK_CONCEPTS;
            default: return [];
        }

    } catch (e) {
        console.error("Library Fetch Error:", e);
        // Fallback on crash
        switch (type) {
            case 'POSE': return MOCK_POSES;
            case 'SCENE': return MOCK_SCENES;
            case 'CONCEPT': return MOCK_CONCEPTS;
            default: return [];
        }
    }
};
