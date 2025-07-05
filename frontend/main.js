console.log("✅ Flip.ai main.js loaded");

// === DOM Elements ===
const imageInput = document.getElementById('propertyImage');
const purchasePriceInput = document.getElementById('purchasePrice');
const rehabInvestmentInput = document.getElementById('rehabInvestment');
const generateBtn = document.getElementById('generateReport');
const resultDiv = document.getElementById('result');
const graphDiv = document.getElementById('graph');

// === BACKEND URL ===
const BACKEND_URL = 'https://flip-ai.onrender.com';

generateBtn.addEventListener('click', async () => {
  resultDiv.innerHTML = "⏳ Generating...";

  const purchasePrice = purchasePriceInput.value.trim();
  const rehabInvestment = rehabInvestmentInput.value.trim();
  const imageFile = imageInput.files[0];

  if (!purchasePrice || !rehabInvestment) {
    resultDiv.innerHTML = "❌ Please enter both purchase price and rehab investment.";
    return;
  }

  if (!imageFile) {
    resultDiv.innerHTML = "❌ Please select an image.";
    return;
  }

  try {
    // === 1️⃣ Get Budget Numbers ===
    const askResponse = await fetch(`${BACKEND_URL}/api/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        value: purchasePrice,
        investment: rehabInvestment
      })
    });

    const askData = await askResponse.json();

    // === 2️⃣ Enhance Image ===
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('investment', rehabInvestment); // ✅ IMPORTANT: pass investment for tier logic

    const enhanceResponse = await fetch(`${BACKEND_URL}/api/enhance`, {
      method: 'POST',
      body: formData
    });

    const enhanceData = await enhanceResponse.json();

    // === 3️⃣ Show Results ===
    resultDiv.innerHTML = `
      <h4>✅ Smart Budget Report</h4>
      <pre>${askData.answer}</pre>
      <h4>✅ Enhanced Image</h4>
      <p><strong>Enhancement Tier Used:</strong> ${enhanceData.tierUsed}</p>
      <img src="${enhanceData.enhancedImageUrl}" alt="Enhanced Property" width="500"/>
    `;

    graphDiv.innerHTML = `
      <p>ARV: ${askData.arv}</p>
      <p>Max Offer (70% Rule): ${askData.maxOffer}</p>
    `;

  } catch (err) {
    console.error("❌ Flip.ai Error:", err);
    resultDiv.innerHTML = "❌ Something went wrong. Please try again.";
  }
});
