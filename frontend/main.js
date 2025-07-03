console.log("✅ Flip.ai main.js loaded");

const enhanceBtn = document.getElementById('btn-enhance');
const workingImage = document.getElementById('workingImage');
const enhancedImage = document.getElementById('enhancedImage');
const glassBox = document.getElementById('glassBox');

enhanceBtn.addEventListener('click', async () => {
  console.log("✨ Enhance Image Clicked");

  workingImage.style.display = 'block';
  glassBox.style.display = 'none';

  const zip = document.getElementById('zip').value;
  const price = Number(document.getElementById('price').value);
  const investment = Number(document.getElementById('investment').value);
  const prompt = document.getElementById('prompt').value;

  console.log({ zip, price, investment, prompt });

  try {
    const response = await fetch('/api/enhance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ zip, price, investment, prompt })
    });

    const data = await response.json();
    console.log("✅ Response:", data);

    // Fake image for now
    enhancedImage.src = data.enhancedImageUrl || 'https://via.placeholder.com/400';
    enhancedImage.style.display = 'block';

    // Fake ARV chart example
    const ctx = document.getElementById('arvChart').getContext('2d');
    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Property', 'Investment', 'Profit'],
        datasets: [{
          data: [price, investment, (price * 0.7)],
          backgroundColor: ['#3b82f6', '#facc15', '#22d3ee']
        }]
      }
    });

    glassBox.style.display = 'block';
    workingImage.style.display = 'none';

  } catch (err) {
    console.error("❌ Error:", err);
    workingImage.style.display = 'none';
  }
});
