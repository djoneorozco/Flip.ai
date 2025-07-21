//#1: Button and Image Setup
const enhanceButton = document.getElementById("runEnhance");
const enhancedImg = document.getElementById("enhanced");

//#2: Static Test URL from Firebase
const firebaseImageUrl = "https://firebasestorage.googleapis.com/v0/b/flip-26d24.firebasestorage.app/o/uploads%2Fimages.jpg?alt=media&token=554f9e08-f28a-47b1-89b8-5c7d09c01936";

//#3: Enhance Logic
enhanceButton.addEventListener("click", async () => {
  enhanceButton.disabled = true;
  enhanceButton.textContent = "Enhancing…";

  try {
    const res = await fetch("https://flip-ai.onrender.com/api/enhance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        image_url: firebaseImageUrl
      })
    });

    const data = await res.json();

    if (data.result && data.result.image) {
      const base64 = data.result.image;
      enhancedImg.src = `data:image/png;base64,${base64}`;
    } else {
      alert("Failed to get image from response.");
      console.error(data);
    }
  } catch (err) {
    console.error("Enhancement failed:", err);
    alert("Something went wrong. See console.");
  } finally {
    enhanceButton.disabled = false;
    enhanceButton.textContent = "Enhance Image";
  }
});
