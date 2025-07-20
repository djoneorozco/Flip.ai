// ================================
// # server.js — Flip.ai backend (Fixed)
// ================================

import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { Runway } from '@runwayml/sdk'; // ✅ Correct import
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
    const response = await runway.image.generate({
      model: 'gen4-turbo',
      input: {
        prompt,
        prompt_image: imageUrl,
        guidance_scale: 6,
        image_strength: 0.6,
        num_images: 1,
      },
    });

    const base64Image = response.outputs[0]?.image_base64;

    if (!base64Image) {
      throw new Error('Runway did not return an image');
    }

    return res.json({ image: `data:image/png;base64,${base64Image}` });
  } catch (error) {
    console.error('🔥 Runway API error:', error.message || error);
    return res.status(500).json({ error: 'Image generation failed' });
  }
});

// 🏁 Start server
app.listen(port, () => {
  console.log(`Flip.ai backend running on port ${port}`);
});
