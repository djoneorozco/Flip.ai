// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post("/enhance", async (req, res) => {
  const { imageURL, description } = req.body;

  if (!imageURL) {
    return res.status(400).json({ error: "Missing imageURL." });
  }

  try {
    const response = await fetch("https://api.runwayml.com/v2/production/models/gen-4/images", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.RUNWAY_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        input: {
          image: imageURL,
          prompt: description || "Enhance real estate photo",
        }
      })
    });

    const data = await response.json();
    const enhancedImageBase64 = data?.outputs?.[0]?.image_base64;

    if (enhancedImageBase64) {
      res.json({ base64: enhancedImageBase64 });
    } else {
      res.status(500).json({ error: "Enhancement failed." });
    }

  } catch (err) {
    console.error("Server Error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
