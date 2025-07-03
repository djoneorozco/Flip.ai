// ============================================================
// ✅ Flip.ai Option A – Smart GPT Plan + DALL·E Variation
// ============================================================

const fs = require('fs');
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const OpenAI = require("openai");
const multer = require('multer');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const app = express();

// 📁 Use /tmp/uploads for ephemeral file system
const uploadDir = '/tmp/uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("✅ Created upload directory:", uploadDir);
}

// ✅ Multer for single file
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage: storage });

app.use(express.json());
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://flip-ai.netlify.app'
  ]
}));

// Health check
app.get('/', (req, res) => {
  res.send('✅ Flip.ai Option A backend alive!');
});

app.get('/api/test', (req, res) => {
  res.json({ message: "✅ Test successful!" });
});

// ============================================================
// 🧮 Ask Route – 70% Rule + GPT Plan
// ============================================================
app.post('/api/ask', async (req, res) => {
  const { value, investment } = req.body;

  if (!value || !investment) {
    return res.status(400).json({ error: "Missing value or investment" });
  }

  const arv = Number(value) + Number(investment);
  const maxOffer = arv * 0.7;

  const messages = [
    {
      role: "system",
      content: `
You are a professional flip advisor.
Provide:
- ARV & 70% Rule max offer
- Clear flip plan: upgrades for boarded windows, doors, paint, etc.
- Tier recommendation: low, moderate, or high
- End with: "Happy Flipping! 🚀"
      `.trim()
    },
    {
      role: "user",
      content: `Property Value: $${value}, Investment: $${investment}.`
    }
  ];

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages
    });

    res.json({
      plan: completion.choices[0].message.content,
      arv: `$${arv.toLocaleString()}`,
      maxOffer: `$${maxOffer.toLocaleString()}`
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate plan." });
  }
});

// ============================================================
// 🎨 Enhance – DALL·E Variation (No Mask Needed)
// ============================================================
app.post('/api/enhance', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const fileStream = fs.createReadStream(req.file.path);

  try {
    const dalleResponse = await openai.images.createVariation({
      image: fileStream,
      n: 1,
      size: "1024x1024"
    });

    res.json({
      enhancedImageUrl: dalleResponse.data[0].url
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to enhance image." });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Flip.ai backend running on ${PORT}`);
});
