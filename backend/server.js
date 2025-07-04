// ✅ Flip.ai MIDDLE-MAN SERVER.JS — Real file upload + return stored URL

import express from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// ✅ Fix __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 10000;

// ✅ CORS — only allow your frontend
const allowedOrigins = ['https://flip-ai.netlify.app'];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error('CORS policy: Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// ✅ Store uploads locally (or switch to S3 later)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, './uploads'),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({ storage });

// ✅ Serve uploaded files statically — now works!
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ POST /api/enhance — MIDDLE-MAN FLOW
app.post('/api/enhance', upload.single('propertyImage'), (req, res) => {
  console.log('✅ Image received:', req.file?.originalname);

  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded.' });
  }

  const budget = req.body.budget || 0;

  // ✅ Real URL to your saved file
  const uploadedImageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

  // ✅ Log — here’s where your manual team or next pipeline would pick it up
  console.log('✅ Stored image at:', uploadedImageUrl);

  // ✅ Response
  res.json({
    uploadedImageUrl,
    budget: Number(budget),
    description: `Real uploaded photo stored. Ready for manual or advanced pipeline enhancement.`,
  });
});

// ✅ Health check
app.get('/', (req, res) => {
  res.send('✅ Flip.ai middle-man backend is LIVE — real upload, real file URL, no fake AI.');
});

app.listen(port, () => {
  console.log(`✅ Flip.ai backend running on port ${port}`);
});
