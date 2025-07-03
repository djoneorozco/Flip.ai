// =========================================
// ✅ Flip.ai Server – Robust Static Layout
// =========================================

const express = require('express');
const cors = require('cors');
const fs = require('fs');
require('dotenv').config();
const OpenAI = require("openai");

const app = express();
app.use(express.json());

// ✅ Serve static files from frontend
app.use(express.static('frontend'));

// ✅ Allow CORS from Netlify etc.
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://flip-ai.netlify.app',
    'https://www.flip-ai.netlify.app'
  ]
}));

// ✅ Example Health Check
app.get('/api/test', (req, res) => {
  res.json({ message: "✅ Backend test successful!" });
});

// ✅ Example POST route (your enhancement logic)
app.post('/api/enhance', (req, res) => {
  // Your OpenAI logic here
  res.json({ message: "Enhance route works!" });
});

// ✅ Start server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Flip.ai backend running on port ${PORT}`);
});
