// ============================================================
// ✅ Flip.ai Backend – Smart Budget Enhancer w/ Edits
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

// ✅ Upload Dir for Render
const uploadDir = '/tmp/uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("✅ Created upload directory:", uploadDir);
}

// ✅ Multer Storage for Original + Mask
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
// #2 Ask Route (No changes)
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
You are a professional, clear, and motivating real estate flip advisor.
Always provide:
- The After Repair Value (ARV)
- A 70% Rule estimate for maximum offer price
- A simple explanation why this matters
- A quick tip for the investor
- End with: "Happy Flipping! 🚀"

Use bullet points. Format numbers with dollar signs and commas.
          `.trim()
        },
        {
          role: "user",
          content: `
Current Property Value: $${Number(value).toLocaleString()}
Planned Investment: $${Number(investment).toLocaleString()}
Please calculate ARV, the 70% Rule, and give professional advice.
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
// #3 ENHANCE w/ SMART BUDGET TIERS + EDITS
// ============================================================
app.post('/api/enhance', upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'mask', maxCount: 1 }
]), async (req, res) => {
  console.log("🖼️ Received image and mask for enhancement!");

  const imageFile = req.files['image']?.[0];
  const maskFile = req.files['mask']?.[0];
  const budget = parseFloat(req.body.investment || 0);

  if (!imageFile || !maskFile) {
    console.error("❌ Missing original image or mask");
    return res.status(400).json({ error: "Both original image and mask are required" });
  }

  console.log("✅ Budget received:", budget);

  // ✅ Build Tiered Prompt
  let stylePrompt = `Keep the same house structure, same siding, same roofline, same angle.
Focus only on replacing boarded windows and doors with realistic upgrades based on budget tier.
No new landscaping or changes to other parts of the house.`;

  if (budget < 10000) {
    stylePrompt += ` Use budget Tier 1: Replace boarded windows and doors with basic standard windows and a simple clean front door. Nothing fancy — just functional.`;
  } else if (budget >= 10000 && budget < 50000) {
    stylePrompt += ` Use budget Tier 2: Replace boarded windows and doors with new modern windows and a modern front door with some stylish trim. Add moderate finishing touches like slight new paint around frames.`;
  } else {
    stylePrompt += ` Use budget Tier 3: Replace all boarded windows and doors with upscale, high-end modern windows and a premium, stylish front door. Add elegant trim details. Make it look professionally renovated while keeping the same house shape.`;
  }

  console.log("✨ Final Prompt:", stylePrompt);

  try {
    const imageStream = fs.createReadStream(imageFile.path);
    const maskStream = fs.createReadStream(maskFile.path);

    const dalleResponse = await openai.images.createEdit({
      model: "dall-e-2",
      image: imageStream,
      mask: maskStream,
      prompt: stylePrompt,
      n: 1,
      size: "1024x1024"
    });

    console.log("✅ DALL·E edit generated:", dalleResponse.data[0].url);

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
