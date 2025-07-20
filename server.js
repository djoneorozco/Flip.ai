// ==============================
// # server.js — Runway Gen-4 Fix
// ==============================

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

// ✅ Supported resolutions
const allowedRatios = {
  "1280:768": { width: 1280, height: 768 },
  "768:1280": { width: 768, height: 1280 },
};

app.post("/enhance", async (req, res) => {
  const { prompt, imageURL, ratio } = req.body;

  if (!prompt || !imageURL || !ratio) {
    return res.status(400).json({
      error: "Missing prompt, imageURL, or ratio.",
    });
  }

  if (!allowedRatios[ratio]) {
    return res.status(400).json({
      error: `Invalid ratio. Allowed: ${Object.keys(allowedRatios).join(", ")}`,
    });
  }

  const { width, height } = allowedRatios[ratio];

  try {
    const response = await client.runway.generate({
      model: "gen-4",
      input: {
        prompt: prompt,
        promptImage: {
          uri: imageURL,
          position: "first",
        },
        width,       // ✅ NEW FORMAT
        height,      // ✅ NEW FORMAT
        numInferenceSteps: 30,
        guidanceScale: 7.5,
      },
    });

    res.json(response);
  } catch (error) {
    console.error("Runway API Error:", error);
    res.status(500).json({ error: "Enhancement failed. Please try again." });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
