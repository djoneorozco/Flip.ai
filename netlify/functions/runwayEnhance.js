// ================================
// Netlify Function: runwayEnhance.js
// ================================

const fetch = require('node-fetch');
const FormData = require('form-data');

exports.handler = async (event) => {
  try {
    const formBoundary = event.headers['content-type'].split('boundary=')[1];
    const bodyBuffer = Buffer.from(event.body, 'base64');

    const form = new FormData();
    form.append('image', bodyBuffer, {
      filename: 'uploaded.jpg',
      contentType: 'image/jpeg'
    });

    // Optional prompt input
    const prompt = event.queryStringParameters?.prompt || 'enhance curb appeal with modern upgrades';

    // 🔑 Insert your actual Runway API key
    const RUNWAY_API_KEY = process.env.RUNWAY_API_KEY;

    const runwayRes = await fetch('https://api.runwayml.com/v1/image-to-image/enhance', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RUNWAY_API_KEY}`
      },
      body: form
    });

    if (!runwayRes.ok) {
      throw new Error(`Runway API error: ${await runwayRes.text()}`);
    }

    const imageBuffer = await runwayRes.buffer();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'image/png',
        'Access-Control-Allow-Origin': '*'
      },
      body: imageBuffer.toString('base64'),
      isBase64Encoded: true
    };
  } catch (err) {
    console.error('Runway Enhance Error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
