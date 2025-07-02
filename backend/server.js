// ============================================================
// #7 ENHANCE IMAGE ROUTE (DALL·E VARIATION EXAMPLE)
// ============================================================
app.post('/api/enhance', upload.single('image'), async (req, res) => {
  console.log("🖼️ Received image for enhancement!");

  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    // Here you can save the uploaded file or transform it.
    console.log("✅ File buffer length:", req.file.buffer.length);

    // Example: Create a variation of the uploaded image
    const dalleResponse = await openai.images.createVariation({
      image: req.file.buffer,
      n: 1,
      size: "1024x1024",
    });

    console.log("✅ DALL·E variation generated:", dalleResponse.data[0].url);

    res.json({ enhancedImageUrl: dalleResponse.data[0].url });

  } catch (err) {
    console.error("❌ Enhance error:", err);
    res.status(500).json({ error: "Failed to enhance image" });
  }
});
