// ================================================
// ✅ Flip.ai – Full main.js
// ================================================

//#1 Make sure your backend URL is correct:
const backendUrl = 'https://your-backend-url.onrender.com/api/enhance';

console.log('✅ Flip.ai main.js loaded');

const enhanceBtn = document.getElementById('enhanceBtn');
if (enhanceBtn) {
  enhanceBtn.addEventListener('click', async () => {
    console.log('✅ Enhance Button Clicked');

    const propertyValue = document.getElementById('propertyValue').value.trim();
    const investmentAmount = document.getElementById('investmentAmount').value.trim();
    const details = document.getElementById('details').value.trim();
    const fileInput = document.getElementById('propertyImage');

    if (!propertyValue || !investmentAmount || !fileInput.files.length) {
      alert('Please fill all required fields and select an image.');
      return;
    }

    const formData = new FormData();
    formData.append('image', fileInput.files[0]);
    formData.append('propertyValue', propertyValue);
    formData.append('investment', investmentAmount);
    formData.append('prompt', details);

    try {
      const response = await fetch(backendUrl, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Variation Response:', data);

      alert(`✅ Enhanced Image URL: ${data.enhancedImageUrl}
Budget: ${data.budget}
Tier: ${data.tier}`);

    } catch (err) {
      console.error('❌ Enhance Image Error:', err);
      alert(`Enhance failed: ${err.message}`);
    }
  });
} else {
  console.error('❌ Enhance button not found. Check your HTML ID.');
}
