// ============================================================
// #1 ELEMENT SELECTORS
// ============================================================
const btnTest = document.getElementById('btn-test');
const btnAsk = document.getElementById('btn-ask');
const zipInput = document.getElementById('zip');
const priceInput = document.getElementById('price');
const promptInput = document.getElementById('prompt');
const btnEnhance = document.getElementById('btn-enhance');
const imageInput = document.getElementById('propertyImage');
const enhancedImage = document.getElementById('enhancedImage');

const glassBox = document.getElementById('glassBox');
const resultEl = document.getElementById('result');
const chartContainer = document.getElementById('chartContainer');
const schoolList = document.getElementById('schoolList');
const crimeInfo = document.getElementById('crimeInfo');

// ============================================================
// #2 BACKEND URL
// ============================================================
const backendURL = '';

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

    // Show glass box
    glassBox.classList.add('show');

    // If prices exist, draw chart
    if (data.prices) {
      chartContainer.style.display = 'block';
      const ctx = document.getElementById('priceChart').getContext('2d');
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: data.prices.map(p => p.label),
          datasets: [{
            label: 'Price Comparison',
            data: data.prices.map(p => p.value),
            backgroundColor: ['#36A2EB', '#FF6384'],
            borderRadius: 5
          }]
        },
        options: {
          animation: {
            duration: 1200,
            easing: 'easeOutBounce'
          },
          scales: {
            y: { beginAtZero: true }
          }
        }
      });
    }

  } catch (err) {
    console.error("❌ Ask FlipAI Error:", err);
    alert("Ask FlipAI failed — see console for details!");
  }
});

// ============================================================
// #5 ENHANCE IMAGE BUTTON
// ============================================================
btnEnhance.addEventListener('click', async () => {
  const file = imageInput.files[0];
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

    // Show enhanced image
    enhancedImage.src = data.enhancedImageUrl;
    enhancedImage.style.display = 'block';

  } catch (err) {
    console.error("❌ Enhance Image Error:", err);
    alert("Image enhancement failed — see console for details!");
  }
});
