console.log("✅ Flip.ai main.js loaded");

// Elements
const enhanceBtn = document.getElementById('btn-enhance');
const zipInput = document.getElementById('zip');
const valueInput = document.getElementById('price');
const investInput = document.getElementById('investment');
const promptInput = document.getElementById('prompt');
const fileInput = document.getElementById('propertyImage');
const arvChart = document.getElementById('arvChart');
const glassBox = document.getElementById('glassBox');
const enhancedImage = document.getElementById('enhancedImage');

// ✅ Correct backend URL
const BACKEND_URL = 'https://flip-ai.onrender.com'; // Replace with your real Render URL!

enhanceBtn.addEventListener('click', async () => {
  console.log("✨ Enhance Button Clicked");

  const value = valueInput.value;
  const investment = investInput.value;
  const prompt = promptInput.value;

  const file = fileInput.files[0];
  if (!file) {
    alert("Please select an image first.");
    return;
  }

  const formData = new FormData();
  formData.append('image', file);
  formData.append('value', value);
  formData.append('investment', investment);
  formData.append('prompt', prompt);

  try {
    const response = await fetch(`${BACKEND_URL}/api/enhance`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) throw new Error(`Server error: ${response.status}`);

    const data = await response.json();
    console.log("✅ Variation Response:", data);

    // Show ARV chart and image
    glassBox.classList.add('show');
    enhancedImage.src = data.enhancedImageUrl;
    enhancedImage.style.display = 'block';

    // Update chart or other UI here if needed
    alert(`Enhanced Image: ${data.enhancedImageUrl}\nARV: ${data.arv}\nTier: ${data.tier}`);

  } catch (err) {
    console.error("❌ Enhance Image Error:", err);
    alert(`Enhance failed: ${err.message}`);
  }
});
