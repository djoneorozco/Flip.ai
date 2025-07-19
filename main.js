<<<<<<< HEAD
const fetch = require('node-fetch');

exports.handler = async function(event) {
  try {
    const { flipPlan } = event.queryStringParameters;
    const imageBase64 = event.body;

    const res = await fetch("https://api.runwayml.com/v1/inferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.RUNWAY_API_KEY}`,
      },
      body: JSON.stringify({
        input: {
          prompt: flipPlan,
          image: imageBase64
        },
        model: "gen-2.5-image-to-image"
      })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.error?.message || "Runway API call failed.");
    }

    if (!data || !data.output || !data.output.image) {
      console.error("Unexpected response from Runway:", data);
      throw new Error("Runway did not return a valid image.");
    }

    const imageRes = await fetch(data.output.image);
    const imageBuffer = await imageRes.arrayBuffer();

    return {
      statusCode: 200,
      headers: { "Content-Type": "image/jpeg" },
      body: Buffer.from(imageBuffer).toString('base64'),
      isBase64Encoded: true
    };
  } catch (error) {
    console.error("Runway Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
=======
// #1 — Firebase config
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-app.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-storage.js";

// #2 — Your Firebase project info
const firebaseConfig = {
  apiKey: "AIzaSyDkS2K8aLmO1cn4eF2D_5w3-N0usmodPto",
  authDomain: "orozcorealty-a7ce6.firebaseapp.com",
  projectId: "orozcorealty-a7ce6",
  storageBucket: "orozcorealty-a7ce6.appspot.com",
  messagingSenderId: "510699377586",
  appId: "1:510699377586:web:de0887b54664a8edf08aab",
  measurementId: "G-761XKT7LBN"
};

// #3 — Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

// #4 — Upload to Firebase
async function uploadImageAndGetURL(file) {
  const fileRef = ref(storage, `uploads/${file.name}`);
  await uploadBytes(fileRef, file);
  const url = await getDownloadURL(fileRef);
  return url;
}

// #5 — Hook to your form
document.getElementById("enhance-button").addEventListener("click", async () => {
  const fileInput = document.getElementById("image-upload");
  const file = fileInput.files[0];
  const prompt = document.getElementById("flip-plan").value;

  if (!file || !prompt) {
    alert("Please upload an image and enter a flip plan.");
    return;
  }

  // Upload image to Firebase and get URL
  const imageUrl = await uploadImageAndGetURL(file);

  // Send to Netlify function (Runway integration)
  const response = await fetch("/.netlify/functions/runwayEnhance", {
    method: "POST",
    body: JSON.stringify({
      imageUrl: imageUrl,
      prompt: prompt
    }),
    headers: {
      "Content-Type": "application/json"
    }
  });

  const data = await response.json();
  const resultImage = document.getElementById("result-image");
  resultImage.src = data.image || "";
});
>>>>>>> 5e3bb9a1fa3e663f96cf38f17c672ba04f466121
