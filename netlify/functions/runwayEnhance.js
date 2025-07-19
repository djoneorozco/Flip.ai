const fetch = require('node-fetch');

exports.handler = async function(event) {
  try {
    const { flipPlan } = JSON.parse(event.body);

    const response = await fetch("https://api.runwayml.com/v1/inference", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.RUNWAY_API_KEY}`,
        "X-Runway-Version": "2024-06-01" // ✅ Important version header
      },
      body: JSON.stringify({
        model: "gen4_turbo", // ✅ Must match Runway's latest model slug
        input: {
          prompt: flipPlan,
          ratio: "16:9",
          seed: Math.floor(Math.random() * 999999999)
        }
      })
    });

    const result = await response.json();

    if (!response.ok || !result?.output?.image_url) {
      console.error("Runway error:", result);
      throw new Error(result?.error || "Runway API failed.");
    }

    const imageResponse = await fetch(result.output.image_url);
    const imageBuffer = await imageResponse.arrayBuffer();

    return {
      statusCode: 200,
      headers: { "Content-Type": "image/jpeg" },
      body: Buffer.from(imageBuffer).toString('base64'),
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
