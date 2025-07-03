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
const maskInput = document.getElementById('propertyMask'); // <-- NEW if you have mask input
const enhancedImage = document.getElementById('enhancedImage');
const glassBox = document.getElementById('glassBox');
const arvCtx = document.getElementById('arvChart')?.getContext?.('2d');

let arvChartInstance = null;

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
    glassBox.classList.add('show');
    alert(data.answer);

  } catch (err) {
    console.error("❌ Ask FlipAI Error:", err);
    alert("Ask FlipAI failed — see console for details!");
  }
});

// ============================================================
// #5 ENHANCE IMAGE BUTTON (w/ IMAGE + MASK)
// ============================================================
btnEnhance?.addEventListener('click', async () => {
  console.log("✨ Enhance Image clicked");

  const imageFile = imageInput?.files[0];
  const maskFile = maskInput?.files?.[0]; // <- Optional but server expects it
  const investment = parseFloat(investInput?.value);

  if (!imageFile || !maskFile) {
    alert("Please choose BOTH an image and a mask file!");
    return;
  }

  console.log(`✅ Sending file: ${imageFile.name}`);
  console.log(`✅ Sending mask: ${maskFile.name}`);
  console.log(`💰 Investment amount: ${investment}`);

  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('mask', maskFile);
  formData.append('investment', investment);

  try {
    const response = await fetch(`${backendURL}/api/enhance`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) throw new Error(`Server error: ${response.status}`);
    const data = await response.json();
    console.log("✅ AI Enhanced Image:", data);

    enhancedImage.src = data.enhancedImageUrl;
    enhancedImage.style.display = 'block';

    if (!isNaN(priceInput.value) && !isNaN(investment)) {
      const expectedARV = Math.round((parseFloat(priceInput.value) + investment) / 0.7);
      const profit = expectedARV - parseFloat(priceInput.value) - investment;

      glassBox.classList.add('show');
      glassBox.querySelector('h2').innerText = `Expected ARV: $${expectedARV.toLocaleString()}`;

      if (arvChartInstance) arvChartInstance.destroy();
      arvChartInstance = new Chart(arvCtx, {
        type: 'pie',
        data: {
          labels: [
            `Property: $${parseFloat(priceInput.value).toLocaleString()}`,
            `Investment: $${investment.toLocaleString()}`,
            `Profit: $${profit.toLocaleString()}`
          ],
          datasets: [{
            data: [parseFloat(priceInput.value), investment, profit],
            backgroundColor: ['#36A2EB', '#FFCE56', '#4BC0C0']
          }]
        },
        options: {
          plugins: {
            legend: { position: 'bottom', labels: { color: '#000' } },
            tooltip: { enabled: true }
          }
        }
      });
    }

  } catch (err) {
    console.error("❌ Enhance Image Error:", err);
    alert("Image enhancement failed — see console for details!");
  }
});
