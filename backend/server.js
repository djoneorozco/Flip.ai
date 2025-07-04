// ✅ server.js — Flip.ai backend only

import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 10000;

// ✅ Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('frontend')); // Serve index.html & main.js

// ✅ Ensure uploads dir exists
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ Setup Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// ✅ Enhance endpoint
app.post('/api/enhance', upload.single('propertyImage'), async (req, res) => {
  try {
    const { propertyValue, investmentAmount, details, zip } = req.body;
    const file = req.file;

    console.log('📸 Received file:', file?.path);
    console.log('💰 Property Value:', propertyValue);
    console.log('💸 Investment Amount:', investmentAmount);

    // Basic tier logic
    const budget = parseInt(investmentAmount) || 5000;
    let tier = 'Basic upgrades';

    if (budget > 5000 && budget <= 20000) {
      tier = 'Low Tier: minor fixes, windows, simple landscaping';
    } else if (budget > 20000) {
      tier = 'Moderate upgrades';
    }

    // 🔑 Use your DALL·E call here — for now placeholder:
    const enhancedImageUrl = `https://placehold.co/600x400?text=Enhanced+Image`;

    res.json({ enhancedImageUrl, budget, tier });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server failed to enhance image.' });
  }
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`✅ Flip.ai backend running on port ${PORT}`);
});
