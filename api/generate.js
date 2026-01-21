import { GoogleGenAI } from "@google/genai";

// ==========================================
// 1. CẤU HÌNH BẢNG GIÁ DỊCH VỤ (Server Side)
// ==========================================
// Phải khớp 100% với constants.ts ở Frontend
const SERVICE_COSTS = {
  '1K': 4,   // Sketch / Draft (4.000đ)
  '2K': 5,   // Quick Design (5.000đ)
  '4K': 10   // Lookbook / High Quality (10.000đ)
};

// Cấu hình CORS Helper (Giữ nguyên)
const allowCors = (fn) => async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }
  return await fn(req, res)
}

const handler = async (req, res) => {
  // Chỉ nhận POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { model, contents, config } = req.body;

    // ==========================================
    // 2. TÍNH TOÁN CHI PHÍ (COST CALCULATION)
    // ==========================================
    
    // ⚠️ QUAN TRỌNG: Lấy resolution/count từ 'config' (nếu có) hoặc từ 'req.body'
    // Frontend thường gửi dạng: { config: { resolution: '2K', count: 1 } }
    const resolution = config?.resolution || req.body.resolution || '2K'; 
    const count = config?.count || req.body.count || 1;

    // Lấy đơn giá (Mặc định là 5 credits cho 2K nếu gửi sai resolution)
    let costPerImage = SERVICE_COSTS[resolution] || 5;
    
    // Tổng tiền = Đơn giá * Số lượng ảnh
    const totalCost = costPerImage * count;

    // ==========================================
    // 3. GỌI AI ENGINE (GOOGLE GEMINI)
    // ==========================================
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Server Error: Thiếu GEMINI_API_KEY");
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // Gọi Google Gemini
    // Lưu ý: config được truyền vào đây để AI biết gen ảnh cỡ nào (aspectRatio)
    const response = await ai.models.generateContent({
      model: model || "gemini-2.0-flash",
      contents: contents,
      config: config // Truyền config xuống để Gemini xử lý
    });

    const candidates = response.candidates;
    if (!candidates || !candidates[0]?.content?.parts) {
      throw new Error("AI không trả về kết quả hợp lệ.");
    }

    // Tìm phần dữ liệu ảnh (inlineData) trong phản hồi
    const generatedPart = candidates[0].content.parts.find((p) => p.inlineData);
    
    // ==========================================
    // 4. TRẢ VỀ KẾT QUẢ + HÓA ĐƠN (COST)
    // ==========================================
    return res.status(200).json({
      success: true,
      data: generatedPart ? generatedPart.inlineData.data : null,
      meta: {
        cost: totalCost,      // Số tiền Backend đã tính (Frontend sẽ dùng số này để trừ DB)
        resolution: resolution,
        count: count,
        provider: 'Mentoris-AI-Core'
      }
    });

  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

export default allowCors(handler);
