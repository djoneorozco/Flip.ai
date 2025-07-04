// ✅ server.js — FULL FILE

import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ CORS setup (adjust origin as needed for Netlify frontend)
app.use(
  cors({
    origin: 'https://flip-ai.netlify.app', // Replace with your real Netlify domain
    methods: ['GET', 'POST'],
  })
);

app.use(express.json());

// ✅ Safe uploads folder creation
const uploadsDir = path.join(process.cwd(), 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log(`✅ Created uploads folder: ${uploadsDir}`);
} else {
  console.log(`✅ Uploads folder already exists: ${uploadsDir}`);
}

// ✅ Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// ✅ Health check
app.get('/', (req, res) => {
  res.send('✅ Flip.ai backend is running!');
});

// ✅ Enhance endpoint
app.post('/api/enhance', upload.single('propertyImage'), (req, res) => {
  try {
    const file = req.file;
    const { propertyValue, investmentAmount, details } = req.body;

    console.log('✅ Received file:', file?.path);
    console.log('✅ Property Value:', propertyValue);
    console.log('✅ Investment Amount:', investmentAmount);
    console.log('✅ Details:', details);

    // 🔥 Placeholder: generate variation data
    const placeholderEnhancedImageUrl = `https://placehold.co/600x400?text=Enhanced+Image`;
    const tier = investmentAmount < 10000 ? 'Minor Fixes' : 'Moderate upgrades';

    res.json({
      enhancedImageUrl: placeholderEnhancedImageUrl,
      budget: investmentAmount,
      tier: tier,
      description: `Keep house shape & style. Add windows and slight landscape based on budget tier: ${tier}.`,
    });
  } catch (error) {
    console.error('❌ Enhance Error:', error);
    res.status(500).json({ error: 'Enhance failed.' });
  }
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`✅ Flip.ai backend server running on port ${PORT}`);
});
