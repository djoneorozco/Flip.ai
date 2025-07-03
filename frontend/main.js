// ✅ Inside your main.js
console.log("Flip.ai main.js loaded");

document.getElementById('btn-enhance').addEventListener('click', async () => {
  console.log("✅ Enhance Image Clicked");

  const propertyImage = document.getElementById('propertyImage').files[0];
  const investment = document.getElementById('investment').value;

  if (!propertyImage) {
    alert("Please select an image first.");
    return;
  }

  const formData = new FormData();
  formData.append('image', propertyImage);
  formData.append('investment', investment);

  try {
    const response = await fetch(
      'https://flip-ai.onrender.com/api/enhance',   // ✅ FULL backend URL!
      {
        method: 'POST',
        body: formData
      }
    );

    const result = await response.json();
    console.log("✅ Variation Response:", result);

    // Use result as needed...
  } catch (error) {
    console.error("❌ Enhance Image Error:", error);
  }
});
