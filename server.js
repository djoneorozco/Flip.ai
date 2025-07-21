//#1. IMPORTS
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const Runway = require('@runwayml/sdk');

dotenv.config();

//#2. SETUP
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

//#3. INIT RUNWAY CLIENT
const runway = new Runway({ apiKey: process.env.RUNWAY_API_KEY });

//#4. POST ENDPOINT
app.post('/enhance', async (req, res) => {
  const { prompt, imageURL, ratio } = req.body;

  if (!prompt || !imageURL) {
    return res.status(400).json({ error: 'Missing prompt or imageURL' });
  }

  try {
    const output = await runway.run({
      model: 'gen-4',
      input: {
        prompt: prompt,
        image: imageURL,
        ratio: ratio || 'square'
      }
    });

    return res.json({ result: output });
  } catch (error) {
    console.error('❌ Runway generation failed:', error);
    return res.status(500).json({
      error: 'Runway generation failed',
      details: error.message || 'Unknown error'
    });
  }
});

//#5. SERVER LAUNCH
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
