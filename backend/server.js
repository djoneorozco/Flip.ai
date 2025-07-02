// ============================================================
// #1 IMPORTS + ESM __dirname
// ============================================================
import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import multer from 'multer';
import dotenv from 'dotenv';

import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
console.log("OPENAI_API_KEY:", process.env.OPENAI_API_KEY);

// ============================================================
// #2 APP INIT + MIDDLEWARE
// ============================================================
const app = express();
app.use(cors());
app.use(express.json());

// Serve frontend if you want:
app.use(express.static(path.join(__dirname, "../frontend")));

// ============================================================
// #3 OPENAI CLIENT
// ============================================================
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ============================================================
// #4 MULTER (for image upload)
// ============================================================
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ============================================================
// #5 ROOT + TEST ROUTES
// ============================================================
app.get('/', (_req, res) => {
  res.send('🎉 Flip.ai backend is running!');
});

app.get('/api/test', (_req, res) => {
  res.json({ ok: true, message: "✅ Backend test successful!" });
});

// ============================================================
// #6 ASK AI ROUTE
// ============================================================
app.post('/api/ask', async (req, res) => {
  const { zip, price, prompt } = req.body;

  if (!zip || !price) {
    return res.status(400).json({ error: "Missing zip or price" });
  }

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: "You are a helpful real estate AI assistant." },
      { role: "user", content: `ZIP: ${zip}, Price: ${price}, Notes: ${prompt}` },
    ],
  });

  res.json({ answer: completion.choices[0].message.content });
});

// ============================================================
// #7 ENHANCE IMAGE ROUTE (DALL·E GENERATION)
// ============================================================
app.post('/api/enhance', upload.single('image'), async (req, res) => {
  console.log("🖼️ Received image for enhancement!");

  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    // Simple DALL·E example: generate a marketing tagline image
    const dalleResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: "A beautiful, inviting real estate property photo with warm colors and attractive curb appeal, designed for modern marketing",
      n: 1,
      size: "1024x1024",
    });

    console.log("✅ DALL·E generated:", dalleResponse.data[0].url);

    res.json({ enhancedImageUrl: dalleResponse.data[0].url });

  } catch (err) {
    console.error("❌ Enhance error:", err);
    res.status(500).json({ error: "Failed to enhance image" });
  }
});

// ============================================================
// #8 CATCH-ALL (for SPA)
// ============================================================
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// ============================================================
// #9 START SERVER
// ============================================================
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Flip backend running on port ${PORT}`);
});
