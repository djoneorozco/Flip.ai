console.log("✅ Flip.ai main.js loaded");

const enhanceBtn = document.getElementById("enhanceBtn");
const backendUrl = 'https://YOUR-BACKEND-URL.onrender.com/api/enhance'; // 🔑 replace with your actual Render backend

enhanceBtn.addEventListener("click", async () => {
  console.log("✨ Enhance Button Clicked");

  const zip = document.getElementById("zip").value;
  const price = document.getElementById("price").value;
  const investment = document.getElementById("investment").value;
  const details = document.getElementById("details").value;
  const fileInput = document.getElementById("propertyImage");
  const file = fileInput.files[0];

  if (!file) {
    alert("Please select an image to enhance.");
    return;
  }

  const formData = new FormData();
  formData.append('image', file);
  formData.append('zip', zip);
  formData.append('price', price);
  formData.append('investment', investment);
  formData.append('details', details);

  try {
    const response = await fetch(backendUrl, {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    console.log("✅ Variation Response:", data);

    if (data.enhancedImageUrl) {
      const resultImage = document.getElementById("resultImage");
      resultImage.src = data.enhancedImageUrl;
      resultImage.style.display = 'block';
    } else {
      alert("No image returned.");
    }

  } catch (err) {
    console.error("❌ Enhance Image Error:", err);
    alert(`Enhance failed: ${err.message}`);
  }
});
