const fetch = require("node-fetch");

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed",
    };
  }

  try {
    const { flipPlan, imageURL } = JSON.parse(event.body);

    const runwayResponse = await fetch("https://api.runwayml.com/v1/inference", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.RUNWAY_API_KEY}`,
        "X-Runway-Version": "2024-07-01"
      },
      body: JSON.stringify({
        model: "gen4_turbo",
        input: {
          prompt: flipPlan,
          image: imageURL
        }
      })
    });

    const result = await runwayResponse.json();

    if (!runwayResponse.ok || !result?.output?.image) {
      console.error("❌ Runway error:", result);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: result?.error || "Runway API failed" }),
      };
    }

    const imgRes = await fetch(result.output.image);
    const imgBuffer = await imgRes.arrayBuffer();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        base64: Buffer.from(imgBuffer).toString("base64"),
      }),
    };
  } catch (error) {
    console.error("❌ Netlify Function Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
