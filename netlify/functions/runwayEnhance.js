// ================================
// # runwayEnhance.js — FINAL FIX
// ================================
const fetch = require('node-fetch');
const { v4: uuidv4 } = require('uuid');

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const data = JSON.parse(event.body);
    const { imageUrl, prompt } = data;

    if (!imageUrl || !prompt) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing imageUrl or prompt' }),
      };
    }

    console.log("🔥 Received imageUrl:", imageUrl);
    console.log("🧠 Received prompt:", prompt);

    // Runway Gen-4 Turbo API Call
    const runwayResponse = await fetch('https://api.runwayml.com/v1/inference/gen-4-turbo', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RUNWAY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: {
          image: imageUrl,
          prompt: prompt,
          strength: 0.75,
          guidance_scale: 7,
        },
      }),
    });

    const result = await runwayResponse.json();

    if (!runwayResponse.ok) {
      console.error("❌ Runway API Error:", result);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: result.error || "Runway API failed." }),
      };
    }

    console.log("✅ Runway Output:", result);

    return {
      statusCode: 200,
      body: JSON.stringify({ image: result.output }),
    };

  } catch (err) {
    console.error("❌ Server Error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || "Server Error" }),
    };
  }
};
