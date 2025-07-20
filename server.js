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

// ✅ Initialize Runway client with secret
const client = new Runway({
  apiKey: process.env.RUNWAY_API_KEY,
});

// ✅ Supported aspect ratio formats for Gen-4 Turbo (image)
const allowedRatios = [
  "1280:720",   // Landscape
  "1584:672",   // Landscape
  "1104:832",   // Landscape
  "720:1280",   // Portrait
  "832:1104",   // Portrait
  "960:960"     // Square
];

// =====================
// # /enhance POST route
// =====================
app.post("/enhance", async (req, res) => {
  const { prompt, imageURL, ratio } = req.body;

  // 🔍 Step 1: Check for required fields
  if (!prompt || !imageURL || !ratio) {
    return res.status(400).json({
      error: "Missing required fields: prompt, imageURL, or ratio.",
    });
  }

  // 🔍 Step 2: Validate ratio format
  if (!allowedRatios.includes(ratio)) {
    return res.status(400).json({
      error: `Invalid ratio. Must be one of: ${allowedRatios.join(", ")}`,
    });
  }

  // 🧠 Debug payload logging
  console.log("📦 Payload Received:", {
    prompt,
    imageURL,
    ratio
  });

  try {
    // 🧪 Step 3: Call Runway Gen-4 image model
    const task = await client.textToImage
      .create({
        model: "gen4_image",
        promptText: prompt,
        promptImage: imageURL,
        ratio: ratio, // string format expected (e.g. "1280:720")
        guidanceScale: 7.5,
        numInferenceSteps: 30,
      })
      .waitForTaskOutput();

    // 🟢 Output image from Runway
    console.log("✅ Enhancement Success:", task.output?.[0]);

    res.json({ image: task.output?.[0] });
  } catch (error) {
    // 🔴 Log the full error
    console.error("🛑 Runway API Error:", error);
    res.status(500).json({ error: "Enhancement failed. Please try again." });
  }
});

// 🚀 Start the server
app.listen(port, () => {
  console.log(`🟢 Flip.ai backend running on port ${port}`);
});
