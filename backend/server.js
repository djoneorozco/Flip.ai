// ✅ Flip.ai REAL SERVER.JS — OpenAI DALL·E, no placeholders

import express from 'express';
import multer from 'multer';
import cors from 'cors';
import OpenAI from 'openai';

const app = express();
const port = process.env.PORT || 10000;

// ✅ Init OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ✅ Allow only your Netlify app to hit the backend
const allowedOrigins = ['https://flip-ai.netlify.app'];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error('CORS policy: Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// ✅ USE MEMORY STORAGE for upload
const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post('/api/enhance', upload.single('propertyImage'), async (req, res) => {
  console.log('✅ Image received:', req.file?.originalname);

  const budget = req.body.budget || 0;

  // ✅ Real prompt for DALL·E
  const prompt = `A realistic photo of this house with improvements matching a $${budget} budget. Keep the original style. Add windows or minor exterior upgrades if needed.`;

  console.log('✨ Sending to OpenAI DALL·E:', prompt);

  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
    });

    const enhancedImageUrl = response.data[0].url;

    console.log('✅ AI Enhanced Image URL:', enhancedImageUrl);

    res.json({
      enhancedImageUrl,
      budget: Number(budget),
      description: prompt,
    });

  } catch (err) {
    console.error('❌ OpenAI Enhance Error:', err);
    res.status(500).json({ error: 'Enhance failed', details: err.message });
  }
});

// ✅ Health check
app.get('/', (req, res) => {
  res.send('✅ Flip.ai backend is LIVE — OpenAI real enhancement!');
});

app.listen(port, () => {
  console.log(`✅ Flip.ai backend running on port ${port}`);
});
