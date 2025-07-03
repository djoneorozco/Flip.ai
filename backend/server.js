// ============================================================
// ✅ Flip.ai Smart Backend – DALL·E + 70% Rule + Budget Tiers
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
// #3 DALL·E ENHANCER – Smart Budget Tiers for Windows/Doors
// ============================================================
app.post('/api/enhance', upload.single('image'), async (req, res) => {
  console.log("🖼️ Received image for enhancement!");

  if (!req.file) {
    console.error("❌ No file uploaded");
    return res.status(400).json({ error: "No file uploaded" });
  }

  const filePath = req.file.path;
  const budget = parseFloat(req.body.investment || 0);
  console.log("✅ Enhancement budget received:", budget);

  // ✅ Tiered style description logic
  let styleDescription = "";
  if (budget < 10000) {
    styleDescription = "Replace boarded windows with simple standard white-framed windows and a basic painted door.";
  } else if (budget >= 10000 && budget < 50000) {
    styleDescription = "Replace boarded windows with modern energy-efficient windows with clean trim, and install a stylish new door.";
  } else {
    styleDescription = "Replace boarded windows with upscale custom windows, premium modern trim, and an elegant high-end front door for strong curb appeal.";
  }
  console.log("✨ Applied style tier:", styleDescription);

  // ✅ Final clear prompt
  const finalPrompt = `
Keep the house exactly the same as the original photo except for the boarded windows and boarded door.
${styleDescription}
Do not change the siding, roof, landscaping, or structure. Return the image looking like the original but upgraded as described.
  `.trim();

  try {
    const fileStream = fs.createReadStream(filePath);

    // ✅ Use DALL·E variation for now (edit API can be swapped later if needed)
    const dalleResponse = await openai.images.createVariation({
      image: fileStream,
      n: 1,
      size: "1024x1024",
    });

    console.log("✅ DALL·E variation generated:", dalleResponse.data[0].url);

    res.json({
      enhancedImageUrl: dalleResponse.data[0].url,
      budget: budget,
      stylePrompt: finalPrompt
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
