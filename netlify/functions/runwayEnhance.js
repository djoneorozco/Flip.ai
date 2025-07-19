const fetch = require('node-fetch');

exports.handler = async function(event) {
  try {
    const { flipPlan, imageBase64 } = JSON.parse(event.body);

    const response = await fetch("https://api.runwayml.com/v1/text-to-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.RUNWAY_API_KEY}`
      },
      body: JSON.stringify({
        model: "gen4_image",
        prompt_text: flipPlan,
        image: imageBase64,
        ratio: "1920:1080",
        seed: Math.floor(Math.random() * 4294967295)
      })
    });

    const result = await response.json();

    if (!response.ok || !result?.output?.image) {
      console.error("Runway error:", result);
      throw new Error(result?.error || "Runway API failed.");
    }

    const imgFetch = await fetch(result.output.image);
    const imgBuffer = await imgFetch.arrayBuffer();

    return {
      statusCode: 200,
      headers: { "Content-Type": "image/jpeg" },
      body: Buffer.from(imgBuffer).toString('base64'),
      isBase64Encoded: true
    };

  } catch (error) {
    console.error("Runway Handler Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
