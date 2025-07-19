// netlify/functions/runwayEnhance.js

const fetch = require('node-fetch');

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  const { prompt } = JSON.parse(event.body);

  try {
    const response = await fetch('https://api.dev.runwayml.com/v1/text_to_image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RUNWAY_API_KEY}`,
        'X-Runway-Version': '2024-11-06',
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

    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (err) {
    console.error('Runway API Error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Runway API failed', message: err.message }),
    };
  }
};
