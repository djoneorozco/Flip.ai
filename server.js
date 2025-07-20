// =========================================
// # server.js — Flip.ai Render API Backend (Diagnostic Ratios)
// =========================================

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

// ✅ List of all ratio candidates
const allowedRatios = [
  "1280:768", 
  "768:1280", 
  "1024:1024", 
  "1920:1080", 
  "1080:1920"
];

// ✅ Convert ratio string to object { width, height }
const parseRatio = (ratioStr) => {
  const [width, height] = ratioStr.split(":").map(Number);
  return { width, height };
};

// ✅ Helper function to test each ratio
const testRatio = async (prompt, imageURL) => {
  for (const r of allowedRatios) {
    try {
      console.log(`🔍 Testing ratio: ${r}`);
      const ratioObj = parseRatio(r);
      
      await client.runway.generate({
        model: "gen-4",
        input: {
          prompt: "Ratio Test",
          promptImage: {
            uri: imageURL,
            position: "first",
          },
          ratio: ratioObj,
          numInferenceSteps: 1,
          guidanceScale: 1,
        },
      });
      console.log(`✅ Ratio accepted: ${r}`);
      return r; // Stop at first valid ratio
    } catch (error) {
      console.log(`❌ Ratio failed: ${r} — ${error.message}`);
    }
  }
  throw new Error("No valid ratio found from allowed list.");
};

app.post("/enhance", async (req, res) => {
  const { prompt, imageURL } = req.body;

  if (!prompt || !imageURL) {
    return res.status(400).json({ error: "Missing required fields: prompt or imageURL." });
  }

  try {
    // ✅ Dynamically find valid ratio
    const validRatio = await testRatio(prompt, imageURL);
    const ratioObject = parseRatio(validRatio);

    console.log("🔹 Final Enhancement Payload:", { prompt, imageURL, ratioObject });

    const response = await client.runway.generate({
      model: "gen-4",
      input: {
        prompt: prompt,
        promptImage: { uri: imageURL, position: "first" },
        ratio: ratioObject,
        numInferenceSteps: 30,
        guidanceScale: 7.5,
      },
    });

    console.log("✅ Enhancement succeeded with ratio:", validRatio);
    res.json({ ratioUsed: validRatio, result: response });
  } catch (error) {
    console.error("🟥 Runway API Error:", error);
    res.status(500).json({ error: "Enhancement failed. Please check logs for details." });
  }
});

app.listen(port, () => {
  console.log(`🚀 Flip.ai backend running on port ${port}`);
});
