console.log("✅ Flip.ai main.js loaded");

// === DOM Elements ===
const imageInput = document.getElementById('propertyImage');
const generateBtn = document.getElementById('generateReport');
const resultDiv = document.getElementById('result');

// === Backend URL ===
const BACKEND_URL = 'https://flip-ai.onrender.com';

generateBtn.addEventListener('click', async () => {
  resultDiv.innerHTML = "⏳ Enhancing image...";

  const imageFile = imageInput.files[0];

  if (!imageFile) {
    resultDiv.innerHTML = "❌ Please select an image.";
    return;
  }

  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('investment', 10000); // Force Tier 1 for now

  try {
    const enhanceResponse = await fetch(`${BACKEND_URL}/api/enhance`, {
      method: 'POST',
      body: formData
    });

    const enhanceData = await enhanceResponse.json();

    resultDiv.innerHTML = `
      <h4>✅ Enhanced Image</h4>
      <p><strong>Enhancement Tier Used:</strong> ${enhanceData.tierUsed}</p>
      <img src="${enhanceData.enhancedImageUrl}" alt="Enhanced Property" width="500"/>
    `;
  } catch (err) {
    console.error("❌ Flip.ai Error:", err);
    resultDiv.innerHTML = "❌ Something went wrong. Please try again.";
  }
});
