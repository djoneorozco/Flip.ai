// ============================================================
// ✅ Flip.ai main.js – Vision-Based Enhance + 70% Rule Advisor
// ============================================================

// #1 ELEMENT SELECTORS
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
let arvChartInstance = null; // Save chart instance

// #2 BACKEND URL
const backendURL = 'https://flip-ai.onrender.com';

// ============================================================
// ✅ #3 TEST BACKEND BUTTON
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
// ✅ #4 ASK AI BUTTON (uses value + investment keys)
// ============================================================
btnAsk?.addEventListener('click', async () => {
  console.log("🤖 Ask AI clicked");
  const zip = zipInput?.value.trim();
  const value = priceInput?.value.trim();
  const investment = investInput?.value.trim();

  if (!value || !investment) {
    alert("Please enter Property Price & Investment!");
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

    glassBox.classList.add('show');
    alert(data.answer);

  } catch (err) {
    console.error("❌ Ask FlipAI Error:", err);
    alert("Ask FlipAI failed — see console for details!");
  }
});

// ============================================================
// ✅ #5 ENHANCE IMAGE BUTTON w/ Vision + ARV PIE
// ============================================================
btnEnhance?.addEventListener('click', async () => {
  const file = imageInput?.files[0];
  const price = parseFloat(priceInput?.value);
  const invest = parseFloat(investInput?.value);

  if (!file) {
    alert("Please choose an image first!");
    return;
  }

  if (isNaN(invest)) {
    alert("Please enter Planned Investment Cost!");
    return;
  }

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

    // Show enhanced image INSIDE glass box
    enhancedImage.src = data.enhancedImageUrl;
    enhancedImage.style.display = 'block';
    glassBox.appendChild(enhancedImage);

    // ✅ Calculate ARV & Profit
    if (!isNaN(price) && !isNaN(invest)) {
      const expectedARV = Math.round((price + invest) / 0.7);
      const profit = expectedARV - price - invest;

      glassBox.classList.add('show');

      const h2 = glassBox.querySelector('h2');
      if (h2) h2.innerText = `Expected ARV: $${expectedARV.toLocaleString()}`;

      // Destroy old chart if exists
      if (arvChartInstance) arvChartInstance.destroy();

      // Draw new pie chart SMALLER
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
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: '#000' }
            }
          }
        }
      });
    }

  } catch (err) {
    console.error("❌ Enhance Image Error:", err);
    alert("Image enhancement failed — see console for details!");
  }
});
