// ============================================================
// ✅ Flip.ai Smart Backend – DALL·E Generate + 70% Rule + Budget Logic
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

// ✅ Ensure /tmp/uploads exists for Render ephemeral file system
const uploadDir = '/tmp/uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("✅ Created upload directory:", uploadDir);
} else {
  console.log("✅ Upload directory exists:", uploadDir);
}

// ✅ Use Multer for file uploads
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// ✅ Middlewares
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
// #3 DALL·E GENERATE – Smart Budget Logic (NO MASK NEEDED)
// ============================================================
app.post('/api/enhance', upload.single('image'), async (req, res) => {
  console.log("🖼️ Received image for enhancement!");

  if (!req.file) {
    console.error("❌ No file uploaded");
    return res.status(400).json({ error: "No file uploaded" });
  }

  // ✅ Use the uploaded image only for reference if needed (currently not used)
  const budget = parseFloat(req.body.investment || 0);
  console.log("✅ Enhancement budget received:", budget);

  // ✅ Build style prompt based on budget
  let stylePrompt = "";
  if (budget < 10000) {
    stylePrompt = "Light cleanup: remove boarded windows, fresh paint, basic landscaping, small cosmetic fixes.";
  } else if (budget >= 10000 && budget < 50000) {
    stylePrompt = "Moderate renovation: new siding, modern windows, porch improvements, nice yard, fresh exterior paint.";
  } else {
    stylePrompt = "Full upscale transformation: luxury siding, new roof, stylish porch, upscale landscaping, beautiful curb appeal, new driveway.";
  }
  console.log("✨ Style prompt:", stylePrompt);

  try {
    // ✅ Use generate endpoint instead of edits – NO MASK REQUIRED
    const dalleResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: `A realistic, photo-style image of the same house after renovation: ${stylePrompt}`,
      n: 1,
      size: "1024x1024",
    });

    console.log("✅ DALL·E generated URL:", dalleResponse.data[0].url);

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
