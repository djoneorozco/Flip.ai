// ================================
// Flip.ai Main.js — Full Flow
// ================================

// DOM Elements
const imageUpload = document.getElementById('imageUpload');
const flipPlanInput = document.getElementById('flipPlan');
const purchasePriceInput = document.getElementById('purchasePrice');
const arvInput = document.getElementById('arv');
const renoCostInput = document.getElementById('renoCost');
const analyzeBtn = document.getElementById('analyzeFlipBtn');

const resultSection = document.getElementById('resultSection');
const originalPreview = document.getElementById('originalPreview');
const enhancedPreview = document.getElementById('enhancedPreview');

const resPrice = document.getElementById('resPrice');
const resARV = document.getElementById('resARV');
const resReno = document.getElementById('resReno');
const resProfit = document.getElementById('resProfit');
const resPass = document.getElementById('resPass');

// ================================
// Upload & Trigger Analysis
// ================================
analyzeBtn.addEventListener('click', async () => {
  const file = imageUpload.files[0];
  if (!file) return alert('Upload an image first.');

  const flipPlan = flipPlanInput.value;
  const purchasePrice = Number(purchasePriceInput.value);
  const arv = Number(arvInput.value);
  const renoCost = Number(renoCostInput.value);

  // Preview original image
  originalPreview.src = URL.createObjectURL(file);

  const formData = new FormData();
  formData.append('image', file);
  formData.append('flipPlan', flipPlan);

  try {
    // ----------------------------
    // 1. Enhance Image with Runway
    // ----------------------------
    const runwayRes = await fetch('/.netlify/functions/runwayEnhance', {
      method: 'POST',
      body: formData
    });

    const runwayData = await runwayRes.json();

    if (!runwayRes.ok || !runwayData.outputUrl) {
      console.error('Runway Error:', runwayData);
      alert('❌ Image enhancement failed. Please try again.');
      return;
    }

    enhancedPreview.src = runwayData.outputUrl;

    // ----------------------------
    // 2. Analyze Investment
    // ----------------------------
    const insightRes = await fetch('/.netlify/functions/getInsight', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ purchasePrice, arv, renoCost })
    });

    const insight = await insightRes.json();

    // ----------------------------
    // 3. Populate Results
    // ----------------------------
    resPrice.innerText = `$${purchasePrice.toLocaleString()}`;
    resARV.innerText = `$${arv.toLocaleString()}`;
    resReno.innerText = `$${renoCost.toLocaleString()}`;
    resProfit.innerText = `$${insight.profit.toLocaleString()}`;
    resPass.innerText = insight.pass ? "✅ Yes" : "❌ No";

    resultSection.style.display = 'block';

  } catch (err) {
    console.error('🔥 Flip.ai crashed:', err);
    alert('Something went wrong during analysis. Please check your connection or try again later.');
  }
});
