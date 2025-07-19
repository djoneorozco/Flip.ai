//#1 – DOM Elements
const uploadInput = document.getElementById('imageInput');        // Match your index.html ID
const generateBtn = document.getElementById('enhanceBtn');        // Match your enhance button ID
const outputImage = document.createElement('img');                // Dynamically created output image
const loader = document.createElement('div');                     // Optional: loader UI (not shown)
const outputContainer = document.getElementById('enhancedResult');

//#2 – Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDkS2K8aLmO1cn4eF2D_5w3-N0usmodPto",
  authDomain: "orozcorealty-a7ce6.firebaseapp.com",
  projectId: "orozcorealty-a7ce6",
  storageBucket: "orozcorealty-a7ce6.appspot.com",
  messagingSenderId: "510699377586",
  appId: "1:510699377586:web:de0887b54664a8edf08aab",
  measurementId: "G-761XKT7LBN"
};

firebase.initializeApp(firebaseConfig);
const storage = firebase.storage();

//#3 – Upload to Firebase
async function uploadToFirebase(file) {
  const storageRef = storage.ref();
  const imageRef = storageRef.child(`uploads/${file.name}`);
  await imageRef.put(file);
  const downloadURL = await imageRef.getDownloadURL();
  return downloadURL;
}

//#4 – Enhance Image via Render Backend
async function enhanceImageWithRunway(imageUrl, prompt) {
  const response = await fetch('https://flip-ai.onrender.com/enhance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageUrl, prompt })
  });

  if (!response.ok) {
    throw new Error('Enhancement failed. Please try again.');
  }

  const data = await response.json();
  return data.image; // base64-encoded image string
}

//#5 – Handle Enhance Button
generateBtn.addEventListener('click', async () => {
  const file = uploadInput.files[0];
  const prompt = "Enhance this image for flip potential"; // Optional: customize or add an input box

  if (!file) {
    alert('Please upload an image.');
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
    console.error('Error:', err);
    outputContainer.innerHTML = "❌ Enhancement failed. Try again.";
  }
});
