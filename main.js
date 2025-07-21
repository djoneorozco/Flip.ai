//#1: Firebase Config
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.5.2/firebase-storage.js";

//#2: Your Flip Project Firebase Settings
const firebaseConfig = {
  apiKey: "AIzaSyCRuzVdgPFZ11Le9-BtzXxNEzic6K2610Y",
  authDomain: "flip-26d24.firebaseapp.com",
  projectId: "flip-26d24",
  storageBucket: "flip-26d24.appspot.com",
  messagingSenderId: "1093213350372",
  appId: "1:1093213350372:web:9b39594ef5a4cce6acbff1"
};

//#3: Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

//#4: DOM Elements
const uploadButton = document.getElementById('uploadBtn');
const imageInput = document.getElementById('imageInput');
const preview = document.getElementById('preview');
const urlOutput = document.getElementById('downloadUrl');
const flipPlan = document.getElementById('flipPlan');
const enhancedPreview = document.getElementById('enhancedImage');

//#5: Upload to Firebase + Trigger Render Enhance
uploadButton.addEventListener('click', async () => {
  const file = imageInput.files[0];
  if (!file) return alert('Please select a file.');

  const storageRef = ref(storage, 'uploads/' + file.name);

  try {
    // Upload to Firebase
    const uploading = "Uploading to Firebase...";
    urlOutput.textContent = uploading;
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    preview.src = downloadURL;
    urlOutput.textContent = downloadURL;

    // Call Render Backend
    const plan = flipPlan.value || "Enhance image for real estate listing";
    const response = await fetch("https://flip-ai.onrender.com/enhance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imageURL: downloadURL,
        description: plan
      })
    });

    const result = await response.json();
    if (result.base64) {
      enhancedPreview.src = `data:image/png;base64,${result.base64}`;
    } else {
      alert("Enhancement failed.");
    }

  } catch (err) {
    console.error("Error:", err);
    alert("Something went wrong. Check the console.");
  }
});
