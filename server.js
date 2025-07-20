//# ====================================================================
//# server.js — Flip.ai Backend (with SDK Version Reporting + Debugging)
//# ====================================================================

//# Section 1: Imports & Configuration
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import RunwayML, { RunwayMLError, TaskFailedError } from '@runwayml/sdk';
import { createRequire } from 'module';
import dotenv from 'dotenv';

dotenv.config();
const requireCJS = createRequire(import.meta.url);

//# Section 2: App & CORS Setup
const app = express();
const port = process.env.PORT || 3000;

const FRONTEND_ORIGINS = [
  'https://flip-ai.netlify.app',
  'https://flip-ai.onrender.com'
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || FRONTEND_ORIGINS.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(bodyParser.json({ limit: '10mb' }));

//# Section 3: RunwayML SDK Initialization
let runway;
let usedKeyName = null;

try {
  const key =
    process.env.RUNWAYML_API_SECRET?.trim() ||
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
  console.log('RUNWAY_API_KEY       =', process.env.RUNWAY_API_KEY);
  console.groupEnd();
  process.exit(1);
}

//# Section 4: Debug Endpoints

// Healthcheck
app.get('/', (_req, res) => {
  res.send('✅ Flip.ai backend is running');
});

// Debug: Environment & SDK version
app.get('/debug/env', (_req, res) => {
  let sdkVersion = 'unknown';
  try {
    sdkVersion = requireCJS('@runwayml/sdk/package.json').version;
  } catch (e) {
    console.warn('⚠️ Could not read @runwayml/sdk version:', e.message);
  }
  res.json({
    usedKeyName,
    keyPresent: !!(process.env.RUNWAYML_API_SECRET || process.env.RUNWAY_API_KEY),
    sdkVersion
  });
});

// Debug: List SDK prototype methods
app.get('/debug/runway-methods', (_req, res) => {
  const proto = Object.getPrototypeOf(runway) || {};
  res.json({ methods: Object.getOwnPropertyNames(proto) });
});

//# Section 5: /enhance — Image Enhancement Endpoint
app.post('/enhance', async (req, res) => {
  const { imageUrl, prompt } = req.body;

  // Validate inputs
  if (!imageUrl || !prompt) {
    console.warn('⚠️ Missing imageUrl or prompt:', { imageUrl, prompt });
    return res.status(400).json({ error: 'Missing imageUrl or prompt' });
  }

  try {
    // Build payload
    const options = {
      model: 'gen4_image',
      promptImage: imageUrl,
      promptText: prompt,
      ratio: '1:1',               // valid Gen-4 ratio
      guidanceScale: 9,
      strength: 0.7,
      numInferenceSteps: 25
    };
    console.log('🛠️ Payload for Runway:', JSON.stringify(options, null, 2));

    // Create task
    const task = await runway.textToImage.create(options);
    console.log(`🔄 Task ${task.id} created, waiting for output...`);

    // Wait for completion
    const completed = await task.waitForTaskOutput();
    console.log('✅ Task completed:', completed);

    // Extract enhanced image
    const enhanced = completed.output?.image;
    if (!enhanced) {
      console.error('❌ No enhanced image returned:', completed);
      return res.status(500).json({ error: 'Runway response missing image' });
    }

    // Respond with enhanced image
    return res.json({ image: enhanced });

  } catch (err) {
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

//# Section 6: Server Start
app.listen(port, () => {
  console.log(`🚀 Flip.ai backend listening on port ${port}`);
});
