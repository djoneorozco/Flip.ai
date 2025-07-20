//#1 — Import required modules
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
require('dotenv').config();

//#2 — Setup Express app
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(bodyParser.json());

//#3 — POST /enhance route for Flip.ai
app.post('/enhance', async (req, res) => {
  const { prompt, imageURL, ratio } = req.body;

  // Basic validation
  if (!prompt || !imageURL || !ratio) {
    return res.status(400).json({ error: 'Missing inputs' });
  }

  try {
    // Runway Gen-4 API call
    const runwayResponse = await fetch('https://api.runwayml.com/v1/inference/gen-4/image-to-image', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RUNWAY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        input: {
          prompt: prompt,
          image: imageURL,
          ratio: ratio
        }
      })
    });

    const result = await runwayResponse.json();

    if (runwayResponse.ok && result.outputs && result.outputs.length > 0) {
      return res.status(200).json({ image: result.outputs[0] });
    } else {
      return res.status(500).json({
        error: 'Runway generation failed',
        details: result.error || result
      });
    }
  } catch (err) {
    console.error('Runway Server Error:', err);
    return res.status(500).json({
      error: 'Internal server error',
      details: err.message
    });
  }
});

//#4 — Start server
app.listen(PORT, () => {
  console.log(`✅ Flip.ai enhancement server running on port ${PORT}`);
});
