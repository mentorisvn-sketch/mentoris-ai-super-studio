import { GoogleGenAI } from "@google/genai";

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
    
    // Lấy API Key từ biến môi trường Server
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
    
    return res.status(200).json({
      success: true,
      data: generatedPart ? generatedPart.inlineData.data : null
    });

  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: error.message });
  }
}

export default allowCors(handler);