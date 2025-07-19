// ================================
// #1 — Firebase SDK Setup
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-app.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-storage.js";

// ================================
// #2 — Your Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDkS2K8aLmO1cn4eF2D_5w3-N0usmodPto",
  authDomain: "orozcorealty-a7ce6.firebaseapp.com",
  projectId: "orozcorealty-a7ce6",
  storageBucket: "orozcorealty-a7ce6.appspot.com",
  messagingSenderId: "510699377586",
  appId: "1:510699377586:web:de0887b54664a8edf08aab",
  measurementId: "G-761XKT7LBN"
};

// ================================
// #3 — Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

// ================================
// #4 — Upload Function
async function uploadImageAndGetURL(file) {
  const fileRef = ref(storage, `uploads/${file.name}`);
  await uploadBytes(fileRef, file);
  const url = await getDownloadURL(fileRef);
  return url;
}

// ================================
// #5 — Enhance Button Listener
document.getElementById("enhance-button").addEventListener("click", async () => {
  const fileInput = document.getElementById("image-upload");
  const file = fileInput.files[0];
  const prompt = document.getElementById("flip-plan").value;

  if (!file || !prompt) {
    alert("Please upload an image and enter a flip plan.");
    return;
  }

  // Show loading state
  document.getElementById("enhance-button").disabled = true;
  document.getElementById("enhance-button").innerText = "✨ Enhancing...";

  try {
    // Upload image to Firebase
    const imageUrl = await uploadImageAndGetURL(file);

    // Send to Netlify function
    const response = await fetch("/.netlify/functions/runwayEnhance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl, prompt })
    });

    const data = await response.json();

    if (response.ok && data.image) {
      document.getElementById("result-image").src = data.image;
    } else {
      alert("Failed to generate image: " + (data.error || "Unknown error"));
      console.error("Error response:", data);
    }
  } catch (err) {
    alert("Error: " + err.message);
    console.error("Enhance Error:", err);
  } finally {
    document.getElementById("enhance-button").disabled = false;
    document.getElementById("enhance-button").innerText = "Generate Flip Preview";
  }
});
