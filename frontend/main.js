const btnAsk = document.getElementById('btn-ask');
const btnEnhance = document.getElementById('btn-enhance');
const priceInput = document.getElementById('price');
const investInput = document.getElementById('investment');
const imageInput = document.getElementById('propertyImage');

const planDiv = document.getElementById('plan');
const glassBox = document.getElementById('glassBox');
const enhancedImage = document.getElementById('enhancedImage');

let arvChart = null;

const backendURL = 'https://flip-ai.onrender.com';

btnAsk.addEventListener('click', async () => {
  const value = priceInput.value.trim();
  const investment = investInput.value.trim();

  if (!value || !investment) {
    alert("Enter value & investment!");
    return;
  }

  const res = await fetch(`${backendURL}/api/ask`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ value, investment })
  });
  const data = await res.json();

  planDiv.innerText = data.plan;

  if (arvChart) arvChart.destroy();
  const ctx = document.getElementById('arvChart').getContext('2d');
  arvChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Property', 'Investment', 'Profit'],
      datasets: [{
        data: [parseFloat(value), parseFloat(investment), (parseFloat(data.arv.replace(/[^0-9.-]+/g,"")) - parseFloat(value) - parseFloat(investment))],
        backgroundColor: ['#36A2EB','#FFCE56','#4BC0C0']
      }]
    }
  });

  glassBox.style.display = 'block';
});

btnEnhance.addEventListener('click', async () => {
  const file = imageInput.files[0];
  if (!file) return alert("Choose an image!");

  const formData = new FormData();
  formData.append('image', file);

  const res = await fetch(`${backendURL}/api/enhance`, {
    method: 'POST',
    body: formData
  });
  const data = await res.json();

  enhancedImage.src = data.enhancedImageUrl;
  enhancedImage.style.display = 'block';
});
