// ================================
// # server.js — Flip.ai backend
// ================================

import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { Runway } from '@runwayml/sdk'; // ✅ Correct import
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// ✅ Allow Netlify frontend
app.use(cors({
  origin: ['https://flip-ai.netlify.app'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

app.use(bodyParser.json({ limit: '10mb' }));

// 🌐 Root route
app.get('/', (req, res) => {
  res.send('Flip.ai backend is running ✅');
});

// 🔑 Initialize Runway SDK
const runway = new Runway({
  apiKey: process.env.RUNWAY_API_KEY,
});

// 🎯 Enhance endpoint
app.post('/enhance', async (req, res) => {
  const { imageUrl, prompt } = req.body;

  if (!imageUrl || !prompt) {
    return res.status(400).json({ error: 'Missing imageUrl or prompt' });
  }

  try {
    const output = await runway.run('gen-4', {
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
