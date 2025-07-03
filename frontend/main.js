// =============================================================
// ✅ Flip.ai — main.js for One Image Upload
// =============================================================

console.log("✅ Flip.ai main.js loaded");

document.getElementById('uploadBtn').addEventListener('click', async () => {
  const imageFile = document.getElementById('imageFileInput').files[0];

  if (!imageFile) {
    alert("⚠️ You must select an image to enhance!");
    return;
  }

  const formData = new FormData();
  formData.append('image', imageFile);

  try {
    console.log("✨ Sending image to backend...");

    const response = await fetch('https://flip-ai.onrender.com/api/enhance', {
      method: 'POST',
      body: formData
      // ❌ DO NOT set Content-Type! Browser handles it for FormData.
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server responded with ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log("✅ Enhanced image URL:", data.enhancedImageUrl);

    // ============================
    // Show the result on the page
    // ============================
    document.getElementById('result').innerHTML = `
      <p><strong>Enhanced Image URL:</strong>
        <a href="${data.enhancedImageUrl}" target="_blank">${data.enhancedImageUrl}</a>
      </p>
      <img src="${data.enhancedImageUrl}" alt="Enhanced" style="max-width:500px; border:1px solid #333;">
    `;

  } catch (error) {
    console.error("❌ Enhance Image Error:", error);
    alert(`Enhance failed: ${error.message}`);
  }
});
