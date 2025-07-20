//# ====================================================================
//# server.js — Flip.ai Backend with Debug Endpoints
//# ====================================================================

import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import RunwayML, { TaskFailedError } from '@runwayml/sdk';
import dotenv from 'dotenv';

dotenv.config();

//#region App Setup
const app = express();
const port = process.env.PORT || 3000;
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
//#endregion

//#region Startup Logging & SDK Introspection
console.log('🔐 Initializing RunwayML SDK...');
const runway = new RunwayML({
  apiKey: process.env.RUNWAYML_API_SECRET,
});

// Log out what methods actually exist on this instance:
const protoMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(runway));
console.log('🔍 RunwayML prototype methods:', protoMethods);
//#endregion

//#region Healthcheck
app.get('/', (_req, res) => {
  res.send('✅ Flip.ai backend is up');
});
//#endregion

//#region Debug: Environment Status
app.get('/debug/env', (_req, res) => {
  res.json({
    runwayKeyLoaded: !!process.env.RUNWAYML_API_SECRET,
    sdkVersion: (() => {
      try {
        // attempt to read from package.json
        // (you can also log this locally if JSON imports aren’t enabled)
        return require('@runwayml/sdk/package.json').version;
      } catch {
        return 'unknown';
      }
    })(),
  });
});
//#endregion

//#region Debug: SDK Methods
app.get('/debug/runway-methods', (_req, res) => {
  res.json({ methods: protoMethods });
});
//#endregion

//#region /enhance — Image Enhancement Endpoint
app.post('/enhance', async (req, res) => {
  const { imageUrl, prompt } = req.body;
  if (!imageUrl || !prompt) {
    console.warn('⚠️ Missing imageUrl or prompt:', { imageUrl, prompt });
    return res.status(400).json({ error: 'Missing imageUrl or prompt' });
  }

  try {
    console.log('🚀 Starting Runway textToImage task with:', { imageUrl, prompt });
    const task = await runway.textToImage.create({
      model: 'gen4_image',
      promptImage: imageUrl,
      promptText: prompt,
    });
    console.log(`🔄 Task created (ID=${task.id}), waiting…`);

    const completed = await task.waitForTaskOutput();
    console.log('✅ Task output received:', completed);

    const enhanced = completed.output?.image;
    if (!enhanced) {
      console.error('❌ No output.image field:', completed);
      return res.status(500).json({ error: 'Runway response missing image' });
    }
    return res.json({ image: enhanced });
  } catch (err) {
    if (err instanceof TaskFailedError) {
      console.error('🔥 Runway TaskFailedError:', err.taskDetails);
    } else {
      console.error('🔥 Runway API Error:', err);
    }
    return res.status(500).json({ error: 'Image enhancement failed — see logs.' });
  }
});
//#endregion

//#region Server Start
app.listen(port, () => {
  console.log(`✅ Flip.ai backend listening on port ${port}`);
});
//#endregion
