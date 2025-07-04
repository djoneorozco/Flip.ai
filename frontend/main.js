// ============================================================
// #1 ELEMENT SELECTORS
// ============================================================
const btnEnhance = document.getElementById('btn-enhance');
const priceInput = document.getElementById('price');
const investInput = document.getElementById('investment');
const imageInput = document.getElementById('propertyImage');
const enhancedImage = document.getElementById('enhancedImage');
const workingImage = document.getElementById('workingImage');
const glassBox = document.getElementById('glassBox');
const arvCtx = document.getElementById('arvChart')?.getContext('2d');
let arvChartInstance = null;

// ============================================================
// #2 BACKEND URL
// ============================================================
const backendURL = 'https://flip-ai.onrender.com';

// ============================================================
// #3 ENHANCE IMAGE BUTTON
// ============================================================
btnEnhance?.addEventListener('click', async () => {
  const file = imageInput?.files[0];
  const price = parseFloat(priceInput?.value);
  const invest = parseFloat(investInput?.value);

  if (!file) {
    alert("Please choose an image first!");
    return;
  }

  workingImage.style.display = 'block';
  enhancedImage.style.display = 'none';

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
    console.log("✅ AI Enhanced Image:", data);

    workingImage.style.display = 'none';

    enhancedImage.src = data.enhancedImageUrl;
    enhancedImage.style.display = 'block';

    if (!isNaN(price) && !isNaN(invest)) {
      const expectedARV = Math.round((price + invest) / 0.7);
      const profit = expectedARV - price - invest;

      glassBox.classList.add('show');

      const h2 = glassBox.querySelector('h2');
      if (h2) h2.innerText = `Expected ARV: $${expectedARV.toLocaleString()}`;

      if (arvChartInstance) arvChartInstance.destroy();

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
    workingImage.style.display = 'none';
    alert("Image enhancement failed — see console for details!");
  }
});
