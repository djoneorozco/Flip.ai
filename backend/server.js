// ✅ Load environment variables
require('dotenv').config();

// ✅ Import required modules
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const Jimp = require('jimp').default; // ✅ THIS IS THE FIX — use `.default`!
const Replicate = require('replicate');

// ✅ Initialize Express app
const app = express();
app.use(cors());

// ✅ Simple root route for sanity check
app.get('/', (req, res) => {
  console.log("✅ Received GET request at /"); // <-- NEW console.log for debug
  res.send("✅ Flip.ai backend is live!");
});

// ✅ Multer config: store uploaded image in memory
const upload = multer({ storage: multer.memoryStorage() });

// ✅ Initialize Replicate with your token
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN
});

// ✅ Main enhancement route
app.post('/api/enhance', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file uploaded." });
    }

    // ✅ Read image with Jimp
    const image = await Jimp.read(req.file.buffer);

    let w = image.bitmap.width;
    let h = image.bitmap.height;

    const MAX_WIDTH = 1024, MAX_HEIGHT = 768;

    // ✅ Resize while preserving aspect ratio & model limits
    if (w > MAX_WIDTH || h > MAX_HEIGHT) {
      const aspect = w / h;
      if (w > h) {
        w = Math.min(w, MAX_WIDTH);
        h = Math.round(w / aspect);
      } else {
        h = Math.min(h, MAX_HEIGHT);
        w = Math.round(h * aspect);
      }
      w -= w % 8;
      h -= h % 8;
      await image.resize(w, h);
    }

    // ✅ Convert image to Base64 Data URI
    const base64Image = (await image.getBufferAsync(Jimp.MIME_PNG)).toString('base64');
    const dataURI = `data:image/png;base64,${base64Image}`;

    // ✅ Tier 1 prompt
    const prompt = "A high-resolution photograph taken around midday of the same house, now with brand new clear glass windows (no boards) and a bright red front door. The house’s exterior and color remain the same apart from these improvements. The front yard now has a small landscaped lawn with green grass and a few plants, but everything else about the house is unchanged.";
    const negativePrompt = "boarded windows, broken glass, old door, people, text";

    // ✅ Replicate input
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

    // ✅ Call Replicate
    const output = await replicate.run(
      "stability-ai/stable-diffusion-img2img",
      { input: inputs }
    );

    const imageUrl = Array.isArray(output) ? output[0] : output;

    // ✅ Return JSON response
    return res.json({
      image: imageUrl,
      tier: "Tier 1",
      promptUsed: prompt // optional for debug
    });

  } catch (err) {
    console.error("Enhancement error:", err);
    return res.status(500).json({ error: err.message || "Image enhancement failed." });
  }
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Flip.ai backend running on port ${PORT}`);
});
