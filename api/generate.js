import { GoogleGenAI } from "@google/genai";

// Bảng giá dịch vụ (Mapping Resolution -> Credits)
// 1K = Sketch (4 Credits)
// 2K = Quick Design (5 Credits)
// 4K = Lookbook (10 Credits)
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
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
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

  try {
    const { model, contents, config } = req.body;

    // --- 1. TÍNH CHI PHÍ (COST CALCULATION) ---
    // Mặc định lấy độ phân giải từ config, nếu không có thì mặc định là 2K
    // Trong req.body.config thường có trường 'resolution' nếu frontend gửi lên
    // Hoặc nếu bạn gửi riêng ngoài body chính
    const resolution = req.body.resolution || '2K'; 
    const count = req.body.count || 1;

    // Lấy giá dựa trên độ phân giải, mặc định là 5 (2K) nếu không khớp
    let costPerImage = SERVICE_COSTS[resolution] || 5;
    const totalCost = costPerImage * count;

    // --- 2. GỌI AI ---
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Server thiếu GEMINI_API_KEY");
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // Gọi Google Gemini
    const response = await ai.models.generateContent({
      model: model || "gemini-2.0-flash",
      contents: contents,
      config: config
    });

    const candidates = response.candidates;
    if (!candidates || !candidates[0]?.content?.parts) {
      throw new Error("Không tạo được ảnh/nội dung từ AI.");
    }

    const generatedPart = candidates[0].content.parts.find((p) => p.inlineData);
    
    // --- 3. TRẢ VỀ KẾT QUẢ KÈM CHI PHÍ ---
    return res.status(200).json({
      success: true,
      data: generatedPart ? generatedPart.inlineData.data : null,
      meta: {
        cost: totalCost, // Server báo cho Frontend biết cần trừ bao nhiêu tiền
        resolution: resolution,
        count: count
      }
    });

  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: error.message });
  }
}

export default allowCors(handler);
