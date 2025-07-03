// ============================================================
// ✅ Flip.ai Backend – Variation-Only Smart Enhancer (No Mask)
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

// ✅ Multer Storage for Original Image
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
// #2 ENHANCE w/ Variation Only (No Mask Required)
// ============================================================
app.post('/api/enhance', upload.single('image'), async (req, res) => {
  console.log("🖼️ Received image for variation!");

  const imageFile = req.file;
  const budget = parseFloat(req.body.investment || 0);

  if (!imageFile) {
    console.error("❌ No image uploaded");
    return res.status(400).json({ error: "Image is required" });
  }

  console.log("✅ Budget received:", budget);

  // ✅ Use simple style prompt logic for display
  let tier = "";
  if (budget < 10000) {
    tier = "Basic fixes";
  } else if (budget >= 10000 && budget < 50000) {
    tier = "Moderate upgrades";
  } else {
    tier = "High-end upscale renovation";
  }

  try {
    const imageStream = fs.createReadStream(imageFile.path);

    const dalleResponse = await openai.images.createVariation({
      image: imageStream,
      n: 1,
      size: "1024x1024"
    });

    console.log("✅ DALL·E variation URL:", dalleResponse.data[0].url);

    res.json({
      enhancedImageUrl: dalleResponse.data[0].url,
      budget: budget,
      tier: tier
    });

  } catch (err) {
    console.error("❌ Variation error:", err);
    res.status(500).json({ error: "Failed to create variation", details: err.message });
  }
});

// ============================================================
// #3 START SERVER
// ============================================================
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`🚀 Flip backend running on port ${PORT}`);
});
