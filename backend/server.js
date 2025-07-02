const express = require('express');
const app = express();

// ✅ Using Multer with /tmp/uploads for Render compatibility
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '/tmp/uploads'); // /tmp is writable on Render
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

app.use(express.json());

// ============================================================
// #7 ENHANCE IMAGE ROUTE (DALL·E VARIATION EXAMPLE)
// ============================================================
app.post('/api/enhance', upload.single('image'), async (req, res) => {
  console.log("🖼️ Received image for enhancement!");

  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    console.log("✅ File buffer length:", req.file.buffer.length);

    const dalleResponse = await openai.images.createVariation({
      image: req.file.buffer,
      n: 1,
      size: "1024x1024",
    });

    console.log("✅ DALL·E variation generated:", dalleResponse.data[0].url);

    res.json({ enhancedImageUrl: dalleResponse.data[0].url });

  } catch (err) {
    console.error("❌ Enhance error:", err);
    res.status(500).json({ error: "Failed to enhance image" });
  }
});

app.get('/', (req, res) => {
  res.send('✅ Flip.AI backend is alive!');
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`🚀 Flip backend running on port ${PORT}`);
});