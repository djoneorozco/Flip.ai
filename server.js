// =========================================
// # server.js — Flip.ai Render API Backend
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

// Allowed resolutions per 2024-11-06 API
const allowedRatios = ["1280:768", "768:1280"];

app.post("/enhance", async (req, res) => {
  const { prompt, imageURL, ratio } = req.body;

  // ✅ Step 1: Check for required fields
  if (!prompt || !imageURL || !ratio) {
    return res.status(400).json({
      error: "Missing required fields: prompt, imageURL, or ratio.",
    });
  }

  // ✅ Step 2: Check that ratio is valid
  if (!allowedRatios.includes(ratio)) {
    return res.status(400).json({
      error: `Invalid ratio value. Must be one of: ${allowedRatios.join(" or ")}`,
    });
  }

  // ✅ Step 3: Log the full payload for debugging
  console.log("🟦 Runway Enhancement Request:", {
    prompt,
    imageURL,
    ratio,
  });

  try {
    const response = await client.runway.generate({
      model: "gen-4",
      input: {
        prompt: prompt,
        promptImage: {
          uri: imageURL,
          position: "first",
        },
        ratio: ratio,
        numInferenceSteps: 30,
        guidanceScale: 7.5,
      },
    });

    console.log("✅ Enhancement successful");
    res.json(response);
  } catch (error) {
    console.error("🟥 Runway API Error:", error);
    res.status(500).json({ error: "Enhancement failed. Please try again." });
  }
});

app.listen(port, () => {
  console.log(`✅ Flip.ai backend running on port ${port}`);
});
