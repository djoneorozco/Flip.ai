// ============================================================
// Flip.ai Main Logic – Chart + Enhance
// ============================================================

const btnTest = document.getElementById('btn-test');
const btnAsk = document.getElementById('btn-ask');
const btnEnhance = document.getElementById('btn-enhance');
const zipInput = document.getElementById('zip');
const priceInput = document.getElementById('price');
const investInput = document.getElementById('investment') || document.getElementById('prompt');
const imageInput = document.getElementById('propertyImage');
const glassBox = document.getElementById('glassBox');
const enhancedImage = document.getElementById('enhancedImage');
const arvCtx = document.getElementById('arvChart')?.getContext?.('2d');

let arvChartInstance = null;
const backendURL = 'https://flip-ai.onrender.com';

// ============================================================
// TEST BACKEND
// ============================================================
btnTest?.addEventListener('click', async () => {
  console.log("🧪 Testing backend...");
  try {
    const response = await fetch(`${backendURL}/api/test`);
    const data = await response.json();
    console.log("✅ Backend Response:", data);
    alert(JSON.stringify(data));
  } catch (err) {
    console.error("❌ Test Backend Error:", err);
    alert("Test backend failed — see console!");
  }
});

// ============================================================
// ASK AI
// ============================================================
btnAsk?.addEventListener('click', async () => {
  console.log("🤖 Ask AI clicked");
  const value = priceInput?.value.trim();
  const investment = investInput?.value.trim();

  if (!value) {
    alert("Please enter Property Price!");
    return;
  }

  try {
    const response = await fetch(`${backendURL}/api/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value, investment })
    });

    if (!response.ok) throw new Error(`Server error: ${response.status}`);
    const data = await response.json();
    console.log("✅ AI Response:", data);

    alert(data.answer);

  } catch (err) {
    console.error("❌ Ask FlipAI Error:", err);
    alert("Ask FlipAI failed — see console for details!");
  }
});

// ============================================================
// ENHANCE IMAGE + ARV PIE
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

  const formData = new FormData();
  formData.append('image', file);
  formData.append('investment', invest || 0);

  console.log("✅ Sending file:", file.name);
  console.log("✅ Investment amount:", invest);

  try {
    const response = await fetch(`${backendURL}/api/enhance`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) throw new Error(`Server error: ${response.status}`);
    const data = await response.json();
    console.log("✅ Enhanced Image:", data);

    const arv = Math.round((price + invest) / 0.7);
    const profit = arv - price - invest;

    glassBox.classList.add('show');
    glassBox.querySelector('h2').innerText = `Expected ARV: $${arv.toLocaleString()}`;

    // Destroy old chart if exists
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
        maintainAspectRatio: false,
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
    alert("Image enhancement failed — see console for details!");
  }
});
