console.log("✅ Flip.ai main.js loaded");

// ----------------------------------------------------
// Enhance Image
// ----------------------------------------------------
document.getElementById('btn-enhance').addEventListener('click', async () => {
  console.log("🔍 Enhance Image Clicked");

  const price = parseFloat(document.getElementById('price').value || 0);
  const investment = parseFloat(document.getElementById('investment').value || 0);
  const fileInput = document.getElementById('propertyImage');
  const file = fileInput.files[0];

  if (!file) {
    alert("Please upload an image");
    return;
  }

  const formData = new FormData();
  formData.append('image', file);
  formData.append('investment', investment);

  const response = await fetch('/api/enhance', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  console.log("✅ Variation Response:", data);

  // Show chart & image
  const glassBox = document.getElementById('glassBox');
  glassBox.classList.add('show');

  // Chart
  const arv = price + investment;
  const profit = arv * 0.2;

  new Chart(
    document.getElementById('arvChart'),
    {
      type: 'pie',
      data: {
        labels: ['Property', 'Investment', 'Profit'],
        datasets: [{
          data: [price, investment, profit],
          backgroundColor: ['#3b82f6', '#facc15', '#34d399']
        }]
      }
    }
  );

  // Image
  document.getElementById('resultImage').src = data.enhancedImageUrl;
});
