//#1 ── Imports & Config
import express from 'express';
import multer from 'multer';
import cors from 'cors';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

//#2 ── File Upload Config
const upload = multer({ dest: 'uploads/' });

//#3 ── OpenAI Init
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

//#4 ── Prompt Logic Function
function getPromptForTier(budget) {
  if (budget <= 10000) {
    return `Keep the house’s existing shape, roof, and siding color exactly the same.
Remove boarded-up windows and doors, replacing them with simple, realistic modern windows and doors.
Add light yard cleanup: trim bushes, fresh green grass. 
No major landscaping. No structural changes. Keep style modest and realistic.`;
  }

  // Placeholder for future higher tiers
  return `Keep house style & shape. Perform improvements matching budget tier.`;
}

//#5 ── API Route: Enhance
app.post('/api/enhance', upload.single('propertyImage'), async (req, res) => {
  try {
    const file = req.file;
    const budget = Number(req.body.budget) || 0;

    console.log('📸 Received file:', file?.originalname);
    console.log('💲 Budget:', budget);

    // 1. Pick the right prompt for the tier
    const prompt = getPromptForTier(budget);
    console.log('✏️ Using prompt:', prompt);

    // 2. DALL·E Image Variation (this is the "middle man" step)
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: '1024x1024',
    });

    const enhancedImageUrl = response.data[0].url;

    res.json({
      enhancedImageUrl,
      budget,
      description: prompt,
    });
  } catch (error) {
    console.error('❌ Enhance Error:', error);
    res.status(500).json({ error: 'Image enhancement failed.' });
  }
});

//#6 ── Health Check (optional)
app.get('/', (req, res) => {
  res.send('🟢 Flip.ai backend running!');
});

//#7 ── Start Server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Flip.ai backend listening on port ${PORT}`);
});
