import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";

// ==========================================
// 1. CẤU HÌNH (CONSTANTS)
// ==========================================
const SERVICE_COSTS = {
  '1K': 4,
  '2K': 5,
  '4K': 10
};

// Cấu hình CORS Helper
const allowCors = (fn) => async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  )
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }
  return await fn(req, res)
}

const handler = async (req, res) => {
  // Chỉ nhận POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // ==========================================
  // 2. KHỞI TẠO SUPABASE ADMIN
  // ==========================================
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // ⚠️ Cần thêm vào Vercel Env

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing Env: VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    return res.status(500).json({ error: 'Server Configuration Error' });
  }

  // Client này có quyền Admin (Service Role), bỏ qua RLS để trừ tiền và upload
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    // ==========================================
    // 3. XÁC THỰC NGƯỜI DÙNG (AUTH CHECK)
    // ==========================================
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Missing Auth Token' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized / Invalid Token' });
    }

    // ==========================================
    // 4. KIỂM TRA SỐ DƯ (BALANCE CHECK)
    // ==========================================
    const { model, contents, config, type } = req.body; // type: 'lookbook', 'sketch'...
    const resolution = config?.resolution || '2K';
    const count = 1; // Luôn xử lý 1 ảnh mỗi request

    // Lấy giá tiền
    let cost = SERVICE_COSTS[resolution] || 5;

    // Query số dư hiện tại của user (Dùng quyền Admin để đọc chính xác)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    if (profile.credits < cost) {
      return res.status(402).json({ error: 'Không đủ Credits. Vui lòng nạp thêm.' });
    }

    // ==========================================
    // 5. GỌI GOOGLE GEMINI AI
    // ==========================================
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("Missing GEMINI_API_KEY");

    const ai = new GoogleGenAI({ apiKey });
    
    // Cấu hình AI an toàn & tối ưu
    const aiConfig = {
      sampleCount: 1,
      aspectRatio: config?.aspectRatio || '1:1',
      personGeneration: "allow_adult",
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" }
      ]
    };

    // Gọi AI
    const response = await ai.models.generateContent({
      model: model || "gemini-2.0-flash",
      contents: contents,
      config: aiConfig
    });

    const candidates = response.candidates;
    if (!candidates || !candidates[0]?.content?.parts) {
      console.error("AI Blocked:", candidates?.[0]?.finishReason);
      throw new Error(`AI từ chối tạo ảnh (${candidates?.[0]?.finishReason}).`);
    }

    const generatedPart = candidates[0].content.parts.find((p) => p.inlineData);
    if (!generatedPart) throw new Error("AI không trả về dữ liệu ảnh.");

    const base64Data = generatedPart.inlineData.data;

    // ==========================================
    // 6. UPLOAD LÊN SUPABASE STORAGE (SERVER-SIDE)
    // ==========================================
    // Convert Base64 to Buffer
    const buffer = Buffer.from(base64Data, 'base64');
    const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
    
    // Upload vào bucket 'generated_images' (Bucket này cần tạo ở Bước 2)
    const { error: uploadError } = await supabase.storage
      .from('generated_images')
      .upload(fileName, buffer, {
        contentType: 'image/jpeg',
        upsert: false
      });

    if (uploadError) {
      console.error("Storage Upload Error:", uploadError);
      throw new Error("Lỗi lưu ảnh vào hệ thống.");
    }

    // Lấy Public URL
    const { data: urlData } = supabase.storage
      .from('generated_images')
      .getPublicUrl(fileName);
    
    const publicUrl = urlData.publicUrl;

    // ==========================================
    // 7. TRANSACTION: TRỪ TIỀN & GHI LOG (RPC)
    // ==========================================
    // Gọi hàm RPC an toàn (Sẽ tạo ở Bước 2)
    const { error: rpcError } = await supabase.rpc('handle_generation_transaction', {
      p_user_id: user.id,
      p_cost: cost,
      p_image_url: publicUrl,
      p_meta: { 
        type: type || 'unknown',
        resolution: resolution,
        model: model 
      }
    });

    if (rpcError) {
      console.error("Transaction Error:", rpcError);
      // Trường hợp này ảnh đã tạo và upload nhưng chưa trừ tiền thành công.
      // Có thể chấp nhận rủi ro nhỏ hoặc xử lý rollback (xóa ảnh) tại đây.
      // Tạm thời báo lỗi để Client biết.
      throw new Error("Lỗi xử lý giao dịch credits.");
    }

    // Lấy số dư mới nhất để cập nhật UI Client
    const { data: updatedProfile } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', user.id)
      .single();

    // ==========================================
    // 8. TRẢ VỀ KẾT QUẢ
    // ==========================================
    return res.status(200).json({
      success: true,
      imageUrl: publicUrl,       // Trả về URL thay vì Base64
      remainingCredits: updatedProfile?.credits || 0, // Số dư mới
      meta: {
        cost: cost,
        resolution: resolution
      }
    });

  } catch (error) {
    console.error("API Processing Error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

export default allowCors(handler);
