// =============================================================
// ✅ Flip.ai — main.js for Combined Image + ARV Smart Budget
// =============================================================

console.log("✅ Flip.ai main.js loaded");

document.getElementById('processBtn').addEventListener('click', async () => {
  const imageFile = document.getElementById('imageFileInput').files[0];
  const purchasePrice = document.getElementById('purchasePrice').value;
  const investmentAmount = document.getElementById('investmentAmount').value;

  if (!imageFile) {
    alert("⚠️ Please select a property image!");
    return;
  }
  if (!purchasePrice || !investmentAmount) {
    alert("⚠️ Please enter purchase price and investment amount!");
    return;
  }

  // ===========================================================
  // ✅ 1️⃣ Enhance Image
  // ===========================================================
  const formData = new FormData();
  formData.append('image', imageFile);

  let enhancedImageUrl = '';
  try {
    console.log("✨ Sending image to backend...");
    const response = await fetch('https://flip-ai.onrender.com/api/enhance', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Enhance failed: ${errorText}`);
    }

    const data = await response.json();
    enhancedImageUrl = data.enhancedImageUrl;
    console.log("✅ Enhanced image URL:", enhancedImageUrl);

  } catch (err) {
    console.error("❌ Enhance error:", err);
    alert(`Image enhance failed: ${err.message}`);
    return;
  }

  // ===========================================================
  // ✅ 2️⃣ Get Smart ARV Budget
  // ===========================================================
  let arvData = {};
  try {
    console.log("💰 Getting smart flip numbers...");
    const response = await fetch('https://flip-ai.onrender.com/api/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        value: purchasePrice,
        investment: investmentAmount
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ask failed: ${errorText}`);
    }

    arvData = await response.json();
    console.log("✅ ARV Data:", arvData);

  } catch (err) {
    console.error("❌ Ask error:", err);
    alert(`Smart budget failed: ${err.message}`);
    return;
  }

  // ===========================================================
  // ✅ 3️⃣ Show it all
  // ===========================================================
  document.getElementById('result').innerHTML = `
    <h3>Enhanced Image:</h3>
    <img src="${enhancedImageUrl}" alt="Enhanced">

    <h3>Smart Budget:</h3>
    <p><strong>ARV:</strong> ${arvData.arv}</p>
    <p><strong>Max Offer (70% Rule):</strong> ${arvData.maxOffer}</p>
    <p><strong>Answer:</strong><br>${arvData.answer.replace(/\n/g, '<br>')}</p>
  `;

  // ===========================================================
  // ✅ 4️⃣ Simple Graph
  // ===========================================================
  const ctx = document.getElementById('flipChart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Purchase Price', 'Investment', 'Max Offer', 'ARV'],
      datasets: [{
        label: 'Flip Breakdown ($)',
        data: [
          Number(purchasePrice),
          Number(investmentAmount),
          Number(arvData.maxOffer.replace(/\$|,/g, '')),
          Number(arvData.arv.replace(/\$|,/g, ''))
        ],
        backgroundColor: [
          '#3498db',
          '#f1c40f',
          '#2ecc71',
          '#e67e22'
        ]
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });

});
