// ===================================
// # server.js — Flip.ai Final Fix ✅
// ===================================

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { createClient } = require("@runwayml/sdk");

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ✅ CORRECT USAGE FOR RUNWAY SDK V2
const client = createClient({ apiKey: process.env.RUNWAY_API_KEY });

app.post("/enhance", async (req, res) => {
  const { prompt, imageURL, ratio } = req.body;

  if (!prompt || !imageURL || !ratio) {
    return res.status(400).json({ error: "Missing inputs" });
  }

  try {
    const result = await client.run({
      model: "gen-2", // Use "gen-4" or "gen-1" if enabled
      input: {
        prompt,
        image: imageURL,
        ratio: ratio
      }
    });

    res.json({ image: result });
  } catch (err) {
    console.error("❌ Runway Error:", err);
    res.status(500).json({
      error: "Runway generation failed",
      details: err.message || err.toString()
    });
  }
});

app.listen(port, () => {
  console.log(`🔥 Flip.ai backend running on http://localhost:${port}`);
});
