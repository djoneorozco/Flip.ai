const express = require('express');
const cors = require('cors');
const multer = require('multer');
const OpenAI = require('openai');

require('dotenv').config();
const app = express();

// ✅ Setup CORS with your actual frontend domain
app.use(cors({
  origin: ['http://localhost:3000', 'https://flip-ai.netlify.app'],
}));

app.use(express.json());

// ✅ Upload setup
const upload = multer({ dest: 'uploads/' });

// ✅ Init OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ✅ Health check
app.get('/', (req, res) => {
  res.send('✅ Flip.ai backend is running!');
});

// ✅ Enhance route
app.post('/api/enhance', upload.single('image'), async (req, res) => {
  try {
    const budget = req.body.budget;
    console.log("Received budget:", budget);

    // 🟢 Call to OpenAI to generate enhanced image
    const response = await openai.images.createVariation({
      model: "dall-e-2",
      image: fs.createReadStream(req.file.path),
      n: 1,
      size: "1024x1024",
    });

    res.json({
      enhancedImageUrl: response.data[0].url,
      budget: budget,
    });

  } catch (err) {
    console.error("❌ Enhance error:", err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Start server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
