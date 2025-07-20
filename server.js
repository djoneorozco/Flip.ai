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

// ✅ Allowed ratio strings (latest API spec)
const allowedRatios = ["1280:768", "768:1280"];

// ✅ Convert ratio string to object for API
const parseRatio = (ratioStr) => {
  const [width, height] = ratioStr.split(":").map(Number);
  return { width, height };
};

app.post("/enhance", async (req, res) => {
  const { prompt, imageURL, ratio } = req.body;

  // ✅ Step 1: Ensure all required fields are present
  if (!prompt || !imageURL || !ratio) {
    return res.status(400).json({
      error: "Missing required fields: prompt, imageURL, or ratio.",
    });
  }

  // ✅ Step 2: Validate the ratio string format
  if (!allowedRatios.includes(ratio)) {
    return res.status(400).json({
      error: `Invalid ratio. Must be one of: ${allowedRatios.join(" or ")}`,
    });
  }

  // ✅ Step 3: Convert string to object { width, height }
  const ratioObject = parseRatio(ratio);

  // ✅ Step 4: Log payload for diagnostics
  console.log("🔹 Enhancement Request Payload:", {
    prompt,
    imageURL,
    ratio: ratioObject,
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
        ratio: ratioObject, // ✅ Converted object
        numInferenceSteps: 30,
        guidanceScale: 7.5,
      },
    });

    console.log("✅ Enhancement succeeded");
    res.json(response);
  } catch (error) {
    console.error("🟥 Runway API Error:", error);
    res.status(500).json({ error: "Enhancement failed. Please try again." });
  }
});

app.listen(port, () => {
  console.log(`🚀 Flip.ai backend running on port ${port}`);
});
