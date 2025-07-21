//#1: Firebase Config (MODULAR SDK)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.5.2/firebase-storage.js";

//#2: Initialize Firebase App + Storage
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

//#3: Upload Logic for Image File
const fileInput = document.getElementById("imageInput");        // 🔄 Updated ID to match your form
const uploadStatus = document.createElement("p");
const preview = document.createElement("img");
preview.style.display = "none";
preview.style.maxWidth = "300px";
preview.style.marginTop = "20px";

// Attach elements below input field
fileInput.parentNode.appendChild(uploadStatus);
fileInput.parentNode.appendChild(preview);

//#4: File Upload Handler
fileInput.addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  try {
    uploadStatus.textContent = "⏳ Uploading image to Firebase...";
    const storageRef = ref(storage, `uploads/${file.name}`);
    await uploadBytes(storageRef, file);

    const url = await getDownloadURL(storageRef);
    uploadStatus.textContent = "✅ Image uploaded! URL is ready.";
    preview.src = url;
    preview.style.display = "block";

    console.log("🟢 Firebase Public URL:", url);

    // 🌟 Make globally available for Runway generation
    window.firebaseImageURL = url;

  } catch (error) {
    console.error("❌ Firebase upload failed:", error);
    uploadStatus.textContent = "❌ Upload failed. Check console for details.";
  }
});
