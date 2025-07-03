// ============================================================
// #1 ELEMENT SELECTORS
// ============================================================
const btnTest = document.getElementById('btn-test');
const btnAsk = document.getElementById('btn-ask');
const zipInput = document.getElementById('zip');
const priceInput = document.getElementById('price');
const investInput = document.getElementById('investment') || document.getElementById('prompt');
const btnEnhance = document.getElementById('btn-enhance');
const imageInput = document.getElementById('propertyImage');
const enhancedImage = document.getElementById('enhancedImage');

const glassBox = document.getElementById('glassBox');
const arvCtx = document.getElementById('arvChart')?.getContext?.('2d');

const workingOverlay = document.getElementById('workingOverlay');

let arvChartInstance = null; // ✅ Save chart instance for reuse

// ============================================================
// #2 BACKEND URL
// ============================================================
const backendURL = 'https://flip-ai.onrender.com';

// ============================================================
// #3 TEST BACKEND BUTTON
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
// #4 ASK AI BUTTON
// ============================================================
btnAsk?.addEventListener('click', async () => {
  console.log("🤖 Ask AI clicked");
  const zip = zipInput?.value.trim();
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

    if (glassBox) glassBox.classList.add('show');
    alert(data.answer);

  } catch (err) {
    console.error("❌ Ask FlipAI Error:", err);
    alert("Ask FlipAI failed — see console for details!");
  }
});

// ============================================================
// #5 ENHANCE IMAGE BUTTON w/ ARV PIE + Working Overlay
// ============================================================
btnEnhance?.addEventListener('click', async () => {
  const file = imageInput?.files[0];
  const price = parseFloat(priceInput?.value);
  const invest = parseFloat(investInput?.value);

  if (!file) {
    alert("Please choose an image first!");
    return;
  }

  // ✅ Show working overlay
  if (workingOverlay) workingOverlay.classList.add('show');

  const formData = new FormData();
  formData.append('image', file);
  formData.append('investment', invest); // Send budget!

  try {
    const response = await fetch(`${backendURL}/api/enhance`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) throw new Error(`Server error: ${response.status}`);
    const data = await response.json();
    console.log("✅ AI Enhanced Image:", data);

    // ✅ Hide working overlay
    if (workingOverlay) workingOverlay.classList.remove('show');

    // Show enhanced image
    enhancedImage.src = data.enhancedImageUrl;
    enhancedImage.style.display = 'block';

    // ✅ Calculate ARV + Profit + Draw Pie Chart
    if (!isNaN(price) && !isNaN(invest)) {
      const expectedARV = Math.round((price + invest) / 0.7);
      const profit = expectedARV - price - invest;

      if (glassBox) glassBox.classList.add('show');

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
    alert("Image enhancement failed — see console for details!");
  } finally {
    if (workingOverlay) workingOverlay.classList.remove('show');
  }
});
