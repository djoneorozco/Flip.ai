import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import RunwayML, { TaskFailedError } from '@runwayml/sdk';
import dotenv from 'dotenv';
dotenv.config();

//#1: Setup Express
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

//#2: Healthcheck route
app.get('/', (req, res) => {
  res.send('✅ Flip.ai backend is up and running.');
});

//#3: Init Runway SDK
console.log('🧠 Initializing Runway SDK...');
const runway = new RunwayML({
  apiKey: process.env.RUNWAYML_API_SECRET || process.env.RUNWAY_API_KEY,
});

//#4: Enhance Endpoint
app.post('/enhance', async (req, res) => {
  const { imageUrl, prompt } = req.body;

  if (!imageUrl || !prompt) {
    console.warn('❗Missing imageUrl or prompt.');
    return res.status(400).json({ error: 'Missing imageUrl or prompt' });
  }

  try {
    console.log(`🚀 Creating enhancement task → model: gen4_image`);
    console.log(`🔗 Source Image URL: ${imageUrl}`);
    console.log(`🧠 Prompt: ${prompt}`);

    const task = await runway.textToImage.create({
      model: 'gen4_image',
      promptImage: imageUrl,
      promptText: prompt,
      // Optional: Adjust model behavior below
      // strength: 0.7,
      // guidanceScale: 9,
      // numInferenceSteps: 25,
      // ratio: '1:1'
    });

    console.log(`⏳ Task created (ID: ${task.id}). Polling until complete…`);

    const result = await task.waitForTaskOutput();

    if (!result.output || !result.output.image) {
      console.error('❌ No image returned in output:', result);
      return res.status(500).json({ error: 'No image returned by RunwayML' });
    }

    console.log('✅ Enhancement complete. Returning image.');
    return res.json({ image: result.output.image });

  } catch (err) {
    if (err instanceof TaskFailedError) {
      console.error('🔥 Runway task failed:', err.taskDetails);
    } else {
      console.error('🔥 Unexpected Runway error:', err.message || err);
    }
    return res.status(500).json({ error: 'Image enhancement failed. Check server logs.' });
  }
});

//#5: Start Server
app.listen(port, () => {
  console.log(`✅ Flip.ai backend live at http://localhost:${port}`);
});
