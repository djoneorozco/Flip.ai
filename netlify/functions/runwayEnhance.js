// netlify/functions/runwayEnhance.js

const fetch = require('node-fetch');

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  let prompt;

  try {
    const data = JSON.parse(event.body);
    prompt = data.prompt;

    if (!prompt || typeof prompt !== 'string') {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing or invalid "prompt" in request body' }),
      };
    }
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid JSON in request body' }),
    };
  }

  const RUNWAY_API_KEY = process.env.RUNWAY_API_KEY;

  if (!RUNWAY_API_KEY) {
    console.error("❌ RUNWAY_API_KEY is missing.");
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server misconfiguration: API key not found' }),
    };
  }

  try {
    const response = await fetch('https://api.dev.runwayml.com/v1/text_to_image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RUNWAY_API_KEY}`,
        'X-Runway-Version': '2024-11-06'
      },
      body: JSON.stringify({
        promptText: prompt,
        model: 'gen4_image',
        ratio: '16:9',
        seed: Math.floor(Math.random() * 4294967295),
        contentModeration: {
          publicFigureThreshold: 'auto',
        },
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("❌ Runway API Error Response:", result);
      return {
        statusCode: response.status,
        body: JSON.stringify({
          error: result.error || 'Runway API error',
          details: result,
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };

  } catch (error) {
    console.error("❌ Network or Server Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Runway API failed',
        message: error.message,
      }),
    };
  }
};
