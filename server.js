// ==============================
// # server.js — Flip.ai Backend
// ==============================

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { createClient } = require("@runwayml/sdk");

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const client = createClient({ apiKey: process.env.RUNWAY_API_KEY });

app.post("/enhance", async (req, res) => {
  const { prompt, imageURL, ratio } = req.body;

  if (!prompt || !imageURL || !ratio) {
    return res.status(400).json({ error: "Missing inputs" });
  }

  try {
    const result = await client.run({
      model: "gen-2", // or "gen-1", or "gen-4", depending on access
      input: {
        prompt,
        image: imageURL,
        ratio
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
