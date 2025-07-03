// ============================================================
// ✅ Flip.ai Backend – Smart ARV + Image Enhancer (Static Ready)
// ============================================================

const fs = require('fs');
const path = require('path');
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

// ✅ Setup Multer for image uploads (saved to /uploads)
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
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

// ✅ Middleware
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, '../frontend')));  // Serve frontend

// ============================================================
// #1 Root Route – Serves index.html
// ============================================================
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ============================================================
// #2 Example Healthcheck
// ============================================================
app.get('/api/test', (req, res) => {
  res.json({ message: "✅ Flip.ai backend working!" });
});

// ============================================================
// #3 Example Enhance Route
// ============================================================
app.post('/api/enhance', upload.single('image'), async (req, res) => {
  console.log("🖼️ Enhance Route Hit!");

  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const investment = parseFloat(req.body.investment || 0);
  console.log("💰 Investment:", investment);

  // Simple example: Generate a variation
  const fileStream = fs.createReadStream(req.file.path);
  const dalleResponse = await openai.images.createVariation({
    image: fileStream,
    n: 1,
    size: "1024x1024",
  });

  res.json({
    enhancedImageUrl: dalleResponse.data[0].url,
    investment: investment,
    tier: investment > 50000 ? 'High-end upgrades' : 'Moderate upgrades'
  });
});

// ============================================================
// #4 Start Server
// ============================================================
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Flip.ai backend running on port ${PORT}`);
});
