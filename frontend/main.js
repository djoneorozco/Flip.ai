// =======================================
// ✅ Flip.ai – main.js (FINAL)
// =======================================

console.log("✅ Flip.ai main.js loaded");

// Elements
const enhanceBtn = document.getElementById('btn-enhance');
const propertyInput = document.getElementById('price');
const investmentInput = document.getElementById('investment');
const zipInput = document.getElementById('zip');
const promptInput = document.getElementById('prompt');
const propertyImageInput = document.getElementById('propertyImage');

const enhancedImage = document.getElementById('enhancedImage');
const glassBox = document.getElementById('glassBox');
const arvTitle = document.getElementById('arvTitle');
const arvChartCanvas = document.getElementById('arvChart');

// Chart instance
let arvChart;

// =======================================
// ✅ Enhance Image Click Handler
// =======================================
enhanceBtn.addEventListener('click', async () => {
  console.log("✨ Enhance Image Clicked");

  const propertyFile = propertyImageInput.files[0];
  if (!propertyFile) {
    alert("Please select a property image first!");
    return;
  }

  const propertyValue = parseFloat(propertyInput.value) || 0;
  const investmentAmount = parseFloat(investmentInput.value) || 0;

  console.log("📁 Sending file:", propertyFile.name);
  console.log("💰 Property Value:", propertyValue);
  console.log("💰 Investment Amount:", investmentAmount);

  const formData = new FormData();
  formData.append('image', propertyFile);
  formData.append('propertyValue', propertyValue);
  formData.append('investment', investmentAmount);

  try {
    const response = await fetch('/api/enhance', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ Variation Response:", data);

    // Show ARV Chart
    const arv = propertyValue + investmentAmount;
    const profit = arv - propertyValue - investmentAmount;

    if (arvChart) {
      arvChart.destroy();
    }

    arvChart = new Chart(arvChartCanvas, {
      type: 'pie',
      data: {
        labels: ['Property', 'Investment', 'Profit'],
        datasets: [{
          data: [propertyValue, investmentAmount, profit],
          backgroundColor: ['#3b82f6', '#facc15', '#22d3ee'],
        }],
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'bottom' } },
      },
    });

    arvTitle.textContent = `Expected ARV: $${arv.toLocaleString()}`;
    glassBox.classList.add('show');

    // Show Enhanced Image
    enhancedImage.src = data.enhancedImageUrl;
    enhancedImage.style.display = 'block';

  } catch (err) {
    console.error("❌ Enhance Image Error:", err);
    alert(`Enhance failed: ${err.message}`);
  }
});
