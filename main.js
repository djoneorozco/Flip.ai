//#1 – DOM Elements
const uploadInput = document.getElementById('imageInput');
const generateBtn = document.getElementById('enhanceBtn');
const outputImage = document.createElement('img');
const loader = document.createElement('div');
const outputContainer = document.getElementById('enhancedResult');

//#2 – Firebase Config (Updated to flip-26d24)
if (!firebase.apps.length) {
  const firebaseConfig = {
    apiKey: "AIzaSyD9VmWrU0ZVy0Lb8rxYV58SmEUxF1z4HHI", // replace if needed
    authDomain: "flip-26d24.firebaseapp.com",
    projectId: "flip-26d24",
    storageBucket: "flip-26d24.firebasestorage.app", // ✅ FIXED HERE
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
  };
  firebase.initializeApp(firebaseConfig);
}
const storage = firebase.storage();

//#3 – Upload to Firebase Storage
async function uploadToFirebase(file) {
  try {
    const storageRef = storage.ref();
    const imageRef = storageRef.child(`uploads/${file.name}`);
    await imageRef.put(file);
    const downloadURL = await imageRef.getDownloadURL();
    return downloadURL;
  } catch (error) {
    console.error("❌ Firebase upload error:", error);
    throw new Error("Image upload failed.");
  }
}

//#4 – Enhance Image via Render Backend
async function enhanceImageWithRunway(imageUrl, prompt) {
  try {
    const response = await fetch('https://flip-ai.onrender.com/enhance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl, prompt })
    });

    if (!response.ok) throw new Error('Enhancement failed. Please try again.');
    const data = await response.json();
    return data.image;
  } catch (error) {
    console.error("❌ Enhancement error:", error);
    throw new Error("AI enhancement failed.");
  }
}

//#5 – Handle Button Click
generateBtn.addEventListener('click', async () => {
  const file = uploadInput.files[0];
  const prompt = "Enhance this image for flip potential";

  if (!file) {
    alert('📂 Please upload an image first.');
    return;
  }

  try {
    outputContainer.innerHTML = "⏳ Enhancing image... please wait.";
    outputContainer.style.display = 'block';

    const imageUrl = await uploadToFirebase(file);
    const enhancedImage = await enhanceImageWithRunway(imageUrl, prompt);

    outputImage.src = enhancedImage;
    outputImage.style.maxWidth = "100%";
    outputImage.style.border = "1px solid #666";

    outputContainer.innerHTML = "<p><strong>Enhanced Image:</strong></p>";
    outputContainer.appendChild(outputImage);
  } catch (err) {
    outputContainer.innerHTML = "❌ Enhancement failed. Try again.";
  }
});
