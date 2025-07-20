// =============================================
// # server.js — Flip.ai backend for Runway Gen-4
// =============================================

import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import { Runway } from '@runwayml/sdk';

// ---------------------------------------------
// # 1. Config + App Setup
// ---------------------------------------------

dotenv.config();
const app = express();
const port = process.env.PORT || 10000;
app.use(cors());
app.use(bodyParser.json());

// ---------------------------------------------
// # 2. Route: Enhance Image
// ---------------------------------------------

app.post('/enhance', async (req, res) => {
  console.log('[🟢 API HIT] /enhance route called');

  try {
    const { imageUrl, prompt: rawPrompt } = req.body;

    // Fallback prompt if none provided
    const prompt =
      rawPrompt?.trim() ||
      'Enhance this real estate photo to look modern, clean, and professionally staged.';

    if (!imageUrl) {
      console.error('[❌ ERROR] Missing imageUrl in request body.');
      return res.status(400).json({ error: 'Missing imageUrl' });
    }

    console.log('[📤 INPUT]', { prompt, imageUrl });

    // ---------------------------------------------
    // # 3. Runway SDK Setup
    // ---------------------------------------------

    const runway = new Runway({ apiKey: process.env.RUNWAY_API_KEY });
    const model = runway.model('gen-4');

    if (!model || typeof model.generate !== 'function') {
      console.error('[❌ SDK ERROR] Runway model not initialized correctly.');
      return res.status(500).json({ error: 'Runway model setup failed' });
    }

    // ---------------------------------------------
    // # 4. Generate Output
    // ---------------------------------------------

    console.log('[⚙️ RUNNING] model.generate()...');
    const output = await model.generate({
      prompt,
      image: imageUrl,
    });

    if (!output || !output.outputs || !output.outputs[0]) {
      console.error('[❌ ERROR] Invalid response from Runway model');
      return res.status(500).json({ error: 'No output from model' });
    }

    console.log('[✅ SUCCESS] Output received from model.');
    res.json({ result: output.outputs[0].image });
  } catch (err) {
    console.error('[🔥 UNHANDLED ERROR]', err);
    res.status(500).json({ error: 'Enhancement failed. Please try again.' });
  }
});

// ---------------------------------------------
// # 5. Launch Server
// ---------------------------------------------

app.listen(port, () => {
  console.log(`\n✅ Flip.ai backend running on port ${port}`);
});
