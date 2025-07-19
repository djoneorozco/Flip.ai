// =======================================
// #1 – Imports and Setup
// =======================================
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { RunwayML, TaskFailedError } from '@runwayml/sdk';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const client = new RunwayML({ apiKey: process.env.RUNWAY_API_KEY });

app.use(cors());
app.use(bodyParser.json({ limit: '25mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// =======================================
// #2 – POST /enhance-image
// =======================================
app.post('/enhance-image', async (req, res) => {
  const { prompt, imageUrl, imageBase64 } = req.body;

  if (!prompt || (!imageUrl && !imageBase64)) {
    return res.status(400).json({ error: 'Missing prompt or image input.' });
  }

  // Determine input format
  let referenceUri;
  if (imageUrl) {
    referenceUri = imageUrl;
  } else {
    referenceUri = imageBase64; // Should already be formatted as data URI
  }

  try {
    const task = await client.textToImage.create({
      model: 'gen4_image',
      promptText: prompt,
      ratio: '1024:1024',
      referenceImages: [
        {
          uri: referenceUri,
          tag: 'source',
        },
      ],
    }).waitForTaskOutput();

    const resultUrl = task.output?.[0];

    if (!resultUrl) {
      throw new Error('No image output returned.');
    }

    return res.status(200).json({ imageUrl: resultUrl });
  } catch (error) {
    if (error instanceof TaskFailedError) {
      return res.status(500).json({
        error: 'Runway task failed.',
        details: error.taskDetails,
      });
    }
    return res.status(500).json({ error: error.message });
  }
});

// =======================================
// #3 – Launch Server
// =======================================
app.listen(port, () => {
  console.log(`🚀 Flip.ai Runway server live at http://localhost:${port}`);
});
