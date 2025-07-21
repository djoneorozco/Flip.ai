//#1: IMPORTS
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const Runway = require('@runwayml/sdk');

//#2: ENV SETUP
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

//#3: INIT RUNWAY CLIENT
const runway = new Runway({ apiKey: process.env.RUNWAY_API_KEY });

//#4: TEST ENDPOINT — Confirm system works
app.get('/', (req, res) => {
  res.send('🚀 Render backend is alive and working!');
});

//#5: MAIN ENHANCE ENDPOINT — ✅ CORRECTED: use runway.model('gen-4').generate()
app.post('/api/enhance', async (req, res) => {
  const { image_url, prompt = 'modern home, clean lighting', ratio = 'square' } = req.body;

  if (!image_url) {
    return res.status(400).json({ error: 'Missing image_url in request.' });
  }

  try {
    const output = await runway.model('gen-4').generate({
      input: {
        image: image_url,
        prompt: prompt,
        ratio: ratio
      }
    });

    res.json({ result: output });
  } catch (error) {
    console.error('❌ Runway failed:', error);
    res.status(500).json({
      error: 'Runway failed',
      details: error.message || 'Unknown error'
    });
  }
});

//#6: START SERVER
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
