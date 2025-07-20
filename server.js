//# ====================================================================
//# server.js — Flip.ai Backend (SDK 2.5.0+, with correct ratio)
//# ====================================================================

import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import RunwayML, { RunwayMLError, TaskFailedError } from '@runwayml/sdk';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

const runway = new RunwayML({
  apiKey: process.env.RUNWAYML_API_SECRET ?? process.env.RUNWAY_API_KEY,
});

// Healthcheck
app.get('/', (_req, res) => res.send('✅ Flip.ai backend is running'));

// Debug endpoint
app.get('/debug/env', (_req, res) => {
  let sdkVersion = 'unknown';
  try {
    sdkVersion = require('@runwayml/sdk/package.json').version;
  } catch {}
  res.json({ sdkVersion });
});

// Enhancement endpoint
app.post('/enhance', async (req, res) => {
  const { imageUrl, prompt } = req.body;
  if (!imageUrl || !prompt) return res.status(400).json({ error: 'Missing inputs' });
  try {
    const options = {
      model: 'gen4_image',
      promptImage: imageUrl,
      promptText: prompt,
      ratio: '960:960',       // ✅ Use a numeric ratio!
      guidanceScale: 9,
      strength: 0.7,
      numInferenceSteps: 25,
    };
    const task = await runway.textToImage.create(options);
    const completed = await task.waitForTaskOutput();
    const enhanced = completed.output?.image;
    if (!enhanced) throw new Error('No image in response');
    res.json({ image: enhanced });
  } catch (err) {
    if (err instanceof TaskFailedError || err instanceof RunwayMLError) {
      console.error('Runway error:', err);
    } else {
      console.error('Unexpected error:', err);
    }
    res.status(500).json({ error: 'Enhancement failed — check server logs.' });
  }
});

app.listen(port, () => console.log(`🚀 Server listening on port ${port}`));
