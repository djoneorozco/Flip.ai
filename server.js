// ================================
// # server.js — Flip.ai backend
// ================================

import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import { getModel } from '@runwayml/sdk'; // ✅ Correct import for SDK v2.5.0+

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

// 🌐 Root route for status check
app.get('/', (req, res) => {
  res.send('Flip.ai backend is running ✅');
});

// 🎯 Enhance endpoint
app.post('/enhance', async (req, res) => {
  const { imageUrl, prompt } = req.body;

  if (!imageUrl || !prompt) {
    return res.status(400).json({ error: 'Missing imageUrl or prompt' });
  }

  try {
    // ✅ Get the Gen-4 model handle
    const model = await getModel('gen-4', {
      apiKey: process.env.RUNWAY_API_KEY,
    });

    // ✅ Call generate method (correct method for this SDK version)
    const output = await model.generate({
      input: {
        prompt,
        image: imageUrl,
        guidance_scale: 9,
        strength: 0.7,
        num_inference_steps: 25,
      },
    });

    // ✅ Handle the image response
    if (!output?.outputs?.[0]?.image) {
      throw new Error('Runway returned an unexpected response format');
    }

    return res.json({ image: output.outputs[0].image });
  } catch (error) {
    console.error('Runway API error:', error);
    return res.status(500).json({ error: 'Image generation failed' });
  }
});

// 🏁 Start server
app.listen(port, () => {
  console.log(`Flip.ai backend running on port ${port}`);
});
