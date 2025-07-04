console.log('✅ Flip.ai main.js loaded');

document.addEventListener('DOMContentLoaded', () => {
  const enhanceButton = document.getElementById('enhanceButton');
  const imageInput = document.getElementById('propertyImage');
  const budgetInput = document.getElementById('investment');

  if (!enhanceButton) {
    console.error('❌ Enhance button not found. Check your HTML ID.');
    return;
  }

  enhanceButton.addEventListener('click', async () => {
    console.log('✨ Enhance Button Clicked');

    const file = imageInput.files[0];
    const budget = Number(budgetInput.value);

    if (!file) {
      alert('Please upload a property image.');
      return;
    }

    console.log('📸 Sending file:', file.name);
    console.log('💲 Budget amount:', budget);

    const formData = new FormData();
    formData.append('propertyImage', file);
    formData.append('budget', budget);

    try {
      const response = await fetch('https://flip-ai.onrender.com/api/enhance', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      console.log('✅ AI Enhanced Image URL:', data.enhancedImageUrl);
      console.log('✅ AI Description:', data.description);
      console.log('✅ Budget Used:', data.budget);

      alert(`Enhanced Image URL:\n${data.enhancedImageUrl}\n\nPrompt Used:\n${data.description}`);

      const resultImage = document.getElementById('enhancedImage');
      const resultBox = document.getElementById('enhancedGlassBox');

      if (resultImage && resultBox) {
        resultImage.src = data.enhancedImageUrl;
        resultBox.style.display = 'block';
      }

    } catch (err) {
      console.error('❌ Enhance Image Error:', err);
      alert(`Enhance failed: ${err.message}`);
    }
  });
});
