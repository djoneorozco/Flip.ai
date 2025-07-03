// ============================================================
// ✅ Flip.ai Backend – Smart Budget Enhancer (NO MASK VERSION)
// ============================================================

const fs = require('fs');
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const OpenAI = require("openai");
const multer = require('multer');

// ✅ Init OpenAI with API Key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const app = express();

// ✅ Ensure /tmp/uploads exists (Fly ephemeral FS)
const uploadDir = '/tmp/uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("✅ Created upload directory:", uploadDir);
} else {
  console.log("✅ Upload directory exists:", uploadDir);
}

// ✅ Multer storage config (ONE file only)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

app.use(express.json());
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://flip-ai.netlify.app',
    'https://www.flip-ai.netlify.app'
  ]
}));

// ============================================================
// ✅ Health Check
// ============================================================
app.get('/', (req, res) => {
  res.send('✅ Flip.AI backend is alive!');
});

// ============================================================
// ✅ Ask Route (Smart Budget)
// ============================================================
app.post('/api/ask', async (req, res) => {
  const { value, investment } = req.body;

  if (!value || !investment) {
    return res.status(400).json({ error: "Missing value or investment amount" });
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
- After Repair Value (ARV)
- 70% Rule estimate for max offer
- Short explanation
- Quick investor tip
End with: "Happy Flipping! 🚀"
Use bullet points and format numbers.
          `.trim()
        },
        {
          role: "user",
          content: `
Property Value: $${Number(value).toLocaleString()}
Planned Investment: $${Number(investment).toLocaleString()}
Please calculate ARV, 70% Rule, and advice.
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
    console.error("❌ /api/ask error:", err);
    res.status(500).json({ error: "OpenAI request failed" });
  }
});

// ============================================================
// ✅ Enhance Image Route — DALL·E (No Mask)
// ============================================================
app.post('/api/enhance', upload.single('image'), async (req, res) => {
  console.log("🖼️ Received image for enhancement!");

  if (!req.file) {
    console.error("❌ No image uploaded");
    return res.status(400).json({ error: "Image is required" });
  }

  const imagePath = req.file.path;
  console.log("✅ Uploaded image path:", imagePath);

  const stylePrompt = `
Photo of a light blue house with boarded-up windows. Replace only the boarded-up sections with clear glass windows matching the house’s original style. Do not change anything else — keep the grass, yard, sidewalk, siding, roof, paint, colors, trees, and lighting exactly the same. Preserve the slightly weathered, realistic look. No beautifying, no landscape improvements, no extra edits.
  `.trim();

  try {
    const dalleResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: stylePrompt,
      n: 1,
      size: "1024x1024",
    });

    console.log("✅ DALL·E generated image:", dalleResponse.data[0].url);

    res.json({ enhancedImageUrl: dalleResponse.data[0].url });

  } catch (err) {
    console.error("❌ /api/enhance error:", err);
    res.status(500).json({ error: "Failed to enhance image", details: err.message });
  } finally {
    fs.unlink(imagePath, () => {});
  }
});

// ============================================================
// ✅ Start Server — Fly expects 0.0.0.0:8080
// ============================================================
const PORT = process.env.PORT || 8080;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Flip backend running on port ${PORT}`);
});
