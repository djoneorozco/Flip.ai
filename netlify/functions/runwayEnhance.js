const fetch = require('node-fetch');
const { uploadImageToFirebase } = require('./utilities/firebaseUpload');
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
    const { imageBase64, prompt } = data;

    if (!imageBase64 || !prompt) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing image or prompt' }),
      };
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(imageBase64.replace(/^data:image\/\w+;base64,/, ''), 'base64');

    // Upload to Firebase
    const filename = `${uuidv4()}.jpg`;
    const imageUrl = await uploadImageToFirebase(buffer, filename);

    console.log("✅ Uploaded image URL:", imageUrl);

    // Runway API call
    const runwayResponse = await fetch('https://api.runwayml.com/v1/inference/gen-3-alpha', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RUNWAY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        input: {
          image: imageUrl,
          prompt: prompt,
          guidance_scale: 7,
          strength: 0.75
        }
      })
    });

    const result = await runwayResponse.json();

    if (!runwayResponse.ok) {
      console.error("❌ Runway API Error:", result);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Runway API call failed', details: result }),
      };
    }

    const outputImage = result.output?.image_base64;
    if (!outputImage) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'No image returned from Runway' }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ image: outputImage }),
    };

  } catch (error) {
    console.error("❌ Server Crash Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error', details: error.message }),
    };
  }
};
