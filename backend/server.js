// ============================================================
// ✅ Flip.ai Backend – Budget Tiers + DALL·E Edits (No Mask)
// ============================================================

const fs = require('fs');
const express = require('express');
const cors = require('cors');
const multer = require('multer');
require('dotenv').config();
const OpenAI = require("openai");

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

// ✅ Multer Storage (single file)
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
  res.send('✅ Flip.ai backend is alive!');
});

app.get('/api/test', (req, res) => {
  res.json({ message: "✅ Backend test successful!" });
});

// ============================================================
// #2 SMART ENHANCE (NO MASK, JUST VARIATION LOGIC)
// ============================================================
app.post('/api/enhance', upload.single('image'), async (req, res) => {
  console.log("✨ Enhance route hit");

  if (!req.file) {
    console.error("❌ No file uploaded");
    return res.status(400).json({ error: "No image file uploaded." });
  }

  const budget = parseFloat(req.body.investment || 0);
  console.log("✅ Received budget:", budget);

  // Build tier prompt
  let tier = '';
  let stylePrompt = 'Keep the same house structure. ';

  if (budget < 10000) {
    tier = 'Basic repairs';
    stylePrompt += 'Replace boarded windows with simple, standard windows and repaint door.';
  } else if (budget >= 10000 && budget < 50000) {
    tier = 'Moderate upgrades';
    stylePrompt += 'Install modern windows, new stylish door, fresh paint, moderate curb appeal.';
  } else {
    tier = 'Premium upgrades';
    stylePrompt += 'Install high-end modern windows, upscale front door, elegant trim, premium curb appeal.';
  }

  console.log("✨ Tier:", tier);
  console.log("✨ Final prompt:", stylePrompt);

  try {
    const imageStream = fs.createReadStream(req.file.path);

    // Create variation (no mask)
    const dalleResponse = await openai.images.createVariation({
      image: imageStream,
      n: 1,
      size: "1024x1024"
    });

    console.log("✅ Variation generated:", dalleResponse.data[0].url);

    res.json({
      enhancedImageUrl: dalleResponse.data[0].url,
      budget: budget,
      tier: tier
    });

  } catch (err) {
    console.error("❌ DALL·E variation error:", err);
    res.status(500).json({ error: "Failed to enhance image", details: err.message });
  }
});

// ============================================================
// #3 START SERVER
// ============================================================
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`🚀 Flip backend running on port ${PORT}`);
});
