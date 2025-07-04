// ================================================
// ✅ Flip.ai – Full Server.js (CORS, Upload, OpenAI)
// ================================================

import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import OpenAI from 'openai';

const app = express();
const PORT = process.env.PORT || 10000;

// ✅ OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// ✅ Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'https://flip-ai.netlify.app']
}));
app.use(express.json());

// ✅ Ensure temp uploads dir exists
const uploadDir = '/tmp/uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`✅ Created temp upload dir: ${uploadDir}`);
}

// ✅ Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// ✅ Health check
app.get('/', (req, res) => {
  res.send('✅ Flip.ai backend running!');
});

// ✅ Enhance endpoint
app.post('/api/enhance', upload.single('image'), async (req, res) => {
  try {
    console.log('✅ Enhance endpoint hit');
    const { investment, prompt } = req.body;
    const imageFile = req.file;

    if (!imageFile) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    console.log('🖼️ Image:', imageFile.path);
    console.log('💸 Investment:', investment);

    // ✅ Middleman prompt — upgrade this as needed
    const finalPrompt = `
Captured on a sunny midday, this charming one-story blue house with white trim rests on a tree-lined street. 
It features a steep gable roof with dark shingles, a red brick chimney, evenly placed windows, 
and a welcoming front door, while the surrounding autumn-toned trees and clean sidewalk complete the picturesque suburban home.
Budget: ${investment}
Additional details: ${prompt || 'N/A'}
`.trim();

    // ✅ DALL·E variation
    const dalleResponse = await openai.images.createVariation({
      model: 'dall-e-2',
      image: fs.createReadStream(imageFile.path),
      n: 1,
      size: '1024x1024'
    });

    console.log('✅ DALL·E URL:', dalleResponse.data[0].url);

    res.json({
      enhancedImageUrl: dalleResponse.data[0].url,
      budget: investment,
      tier: 'Moderate upgrades'
    });

  } catch (err) {
    console.error('❌ Enhance error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Flip.ai backend running on port ${PORT}`);
});
