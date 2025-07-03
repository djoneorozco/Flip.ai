// ============================================================
// ✅ Flip.ai Backend – FINAL VERSION (Stable)
// ============================================================

const fs = require('fs');
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const OpenAI = require('openai');
const multer = require('multer');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const app = express();
app.use(express.json());

// ✅ Allow Netlify to call Render backend
app.use(cors({
  origin: ['https://flip-ai.netlify.app'],
}));

// ✅ Upload Dir
const uploadDir = '/tmp/uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("✅ Created upload directory:", uploadDir);
}

// ✅ Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage: storage });

// ✅ Health Check
app.get('/', (req, res) => {
  res.send('✅ Flip.ai backend is alive!');
});

// ✅ Enhance Route
app.post('/api/enhance', upload.single('image'), async (req, res) => {
  console.log("🖼️ Enhance route hit!");

  const file = req.file;
  const investment = parseFloat(req.body.investment || 0);

  if (!file) {
    return res.status(400).json({ error: "No image uploaded" });
  }

  let tier = "Basic upgrades";
  if (investment >= 10000 && investment < 50000) {
    tier = "Moderate upgrades";
  } else if (investment >= 50000) {
    tier = "High-end upgrades";
  }

  // ✅ Just send back a mock variation for now
  res.json({
    enhancedImageUrl: 'https://placehold.co/600x400?text=Enhanced+Image',
    budget: investment,
    tier: tier
  });
});

// ✅ Start Server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Flip.ai backend running on ${PORT}`);
});
