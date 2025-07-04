// ============================================================
// ✅ Flip.ai Backend – Smart Budget Enhancer w/ Vision
// ============================================================

const fs = require('fs');
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const OpenAI = require('openai');
const multer = require('multer');

// ✅ Init OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const app = express();

// ✅ Upload Dir for Render
const uploadDir = 'uploads'; // Keep it simple for local and Render

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true }); // ✅ This prevents EEXIST errors
  console.log("✅ Created upload directory:", uploadDir);
}

// ✅ Multer Storage for Original Images
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
  res.send('✅ Flip.ai backend is alive!');
});

// ============================================================
// #2 Ask Route (No changes, classic ARV)
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
// #3 Enhance w/ Placeholder Vision for Now
// ============================================================
app.post('/api/enhance', upload.single('image'), async (req, res) => {
  console.log("🖼️ Enhance called, file:", req.file);

  const propertyValue = parseFloat(req.body.propertyValue || 0);
  const investment = parseFloat(req.body.investment || 0);

  const arv = propertyValue + investment;
  const maxOffer = arv * 0.7;

  // Choose tier
  let tier = "Basic fixes";
  if (investment < 10000) {
    tier = "Basic window/door upgrades";
  } else if (investment < 50000) {
    tier = "Moderate upgrades";
  } else {
    tier = "Premium upscale transformation";
  }

  console.log("💰 ARV:", arv, " Max Offer:", maxOffer, " Tier:", tier);

  // ✅ For now, return placeholder. Hook DALL·E or Vision next.
  const placeholderUrl = `https://placehold.co/600x400?text=Enhanced+Image`;

  res.json({
    enhancedImageUrl: placeholderUrl,
    budget: investment,
    tier: tier,
    arv: `$${arv.toLocaleString()}`,
    maxOffer: `$${maxOffer.toLocaleString()}`
  });
});

// ============================================================
// #4 Start Server
// ============================================================
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`🚀 Flip.ai backend running on port ${PORT}`);
});
