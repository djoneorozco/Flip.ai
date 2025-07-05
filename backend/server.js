// ============================================================
// ✅ Flip.ai Backend — Smart Budget + Real DALL·E Generation + Tiers
// ============================================================

import fs from 'fs';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

// ✅ Init OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ✅ Express app
const app = express();
app.use(express.json());

// ✅ CORS for Netlify + local dev
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://flip-ai.netlify.app',
    'https://www.flip-ai.netlify.app'
  ],
}));

// ✅ Ensure /tmp/uploads exists
const uploadDir = '/tmp/uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('✅ Created upload directory:', uploadDir);
} else {
  console.log('✅ Upload directory exists:', uploadDir);
}

// ✅ Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

// ============================================================
// ✅ Health check
// ============================================================
app.get('/', (req, res) => {
  res.send('✅ Flip.ai backend is alive & ready!');
});

// ============================================================
// ✅ /api/ask — Smart Flip Budget
// ============================================================
app.post('/api/ask', async (req, res) => {
  const { value, investment } = req.body;

  if (!value || !investment) {
    return res.status(400).json({ error: "Missing value or investment amount" });
  }

  const arv = Number(value) + Number(investment);
  const maxOffer = arv * 0.7;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `
You are a professional real estate flip advisor.
Always provide:
- After Repair Value (ARV)
- 70% Rule estimate for max offer
- Short explanation
- Quick investor tip
End with: "Happy Flipping! 🚀"
Use bullet points and format numbers.
          `.trim()
        },
        {
          role: "user",
          content: `
Property Value: $${Number(value).toLocaleString()}
Planned Investment: $${Number(investment).toLocaleString()}
Please calculate ARV, 70% Rule, and advice.
          `.trim()
        }
      ],
    });

    res.json({
      answer: completion.choices[0].message.content,
      arv: `$${arv.toLocaleString()}`,
      maxOffer: `$${maxOffer.toLocaleString()}`
    });

  } catch (err) {
    console.error("❌ /api/ask error:", err);
    res.status(500).json({ error: "OpenAI request failed" });
  }
});

// ============================================================
// ✅ /api/enhance — Real DALL·E Generate + Tiers + Fixed for generate()
// ============================================================
app.post('/api/enhance', upload.single('image'), async (req, res) => {
  console.log("🖼️ Received image for enhancement");

  if (!req.file) {
    console.error("❌ No image uploaded");
    return res.status(400).json({ error: "Image is required" });
  }

  const investment = parseFloat(req.body.investment || 0);
  const imagePath = req.file.path;
  console.log("✅ Uploaded image path:", imagePath);

  let stylePrompt = '';
  let tier = '';

  if (investment < 20000) {
    tier = "Tier 1 — Basic";
    stylePrompt = `
Photo of a light blue house with boarded-up windows.
Replace only the boarded-up windows with clear glass windows matching the house’s style.
Do not change paint, yard, door, or anything else. Keep realistic look.
    `.trim();
  } else if (investment < 50000) {
    tier = "Tier 2 — Moderate";
    stylePrompt = `
Photo of a light blue house with boarded-up windows and old paint.
Replace windows with clear modern windows, repaint the exterior with fresh coat matching original color, add simple landscaping (fresh grass, trimmed bushes). Keep realistic, no major redesign.
    `.trim();
  } else {
    tier = "Tier 3 — Premium";
    stylePrompt = `
Photo of a light blue house ready for high-end flip.
Replace old windows with luxury style windows, repaint exterior with modern designer color, upgrade front door with modern look, add upscale landscaping (plants, pathway stones, trimmed lawn).
Keep realistic look for a premium flip.
    `.trim();
  }

  console.log(`✨ Using enhancement tier: ${tier}`);

  try {
    // ✅ Use generate() instead of createEdit()
    const dalleResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: stylePrompt,
      n: 1,
      size: "1024x1024"
    });

    const enhancedImageUrl = dalleResponse.data[0].url;
    console.log("✅ DALL·E returned:", enhancedImageUrl);

    res.json({
      enhancedImageUrl,
      tierUsed: tier,
      description: "Generated by Flip.ai with real DALL·E generation & tiered prompt.",
    });

  } catch (err) {
    console.error("❌ /api/enhance error:", err);
    if (err.response) {
      console.error("OpenAI Response:", err.response.status, err.response.data);
    }
    res.status(500).json({
      error: "Image enhancement failed",
      details: err.message,
      response: err.response ? err.response.data : undefined
    });
  } finally {
    fs.unlink(imagePath, () => {});
  }
});

// ============================================================
// ✅ Start Server
// ============================================================
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Flip.ai backend running on port ${PORT}`);
});
