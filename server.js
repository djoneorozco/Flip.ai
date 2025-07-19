// server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const Runway = require('@runwayml/sdk');

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

const client = new Runway({
  apiKey: process.env.RUNWAY_API_KEY,
});

app.post('/enhance', async (req, res) => {
  try {
    const { imageUrl, prompt } = req.body;

    const result = await client.images.generate({
      model: 'gen-4',
      input: {
        prompt,
        prompt_image: imageUrl,
      },
    });

    res.json({ output: result.outputs[0].image });
  } catch (err) {
    console.error('❌ ERROR:', err);
    res.status(500).json({ error: 'Something went wrong with Runway.' });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
