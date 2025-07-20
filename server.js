// ===============================
// # server.js — Flip.ai Backend
// ===============================

//#1 – Import Dependencies
import express from 'express';
import multer from 'multer';
import cors from 'cors';
import dotenv from 'dotenv';
import { Runway } from '@runwayml/sdk';
import sizeOf from 'image-size';

dotenv.config();

//#2 – App Configuration
const app = express();
const port = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());

//#3 – File Upload Setup
const upload = multer();

//#4 – Runway SDK Setup
const runway = new Runway({
  apiKey: process.env.RUNWAY_API_KEY,
});

//#5 – Enhance Endpoint
app.post('/enhance', upload.single('image'), async (req, res) => {
  try {
    const prompt = req.body.prompt || "Modern, renovated, high-end real estate photo";
    const imageBuffer = req.file.buffer;

    // Get image dimensions and calculate aspect ratio
    const dimensions = sizeOf(imageBuffer);
    const ratio = +(dimensions.width / dimensions.height).toFixed(2); // rounded to 2 decimal places

    // Optional: restrict to supported ranges if needed
    if (!ratio || isNaN(ratio)) {
      return res.status(400).json({ error: 'Unable to detect valid image ratio' });
    }

    // Generate enhanced image with SDK
    const result = await runway.image.toImage({
      model: "gen-4",
      prompt: prompt,
      image: imageBuffer,
      ratio: ratio,
      output_format: "jpeg",
    });

    res.status(200).json({ base64: result });
  } catch (error) {
    console.error("Enhancement failed:", error.message || error);
    res.status(500).json({ error: "Enhancement failed. Please try again." });
  }
});

//#6 – Debug Route to Confirm ENV + SDK
app.get('/debug/env', (req, res) => {
  res.json({
    usedKeyName: 'RUNWAY_API_KEY',
    keyPresent: !!process.env.RUNWAY_API_KEY,
    sdkVersion: Runway?.version || 'unknown',
  });
});

//#7 – Launch Server
app.listen(port, () => {
  console.log(`🚀 Flip.ai backend running on port ${port}`);
});
