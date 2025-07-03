// ============================================================
// ✅ Flip.ai Backend – Fixed for Render + Netlify Proxy
// ============================================================

import fs from 'fs';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import OpenAI from "openai";
import dotenv from 'dotenv';

dotenv.config();

// ✅ Init OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ✅ Express App
const app = express();

// ✅ Ensure uploads folder exists for ephemeral Render FS
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("✅ Created upload directory:", uploadDir);
}

// ✅ Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// ✅ CORS for Netlify Frontend
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://flip-ai.netlify.app'
  ]
}));
app.use(express.json());

// ============================================================
// #1 Health Check
// ============================================================
app.get('/', (req, res) => {
  res.send('✅ Flip.AI backend is alive!');
});

// ============================================================
// #2 Enhance Route (No mask! Just main image)
// ============================================================
app.post('/api/enhance', upload.single('image'), async (req, res) => {
  console.log("🖼️ Received file:", req.file?.filename);

  const propertyValue = parseFloat(req.body.propertyValue || 0);
  const investment = parseFloat(req.body.investment || 0);
  const arv = propertyValue + investment;
  const profit = arv - propertyValue - investment;

  let tier = "Basic";
  if (investment < 10000) tier = "Basic upgrades";
  else if (investment < 50000) tier = "Moderate upgrades";
  else tier = "High-end upgrades";

  // ✅ Mock: Return placeholder for now
  const placeholder = 'https://placehold.co/600x400?text=Enhanced+Image';

  res.json({
    enhancedImageUrl: placeholder,
    arv,
    profit,
    budget: investment,
    tier
  });
});

// ============================================================
// #3 Start Server
// ============================================================
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Flip backend running on port ${PORT}`);
});
