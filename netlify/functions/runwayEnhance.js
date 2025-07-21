// /netlify/functions/runwayEnhance.js

const Runway = require('@runwayml/sdk');
require('dotenv').config();

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Only POST allowed' }),
    };
  }

  try {
    const { prompt, imageURL, ratio } = JSON.parse(event.body);

    if (!prompt || !imageURL) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing prompt or imageURL' }),
      };
    }

    const output = await Runway.run({
      model: 'gen-4',
      input: {
        prompt,
        image: imageURL,
        ratio: ratio || 'square',
      },
      apiKey: process.env.RUNWAY_API_KEY,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ result: output }),
    };

  } catch (err) {
    console.error('❌ Runway API error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Runway generation failed',
        details: err.message,
      }),
    };
  }
};
