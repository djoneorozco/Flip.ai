//# ====================================================================
//# server.js — Flip.ai Backend w/ Explicit CORS Policy
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

// 🔐 CORS Configuration
const FRONTEND_ORIGINS = [
  'https://flip-ai.netlify.app',
  'https://flip-ai.onrender.com',   // in case you call it from its own domain
];
const corsOptions = {
  origin: (origin, callback) => {
    // allow requests with no origin (e.g. Postman) or if in our whitelist
    if (!origin || FRONTEND_ORIGINS.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error(`CORS policy blocked request from ${origin}`));
  },
  methods: ['GET','POST','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  optionsSuccessStatus: 204,
};

// Apply CORS to all routes and preflights
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// JSON bodies up to 10 MB
app.use(bodyParser.json({ limit: '10mb' }));
//#endregion

//#region RunwaySDK Init (with Key Fallback & Debug)
let runway;
let usedKeyName = null;
try {
  const key = process.env.RUNWAYML_API_SECRET?.trim() ||
              process.env.RUNWAY_API_KEY?.trim();
  usedKeyName = process.env.RUNWAYML_API_SECRET
    ? 'RUNWAYML_API_SECRET'
    : process.env.RUNWAY_API_KEY
    ? 'RUNWAY_API_KEY'
    : null;

  console.log('🔑 Initializing RunwayML SDK with key from', usedKeyName);
  runway = new RunwayML({ apiKey: key });
  console.log('✅ RunwayML SDK ready.');
} catch (err) {
  console.error('❌ RunwayML init failed:', err.message || err);
  console.group('ℹ️ Env vars:');
  console.log('RUNWAYML_API_SECRET=', process.env.RUNWAYML_API_SECRET);
  console.log('RUNWAY_API_KEY=', process.env.RUNWAY_API_KEY);
  console.groupEnd();
  process.exit(1);
}
//#endregion

//#region Debug Endpoints
app.get('/', (_req, res) => res.send('✅ Flip.ai backend is running'));

app.get('/debug/env', (_req, res) => {
  res.json({
    usedKeyName,
    runwayKeyPresent: !!(process.env.RUNWAYML_API_SECRET || process.env.RUNWAY_API_KEY),
  });
});

app.get('/debug/runway-methods', (_req, res) => {
  const proto = Object.getPrototypeOf(runway) || {};
  res.json({ methods: Object.getOwnPropertyNames(proto) });
});
//#endregion

//#region /enhance — Image Enhancement
app.post('/enhance', async (req, res) => {
  const { imageUrl, prompt } = req.body;
  if (!imageUrl || !prompt) {
    console.warn('⚠️ Missing imageUrl or prompt:', { imageUrl, prompt });
    return res.status(400).json({ error: 'Missing imageUrl or prompt' });
  }

  try {
    console.log('🚀 textToImage.create:', { imageUrl, prompt });
    const task = await runway.textToImage.create({
      model: 'gen4_image',
      promptImage: imageUrl,
      promptText: prompt,
    });
    console.log(`🔄 Task ${task.id} created, waiting…`);

    const completed = await task.waitForTaskOutput();
    console.log('✅ Task complete:', completed);

    const enhanced = completed.output?.image;
    if (!enhanced) {
      console.error('❌ No image in response:', completed);
      return res.status(500).json({ error: 'Runway response missing enhanced image' });
    }
    return res.json({ image: enhanced });

  } catch (err) {
    if (err instanceof TaskFailedError) {
      console.error('🔥 TaskFailedError:', err.taskDetails);
    } else if (err instanceof RunwayMLError) {
      console.error('🔥 RunwayMLError:', err.message, err);
    } else {
      console.error('🔥 Unknown error:', err);
    }
    return res.status(500).json({ error: 'Image enhancement failed—see server logs.' });
  }
});
//#endregion

//#region Server Start
app.listen(port, () => {
  console.log(`🚀 Flip.ai backend listening on port ${port}`);
});
//#endregion
