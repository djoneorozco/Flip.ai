//# ====================================================================
//# server.js — Flip.ai Backend w/ Enhanced Debugging
//# ====================================================================

import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import RunwayML, { RunwayMLError, TaskFailedError } from '@runwayml/sdk';
import dotenv from 'dotenv';

dotenv.config();

//#region App Setup
const app = express();
const port = process.env.PORT || 3000;
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
//#endregion

//#region SDK Initialization with Key-Check
let runway;
let usedKeyName = null;
try {
  // Allow either env var name
  const key =
    process.env.RUNWAYML_API_SECRET?.trim() ||
    process.env.RUNWAY_API_KEY?.trim();

  // Remember which one we used
  usedKeyName = process.env.RUNWAYML_API_SECRET
    ? 'RUNWAYML_API_SECRET'
    : process.env.RUNWAY_API_KEY
    ? 'RUNWAY_API_KEY'
    : null;

  console.log('🔑 Attempting RunwayML init with key from:', usedKeyName);

  runway = new RunwayML({ apiKey: key });
  console.log('✅ RunwayML SDK initialized successfully.');
} catch (err) {
  console.error('❌ RunwayML init error:', err.message || err);
  console.group('ℹ️ Environment snapshot:');
  console.log('RUNWAYML_API_SECRET:', process.env.RUNWAYML_API_SECRET);
  console.log('RUNWAY_API_KEY:', process.env.RUNWAY_API_KEY);
  console.groupEnd();
  // Exit so you see this in logs immediately
  process.exit(1);
}
//#endregion

//#region Debug Endpoints
// Healthcheck
app.get('/', (_req, res) => res.send('✅ Flip.ai backend is running'));

// Which key loaded?
app.get('/debug/env', (_req, res) => {
  res.json({
    usedKeyName,
    runwayKeyPresent: !!(
      process.env.RUNWAYML_API_SECRET || process.env.RUNWAY_API_KEY
    ),
  });
});

// What methods exist on the SDK instance?
app.get('/debug/runway-methods', (_req, res) => {
  const proto = Object.getPrototypeOf(runway) || {};
  res.json({ methods: Object.getOwnPropertyNames(proto) });
});
//#endregion

//#region /enhance — Image Enhancement Endpoint
app.post('/enhance', async (req, res) => {
  const { imageUrl, prompt } = req.body;
  if (!imageUrl || !prompt) {
    console.warn('⚠️  Missing imageUrl or prompt:', { imageUrl, prompt });
    return res.status(400).json({ error: 'Missing imageUrl or prompt' });
  }

  try {
    console.log('🚀 Creating textToImage task:', { imageUrl, prompt });

    const task = await runway.textToImage.create({
      model: 'gen4_image',
      promptImage: imageUrl,
      promptText: prompt,
    });
    console.log(`🔄 Task ${task.id} created, waiting for output…`);

    const completed = await task.waitForTaskOutput();
    console.log('✅ Task complete:', completed);

    const enhanced = completed.output?.image;
    if (!enhanced) {
      console.error('❌ No image in response:', completed);
      return res
        .status(500)
        .json({ error: 'Runway response missing enhanced image' });
    }
    return res.json({ image: enhanced });
  } catch (err) {
    if (err instanceof TaskFailedError) {
      console.error('🔥 Runway TaskFailedError:', err.taskDetails);
    } else if (err instanceof RunwayMLError) {
      console.error('🔥 RunwayMLError:', err.message, err);
    } else {
      console.error('🔥 Unknown error:', err);
    }
    return res
      .status(500)
      .json({ error: 'Image enhancement failed. See server logs.' });
  }
});
//#endregion

//#region Server Start
app.listen(port, () => {
  console.log(`🚀 Flip.ai backend listening on port ${port}`);
});
//#endregion
