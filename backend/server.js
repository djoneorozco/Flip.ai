// ============================================================
// ✅ Flip.ai Backend – Smart Budget Enhancer w/ Real DALL·E Edit
// ============================================================

const fs = require('fs');
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const OpenAI = require("openai");
const multer = require('multer');

// ✅ Init OpenAI with API Key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const app = express();

// ✅ Ensure /tmp/uploads exists (Render ephemeral FS)
const uploadDir = '/tmp/uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("✅ Created upload directory:", uploadDir);
} else {
  console.log("✅ Upload directory exists:", uploadDir);
}

// ✅ Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

app.use(express.json());
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://flip-ai.netlify.app',
    'https://www.flip-ai.netlify.app'
  ]
}));

// ============================================================
// ✅ Health Check
// ============================================================
app.get('/', (req, res) => {
  res.send('✅ Flip.AI backend is alive!');
});

// ============================================================
// ✅ Ask Route (unchanged example)
// ============================================================
app.post('/api/ask', async (req, res) => {
  const { value, investment } = req.body;

  if (!value || !investment) {
    return res.status(400).json({ error: "Missing value or investment amount" });
  }

  const arv = Number(value) + Number(investment);
  const maxOffer = arv * 0.7;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `
You are a professional real estate flip advisor.
Always provide:
- After Repair Value (ARV)
- 70% Rule estimate for max offer
- Short explanation
- Quick investor tip
End with: "Happy Flipping! 🚀"
Use bullet points and format numbers.
          `.trim()
        },
        {
          role: "user",
          content: `
Property Value: $${Number(value).toLocaleString()}
Planned Investment: $${Number(investment).toLocaleString()}
Please calculate ARV, 70% Rule, and advice.
          `.trim()
        }
      ],
    });

    res.json({
      answer: completion.choices[0].message.content,
      arv: `$${arv.toLocaleString()}`,
      maxOffer: `$${maxOffer.toLocaleString()}`
    });

  } catch (err) {
    console.error("❌ Ask error:", err);
    res.status(500).json({ error: "OpenAI request failed" });
  }
});

// ============================================================
// ✅ ENHANCE IMAGE ROUTE — DALL·E EDIT VERSION (WITH MASK)
// ============================================================
app.post('/api/enhance', upload.fields([{ name: 'image' }, { name: 'mask' }]), async (req, res) => {
  console.log("🖼️ Received image + mask for enhancement!");

  if (!req.files || !req.files.image || !req.files.mask) {
    console.error("❌ Both image and mask are required");
    return res.status(400).json({ error: "Both image and mask files are required" });
  }

  const imagePath = req.files.image[0].path;
  const maskPath = req.files.mask[0].path;

  console.log("✅ Uploaded image path:", imagePath);
  console.log("✅ Uploaded mask path:", maskPath);

  try {
    const dalleResponse = await openai.images.createEdit({
      model: "dall-e-2",
      image: fs.createReadStream(imagePath),
      mask: fs.createReadStream(maskPath),
      prompt: "Replace boarded windows with real glass windows that match the house’s style. Do not change anything else — preserve the grass, yard, sidewalk, siding, roof, paint, trees, and lighting exactly the same. Keep the slightly weathered, realistic look.",
      n: 1,
      size: "1024x1024",
    });

    console.log("✅ DALL·E edit generated:", dalleResponse.data[0].url);

    res.json({ enhancedImageUrl: dalleResponse.data[0].url });

  } catch (err) {
    console.error("❌ Enhance error:", err.response ? err.response.data : err);
    res.status(500).json({ error: "Failed to enhance image", details: err.message });
  } finally {
    // ✅ Clean up uploaded files on ephemeral FS
    fs.unlink(imagePath, () => {});
    fs.unlink(maskPath, () => {});
  }
});

// ============================================================
// ✅ Start Server
// ============================================================
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`🚀 Flip backend running on port ${PORT}`);
});
