// ================================
// # server.js — Flip.ai backend
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

// 🌐 Root route for status check
app.get('/', (req, res) => {
  res.send('Flip.ai backend is running ✅');
});

// 🔑 Initialize Runway SDK
const runway = new Runway({ apiKey: process.env.RUNWAY_API_KEY });

// 🎯 Enhance endpoint using SDK v2.5.0 syntax
app.post('/enhance', async (req, res) => {
  const { imageUrl, prompt } = req.body;

  if (!imageUrl || !prompt) {
    return res.status(400).json({ error: 'Missing imageUrl or prompt' });
  }

  try {
    const model = await runway.getModel('gen-4');

    const output = await model.generate({
      input: {
        prompt,
        image: imageUrl,
        guidance_scale: 9,
        strength: 0.7,
        num_inference_steps: 25,
      },
    });

    if (!output?.output?.image) {
      throw new Error('Runway returned an unexpected response format');
    }

    return res.json({ image: output.output.image });
  } catch (error) {
    console.error('Runway API error:', error);
    return res.status(500).json({ error: 'Image generation failed' });
  }
});

// 🏁 Start server
app.listen(port, () => {
  console.log(`Flip.ai backend running on port ${port}`);
});
