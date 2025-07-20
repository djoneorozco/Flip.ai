// ================================
// # server.js — Flip.ai Enhance Endpoint (Gen-4)
// ================================

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const { Runway } = require("@runwayml/client");
const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Init Runway client
const runway = new Runway({ apiKey: process.env.RUNWAY_API_KEY });

// Endpoint to enhance images
app.post("/enhance", async (req, res) => {
  const { prompt, imageURL, ratio } = req.body;

  // ✅ Debug log incoming values
  console.log("Received:", { prompt, imageURL, ratio });

  // Validate all inputs are provided
  if (!prompt || !imageURL || !ratio) {
    return res.status(400).json({ error: "Missing inputs" });
  }

  try {
    const response = await runway.generate({
      model: "gen-4",
      input: {
        prompt,
        promptImage: {
          uri: imageURL,
          position: "first",
        },
        ratio, // example: "cinematic", "square", etc.
        numInferenceSteps: 30,
        guidanceScale: 7.5,
      },
    });

    console.log("✅ Runway response:", response);
    return res.json(response);
  } catch (error) {
    console.error("❌ Runway Error:", error);
    return res.status(500).json({ error: "Runway generation failed" });
  }
});

// Start server
app.listen(port, () => {
  console.log(`✅ Flip.ai backend running on http://localhost:${port}`);
});
