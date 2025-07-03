// ============================================================
// ✅ Flip.ai Backend – Smart Budget Enhancer w/ Real DALL·E
// ============================================================

const fs = require('fs');
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const OpenAI = require("openai");
const multer = require('multer');

// ✅ Init OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const app = express();

// ✅ Upload Dir for Render ephemeral FS
const uploadDir = '/tmp/uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("✅ Created upload directory:", uploadDir);
}

// ✅ Multer for single file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// ✅ Middleware
app.use(express.json());
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://flip-ai.netlify.app',
    'https://www.flip-ai.netlify.app'
  ]
}));

// ============================================================
// #1 Health Check
// ============================================================
app.get('/', (req, res) => {
  res.send('✅ Flip.AI backend is alive!');
});

app.get('/api/test', (req, res) => {
  res.json({ message: "✅ Backend test successful!" });
});

// ============================================================
// #2 Ask Route (unchanged, optional)
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
    console.error("❌ Ask error:", err);
    res.status(500).json({ error: "OpenAI request failed" });
  }
});

// ============================================================
// #3 ENHANCE w/ REAL DALL·E EDITS – PRODUCTION READY
// ============================================================
app.post('/api/enhance', upload.single('image'), async (req, res) => {
  console.log("🖼️ Enhance route hit!");

  const imageFile = req.file;
  const budget = parseFloat(req.body.investment || 0);

  if (!imageFile) {
    console.error("❌ No image uploaded");
    return res.status(400).json({ error: "Image is required" });
  }

  console.log("✅ Image uploaded:", imageFile.path);
  console.log("✅ Budget amount:", budget);

  // Build tiered stylePrompt
  let stylePrompt = `Keep same house structure, siding, roofline, and angle. Replace boarded windows and doors with realistic upgrades.`;

  if (budget < 10000) {
    stylePrompt += ` Tier 1: Basic windows and a simple front door. No fancy trim.`;
  } else if (budget >= 10000 && budget < 50000) {
    stylePrompt += ` Tier 2: Modern windows, new front door, stylish trim, moderate paint.`;
  } else {
    stylePrompt += ` Tier 3: Upscale high-end windows, premium front door, elegant trim, pro-renovated look.`;
  }

  console.log("✨ Final prompt:", stylePrompt);

  try {
    const dalleResponse = await openai.images.createEdit({
      model: "dall-e-2",
      image: fs.createReadStream(imageFile.path),
      // mask: fs.createReadStream(maskFile.path), // Optional if you have a mask
      prompt: stylePrompt,
      n: 1,
      size: "1024x1024"
    });

    const enhancedImageUrl = dalleResponse.data[0].url;

    console.log("✅ DALL·E enhanced image:", enhancedImageUrl);

    res.json({
      enhancedImageUrl,
      budget,
      tier: stylePrompt
    });

  } catch (err) {
    console.error("❌ DALL·E Enhance error:", err);
    res.status(500).json({ error: "Enhancement failed", details: err.message });
  }
});

// ============================================================
// #4 Start Server
// ============================================================
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Flip.ai backend running on port ${PORT}`);
});
