// ============================================================
// ✅ Flip.ai Frontend – main.js
// ============================================================

console.log('✅ Flip.ai main.js loaded');

document.getElementById('btn-enhance').addEventListener('click', async () => {
  console.log('✨ Enhance Button Clicked');

  const zip = document.getElementById('zip').value;
  const propertyValue = document.getElementById('price').value;
  const investment = document.getElementById('investment').value;
  const details = document.getElementById('prompt').value;
  const fileInput = document.getElementById('propertyImage');
  const file = fileInput.files[0];

  if (!file) {
    alert('Please select an image file to enhance.');
    return;
  }

  const formData = new FormData();
  formData.append('image', file);
  formData.append('zip', zip);
  formData.append('propertyValue', propertyValue);
  formData.append('investment', investment);
  formData.append('details', details);

  try {
    const response = await fetch('https://your-backend-url.onrender.com/api/enhance', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Enhance failed: Server error: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Variation Response:', result);

    // Show ARV and Enhanced Image
    const arv = Number(propertyValue) + Number(investment);
    document.getElementById('arvValue').innerText = `Expected ARV: $${arv.toLocaleString()}`;
    document.getElementById('enhancedImage').src = result.enhancedImageUrl;
    document.getElementById('enhancedImage').style.display = 'block';
    document.getElementById('glassBox').classList.add('show');

  } catch (error) {
    console.error('❌ Enhance Image Error:', error);
    alert(error.message);
  }
});
