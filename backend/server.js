// ============================================================
// ✅ Flip.ai Smart Backend – DALL·E + 70% Rule + Realistic Edits
// ============================================================

const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const OpenAI = require("openai");

// ✅ Init OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const app = express();

// ✅ Ensure /tmp/uploads exists
const uploadDir = '/tmp/uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("✅ Created upload directory:", uploadDir);
} else {
  console.log("✅ Upload directory exists:", uploadDir);
}

// ✅ Multer for uploads
const multer = require('multer');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
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
You are a professional, clear, and motivating real estate flip advisor.
Always provide:
- The After Repair Value (ARV)
- A 70% Rule estimate for maximum offer price
- Simple explanation why this matters
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
// #3 Smart Enhancer – Realistic Edits with Tiered Logic
// ============================================================
app.post('/api/enhance', upload.single('image'), async (req, res) => {
  console.log("🖼️ Received image for enhancement!");

  if (!req.file) {
    console.error("❌ No file uploaded");
    return res.status(400).json({ error: "No file uploaded" });
  }

  const filePath = req.file.path;
  const budget = parseFloat(req.body.investment || 0);
  console.log("✅ Enhancement budget:", budget);

  let stylePrompt = "";

  if (budget < 10000) {
    stylePrompt = "Replace boarded windows with basic new windows, repaint door with simple finish, light touch-ups.";
  } else if (budget >= 10000 && budget < 50000) {
    stylePrompt = "Replace boarded windows with modern double-pane windows, new stylish front door, clean exterior repaint, fresh trim.";
  } else {
    stylePrompt = "Full upscale curb appeal: luxury modern windows, elegant front door, upscale trim, manicured landscaping, new roof if needed.";
  }

  console.log("✨ Final style prompt:", stylePrompt);

  try {
    const fileStream = fs.createReadStream(filePath);

    // ✅ Use DALL·E variation or edit (using edit here for realism — requires a mask file if you have one!)
    // If you don't have a mask, fallback to variation:
    const dalleResponse = await openai.images.createVariation({
      image: fileStream,
      n: 1,
      size: "1024x1024",
    });

    // 👉 If you implement mask files, switch to this instead:
    // const maskStream = fs.createReadStream(maskFilePath);
    // const dalleResponse = await openai.images.createEdit({
    //   image: fileStream,
    //   mask: maskStream,
    //   prompt: stylePrompt,
    //   n: 1,
    //   size: "1024x1024",
    // });

    console.log("✅ DALL·E response:", dalleResponse.data[0].url);

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
