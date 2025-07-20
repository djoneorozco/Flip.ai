//===============================
// # server.js — Flip.ai Backend
//===============================

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Runway } = require('@runwayml/sdk');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

//========================================
// # Runway API Client Initialization
//========================================
const runway = new Runway({
  apiKey: process.env.RUNWAY_API_KEY,
});

//========================================
// # POST /enhance — Enhance Property Image
//========================================
app.post('/enhance', async (req, res) => {
  const { imageUrl, prompt } = req.body;

  if (!imageUrl || !prompt) {
    return res.status(400).json({ error: 'Missing imageUrl or prompt in request body.' });
  }

  try {
    //==============================
    // # Valid Ratio Fix Applied ✅
    //==============================
    const result = await runway.generate({
      model: 'gen4-image', // Or 'gen4_image' based on SDK version
      input: {
        prompt: prompt,
        image: imageUrl,
        ratio: '960:960',             // ✅ Valid ratio for Gen-4 (square format)
        guidance_scale: 9,
        strength: 0.7,
        num_inference_steps: 25
      }
    });

    //==============================
    // # Respond with generated image
    //==============================
    const enhancedImage = result?.output?.image || null;

    if (!enhancedImage) {
      return res.status(500).json({ error: 'Image generation failed. No image returned.' });
    }

    res.status(200).json({ image: enhancedImage });
  } catch (err) {
    console.error('❌ RunwayMLError:', err.message || err);
    if (err?.response?.data) {
      console.error('📦 Runway Response:', err.response.data);
    }
    res.status(500).json({ error: 'Enhancement failed. Please try again.' });
  }
});

//===============================
// # Launch Server
//===============================
app.listen(port, () => {
  console.log(`🚀 Flip.ai server running on port ${port}`);
});
