// ============================================================
// #1 ELEMENT SELECTORS
// ============================================================

const btnEnhance = document.getElementById('btn-enhance');
const imageInput = document.getElementById('propertyImage');
const priceInput = document.getElementById('price');
const investInput = document.getElementById('investment');

const glassBox = document.getElementById('glassBox');
const arvCtx = document.getElementById('arvChart')?.getContext?.('2d');
const enhancedImage = document.getElementById('enhancedImage');

let arvChartInstance = null;

// ============================================================
// #2 BACKEND URL
// ============================================================

const backendURL = 'https://flip-ai.onrender.com';

// ============================================================
// #3 ENHANCE IMAGE BUTTON – VARIATION ONLY
// ============================================================

btnEnhance?.addEventListener('click', async () => {
  console.log("✨ Enhance Image clicked");

  const file = imageInput?.files[0];
  const price = parseFloat(priceInput?.value);
  const invest = parseFloat(investInput?.value);

  if (!file) {
    alert("Please choose an image first!");
    return;
  }

  console.log("✅ Sending file:", file.name);
  console.log("✅ Investment amount:", invest);

  const formData = new FormData();
  formData.append('image', file);
  formData.append('investment', invest);

  try {
    const response = await fetch(`${backendURL}/api/enhance`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) throw new Error(`Server error: ${response.status}`);
    const data = await response.json();
    console.log("✅ Variation Response:", data);

    // ✅ Show enhanced image inside glass box
    enhancedImage.src = data.enhancedImageUrl;
    enhancedImage.style.display = 'block';

    // ✅ Calculate ARV + Profit + Draw Chart
    if (!isNaN(price) && !isNaN(invest)) {
      const expectedARV = Math.round((price + invest) / 0.7);
      const profit = expectedARV - price - invest;

      glassBox.classList.add('show');

      // Update header
      const h2 = glassBox.querySelector('h2');
      if (h2) h2.innerText = `Expected ARV: $${expectedARV.toLocaleString()}`;

      // Destroy old chart if needed
      if (arvChartInstance) arvChartInstance.destroy();

      // Draw new pie chart
      arvChartInstance = new Chart(arvCtx, {
        type: 'pie',
        data: {
          labels: [
            `Property: $${price.toLocaleString()}`,
            `Investment: $${invest.toLocaleString()}`,
            `Profit: $${profit.toLocaleString()}`
          ],
          datasets: [{
            data: [price, invest, profit],
            backgroundColor: ['#36A2EB', '#FFCE56', '#4BC0C0']
          }]
        },
        options: {
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: '#000' }
            },
            tooltip: { enabled: true }
          }
        }
      });
    }

  } catch (err) {
    console.error("❌ Enhance Image Error:", err);
    alert("Enhance failed — see console for details!");
  }
});
