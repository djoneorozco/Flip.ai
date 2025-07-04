// ✅ main.js — Flip.ai full frontend script

console.log('✅ Flip.ai main.js loaded');

document.addEventListener('DOMContentLoaded', () => {
  const enhanceButton = document.getElementById('enhanceButton');

  if (!enhanceButton) {
    console.error('❌ Enhance button not found. Check your HTML ID.');
    return;
  }

  enhanceButton.addEventListener('click', async () => {
    console.log('✅ Enhance Button Clicked');

    const zipInput = document.getElementById('zipInput').value.trim();
    const propertyValue = document.getElementById('propertyValue').value.trim();
    const investmentAmount = document.getElementById('investmentAmount').value.trim();
    const details = document.getElementById('details').value.trim();
    const fileInput = document.getElementById('propertyImage');

    if (!fileInput.files[0]) {
      alert('❌ Please select a property image to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('propertyImage', fileInput.files[0]);
    formData.append('propertyValue', propertyValue);
    formData.append('investmentAmount', investmentAmount);
    formData.append('details', details);
    formData.append('zip', zipInput);

    try {
      const response = await fetch('https://YOUR-BACKEND-URL.onrender.com/api/enhance', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      console.log('✅ AI Enhanced Image:', data);

      // ✅ Example: Show result on the page
      alert(`✅ AI Enhanced:\n${data.enhancedImageUrl}\nBudget: ${data.budget}\nTier: ${data.tier}`);

      // If you have an <img id="enhancedImage"> element:
      const resultImage = document.getElementById('enhancedImage');
      if (resultImage) {
        resultImage.src = data.enhancedImageUrl;
      }
    } catch (error) {
      console.error('❌ Enhance Image Error:', error);
      alert(`Enhance failed: ${error.message}`);
    }
  });
});
