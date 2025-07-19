const fetch = require('node-fetch');

exports.handler = async function(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { flipPlan, imageURL } = JSON.parse(event.body);

    const response = await fetch("https://api.runwayml.com/v1/inference", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.RUNWAY_API_KEY}`,
        "X-Runway-Version": "2024-11-06"
      },
      body: JSON.stringify({
        model: "gen4_turbo",
        input: {
          prompt: flipPlan,
          image: imageURL,
          ratio: "16:9",
          seed: Math.floor(Math.random() * 4294967295)
        }
      })
    });

    const result = await response.json();

    if (!response.ok || !result?.output?.image) {
      console.error("Runway API Error:", result);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: result?.error || "Runway failed." })
      };
    }

    const imageResponse = await fetch(result.output.image);
    const buffer = await imageResponse.arrayBuffer();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        base64: Buffer.from(buffer).toString("base64")
      })
    };
  } catch (error) {
    console.error("Handler Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
