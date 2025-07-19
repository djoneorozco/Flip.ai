// ==========================
// # firebaseUpload.js
// ==========================

const admin = require("firebase-admin");
const { v4: uuidv4 } = require("uuid");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

const bucket = admin.storage().bucket();

async function uploadImageToFirebase(buffer, filename) {
  const file = bucket.file(`uploads/${filename}`);
  const uuid = uuidv4();

  await file.save(buffer, {
    metadata: {
      contentType: "image/jpeg",
      metadata: {
        firebaseStorageDownloadTokens: uuid,
      },
    },
  });

  const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/uploads%2F${encodeURIComponent(filename)}?alt=media&token=${uuid}`;
  return publicUrl;
}

module.exports = { uploadImageToFirebase };
