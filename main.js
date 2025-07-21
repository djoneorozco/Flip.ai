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

//#3: Listen for file input and upload
const fileInput = document.getElementById("imageUpload");
const uploadStatus = document.getElementById("uploadStatus");
const preview = document.getElementById("previewImage");

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

    console.log("Public Firebase URL:", url);
    // Store this URL for Runway API in next step
    window.imageURL = url;

  } catch (err) {
    console.error("Upload failed:", err);
    uploadStatus.textContent = "❌ Upload failed. See console.";
  }
});
