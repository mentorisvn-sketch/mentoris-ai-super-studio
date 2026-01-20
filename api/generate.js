// api/generate.js

export default async function handler(req, res) {
  // Cấu hình CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { prompt, resolution = '1K', count = 1 } = req.body;

    // --- MÔ PHỎNG GỌI AI ENGINE (Gemini / Stable Diffusion) ---
    // (Sau này bạn sẽ thay đoạn này bằng code gọi API thật)
    
    // 1. Tính toán chi phí giả lập (Cost Estimation)
    // Ví dụ: 1 ảnh 1K = 1 Credit, 4K = 4 Credits
    let costPerImage = 1;
    if (resolution === '2K') costPerImage = 2;
    if (resolution === '4K') costPerImage = 4;
    
    const totalCost = costPerImage * count;

    // 2. Mô phỏng độ trễ của AI (2-3 giây)
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 3. Trả về kết quả
    return res.status(200).json({
      success: true,
      data: [
        // Trả về danh sách ảnh (Ở đây dùng ảnh mẫu ngẫu nhiên để test)
        `https://source.unsplash.com/random/1024x1024/?${encodeURIComponent(prompt)}&sig=${Math.random()}`,
      ],
      meta: {
        cost: totalCost, // <--- QUAN TRỌNG: Trả về số credit đã tiêu
        resolution: resolution,
        provider: 'Mentoris-AI-Core'
      }
    });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
