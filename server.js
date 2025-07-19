// ================================
// # Imports and Setup
// ================================

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const Runway = require("@runwayml/sdk");

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// ================================
// # Middleware
// ================================

app.use(cors());
app.use(bodyParser.json({ limit: "25mb" }));
app.use(bodyParser.urlencoded({ extended: true }));

// ================================
// # POST /enhance-image
// ================================

app.post("/enhance-image", async (req, res) => {
  const { prompt, imageUrl, imageBase64 } = req.body;

  if (!prompt || (!imageUrl && !imageBase64)) {
    return res.status(400).json({ error: "Missing prompt or image input." });
  }

  // Determine input format
  let referenceUrl;
  if (imageUrl) {
    referenceUrl = imageUrl;
  } else {
    referenceUrl = imageBase64; // Should already be formatted as data URI
  }

  const client = new Runway({
    apiKey: process.env.RUNWAY_API_KEY,
  });

  try {
    const result = await client.images.generate({
      model: "gen-4",
      prompt: prompt,
      prompt_image: referenceUrl,
    });

    const output = result?.outputs?.[0];

    if (!output) {
      throw new Error("No image output returned.");
    }

    res.status(200).json({ image: output });
  } catch (error) {
    console.error("Runway API Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// ================================
// # Start Server
// ================================

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
