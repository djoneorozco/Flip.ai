const fs = require('fs');
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const OpenAI = require("openai");
const multer = require('multer');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const app = express();

const uploadDir = '/tmp/uploads';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage: storage });

app.use(express.json());
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://flip-ai.netlify.app',
    'https://www.flip-ai.netlify.app'
  ]
}));

app.get('/', (req, res) => res.send('✅ Flip.AI backend is alive!'));

app.post('/api/enhance', upload.single('image'), async (req, res) => {
  const budget = parseFloat(req.body.investment || 0);
  const filePath = req.file?.path;

  if (!filePath) return res.status(400).json({ error: "No file uploaded" });

  let stylePrompt = `Keep house shape & style. Add windows and doors based on budget tier.`;
  if (budget < 10000) stylePrompt += ` Tier 1: basic standard replacements.`;
  else if (budget < 50000) stylePrompt += ` Tier 2: modern replacements.`;
  else stylePrompt += ` Tier 3: upscale replacements with stylish trim.`;

  try {
    const dalleResponse = await openai.images.createVariation({
      image: fs.createReadStream(filePath),
      n: 1,
      size: "1024x1024",
    });

    res.json({
      enhancedImageUrl: dalleResponse.data[0].url,
      budget,
      description: stylePrompt
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Enhance failed", details: err.message });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Flip backend running on port ${PORT}`));
