import express from 'express';
import multer from 'multer';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 10000;

// ✅ Allow only your Netlify app to hit the backend
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

// ✅ USE MEMORY STORAGE instead of writing to ./uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post('/api/enhance', upload.single('propertyImage'), (req, res) => {
  console.log('✅ Image received:', req.file?.originalname);

  const budget = req.body.budget || 0;

  // ✅ Your OWN hosted image (guaranteed to resolve)
  const enhancedImageUrl = `https://flip-ai.netlify.app/sample-placeholder.png`;
  const description = `Keep house shape & style. Add windows or minor updates based on budget tier.`;

  res.json({
    enhancedImageUrl,
    budget: Number(budget),
    description
  });
});

// ✅ Add a simple GET / route so you don't get 502
app.get('/', (req, res) => {
  res.send('✅ Flip.ai backend is live. Use POST /api/enhance instead.');
});

app.listen(port, () => {
  console.log(`✅ Flip.ai backend running on port ${port}`);
});
