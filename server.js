// ==============================
// # server.js — Dynamic Ratio Handler for Runway Gen-4
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

// ✅ Supported ratio map
const ratioMap = {
  "1280:768": { width: 1280, height: 768 },
  "768:1280": { width: 768, height: 1280 },
  "1:1": { width: 1024, height: 1024 },
  "16:9": { width: 1280, height: 720 },
  "9:16": { width: 720, height: 1280 },
};

app.post("/enhance", async (req, res) => {
  const { prompt, imageURL, ratio } = req.body;

  if (!prompt || !imageURL || !ratio) {
    return res.status(400).json({
      error: "Missing prompt, imageURL, or ratio.",
    });
  }

  // ✅ Lookup or fallback to error
  const ratioKey = ratio.trim();
  const resolution = ratioMap[ratioKey];

  if (!resolution) {
    return res.status(400).json({
      error: `Unsupported ratio '${ratio}'. Supported values: ${Object.keys(ratioMap).join(", ")}`
    });
  }

  const { width, height } = resolution;

  try {
    console.log(`🧠 Ratio '${ratio}' → width: ${width}, height: ${height}`);

    const response = await client.runway.generate({
      model: "gen-4",
      input: {
        prompt,
        promptImage: {
          uri: imageURL,
          position: "first",
        },
        width,
        height,
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
