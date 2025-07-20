// ==================================
// # server.js — Flip.ai backend API
// ==================================

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Runway } = require('@runwayml/sdk');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// ✅ Allow requests from your Netlify frontend
app.use(cors({
  origin: 'https://flip-ai.netlify.app', // 🔒 Only allow frontend traffic from this domain
}));

// 🧠 Handle large JSON payloads
app.use(bodyParser.json({ limit: '10mb' }));

// 🧪 Root route for health check
app.get('/', (req, res) => {
  res.send('✅ Flip.ai backend is live and running.');
});

// 🔑 Initialize Runway SDK
const runway = new Runway({
  apiKey: process.env.RUNWAY_API_KEY,
});

// 🎯 POST /enhance — Main image enhancement route
app.post('/enhance', async (req, res) => {
  const { imageUrl, prompt } = req.body;

  if (!imageUrl || !prompt) {
    return res.status(400).json({ error: '❌ Missing imageUrl or prompt in request.' });
  }

  try {
    const output = await runway.run('gen-4', {
      input: {
        image: imageUrl,
        prompt: prompt || 'Enhance this property image for maximum real estate appeal.',
        guidance_scale: 9,
        strength: 0.7,
        num_inference_steps: 25,
      },
    });

    if (!output || !output.output || !output.output.image) {
      throw new Error('❌ Runway did not return a valid image.');
    }

    return res.json({ image: output.output.image });
  } catch (error) {
    console.error('🔥 Runway API Error:', error.message || error);
    return res.status(500).json({ error: 'Image generation failed. Please try again.' });
  }
});

// 🚀 Start the server
app.listen(port, () => {
  console.log(`🚀 Flip.ai backend running on port ${port}`);
});
