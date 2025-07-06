// ==========================================
// ✅ Flip.ai Minimal Server — TEST ONLY
// ==========================================
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const Replicate = require('replicate');

const app = express();
app.use(cors());

// ✅ Simple GET root to check
app.get('/', (req, res) => {
  console.log("✅ GET / hit");
  res.send("✅ Flip.ai TEST server is live!");
});

// ✅ Replicate client
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN
});

// ✅ Test enhancement route — no file upload
app.get('/api/enhance-test', async (req, res) => {
  console.log("✅ /api/enhance-test called");

  try {
    // 🏡 Use a fixed test image
    const testImageUrl = "https://upload.wikimedia.org/wikipedia/commons/6/6e/Golde33443.jpg"; // Replace with any public image

    // ✅ Prompt: Tier 1
    const prompt = "A high-resolution photo of the same house with brand new clear glass windows and a bright red front door. The yard has green grass and some bushes. Everything else stays the same.";
    const negativePrompt = "boarded windows, broken glass, old door, people, text";

    // ✅ Replicate input
    const inputs = {
      image: testImageUrl, // Direct URL!
      prompt,
      negative_prompt: negativePrompt,
      prompt_strength: 0.7,
      num_inference_steps: 30,
      guidance_scale: 7.5,
      width: 768,
      height: 512
    };

    // ✅ Run Stable Diffusion
    const output = await replicate.run(
      "stability-ai/stable-diffusion-img2img",
      { input: inputs }
    );

    const imageUrl = Array.isArray(output) ? output[0] : output;

    console.log("✅ Enhanced image:", imageUrl);

    res.json({
      enhancedImageUrl: imageUrl,
      tier: "Tier 1",
      promptUsed: prompt
    });

  } catch (err) {
    console.error("❌ Enhancement error:", err);
    res.status(500).json({ error: err.message || "Image enhancement failed" });
  }
});

// ✅ Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`✅ Flip.ai TEST server running on port ${PORT}`);
});
