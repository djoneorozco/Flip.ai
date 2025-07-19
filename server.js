// ================================
// # server.js — Flip.ai backend
// ================================

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Runway } = require('@runwayml/sdk'); // Version 2.5.0+

require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

// Initialize Runway SDK with your API key
const runway = new Runway({
  apiKey: process.env.RUNWAY_API_KEY,
});

// Endpoint to receive POST requests for image enhancement
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

    if (!output || !output.output || !output.output.image) {
      throw new Error('Runway returned an unexpected response format');
    }

    const base64Image = output.output.image;

    return res.json({ image: base64Image });
  } catch (error) {
    console.error('Runway API error:', error);
    return res.status(500).json({ error: 'Image generation failed' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Flip.ai backend running on port ${port}`);
});
