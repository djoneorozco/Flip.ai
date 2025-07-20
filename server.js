//# ==========================
//# 1. Dependencies
//# ==========================
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { Readable } = require('stream');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 10000;
app.use(cors());
app.use(express.json());

const upload = multer();

//# ==========================
//# 2. Runway Enhance Route
//# ==========================
app.post('/enhance', upload.single('image'), async (req, res) => {
  try {
    const imageBuffer = req.file.buffer;
    const prompt = req.body.prompt;

    const runwayResponse = await fetch('https://api.runwayml.com/v1/generation/gen4_turbo', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RUNWAY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt,
        promptStrength: 7,
        outputQuality: "standard",
        steps: 30,
        seed: 42,
        // ✅ ✅ THIS IS THE FIX — use valid ratio format
        ratio: "1280x768",  
        promptImage: {
          uri: 'data:image/jpeg;base64,' + imageBuffer.toString('base64'),
          position: 'first'
        }
      })
    });

    const json = await runwayResponse.json();

    if (runwayResponse.ok) {
      res.json(json);
    } else {
      console.error("Runway error:", json);
      res.status(500).json({ error: "Enhancement failed. Please try again." });
    }

  } catch (err) {
    console.error("Enhancement error:", err);
    res.status(500).json({ error: "Server error during enhancement." });
  }
});

//# ==========================
//# 3. Start Server
//# ==========================
app.listen(port, () => {
  console.log(`\n==> Server listening on port ${port}`);
  console.log(`==> Your service is live 🎉`);
  console.log(`==> Available at your primary URL https://flip-ai.onrender.com`);
});
