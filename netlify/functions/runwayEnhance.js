//=========================
// #0 — Import Libraries & Init Firebase
//=========================
const fetch = require('node-fetch');
const { initializeApp, cert } = require('firebase-admin/app');
const { getStorage } = require('firebase-admin/storage');
const { v4: uuidv4 } = require('uuid');
const Busboy = require('busboy');
const fs = require('fs');
const path = require('path');
const os = require('os');

require('dotenv').config();

const firebaseApp = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
  storageBucket: process.env.FIREBASE_BUCKET_URL,
});

const bucket = getStorage().bucket();

//=========================
// #1 — Helper: Upload File to Firebase
//=========================
async function uploadToFirebase(file, filename) {
  const tempFilePath = path.join(os.tmpdir(), filename);
  await fs.promises.writeFile(tempFilePath, file);

  const firebaseFile = bucket.file(`uploads/${filename}`);
  await firebaseFile.save(file, {
    metadata: {
      contentType: 'image/jpeg',
      metadata: {
        firebaseStorageDownloadTokens: uuidv4(),
      },
    },
    public: true,
    validation: 'md5',
  });

  const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/uploads%2F${encodeURIComponent(filename)}?alt=media`;
  return publicUrl;
}

//=========================
// #2 — Netlify Handler
//=========================
exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  return new Promise((resolve, reject) => {
    const busboy = new Busboy({ headers: event.headers });
    let imageBuffer = Buffer.from([]);
    let fileName = '';
    let prompt = '';

    busboy.on('file', (fieldname, file, filename) => {
      fileName = filename;
      file.on('data', (data) => {
        imageBuffer = Buffer.concat([imageBuffer, data]);
      });
    });

    busboy.on('field', (fieldname, val) => {
      if (fieldname === 'prompt') {
        prompt = val;
      }
    });

    busboy.on('finish', async () => {
      try {
        // Step 1: Upload image to Firebase
        const imageUrl = await uploadToFirebase(imageBuffer, fileName);

        // Step 2: Call Runway API
        const runwayResponse = await fetch('https://api.runwayml.com/v1/inference/gen-4-turbo', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.RUNWAY_API_KEY}`,
          },
          body: JSON.stringify({
            input: {
              prompt,
              image_url: imageUrl,
            },
          }),
        });

        const data = await runwayResponse.json();

        if (!runwayResponse.ok) {
          return resolve({
            statusCode: 500,
            body: JSON.stringify({ error: data.error || 'Runway API call failed' }),
          });
        }

        return resolve({
          statusCode: 200,
          body: JSON.stringify(data),
        });
      } catch (error) {
        console.error('Error in enhancement pipeline:', error);
        return resolve({
          statusCode: 500,
          body: JSON.stringify({ error: error.message }),
        });
      }
    });

    busboy.end(Buffer.from(event.body, 'base64'));
  });
};
