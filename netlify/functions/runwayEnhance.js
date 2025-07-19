// ================================
// #1 — Imports & Environment Setup
const fetch = require('node-fetch');
require('dotenv').config();

// ================================
// #2 — Netlify Function Handler
exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const { imageUrl, prompt } = JSON.parse(event.body);

    if (!imageUrl || !prompt) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing imageUrl or prompt' }),
      };
    }

    // ================================
    // #3 — Call Runway Gen-4 Image (Text + Image)
    const response = await fetch("https://api.runwayml.com/v1/inferences", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.RUNWAY_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        version: "gen-4",  // This ensures it's Gen-4 Image model
        input: {
          prompt: prompt,
          image_url: imageUrl
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Runway Error:", data);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: data.error || "Runway API error" })
      };
    }

    // ================================
    // #4 — Download Image from Output URL
    const outputUrl = data.output?.image;
    if (!outputUrl) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "No image URL returned from Runway" })
      };
    }

    const imageRes = await fetch(outputUrl);
    const arrayBuffer = await imageRes.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString("base64");

    // ================================
    // #5 — Return Image to Frontend
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "image/jpeg"
      },
      body: base64Image,
      isBase64Encoded: true
    };

  } catch (error) {
    console.error("Server Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || "Unknown server error" })
    };
  }
};
