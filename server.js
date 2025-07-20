//#1 - Imports
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Runway } = require('@runwayml/sdk');

//#2 - Config
dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());

//#3 - POST /enhance Route
app.post('/enhance', async (req, res) => {
  const { prompt, imageURL, ratio } = req.body;

  // Validate required inputs
  if (!prompt || !imageURL || !ratio) {
    return res.status(400).json({ error: 'Missing inputs' });
  }

  try {
    // Initialize Runway client
    const runway = new Runway({
      apiKey: process.env.RUNWAY_API_KEY,
    });

    // Runway Gen-4 call
    const result = await runway.gen4.turbo.run({
      prompt: prompt,
      image: imageURL,
      ratio: ratio,
      output_format: 'base64',
    });

    // Return enhanced image
    res.status(200).json({
      success: true,
      result: result,
    });
  } catch (err) {
    console.error('❌ Runway Error:', err);
    res.status(500).json({ error: 'Runway generation failed', details: err.message });
  }
});

//#4 - Start Server
app.listen(port, () => {
  console.log(`🚀 Flip.ai backend is live on port ${port}`);
});
