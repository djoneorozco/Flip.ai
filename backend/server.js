require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const Jimp = require('jimp'); // ✅ correct: do not use `.default`
const Replicate = require('replicate');

const app = express();
app.use(cors());

// ✅ Root test route to confirm server works
app.get('/', (req, res) => {
  res.send("✅ Flip.ai backend is live!");
});

// Multer for file upload
const upload = multer({ storage: multer.memoryStorage() });

// Replicate client
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN
});

// Enhancement route
app.post('/api/enhance', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file uploaded." });
    }

    const image = await Jimp.read(req.file.buffer); // ✅ Fix: Jimp.read works directly
    let w = image.bitmap.width;
    let h = image.bitmap.height;

    const MAX_WIDTH = 1024, MAX_HEIGHT = 768;
    if (w > MAX_WIDTH || h > MAX_HEIGHT) {
      const aspect = w / h;
      if (w > h) {
        w = Math.min(w, MAX_WIDTH);
        h = Math.round(w / aspect);
        if (h > MAX_HEIGHT) {
          h = MAX_HEIGHT;
          w = Math.round(h * aspect);
        }
      } else {
        h = Math.min(h, MAX_HEIGHT);
        w = Math.round(h * aspect);
        if (w > MAX_WIDTH) {
          w = MAX_WIDTH;
          h = Math.round(w / aspect);
        }
      }
      w = w - (w % 8);
      h = h - (h % 8);
      await image.resize(w, h);
    }

    const mimeType = req.file.mimetype || 'image/png';
    const base64Image = (await image.getBufferAsync(mimeType)).toString('base64');
    const dataURI = `data:${mimeType};base64,${base64Image}`;

    const prompt = "A high-resolution photograph taken around midday of the same house, now with brand new clear glass windows (no boards) and a bright red front door. The house’s exterior and color remain the same apart from these improvements. The front yard now has a small landscaped lawn with green grass and a few plants, but everything else about the house is unchanged.";
    const negativePrompt = "boarded windows, broken glass, old door, people, text";

    const inputs = {
      image: dataURI,
      prompt,
      negative_prompt: negativePrompt,
      prompt_strength: 0.7,
      num_inference_steps: 30,
      guidance_scale: 7.5,
      width: w,
      height: h
    };

    const output = await replicate.run(
      "stability-ai/stable-diffusion-img2img",
      { input: inputs }
    );

    const imageUrl = Array.isArray(output) ? output[0] : output;

    return res.json({
      image: imageUrl, // ✅ matches main.js
      tier: "Tier 1"
    });

  } catch (err) {
    console.error("Enhancement error:", err);
    return res.status(500).json({ error: err.message || "Image enhancement failed." });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Flip.ai backend running on port ${PORT}`);
});
