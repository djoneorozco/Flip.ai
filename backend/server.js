// ============================================================
// ✅ Flip.ai Polished Backend – DALL·E + 70% Rule Advisor (Updated)
// ============================================================

const fs = require('fs');
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const OpenAI = require("openai");
const multer = require('multer');

// ============================================================
// #1 INIT OPENAI + APP
// ============================================================
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const app = express();

// ============================================================
// #2 /tmp/uploads for Render
// ============================================================
const uploadDir = '/tmp/uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("✅ Created upload directory:", uploadDir);
} else {
  console.log("✅ Upload directory exists:", uploadDir);
}

// ============================================================
// #3 Multer Storage
// ============================================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage: storage });

// ============================================================
// #4 Middleware
// ============================================================
app.use(express.json());
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://flip-ai.netlify.app',
    'https://www.flip-ai.netlify.app'
  ]
}));

// ============================================================
// #5 Health Check + Test
// ============================================================
app.get('/', (req, res) => res.send('✅ Flip.AI backend is alive!'));
app.get('/api/test', (req, res) => res.json({ message: "✅ Backend test successful!" }));

// ============================================================
// #6 /api/ask – 70% Rule Flip Advisor (Polished)
// ============================================================
app.post('/api/ask', async (req, res) => {
  const { value, investment, zip, prompt } = req.body;

  if (!value || !investment) {
    return res.status(400).json({ error: "Missing property value or investment amount" });
  }

  const arv = Number(value) + Number(investment);
  const maxOffer = arv * 0.7;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `
You are a professional real estate flip advisor.
Always provide:
• After Repair Value (ARV)
• 70% Rule max offer estimate
• Simple explanation why this matters
• Quick tip for the investor
• End with: "Happy Flipping! 🚀"

Format numbers with dollar signs and commas.
Use short bullet points.
          `.trim()
        },
        {
          role: "user",
          content: `
ZIP Code: ${zip || 'N/A'}
Property Value: $${Number(value).toLocaleString()}
Planned Investment: $${Number(investment).toLocaleString()}
Notes: ${prompt || 'N/A'}

Calculate ARV, 70% Rule, and share professional advice.
          `.trim()
        }
      ],
    });

    res.json({
      answer: completion.choices[0].message.content,
      arv: `$${arv.toLocaleString()}`,
      maxOffer: `$${maxOffer.toLocaleString()}`
    });

  } catch (err) {
    console.error("❌ OpenAI error:", err);
    res.status(500).json({ error: "OpenAI request failed", details: err.message });
  }
});

// ============================================================
// #7 /api/enhance – DALL·E Variation
// ============================================================
app.post('/api/enhance', upload.single('image'), async (req, res) => {
  console.log("🖼️ Received image for enhancement!");

  if (!req.file) {
    console.error("❌ No file uploaded");
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    const dalleResponse = await openai.images.createVariation({
      image: fs.createReadStream(req.file.path),
      n: 1,
      size: "1024x1024"
    });

    console.log("✅ DALL·E variation generated:", dalleResponse.data[0].url);
    res.json({ enhancedImageUrl: dalleResponse.data[0].url });

  } catch (err) {
    console.error("❌ Enhance error:", err);
    res.status(500).json({ error: "Failed to enhance image", details: err.message });
  }
});

// ============================================================
// #8 START SERVER
// ============================================================
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Flip backend running on port ${PORT}`));
