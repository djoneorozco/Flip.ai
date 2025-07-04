console.log('✅ Flip.ai main.js loaded');

const btnEnhance = document.getElementById('btn-enhance');
btnEnhance.addEventListener('click', async () => {
  console.log('✨ Enhance Button Clicked');

  const propertyValue = document.getElementById('propertyValue').value;
  const investment = document.getElementById('investment').value;
  const imageFile = document.getElementById('propertyImage').files[0];

  if (!propertyValue || !investment || !imageFile) {
    alert('Please fill in all fields and upload an image!');
    return;
  }

  const formData = new FormData();
  formData.append('propertyValue', propertyValue);
  formData.append('investment', investment);
  formData.append('image', imageFile);

  try {
    const response = await fetch('https://YOUR-BACKEND-URL.com/api/enhance', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Server error: ' + response.status);
    }

    const data = await response.json();
    console.log('✅ Variation Response:', data);

    document.getElementById('result').style.display = 'block';
    document.getElementById('arv').innerText = `ARV: ${data.arv}`;
    document.getElementById('maxOffer').innerText = `Max Offer: ${data.maxOffer}`;
    document.getElementById('tier').innerText = `Recommended Tier: ${data.tier}`;
    document.getElementById('enhancedImage').src = data.enhancedImageUrl;

  } catch (err) {
    console.error(err);
    alert('Enhance failed: ' + err.message);
  }
});
