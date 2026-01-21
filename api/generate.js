import { GoogleGenAI } from "@google/genai";

// ==========================================
// 1. CẤU HÌNH BẢNG GIÁ DỊCH VỤ (Server Side)
// ==========================================
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
    // 2. TÁCH BIỆT THAM SỐ (QUAN TRỌNG)
    // ==========================================
    
    // A. Tham số dùng để TÍNH TIỀN (Business Logic)
    const resolution = config?.resolution || '2K'; // Mặc định 2K
    const count = config?.count || 1;              // Luôn là 1 (do frontend đã loop)

    // B. Tham số dùng để GỌI AI (AI Logic)
    // 🔥 Chỉ lấy những gì Gemini Imagen 3 hiểu (aspectRatio, sampleCount)
    // ❌ KHÔNG gửi 'resolution' hay 'imageSize' vì AI sẽ báo lỗi
    const aiConfig = {
      sampleCount: 1, // Luôn sinh 1 ảnh mỗi lần gọi
      aspectRatio: config?.aspectRatio || '1:1', // Tỉ lệ khung hình (16:9, 1:1...)
      personGeneration: "allow_adult", // Cho phép tạo hình người
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" }
      ]
    };

    // ==========================================
    // 3. TÍNH TOÁN CHI PHÍ
    // ==========================================
    let costPerImage = SERVICE_COSTS[resolution] || 5;
    const totalCost = costPerImage * count;

    // ==========================================
    // 4. GỌI AI ENGINE (GOOGLE GEMINI)
    // ==========================================
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Server Error: Thiếu GEMINI_API_KEY");
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // Gọi Google Gemini với cấu hình AI "sạch"
    const response = await ai.models.generateContent({
      model: model || "gemini-2.0-flash", // Hoặc "imagen-3.0-generate-001"
      contents: contents,
      config: aiConfig // 👈 Sử dụng aiConfig đã lọc sạch
    });

    const candidates = response.candidates;
    if (!candidates || !candidates[0]?.content?.parts) {
      throw new Error("AI không trả về kết quả hợp lệ.");
    }

    // Tìm phần dữ liệu ảnh (inlineData)
    const generatedPart = candidates[0].content.parts.find((p) => p.inlineData);
    
    // ==========================================
    // 5. TRẢ VỀ KẾT QUẢ
    // ==========================================
    return res.status(200).json({
      success: true,
      data: generatedPart ? generatedPart.inlineData.data : null,
      meta: {
        cost: totalCost,      // Số tiền đã tính
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
