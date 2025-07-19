//#1 Initialize Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyDkS2K8aLmO1cn4eF2D_5w3-N0usmodPto",
  authDomain: "orozcorealty-a7ce6.firebaseapp.com",
  projectId: "orozcorealty-a7ce6",
  storageBucket: "orozcorealty-a7ce6.appspot.com",
  messagingSenderId: "510699377586",
  appId: "1:510699377586:web:de0887b54664a8edf08aab"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

//#2 Image Upload Handler
document.getElementById("generateBtn").addEventListener("click", async () => {
  const imageInput = document.getElementById("imageInput");
  const flipPlan = document.getElementById("flipPlan").value.trim();

  if (!imageInput.files[0] || !flipPlan) {
    alert("Upload an image and enter a flip plan first.");
    return;
  }

  const file = imageInput.files[0];
  const storageRef = ref(storage, `uploads/${file.name}`);

  try {
    const snapshot = await uploadBytes(storageRef, file);
    const imageUrl = await getDownloadURL(snapshot.ref);

    console.log("Image uploaded. URL:", imageUrl);

    //#3 Send to Netlify Function
    const response = await fetch("/.netlify/functions/runwayEnhance", {
      method: "POST",
      body: JSON.stringify({
        prompt: flipPlan,
        image_url: imageUrl
      })
    });

    const data = await response.json();
    if (data.image_base64) {
      const resultImage = document.getElementById("resultImage");
      resultImage.src = `data:image/png;base64,${data.image_base64}`;
    } else {
      alert("Error: " + JSON.stringify(data));
    }
  } catch (err) {
    console.error("Upload or API error:", err);
    alert("Something went wrong: " + err.message);
  }
});
