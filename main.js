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

//#4: Upload Logic
const uploadButton = document.getElementById('uploadBtn');
const imageInput = document.getElementById('imageInput');
const preview = document.getElementById('preview');
const urlOutput = document.getElementById('downloadUrl');

uploadButton.addEventListener('click', async () => {
  const file = imageInput.files[0];

  if (!file) {
    alert('Please select a file first.');
    return;
  }

  const storageRef = ref(storage, 'uploads/' + file.name);

  try {
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    preview.src = downloadURL;
    urlOutput.textContent = downloadURL;
  } catch (err) {
    console.error("Upload failed:", err);
    alert("Upload failed. Check console for details.");
  }
});
