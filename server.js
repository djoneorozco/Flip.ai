// ================================
// # server.js — Flip.ai backend
// ================================

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const { Runway } = require('@runwayml/sdk'); // SDK v2.5.0+

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

// ✅ Correct way to initialize Runway (SDK v2+ uses function, not constructor)
const runway = Runway({
  token: process.env.RUNWAY_API_KEY,
});

// ================================
// # POST /enhance – Runway Gen-4
// ================================
app.post('/enhance', async (req, res) => {
  const { imageUrl, prompt } = req.body;

  if (!imageUrl || !prompt) {
    return res.status(400).json({ error: 'Missing imageUrl or prompt' });
  }

  try {
    const response = await runway.run('gen-4', {
      prompt: prompt,
      prompt_image: imageUrl,
      strength: 0.7,
      guidance_scale: 9,
      num_inference_steps: 25,
    });

    if (!response || !response.image) {
      throw new Error('Runway returned an unexpected response format');
    }

    return res.json({ image: response.image });
  } catch (error) {
    console.error('Runway API error:', error);
    return res.status(500).json({ error: 'Image generation failed', details: error.message });
  }
});

// ================================
// # Start Server
// ================================
app.listen(port, () => {
  console.log(`✅ Flip.ai backend is live on port ${port}`);
});
