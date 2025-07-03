// ============================================================
// ✅ Flip.ai Smart Backend – Windows & Door Enhancement Logic
// ============================================================

const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const app = express();

const uploadDir = '/tmp/uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("✅ Created upload directory:", uploadDir);
}

const multer = require('multer');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
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
// #1 HEALTH CHECK
// ============================================================
app.get('/', (req, res) => {
  res.send('✅ Flip.AI backend is alive!');
});

app.get('/api/test', (req, res) => {
  res.json({ message: "✅ Backend test successful!" });
});

// ============================================================
// #2 70% Rule Advisor
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
- The ARV
- A 70% Rule estimate
- Simple why this matters
- Quick tip for the investor
- End with: "Happy Flipping! 🚀"
Use bullet points and format with dollar signs.
`.trim()
        },
        {
          role: "user",
          content: `
Property Value: $${Number(value).toLocaleString()}
Investment: $${Number(investment).toLocaleString()}
Calculate ARV, 70% Rule, and advice.
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
    console.error("❌ AI error:", err);
    res.status(500).json({ error: "OpenAI request failed" });
  }
});

// ============================================================
// #3 DALL·E ENHANCER – Windows & Door Logic
// ============================================================
app.post('/api/enhance', upload.single('image'), async (req, res) => {
  console.log("🖼️ Received image for enhancement!");

  if (!req.file) {
    console.error("❌ No file uploaded");
    return res.status(400).json({ error: "No file uploaded" });
  }

  const filePath = req.file.path;
  const budget = parseFloat(req.body.investment || 0);
  console.log("✅ Budget:", budget);

  let stylePrompt = "";
  if (budget < 10000) {
    stylePrompt = "Replace boarded windows with simple realistic windows and a basic front door. Keep the original house shape, colors, and neighborhood style.";
  } else if (budget >= 10000 && budget < 50000) {
    stylePrompt = "Replace all boarded windows with energy-efficient new windows and modern trim. Upgrade front door to a stylish, secure version with fresh paint. Keep house same style.";
  } else {
    stylePrompt = "High-end upgrade: new modern upscale windows with custom frames, high-quality stylish front door with sidelights and premium finish. Retain original architecture, just upscale.";
  }

  console.log("✨ Style prompt:", stylePrompt);

  try {
    const fileStream = fs.createReadStream(filePath);

    const dalleResponse = await openai.images.createVariation({
      image: fileStream,
      n: 1,
      size: "1024x1024",
      // If you switch to edits:
      // prompt: stylePrompt
    });

    console.log("✅ Enhanced image:", dalleResponse.data[0].url);

    res.json({
      enhancedImageUrl: dalleResponse.data[0].url,
      budget: budget,
      description: stylePrompt
    });

  } catch (err) {
    console.error("❌ Enhance error:", err);
    res.status(500).json({ error: "Failed to enhance image", details: err.message });
  }
});

// ============================================================
// #4 START SERVER
// ============================================================
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Flip backend running on port ${PORT}`);
});
