//#1 – DOM Elements
const uploadInput = document.getElementById('imageUpload');
const promptInput = document.getElementById('flipPrompt');
const generateBtn = document.getElementById('generateBtn');
const outputImage = document.getElementById('outputImage');
const loader = document.getElementById('loader');
const outputContainer = document.getElementById('outputContainer');

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
  return data.image; // base64 image string
}

//#5 – Handle Generate Button Click
generateBtn.addEventListener('click', async () => {
  const file = uploadInput.files[0];
  const prompt = promptInput.value.trim();

  if (!file || !prompt) {
    alert('Please upload an image and enter a prompt.');
    return;
  }

  try {
    loader.style.display = 'block';
    outputContainer.style.display = 'none';

    // Upload image
    const imageUrl = await uploadToFirebase(file);

    // Call backend
    const enhancedImage = await enhanceImageWithRunway(imageUrl, prompt);

    // Show result
    outputImage.src = enhancedImage;
    outputContainer.style.display = 'block';
  } catch (err) {
    console.error('Error:', err);
    alert('Something went wrong. Check console for details.');
  } finally {
    loader.style.display = 'none';
  }
});
