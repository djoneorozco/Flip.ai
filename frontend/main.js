console.log("✅ Flip.ai main.js loaded");

// ✅ DOM Elements
const btn = document.getElementById('btn-enhance');
const zip = document.getElementById('zip');
const propertyValue = document.getElementById('price');
const investment = document.getElementById('investment');
const details = document.getElementById('prompt');
const imageInput = document.getElementById('propertyImage');

btn.addEventListener('click', async () => {
  console.log("✨ Enhance Image Clicked");

  const file = imageInput.files[0];
  if (!file) {
    alert("Please choose an image file.");
    return;
  }

  const formData = new FormData();
  formData.append('image', file);
  formData.append('propertyValue', propertyValue.value);
  formData.append('investment', investment.value);
  formData.append('details', details.value);

  try {
    const response = await fetch('https://flip-ai.onrender.com/api/enhance', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) throw new Error(`Server error: ${response.status}`);

    const data = await response.json();
    console.log("✅ Variation Response:", data);

    alert(`Enhanced URL: ${data.enhancedImageUrl}\nBudget: ${data.budget}\nTier: ${data.tier}`);

  } catch (err) {
    console.error("❌ Enhance Image Error:", err);
    alert(`Enhance failed: ${err.message}`);
  }
});
