// ============================================================
// ✅ Flip.ai Backend – Smart Budget Enhancer w/ DALL·E flow
// ============================================================

const express = require('express');
const fs = require('fs');
const cors = require('cors');
require('dotenv').config();
const OpenAI = require("openai");
const multer = require('multer');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const app = express();

// ✅ Uploads Dir for Render
const uploadDir = '/tmp/uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("✅ Created upload directory:", uploadDir);
}

// ✅ Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// ✅ Correct CORS: localhost + Netlify
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://flip-ai.netlify.app',
    'https://www.flip-ai.netlify.app'
  ]
}));
app.use(express.json());

// ============================================================
// #1 Health
// ============================================================
app.get('/', (req, res) => {
  res.send('✅ Flip.AI backend is alive!');
});

// ============================================================
// #2 Enhance
// ============================================================
app.post('/api/enhance', upload.single('image'), async (req, res) => {
  console.log("✨ Enhance endpoint hit!");

  const imageFile = req.file;
  const { value, investment } = req.body;

  if (!imageFile) {
    return res.status(400).json({ error: "No image uploaded." });
  }

  const arv = Number(value) + Number(investment);

  console.log("💵 Property Value:", value);
  console.log("🔨 Investment:", investment);
  console.log("🏠 ARV:", arv);

  try {
    // ✅ Basic DALL·E call – this is your real flow
    // Replace with your custom prompt
    const dalleResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: `A beautifully enhanced renovated version of the uploaded house. Keep the structure the same. Replace boarded windows with modern ones, repaint where needed, moderate upgrades only.`,
      n: 1,
      size: "1024x1024"
    });

    res.json({
      enhancedImageUrl: dalleResponse.data[0].url,
      arv: arv,
      tier: "Moderate upgrades"
    });

  } catch (err) {
    console.error("❌ DALL·E error:", err);
    res.status(500).json({ error: "DALL·E failed", details: err.message });
  }
});

// ============================================================
// #3 Start
// ============================================================
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Flip backend running on port ${PORT}`);
});
