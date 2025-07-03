// ============================================================
// ✅ Flip.ai Backend – Stable Uploads w/ /tmp Directory
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

// ✅ Use /tmp/uploads for Render
const uploadDir = '/tmp/uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("✅ Created upload directory:", uploadDir);
}

// ✅ Multer config uses /tmp/uploads
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
    'https://flip-ai.netlify.app'
  ]
}));

// ============================================================
// #1 Health Check
// ============================================================
app.get('/', (req, res) => {
  res.send('✅ Flip.AI backend is alive!');
});

// ============================================================
// #2 Enhance Route – uses /tmp/uploads safely
// ============================================================
app.post('/api/enhance', upload.single('image'), async (req, res) => {
  console.log("🖼️ Enhance request received");

  const imageFile = req.file;
  const propertyValue = parseFloat(req.body.propertyValue || 0);
  const investment = parseFloat(req.body.investment || 0);

  if (!imageFile) {
    console.error("❌ No image uploaded");
    return res.status(400).json({ error: "Image file is required" });
  }

  const arv = propertyValue + investment;
  const profit = arv - propertyValue - investment;

  // Simple variation response
  const placeholderUrl = `https://placehold.co/600x400?text=Enhanced+Image`;

  console.log("✅ Enhancement complete");

  res.json({
    enhancedImageUrl: placeholderUrl,
    budget: investment,
    tier: investment < 10000 ? "Basic upgrades" :
          investment < 50000 ? "Moderate upgrades" : "High-end upgrades"
  });
});

// ============================================================
// #3 Start server
// ============================================================
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Flip.ai backend running on port ${PORT}`);
});
