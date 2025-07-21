//#1: Firebase Config
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.5.2/firebase-storage.js";

//#2: Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCRuzVdgPFZ11Le9-BtzXxNEzic6K2610Y",
  authDomain: "flip-26d24.firebaseapp.com",
  projectId: "flip-26d24",
  storageBucket: "flip-26d24.appspot.com",
  messagingSenderId: "1093213350372",
  appId: "1:1093213350372:web:9b39594ef5a4cce6acbff1",
  measurementId: "G-GS51GRBJ43"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

//#3: DOM Elements
const fileInput = document.getElementById("imageUpload");
const uploadStatus = document.getElementById("uploadStatus");
const preview = document.getElementById("previewImage");
const generateBtn = document.getElementById("generateBtn");
const flipPlanInput = document.getElementById("flipPlan");
const resultImage = document.getElementById("resultImage");
const enhanceStatus = document.getElementById("enhanceStatus");

//#4: Upload to Firebase
fileInput.addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  try {
    uploadStatus.textContent = "Uploading to Firebase...";
    const storageRef = ref(storage, `uploads/${file.name}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);

    uploadStatus.textContent = "✅ Uploaded! Public URL ready.";
    preview.src = url;
    preview.style.display = "block";
    window.imageURL = url;

    console.log("Public Firebase URL:", url);
  } catch (err) {
    console.error("Upload failed:", err);
    uploadStatus.textContent = "❌ Upload failed. See console.";
  }
});

//#5: Enhance with Runway API
generateBtn.addEventListener("click", async () => {
  const prompt = flipPlanInput.value;
  const imageURL = window.imageURL;
  const ratio = "square"; // You can let users choose later

  if (!prompt || !imageURL) {
    alert("Please upload an image and enter a flip plan.");
    return;
  }

  try {
    enhanceStatus.textContent = "⏳ Enhancing with AI...";
    const response = await fetch("https://flip-ai.onrender.com/enhance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt, imageURL, ratio })
    });

    const data = await response.json();

    if (data.result && data.result.image) {
      resultImage.src = data.result.image;
      resultImage.style.display = "block";
      enhanceStatus.textContent = "✅ Enhancement complete!";
    } else {
      console.error("No image returned:", data);
      enhanceStatus.textContent = "❌ Failed to enhance. Check logs.";
    }
  } catch (error) {
    console.error("Error during enhancement:", error);
    enhanceStatus.textContent = "❌ Enhancement error. See console.";
  }
});
