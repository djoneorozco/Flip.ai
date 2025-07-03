// ============================================================
// ✅ Flip.ai Frontend Enhancer Logic
// ============================================================

// ELEMENTS
const btnEnhance = document.getElementById('btn-enhance');
const imageInput = document.getElementById('propertyImage');
const investInput = document.getElementById('investment');
const glassBox = document.getElementById('glassBox');
const arvCtx = document.getElementById('arvChart')?.getContext?.('2d');
const workingOverlay = document.getElementById('workingOverlay');
const enhancedImage = document.getElementById('enhancedImage');

const backendURL = 'https://flip-ai.onrender.com';

let arvChartInstance = null;

btnEnhance?.addEventListener('click', async () => {
  console.log("✨ Enhance Image Clicked");

  const file = imageInput?.files[0];
  const invest = parseFloat(investInput?.value);

  if (!file) {
    alert("Please select an image first!");
    return;
  }

  const formData = new FormData();
  formData.append('image', file);
  formData.append('investment', invest);

  workingOverlay.style.display = 'block';

  try {
    const response = await fetch(`${backendURL}/api/enhance`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) throw new Error(`Server error: ${response.status}`);
    const data = await response.json();

    console.log("✅ Enhanced Image:", data);

    glassBox.classList.add('show');

    const h2 = glassBox.querySelector('h2');
    if (h2) h2.innerText = `Expected ARV: $${Math.round((invest + 125000)/0.7).toLocaleString()}`;

    if (arvChartInstance) arvChartInstance.destroy();
    arvChartInstance = new Chart(arvCtx, {
      type: 'pie',
      data: {
        labels: [
          `Property: $125,000`,
          `Investment: $${invest.toLocaleString()}`,
          `Profit: $${Math.round((invest + 125000)/0.7 - invest - 125000).toLocaleString()}`
        ],
        datasets: [{
          data: [125000, invest, Math.round((invest + 125000)/0.7 - invest - 125000)],
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

    enhancedImage.src = data.enhancedImageUrl;
    enhancedImage.style.display = 'block';

  } catch (err) {
    console.error("❌ Enhance Image Error:", err);
    alert("Enhance failed — see console for details!");
  } finally {
    workingOverlay.style.display = 'none';
  }
});
