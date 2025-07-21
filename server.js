//#1: IMPORTS
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const RunwayML = require('@runwayml/sdk'); // ⚙️ Updated import name

//#2: ENV SETUP
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

//#3: INIT RUNWAY CLIENT
const runway = new RunwayML({ apiKey: process.env.RUNWAY_API_KEY }); // ✅ Correct client instantiation

//#4: TEST ENDPOINT — Confirm system works
app.get('/', (req, res) => {
  res.send('🚀 Render backend is alive and working!');
});

//#5: MAIN ENHANCE ENDPOINT — Corrected method and object path
app.post('/api/enhance', async (req, res) => {
  const {
    image_url,
    prompt = 'modern home, clean lighting',
    ratio = 'square'
  } = req.body;

  if (!image_url) {
    return res.status(400).json({ error: 'Missing image_url in request.' });
  }

  try {
    // ⚠️ Replace runway.generate with the correct client.textToImage.create
    const task = await runway.textToImage
      .create({
        model: 'gen4_image',     // use the proper model name
        promptText: prompt,
        ratio: ratio,
        referenceImages: [
          { uri: image_url, tag: 'input' }
        ]
      })
      .waitForTaskOutput(); // ⏱️ Wait until processing finishes

    return res.json({ result: task });
  } catch (error) {
    console.error('❌ Runway failed:', error);
    return res.status(500).json({
      error: 'Runway failed',
      details: error.message || 'Unknown error'
    });
  }
});

//#6: START SERVER
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
