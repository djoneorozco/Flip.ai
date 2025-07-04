// ============================================================
// ✅ Flip.ai – Smart Budget Server (Comprehensive)
// ============================================================

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const OpenAI = require("openai");

const app = express();
const port = process.env.PORT || 10000;

// ✅ OpenAI Client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ============================================================
// ✅ Ensure Upload Directory Exists
// ============================================================
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`✅ Created upload directory: ${uploadDir}`);
}

// ============================================================
// ✅ Multer Setup for File Uploads
// ============================================================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// ============================================================
// ✅ Middleware
// ============================================================
app.use(express.json());
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://flip-ai.netlify.app',
    'https://www.flip-ai.netlify.app'
  ]
}));

// ============================================================
// ✅ Health Check
// ============================================================
app.get('/', (req, res) => {
  res.send('✅ Flip.ai backend is live!');
});

// ============================================================
// ✅ Enhance Endpoint (Middle Man → OpenAI DALL·E)
// ============================================================
app.post('/api/enhance', upload.single('image'), async (req, res) => {
  console.log("✨ Enhance request received!");

  const { propertyValue, investment } = req.body;
  const imageFile = req.file;

  if (!imageFile) {
    return res.status(400).json({ error: 'No image uploaded' });
  }

  console.log(`🖼️ Image saved: ${imageFile.path}`);
  console.log(`🏠 Property Value: ${propertyValue}`);
  console.log(`💰 Investment: ${investment}`);

  // ✅ Example prompt generation
  const stylePrompt = `
Captured on a sunny midday, this charming one-story blue house with white trim rests on a tree-lined street. 
Enhance the boarded windows with realistic windows based on a budget of $${investment}. 
Keep the roofline, siding, and angle the same — just improve the windows and doors moderately.
`;

  try {
    // ✅ Replace this with your actual OpenAI image variation or edit
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: stylePrompt,
      n: 1,
      size: "1024x1024"
    });

    console.log("✅ DALL·E response:", response.data[0].url);

    res.json({
      enhancedImageUrl: response.data[0].url,
      propertyValue,
      investment,
      promptUsed: stylePrompt
    });

  } catch (err) {
    console.error("❌ Enhance error:", err);
    res.status(500).json({ error: 'Failed to enhance image', details: err.message });
  }
});

// ============================================================
// ✅ Start Server
// ============================================================
app.listen(port, () => {
  console.log(`🚀 Flip.ai backend running on port ${port}`);
});
