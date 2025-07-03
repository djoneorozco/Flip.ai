// ============================================================
// ✅ Flip.ai Backend – Smart Vision + DALL·E 3 Enhancer (No Mask)
// ============================================================

const fs = require('fs');
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const OpenAI = require("openai");
const multer = require('multer');

// ✅ Init OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const app = express();

// ✅ Upload Dir for Render or local dev
const uploadDir = '/tmp/uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("✅ Created upload directory:", uploadDir);
}

// ✅ Multer Storage for Single Upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// ✅ Middleware
app.use(express.json());
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://flip-ai.netlify.app',
    'https://www.flip-ai.netlify.app'
  ]
}));

// ============================================================
// #1 Health Check
// ============================================================
app.get('/', (req, res) => {
  res.send('✅ Flip.AI backend is alive!');
});

app.get('/api/test', (req, res) => {
  res.json({ message: "✅ Backend test successful!" });
});

// ============================================================
// #2 Ask Route (No change)
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
You are a clear, professional real estate flip advisor.
Always provide:
- After Repair Value (ARV)
- 70% Rule estimate for max offer
- Simple explanation
- Quick investor tip
- End with: "Happy Flipping! 🚀"
Format numbers with dollar signs & commas.
          `.trim()
        },
        {
          role: "user",
          content: `
Current Property Value: $${Number(value).toLocaleString()}
Planned Investment: $${Number(investment).toLocaleString()}
Please calculate ARV, 70% Rule, and professional advice.
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
    console.error("❌ AI error:", err);
    res.status(500).json({ error: "OpenAI request failed" });
  }
});

// ============================================================
// #3 ENHANCE – Vision Reasoning + Smart DALL·E 3 Prompt
// ============================================================
app.post('/api/enhance', upload.single('image'), async (req, res) => {
  console.log("🖼️ Received image for enhancement!");

  const imageFile = req.file;
  const budget = parseFloat(req.body.investment || 0);

  if (!imageFile) {
    console.error("❌ No file uploaded");
    return res.status(400).json({ error: "No file uploaded" });
  }

  console.log("✅ Investment amount received:", budget);

  // Step 1: Convert image to base64
  const imageData = fs.readFileSync(imageFile.path).toString('base64');
  const dataURL = `data:image/png;base64,${imageData}`;

  // Step 2: Determine Tier
  let tier = "Basic";
  if (budget < 10000) tier = "Basic";
  else if (budget < 50000) tier = "Moderate";
  else tier = "Upscale";

  console.log("🏷️ Tier:", tier);

  // Step 3: GPT-4 Vision for reasoning + DALL·E prompt
  const completion = await openai.chat.completions.create({
    model: "gpt-4o", // or "gpt-4-vision-preview"
    messages: [
      {
        role: "system",
        content: `
You are a smart real estate renovation assistant.
You analyze property photos and create a perfect DALL·E 3 prompt for realistic upgrades.
Keep the same house shape, color, roofline, angle.
Replace boarded windows and doors based on the budget tier.
Do NOT add landscaping or change the environment.
Output ONLY a single clear DALL·E prompt.
        `.trim()
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `This is the property photo. Tier: ${tier}.
Provide a DALL·E 3 prompt that keeps the house identical but upgrades boarded windows and doors to match the tier.`
          },
          {
            type: "image_url",
            image_url: {
              url: dataURL
            }
          }
        ]
      }
    ]
  });

  const dallePrompt = completion.choices[0].message.content;
  console.log("✨ DALL·E Prompt:", dallePrompt);

  // Step 4: DALL·E 3 to generate new image
  const dalleResponse = await openai.images.generate({
    model: "dall-e-3",
    prompt: dallePrompt,
    n: 1,
    size: "1024x1024"
  });

  console.log("✅ Enhanced Image URL:", dalleResponse.data[0].url);

  res.json({
    enhancedImageUrl: dalleResponse.data[0].url,
    budget: budget,
    tier: tier,
    dallePrompt: dallePrompt
  });
});

// ============================================================
// #4 START SERVER
// ============================================================
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`🚀 Flip backend running on port ${PORT}`);
});
