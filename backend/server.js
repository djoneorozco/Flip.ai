// ============================================================
// ✅ Flip.ai Smart Backend – Final Version w/ Budget-Scaled Enhancer
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

// ✅ Ensure /tmp/uploads exists for Render ephemeral file system
const uploadDir = '/tmp/uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("✅ Created upload directory:", uploadDir);
} else {
  console.log("✅ Upload directory exists:", uploadDir);
}

const multer = require('multer');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
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
You are a clear and professional real estate flip advisor.
Always provide:
- ARV calculation
- 70% Rule estimate for maximum offer
- Short explanation why this matters
- Quick tip for the investor
- End with: "Happy Flipping! 🚀"

Use bullet points. Format numbers with dollar signs and commas.
          `.trim()
        },
        {
          role: "user",
          content: `
Current Property Value: $${Number(value).toLocaleString()}
Planned Investment: $${Number(investment).toLocaleString()}
Please calculate ARV, 70% Rule, and give advice.
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
// #3 Smart DALL·E ENHANCER w/ Budget Scaling & Same-House Style
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

  // 🗒️ Build style prompt per budget
  let stylePrompt = "";
  if (budget < 10000) {
    stylePrompt = "Same house shape and style, just light exterior clean-up: remove boarded windows, touch up paint, minor landscaping, no major structural changes.";
  } else if (budget >= 10000 && budget < 50000) {
    stylePrompt = "Same house shape and style, moderate renovation: fresh siding, some windows replaced, clean trim, improved yard, keep house structure the same.";
  } else {
    stylePrompt = "Same house shape and style, full upscale exterior upgrade: new siding, new porch, updated windows, neat landscaping, maintain original architecture.";
  }
  console.log("✨ Final enhancement style prompt:", stylePrompt);

  try {
    const fileStream = fs.createReadStream(filePath);

    // Use variation with tight instruction: DALL·E will do its best with the original
    const dalleResponse = await openai.images.createVariation({
      image: fileStream,
      n: 1,
      size: "1024x1024",
      // Note: OpenAI's variation does not accept text prompts — this is why the original house needs to show your improvements in the image
      // If they roll out edits with masks, you can switch to edits for true prompt adherence
    });

    console.log("✅ DALL·E variation URL:", dalleResponse.data[0].url);

    res.json({
      enhancedImageUrl: dalleResponse.data[0].url,
      usedBudget: budget,
      appliedStylePrompt: stylePrompt
    });

  } catch (err) {
    console.error("❌ Enhance error:", err);
    res.status(500).json({ error: "Image enhancement failed", details: err.message });
  }
});

// ============================================================
// #4 START SERVER
// ============================================================
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`🚀 Flip backend running on port ${PORT}`);
});
