// ========================================================================
// ✅ Flip.ai – Smart Budget AI – Comprehensive Server.js
// ========================================================================

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const multer = require('multer');
const OpenAI = require('openai');
require('dotenv').config();

// ✅ Init OpenAI Client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ✅ Express App Setup
const app = express();
app.use(cors());
app.use(express.json());

// ✅ Upload Directory for Render / Fly.io
const uploadDir = '/tmp/uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('✅ Upload directory created:', uploadDir);
}

// ✅ Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage: storage });

// ========================================================================
// ✅ Health Check
// ========================================================================
app.get('/', (req, res) => {
  res.send('✅ Flip.ai backend is alive!');
});

// ========================================================================
// ✅ Smart Flip Enhance Route
// ========================================================================
app.post('/api/enhance', upload.single('image'), async (req, res) => {
  console.log('🖼️ Received request for Flip Enhance');

  const { propertyValue, investment } = req.body;
  const file = req.file;

  if (!propertyValue || !investment) {
    return res.status(400).json({ error: 'Missing property value or investment amount.' });
  }

  if (!file) {
    return res.status(400).json({ error: 'Image file is required.' });
  }

  const propertyVal = Number(propertyValue);
  const investVal = Number(investment);

  const arv = propertyVal + investVal;
  const maxOffer = arv * 0.7;

  // ✅ Determine tier
  let tier = 'Basic upgrades';
  if (investVal < 10000) {
    tier = 'Basic upgrades';
  } else if (investVal >= 10000 && investVal < 50000) {
    tier = 'Moderate upgrades';
  } else {
    tier = 'Premium upscale renovation';
  }

  console.log(`💰 ARV: ${arv} | Max Offer: ${maxOffer} | Tier: ${tier}`);

  // ✅ Build DALL·E Prompt
  const prompt = `
Captured on a sunny midday, this charming one-story blue house with white trim rests on a tree-lined street.
It features a steep gable roof with dark shingles, a red brick chimney, evenly placed windows, and a welcoming front door,
while the surrounding autumn-toned trees and clean sidewalk complete the picturesque suburban home.

Upgrade level: ${tier}.

Focus on:
- Keeping the same house structure and siding.
- Replacing boarded windows and doors with realistic upgrades.
- Add clean trim, realistic window styles, and curb appeal appropriate for the budget.
No landscaping changes.
No new structures.
  `.trim();

  console.log('✨ Final Prompt:', prompt);

  try {
    // ✅ Generate Enhanced Image with DALL·E
    const imageStream = fs.createReadStream(file.path);

    const dalleResponse = await openai.images.createVariation({
      model: 'dall-e-2',
      image: imageStream,
      n: 1,
      size: '1024x1024',
      response_format: 'url',
      // Note: For edits, you’d use `createEdit` with a mask, but we skip mask for now
    });

    const enhancedUrl = dalleResponse.data[0].url;

    console.log('✅ Enhanced Image URL:', enhancedUrl);

    return res.json({
      enhancedImageUrl: enhancedUrl,
      arv: `$${arv.toLocaleString()}`,
      maxOffer: `$${maxOffer.toLocaleString()}`,
      tier: tier,
    });

  } catch (err) {
    console.error('❌ OpenAI error:', err);
    res.status(500).json({ error: 'Failed to generate enhancement', details: err.message });
  }
});

// ========================================================================
// ✅ Start Server
// ========================================================================
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Flip.ai backend running on port ${PORT}`);
});
