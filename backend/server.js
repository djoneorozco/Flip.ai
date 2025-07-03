// ============================================================
// ✅ Flip.ai Backend – Realistic Smart Enhancer (No Masks)
// ============================================================

const fs = require('fs');
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const OpenAI = require("openai");
const multer = require('multer');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const app = express();

const uploadDir = '/tmp/uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("✅ Created upload directory:", uploadDir);
}

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
// #1 Health Check
// ============================================================
app.get('/', (req, res) => {
  res.send('✅ Flip.AI backend is alive!');
});

// ============================================================
// #2 Ask AI (unchanged)
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
You are a clear and motivating real estate flip advisor. Always provide:
- ARV
- 70% rule estimate
- One line explanation
- One quick tip
- End with: Happy Flipping! 🚀
Format numbers with dollar signs and commas.
          `.trim()
        },
        {
          role: "user",
          content: `
Current Property Value: $${Number(value).toLocaleString()}
Planned Investment: $${Number(investment).toLocaleString()}
Please calculate ARV and 70% rule.
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
// #3 ENHANCE REALISTIC FLOW
// ============================================================
app.post('/api/enhance', upload.single('image'), async (req, res) => {
  console.log("🖼️ Received image for enhancement!");

  const file = req.file;
  const budget = parseFloat(req.body.investment || 0);

  if (!file) {
    console.error("❌ No image uploaded");
    return res.status(400).json({ error: "Image required" });
  }

  console.log("✅ Budget received:", budget);

  // ✅ Smart prompt
  let stylePrompt = `
Same house, same angle, same structure.
Enhance boarded windows and doors based on budget:
`;

  if (budget < 10000) {
    stylePrompt += `
Tier: Low Budget.
- Replace boarded windows with basic clean windows.
- Simple front door.
- No extra landscaping.
- Keep siding as is.
    `;
  } else if (budget >= 10000 && budget < 50000) {
    stylePrompt += `
Tier: Moderate Budget.
- Replace boarded windows with modern white framed windows.
- Add fresh front door.
- Repaint siding.
- Minor curb appeal upgrade.
    `;
  } else {
    stylePrompt += `
Tier: High Budget.
- Replace all boarded windows with upscale premium windows.
- High-end front door.
- Add elegant trim details.
- New fresh landscaping.
- Keep house structure identical.
    `;
  }

  console.log("✨ Final Prompt:", stylePrompt);

  try {
    const fileStream = fs.createReadStream(file.path);

    const dalleResponse = await openai.images.createVariation({
      image: fileStream,
      n: 1,
      size: "1024x1024"
    });

    console.log("✅ Variation generated:", dalleResponse.data[0].url);

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
