// Tier 1 Image Enhancement Server
// Uses Express to receive an image and calls Replicate's Stable Diffusion Img2Img API to add windows, red door, landscaping.
// - Accepts an uploaded house image (multipart/form-data).
// - Converts image to Base64 data URI for the Replicate API:contentReference[oaicite:4]{index=4}.
// - Uses Stable Diffusion image-to-image with a prompt describing Tier 1 improvements.
// - Prompt strength ~0.7 to preserve original structure (0.5–0.75 is a good balance:contentReference[oaicite:5]{index=5}; 1.0 would ignore the original:contentReference[oaicite:6]{index=6}).
// - Ensures output dimensions <= 1024x768 (model limit:contentReference[oaicite:7]{index=7}) by scaling the input image if necessary.
// - Returns the URL of the enhanced image in JSON response.

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const Jimp = require('jimp').default;
const Replicate = require('replicate');

const app = express();
app.use(cors());

// Configure Multer to use memory storage (no temp file on disk)
const upload = multer({ storage: multer.memoryStorage() });

// Initialize Replicate client with API token from environment
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN  // Make sure to set this in your .env file
});

// Define the Tier 1 enhancement route (expects a file field named "image" and optional "tier")
app.post('/api/enhance', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file uploaded." });
    }
    const tier = req.body.tier || "1";  // Tier level, default to "1" if not provided
    // Load the image using Jimp from the buffer
    const image = await Jimp.read(req.file.buffer);
    let w = image.bitmap.width;
    let h = image.bitmap.height;
    // Calculate max allowed dimensions while preserving aspect ratio (max 1024x768 or 768x1024)
    const MAX_WIDTH = 1024;
    const MAX_HEIGHT = 768;
    if (w > MAX_WIDTH || h > MAX_HEIGHT) {
      // Scale down if exceeding limits
      const aspect = w / h;
      if (w > h) {
        // landscape or square image
        w = Math.min(w, MAX_WIDTH);
        h = Math.round(w / aspect);
        if (h > MAX_HEIGHT) {
          h = MAX_HEIGHT;
          w = Math.round(h * aspect);
        }
      } else {
        // portrait image
        h = Math.min(h, MAX_HEIGHT);
        w = Math.round(h * aspect);
        if (w > MAX_WIDTH) {
          w = MAX_WIDTH;
          h = Math.round(w / aspect);
        }
      }
      // Ensure dimensions are divisible by 8 (required by the model)
      w = w - (w % 8);
      h = h - (h % 8);
      await image.resize(w, h);
    }
    // Convert image to Base64 data URI for the API:contentReference[oaicite:8]{index=8}
    const mimeType = req.file.mimetype || 'image/png';  // use original mime type if available
    const base64Image = (await image.getBufferAsync(mimeType)).toString('base64');
    const dataURI = `data:${mimeType};base64,${base64Image}`;

    // Define the text prompt for Tier 1 enhancements
    const promptTier1 = 
      "A high-resolution photograph taken around midday of the same house, " +
      "now with brand new clear glass windows (no boards) and a bright red front door. " +
      "The house’s exterior and color remain the same apart from these improvements. " +
      "The front yard now has a small landscaped lawn with green grass and a few plants, " +
      "but everything else about the house is unchanged.";
    const negativePrompt = "boarded windows, broken glass, old door, people, text";  // things to avoid

    // (In future tiers, you can add conditions here to modify the prompt or settings based on tier number.)
    const prompt = promptTier1;
    // Set Stable Diffusion parameters
    const inputs = {
      image: dataURI,
      prompt: prompt,
      negative_prompt: negativePrompt,
      prompt_strength: 0.7,        // how strongly to apply the prompt (0.7 is moderate:contentReference[oaicite:9]{index=9})
      num_inference_steps: 30,     // number of diffusion steps (higher = more quality, slower)
      guidance_scale: 7.5,         // how strongly to follow prompt vs. randomness (7.5 is a good default)
      width: w || 768,             // output width (divisible by 8, <=1024)
      height: h || 576            // output height (divisible by 8, <=768)
    };

    // Run the Stable Diffusion image-to-image model on Replicate
    const output = await replicate.run(
      "stability-ai/stable-diffusion-img2img", 
      { input: inputs }
    );
    // The output is an array of image URLs (one URL since num_outputs=1)
    const imageUrl = Array.isArray(output) ? output[0] : output;
    return res.json({ image: imageUrl, tier });
  } catch (err) {
    console.error("Enhancement error:", err);
    return res.status(500).json({ error: err.message || "Image enhancement failed." });
  }
});

// Start the server on the given PORT
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server is running and listening on port ${PORT}`);
});
