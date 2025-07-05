console.log("✅ Flip.ai main.js loaded");

const imageInput = document.getElementById('propertyImage');
const enhanceBtn = document.getElementById('enhanceBtn');
const resultDiv = document.getElementById('result');

const BACKEND_URL = 'http://flip-ai.onrender.com'; // Or your Render URL if testing live

enhanceBtn.addEventListener('click', async () => {
  resultDiv.innerHTML = "⏳ Uploading & Enhancing...";

  const imageFile = imageInput.files[0];
  if (!imageFile) {
    resultDiv.innerHTML = "❌ Please select an image file.";
    return;
  }

  const formData = new FormData();
  formData.append('image', imageFile);

  try {
    const res = await fetch(`${BACKEND_URL}/api/enhance`, {
      method: 'POST',
      body: formData
    });

    const data = await res.json();

    if (data.enhancedImageUrl) {
      resultDiv.innerHTML = `
        <p>✅ Enhancement Done! Tier Used: ${data.tierUsed}</p>
        <img src="${data.enhancedImageUrl}" alt="Enhanced Property" />
      `;
    } else {
      resultDiv.innerHTML = `❌ ${data.error || "Something went wrong."}`;
    }

  } catch (err) {
    console.error(err);
    resultDiv.innerHTML = "❌ Flip.ai Error. Check console.";
  }
});
