// ============================================================
// #1 ELEMENT SELECTORS
// ============================================================
const btnTest = document.getElementById('btn-test');
const btnAsk = document.getElementById('btn-ask');
const zipInput = document.getElementById('zip');
const priceInput = document.getElementById('price');
const investInput = document.getElementById('investment');
const promptInput = document.getElementById('prompt');
const btnEnhance = document.getElementById('btn-enhance');
const imageInput = document.getElementById('propertyImage');
const enhancedImage = document.getElementById('enhancedImage');

const glassBox = document.getElementById('glassBox');
const chartContainer = document.getElementById('chartContainer'); // Not used here, kept for backward compat
const resultEl = document.getElementById('result');
const schoolList = document.getElementById('schoolList');
const crimeInfo = document.getElementById('crimeInfo');

const arvCtx = document.getElementById('arvChart')?.getContext?.('2d');

// ============================================================
// #2 BACKEND URL
// ============================================================
const backendURL = 'https://flip-ai.onrender.com';

// ============================================================
// #3 TEST BACKEND BUTTON
// ============================================================
btnTest.addEventListener('click', async () => {
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
btnAsk.addEventListener('click', async () => {
  console.log("🤖 Ask AI clicked");
  const zip = zipInput.value.trim();
  const price = priceInput.value.trim();
  const prompt = promptInput.value.trim();

  if (!zip || !price) {
    alert("Please enter ZIP and Price!");
    return;
  }

  try {
    const response = await fetch(`${backendURL}/api/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ zip, price, prompt })
    });

    if (!response.ok) throw new Error(`Server error: ${response.status}`);
    const data = await response.json();
    console.log("✅ AI Response:", data);

    resultEl.innerText = data.answer || "No answer provided.";
    crimeInfo.innerText = data.crime || "";
    schoolList.innerHTML = data.schools
      ? `<ul>${data.schools.map(s => `<li>${s}</li>`).join('')}</ul>`
      : "";

    glassBox.classList.add('show');

  } catch (err) {
    console.error("❌ Ask FlipAI Error:", err);
    alert("Ask FlipAI failed — see console for details!");
  }
});

// ============================================================
// #5 ENHANCE IMAGE BUTTON w/ ARV PIE
// ============================================================
btnEnhance.addEventListener('click', async () => {
  const file = imageInput.files[0];
  const price = parseFloat(priceInput.value);
  const invest = parseFloat(investInput.value);

  if (!file) {
    alert("Please choose an image first!");
    return;
  }

  console.log("🖼️ Uploading image for enhancement...");

  const formData = new FormData();
  formData.append('image', file);

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

    // Calculate ARV and show glass box with Pie Chart
    if (!isNaN(price) && !isNaN(invest)) {
      const expectedARV = Math.round((price + invest) / 0.7);
      const profit = expectedARV - price - invest;

      glassBox.classList.add('show');

      new Chart(arvCtx, {
        type: 'pie',
        data: {
          labels: ['Property Cost', 'Planned Investment', 'Expected Profit'],
          datasets: [{
            data: [price, invest, profit],
            backgroundColor: ['#36A2EB', '#FFCE56', '#4BC0C0']
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'bottom'
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
