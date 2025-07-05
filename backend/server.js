// ============================================================
// ✅ Flip.ai Backend — Smart Budget + DALL·E Edit (WITH IMAGE)
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

// ✅ Upload dir
const uploadDir = '/tmp/uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('✅ Created upload directory:', uploadDir);
}

// ✅ Multer
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
// ✅ /api/ask
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
// ✅ /api/enhance — Real DALL·E createEdit() (keeps uploaded image)
// ============================================================
app.post('/api/enhance', upload.single('image'), async (req, res) => {
  console.log("🖼️ Received image for enhancement");

  if (!req.file) {
    console.error("❌ No image uploaded");
    return res.status(400).json({ error: "Image is required" });
  }

  const investment = parseFloat(req.body.investment || 0);
  const imagePath = req.file.path;

  let tier = "";
  let stylePrompt = "";

  if (investment < 20000) {
    tier = "Tier 1 — Basic";
    stylePrompt = `
Photo of a house needing minimal updates. Add clear glass windows where boarded-up sections are. Keep yard, paint, door, landscaping, and style unchanged. Realistic look only.
    `.trim();
  } else if (investment < 50000) {
    tier = "Tier 2 — Moderate";
    stylePrompt = `
Photo of a house with old paint and boarded windows. Replace windows with new ones, repaint with original color, add fresh grass and trimmed bushes. Keep original shape, realistic style.
    `.trim();
  } else {
    tier = "Tier 3 — Premium";
    stylePrompt = `
Photo of a house ready for upscale flip. Add luxury windows, modern paint color, stylish front door, upscale landscaping (pathway, trimmed lawn). Keep realistic house style.
    `.trim();
  }

  console.log(`✨ Using tier: ${tier}`);

  try {
    const dalleResponse = await openai.images.createEdit({
      model: "dall-e-2",
      image: fs.createReadStream(imagePath),
      prompt: stylePrompt,
      n: 1,
      size: "1024x1024"
    });

    const enhancedImageUrl = dalleResponse.data[0].url;
    console.log("✅ DALL·E returned:", enhancedImageUrl);

    res.json({
      enhancedImageUrl,
      tierUsed: tier,
      description: "Enhanced by Flip.ai using your uploaded image & tiered prompt."
    });

  } catch (err) {
    console.error("❌ /api/enhance error:", err);
    res.status(500).json({ error: "Enhancement failed", details: err.message });
  } finally {
    fs.unlink(imagePath, () => {});
  }
});

// ============================================================
// ✅ Start server
// ============================================================
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Flip.ai backend running on port ${PORT}`);
});
