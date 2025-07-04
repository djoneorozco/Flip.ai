//#1 ── Startup
console.log('✅ Flip.ai main.js loaded');

//#2 ── Wait for DOM & Attach Listener
document.addEventListener('DOMContentLoaded', () => {
  const enhanceBtn = document.getElementById('enhanceBtn');
  const imageInput = document.getElementById('propertyImage');
  const budgetInput = document.getElementById('investmentAmount');

  if (!enhanceBtn) {
    console.error('❌ Enhance button not found. Check your HTML ID.');
    return;
  }

  enhanceBtn.addEventListener('click', async () => {
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
      const response = await fetch('https://your-backend-url.onrender.com/api/enhance', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ AI Enhanced Image:', data);

      // Show the result
      alert(`Enhanced Image URL:\n${data.enhancedImageUrl}\n\nPrompt Used:\n${data.description}`);

    } catch (err) {
      console.error('❌ Enhance Image Error:', err);
      alert(`Enhance failed: ${err.message}`);
    }
  });
});
