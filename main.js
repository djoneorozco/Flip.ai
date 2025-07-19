const fetch = require('node-fetch');

exports.handler = async function(event) {
  try {
    const { flipPlan } = event.queryStringParameters;
    const imageBase64 = event.body;

    const res = await fetch("https://api.runwayml.com/v1/inferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.RUNWAY_API_KEY}`,
      },
      body: JSON.stringify({
        input: {
          prompt: flipPlan,
          image: imageBase64
        },
        model: "gen-2.5-image-to-image"
      })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.error?.message || "Runway API call failed.");
    }

    if (!data || !data.output || !data.output.image) {
      console.error("Unexpected response from Runway:", data);
      throw new Error("Runway did not return a valid image.");
    }

    const imageRes = await fetch(data.output.image);
    const imageBuffer = await imageRes.arrayBuffer();

    return {
      statusCode: 200,
      headers: { "Content-Type": "image/jpeg" },
      body: Buffer.from(imageBuffer).toString('base64'),
      isBase64Encoded: true
    };
  } catch (error) {
    console.error("Runway Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
