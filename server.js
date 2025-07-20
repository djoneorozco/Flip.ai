// ===========================
// # server.js — Flip.ai Ratio Debug Mode
// ===========================

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Runway } from "@runwayml/sdk";

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const client = new Runway({
  apiKey: process.env.RUNWAY_API_KEY,
});

// ✅ Ratios to test (strings and objects)
const ratioCandidates = [
  "1:1",
  "4:5",
  "5:4",
  "16:9",
  "9:16",
  "2:3",
  "3:2",
  "768:1024",
  "1024:768",
  { width: 1024, height: 1024 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1280, height: 768 },
  { width: 768, height: 1280 },
];

// ✅ Route: /enhance — debug each ratio format
app.post("/enhance", async (req, res) => {
  const { prompt, imageURL } = req.body;

  if (!prompt || !imageURL) {
    return res.status(400).json({ error: "Missing prompt or imageURL" });
  }

  const results = [];

  for (const ratio of ratioCandidates) {
    try {
      console.log(`🔍 Testing ratio: ${JSON.stringify(ratio)}`);

      const response = await client.runway.generate({
        model: "gen-4",
        input: {
          prompt,
          promptImage: {
            uri: imageURL,
            position: "first",
          },
          ratio,
          numInferenceSteps: 30,
          guidanceScale: 7.5,
        },
      });

      results.push({ ratio, status: "✅ Success" });
      console.log("✅ Enhancement succeeded with:", ratio);

      // Optional: break on first success
      break;

    } catch (error) {
      results.push({
        ratio,
        status: "❌ Failed",
        message: error?.message || "Unknown error",
      });
      console.error(`❌ Failed with ratio ${JSON.stringify(ratio)}:`, error.message);
    }
  }

  res.json({ testResults: results });
});

app.listen(port, () => {
  console.log(`🚀 Ratio tester backend running on port ${port}`);
});
