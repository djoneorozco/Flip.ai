// 📁 /netlify/functions/runwayEnhance.js

const fetch = require('node-fetch');
require('dotenv').config();

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const { prompt, imageURL, ratio } = JSON.parse(event.body);

    if (!prompt || !imageURL) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required inputs: prompt or imageURL' }),
      };
    }

    const response = await fetch('https://api.runwayml.com/v1/generate/gen4_turbo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RUNWAY_API_KEY}`,
      },
      body: JSON.stringify({
        prompt: prompt,
        image_url: imageURL,
        ratio: ratio || 'square',
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({
          error: 'Runway generation failed',
          details: result,
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ result }),
    };
  } catch (error) {
    console.error('❌ Runway error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Unexpected server error',
        details: error.message,
      }),
    };
  }
};
