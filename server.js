// ================================
// # server.js — Flip.ai backend (Final Diagnosed Version)
// ================================

import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import Runway from '@runwayml/sdk';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

// ✅ Root status check
app.get('/', (req, res) => {
  res.send('✅ Flip.ai backend is running');
});

// ✅ Runway SDK Init (with logging)
console.log('🔐 Initializing Runway SDK...');
const runway = new Runway({ apiKey: process.env.RUNWAY_API_KEY });

// ✅ Enhancement endpoint
app.post('/enhance', async (req, res) => {
  const { imageUrl, prompt } = req.body;

  if (!imageUrl || !prompt) {
    console.warn('⚠️ Missing required fields:', { imageUrl, prompt });
    return res.status(400).json({ error: 'Missing imageUrl or prompt' });
  }

  try {
    console.log('🚀 Sending to Runway:', { imageUrl, prompt });

    const output = await runway.run('gen-4', {
      input: {
        prompt,
        image: imageUrl,
        guidance_scale: 9,
        strength: 0.7,
        num_inference_steps: 25,
      },
    });

    console.log('✅ Runway response received.');

    if (!output?.output?.image) {
      console.error('❌ Runway response missing expected "image" field.', output);
      return res.status(500).json({ error: 'Runway response invalid' });
    }

    return res.json({ image: output.output.image });
  } catch (error) {
    console.error('🔥 Runway API Error:', error?.message || error);
    return res.status(500).json({ error: 'Image enhancement failed. Please check logs.' });
  }
});

// 🏁 Server start
app.listen(port, () => {
  console.log(`✅ Flip.ai backend running at http://localhost:${port}`);
});
