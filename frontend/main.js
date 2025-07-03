console.log("Flip.ai main.js loaded");

// Get elements
const enhanceButton = document.getElementById('btn-enhance');
const propertyInput = document.getElementById('price');
const investmentInput = document.getElementById('investment');
const propertyImage = document.getElementById('propertyImage');

enhanceButton.addEventListener('click', async () => {
  console.log("✨ Enhance Image Clicked");

  const propertyValue = propertyInput.value;
  const investment = investmentInput.value;
  const file = propertyImage.files[0];

  if (!file) {
    alert("Please upload an image");
    return;
  }

  const formData = new FormData();
  formData.append('image', file);
  formData.append('propertyValue', propertyValue);
  formData.append('investment', investment);

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
