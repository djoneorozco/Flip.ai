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
      // Allow requests with no origin like Postman or curl
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

// ✅ Your file upload logic stays the same...
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, './uploads'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const upload = multer({ storage });

app.post('/api/enhance', upload.single('propertyImage'), (req, res) => {
  console.log('✅ Image received:', req.file?.originalname);

  const budget = req.body.budget || 0;

  const enhancedImageUrl = `https://placehold.co/600x400?text=Enhanced+Image`;
  const description = `Keep house shape & style. Add windows or minor updates based on budget tier.`;

  res.json({
    enhancedImageUrl,
    budget: Number(budget),
    description
  });
});

app.listen(port, () => {
  console.log(`✅ Flip.ai backend running on port ${port}`);
});
