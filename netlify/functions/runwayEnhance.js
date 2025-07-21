const fetch = require("node-fetch");

exports.handler = async (event) => {
  try {
    const { imageURL, description } = JSON.parse(event.body);

    const runwayResponse = await fetch("https://api.runwayml.com/v2/real-esrgan/enhance", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.RUNWAY_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        input: {
          image: imageURL,
          prompt: description || "Enhance real estate photo with clearer details"
        }
      })
    });

    const data = await runwayResponse.json();

    return {
      statusCode: 200,
      body: JSON.stringify({
        base64: data.outputs[0]?.image || null,
        status: "success"
      })
    };
  } catch (err) {
    console.error("Runway enhance error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Enhancement failed", details: err.message })
    };
  }
};
