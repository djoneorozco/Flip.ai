// ============================================================
// ✅ Flip.ai Backend — Modular: Upload ➜ Smart Edit ➜ createEdit()
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
// ✅ /api/enhance — Tier 1: Modular smart window-only edit
// ============================================================

app.post('/api/enhance', upload.single('image'), async (req, res) => {
  console.log("🖼️ Received image for Tier 1 enhancement");

  if (!req.file) {
    console.error("❌ No image uploaded");
    return res.status(400).json({ error: "Image is required" });
  }

  const imagePath = req.file.path;
  const tier = "Tier 1 — Basic";

  // ✅ Modular prompt — works with ANY uploaded house
  const stylePrompt = `
You are editing the uploaded photo of a house.
Replace only any old, boarded-up, or broken windows with modestly priced clear glass windows that match the house style.
Keep the house's paint, siding, roof, yard, doors, and overall structure exactly the same.
Do not add or remove anything else.
Keep the perspective and angle identical.
The final result should look realistic and naturally match the original house.
`.trim();

  console.log(`✨ Using: ${tier} with modular smart prompt`);

  try {
    const dalleResponse = await openai.images.createEdit({
      model: "dall-e-2", // Use "dall-e-3" when it's supported for edits!
      image: fs.createReadStream(imagePath),
      prompt: stylePrompt,
      n: 1,
      size: "1024x1024"
    });

    const enhancedImageUrl = dalleResponse.data[0].url;
    console.log("✅ Generated:", enhancedImageUrl);

    res.json({
      enhancedImageUrl,
      tierUsed: tier,
      description: "Enhanced with modular window-only edit."
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
