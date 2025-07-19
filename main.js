// #1 Firebase Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// #2 Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDkS2K8aLmO1cn4eF2D_5w3-N0usmodPto",
  authDomain: "orozcorealty-a7ce6.firebaseapp.com",
  projectId: "orozcorealty-a7ce6",
  storageBucket: "orozcorealty-a7ce6.appspot.com",
  messagingSenderId: "510699377586",
  appId: "1:510699377586:web:de0887b54664a8edf08aab"
};

// #3 Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

// #4 Selectors
const form = document.getElementById("enhanceForm");
const loader = document.getElementById("loader");
const outputImage = document.getElementById("outputImage");

// #5 Form Submission
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  loader.style.display = "block";
  outputImage.style.display = "none";
  outputImage.src = "";

  const imageFile = document.getElementById("imageUpload").files[0];
  const flipPlan = document.getElementById("flipPlan").value;

  try {
    // #6 Upload Image to Firebase
    const imageRef = ref(storage, `uploads/${imageFile.name}`);
    await uploadBytes(imageRef, imageFile);
    const imageURL = await getDownloadURL(imageRef);

    // #7 Send to Runway via Netlify Function
    const response = await fetch("/.netlify/functions/runwayEnhance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ flipPlan, imageURL })
    });

    const result = await response.json();

    if (response.ok && result?.base64) {
      outputImage.src = `data:image/jpeg;base64,${result.base64}`;
      outputImage.style.display = "block";
    } else {
      throw new Error(result.error || "Image generation failed");
    }
  } catch (err) {
    alert("❌ Error: " + err.message);
    console.error(err);
  }

  loader.style.display = "none";
});
