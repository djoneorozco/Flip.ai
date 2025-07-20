// =======================================
// # server.js – Flip.ai Backend (Gen-4 Ready)
// =======================================

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import { RunwayClient } from '@runwayml/sdk';

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

// ✅ Initialize Runway SDK client
const client = new RunwayClient({ apiKey: process.env.RUNWAY_API_KEY });

// =======================================
// # POST /enhance – Main Endpoint
// =======================================
app.post('/enhance', async (req, res) => {
  const { prompt, imageURL } = req.body;

  if (!prompt || !imageURL) {
    return res.status(400).json({ error: 'Missing prompt or imageURL' });
  }

  try {
    const result = await client.images.generate({
      prompt: prompt,
      image: imageURL,
      model: 'gen-4'
      // ❌ Do NOT include ratio for Gen-4 – causes 400 error!
    });

    // ✅ Success: Send enhanced image
    res.json({ image: result.image });
  } catch (error) {
    console.error('Runway API error:', error.message || error);
    res.status(500).json({
      error: 'Runway enhancement failed',
      detail: error.message || error
    });
  }
});

// =======================================
// # Health Check (Optional)
app.get('/', (req, res) => {
  res.send('Flip.ai backend is running 🚀');
});
// =======================================

// ✅ Start server
app.listen(port, () => {
  console.log(`✅ Flip.ai backend listening at http://localhost:${port}`);
});
