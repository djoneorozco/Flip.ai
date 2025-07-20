//# ====================================================================
//# server.js — Flip.ai Backend (Fixed: Valid Ratio + CORS + Debugging)
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

// 🔐 Explicit CORS policy
const FRONTEND_ORIGINS = [
  'https://flip-ai.netlify.app',
  'https://flip-ai.onrender.com'
];
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || FRONTEND_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked for origin: ${origin}`));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(bodyParser.json({ limit: '10mb' }));
//#endregion

//#region RunwayML SDK Initialization
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

  console.log(`🔑 Initializing RunwayML SDK using: ${usedKeyName}`);
  runway = new RunwayML({ apiKey: key });
  console.log('✅ RunwayML SDK initialized successfully');
} catch (err) {
  console.error('❌ RunwayML init error:', err.message || err);
  console.group('ℹ️ Environment snapshot');
  console.log('RUNWAYML_API_SECRET =', process.env.RUNWAYML_API_SECRET);
  console.log('RUNWAY_API_KEY         =', process.env.RUNWAY_API_KEY);
  console.groupEnd();
  process.exit(1);
}
//#endregion

//#region Debug Endpoints
// Healthcheck
app.get('/', (_req, res) => {
  res.send('✅ Flip.ai backend is alive');
});

// Which key was loaded?
app.get('/debug/env', (_req, res) => {
  res.json({
    usedKeyName,
    keyPresent: !!(process.env.RUNWAYML_API_SECRET || process.env.RUNWAY_API_KEY)
  });
});

// List SDK prototype methods
app.get('/debug/runway-methods', (_req, res) => {
  const proto = Object.getPrototypeOf(runway) || {};
  res.json({ methods: Object.getOwnPropertyNames(proto) });
});
//#endregion

//#region /enhance — Image Enhancement Endpoint
app.post('/enhance', async (req, res) => {
  const { imageUrl, prompt } = req.body;

  // 1️⃣ Validate inputs
  if (!imageUrl || !prompt) {
    console.warn('⚠️ Missing parameters:', { imageUrl, prompt });
    return res.status(400).json({ error: 'Missing imageUrl or prompt' });
  }

  try {
    // 2️⃣ Build payload without invalid ratio
    const options = {
      model: 'gen4_image',
      promptImage: imageUrl,
      promptText: prompt,
      // If you need to force a ratio, uncomment one of these:
      // ratio: '1:1',
      // ratio: '16:9',
    };
    console.log('🛠️ Payload for Runway:', options);

    // 3️⃣ Create the task
    const task = await runway.textToImage.create(options);
    console.log(`🔄 Task ${task.id} created, waiting for output...`);

    // 4️⃣ Wait for completion
    const completed = await task.waitForTaskOutput();
    console.log('✅ Task completed:', completed);

    // 5️⃣ Extract result
    const enhanced = completed.output?.image;
    if (!enhanced) {
      console.error('❌ No enhanced image returned:', completed);
      return res.status(500).json({ error: 'Runway response missing image' });
    }

    // 6️⃣ Send it back
    return res.json({ image: enhanced });

  } catch (err) {
    // Detailed error handling
    if (err instanceof TaskFailedError) {
      console.error('🔥 TaskFailedError:', err.taskDetails);
    } else if (err instanceof RunwayMLError) {
      console.error('🔥 RunwayMLError:', err.message, err);
    } else {
      console.error('🔥 Unexpected error:', err);
    }
    return res
      .status(500)
      .json({ error: 'Image enhancement failed. Check server logs for details.' });
  }
});
//#endregion

//#region Server Start
app.listen(port, () => {
  console.log(`🚀 Flip.ai backend listening on port ${port}`);
});
//#endregion
