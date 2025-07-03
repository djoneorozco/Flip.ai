// ============================================================
// ✅ Flip.ai Frontend JS – FINAL VERSION (Stable)
// ============================================================

console.log("✅ Flip.ai main.js loaded");

const enhanceBtn = document.getElementById('btn-enhance');

enhanceBtn.addEventListener('click', async () => {
  console.log("✨ Enhance Image Clicked");

  const zip = document.getElementById('zip').value.trim();
  const price = parseFloat(document.getElementById('price').value.trim()) || 0;
  const investment = parseFloat(document.getElementById('investment').value.trim()) || 0;
  const prompt = document.getElementById('prompt').value.trim();
  const imageFile = document.getElementById('propertyImage').files[0];

  if (!imageFile) {
    alert("Please select an image to enhance!");
    return;
  }

  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('investment', investment);
  formData.append('prompt', prompt);

  try {
    const response = await fetch('https://flip-ai.onrender.com/api/enhance', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) throw new Error('Backend returned an error');

    const result = await response.json();
    console.log("✅ Variation Response:", result);

    // TODO: Replace this with your DOM update logic
    alert(`Enhanced URL: ${result.enhancedImageUrl}\nBudget: ${result.budget}\nTier: ${result.tier}`);

  } catch (err) {
    console.error("❌ Enhance Error:", err);
    alert('Something went wrong. Check console for details.');
  }
});
