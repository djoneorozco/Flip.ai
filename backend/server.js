// ============================================================
// ✅ Flip.ai Backend — Fresh Draft: Upload ➜ Prompt ➜ generate()
// ============================================================

import fs from 'fs';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

// ✅ Init OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const app = express();
app.use(express.json());
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://flip-ai.netlify.app',
    'https://www.flip-ai.netlify.app'
  ],
}));

// ✅ Multer upload dir
const uploadDir = '/tmp/uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

// ============================================================
// ✅ Health check
app.get('/', (req, res) => {
  res.send('✅ Flip.ai backend is alive!');
});

// ============================================================
// ✅ /api/enhance — Tier 1 only: smart prompt ➜ generate()
// ============================================================
app.post('/api/enhance', upload.single('image'), async (req, res) => {
  console.log("🖼️ Received image");

  if (!req.file) {
    console.error("❌ No image uploaded");
    return res.status(400).json({ error: "Image is required" });
  }

  const imagePath = req.file.path;
  const tier = "Tier 1 — Basic";
  const stylePrompt = `
A realistic photo of a light blue house with boarded-up windows.
Replace only the boarded-up windows with clear glass windows that match the house’s style.
Keep yard, paint, door, and everything else exactly the same.
`.trim();

  console.log(`✨ Using: ${tier} with smart prompt`);

  try {
    const dalleResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: stylePrompt,
      n: 1,
      size: "1024x1024"
    });

    const enhancedImageUrl = dalleResponse.data[0].url;
    console.log("✅ Generated:", enhancedImageUrl);

    res.json({
      enhancedImageUrl,
      tierUsed: tier,
      description: "Generated with smart prompt only."
    });

  } catch (err) {
    console.error("❌ /api/enhance error:", err);
    res.status(500).json({ error: "Image enhancement failed", details: err.message });
  } finally {
    fs.unlink(imagePath, () => {});
  }
});

// ============================================================
// ✅ Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Flip.ai backend running on port ${PORT}`);
});
