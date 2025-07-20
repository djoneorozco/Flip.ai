// ================================
// # server.js — Flip.ai backend
// ================================

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Runway } = require('@runwayml/sdk'); // ✅ CommonJS correct import
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

// 🌐 Status check
app.get('/', (req, res) => {
  res.send('Flip.ai backend is running ✅');
});

// 🔑 Runway SDK setup
const runway = new Runway({
  apiKey: process.env.RUNWAY_API_KEY,
});

// 🎯 Image enhancement route
app.post('/enhance', async (req, res) => {
  const { imageUrl, prompt } = req.body;

  if (!imageUrl || !prompt) {
    return res.status(400).json({ error: 'Missing imageUrl or prompt' });
  }

  try {
    const output = await runway.run('gen-4', {
      input: {
        image: imageUrl,
        prompt: prompt || "Enhance this image for flip potential",
        guidance_scale: 9,
        strength: 0.7,
        num_inference_steps: 25
      }
    });

    if (!output?.output?.image) {
      throw new Error('Invalid image result');
    }

    return res.json({ image: output.output.image });
  } catch (error) {
    console.error('Runway API error:', error);
    return res.status(500).json({ error: 'Image generation failed' });
  }
});

// 🚀 Start server
app.listen(port, () => {
  console.log(`Flip.ai backend running on port ${port}`);
});
