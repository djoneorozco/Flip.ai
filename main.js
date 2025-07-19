//#1: Wait for DOM to load
document.addEventListener("DOMContentLoaded", function () {
  const uploadInput = document.getElementById("upload");
  const previewImg = document.getElementById("preview");
  const resultImg = document.getElementById("result");
  const planInput = document.getElementById("flip-plan");
  const generateBtn = document.getElementById("generate");
  const loader = document.getElementById("loader");

  let base64Image = "";

  //#2: Convert uploaded image to base64
  uploadInput.addEventListener("change", function () {
    const file = uploadInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      base64Image = e.target.result.split(",")[1]; // Remove base64 prefix
      previewImg.src = e.target.result;
      previewImg.style.display = "block";
    };
    reader.readAsDataURL(file);
  });

  //#3: Send POST to runwayEnhance function
  generateBtn.addEventListener("click", async function () {
    const flipPlan = planInput.value.trim();

    if (!base64Image || !flipPlan) {
      alert("Please upload an image and enter a flip plan.");
      return;
    }

    loader.style.display = "block";
    resultImg.style.display = "none";

    try {
      const response = await fetch(`/.netlify/functions/runwayEnhance?flipPlan=${encodeURIComponent(flipPlan)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          imageBase64: base64Image
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Unknown error from server");
      }

      const imageBlob = await response.blob();
      const imageURL = URL.createObjectURL(imageBlob);
      resultImg.src = imageURL;
      resultImg.style.display = "block";
    } catch (err) {
      console.error("Runway enhancement failed:", err.message);
      alert("Image generation failed. Check logs or try a different image.");
    } finally {
      loader.style.display = "none";
    }
  });
});
