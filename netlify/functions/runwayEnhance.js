<<<<<<< HEAD
const fetch = require('node-fetch');
=======
// # runwayEnhance.js
const fetch = require('node-fetch');
const Busboy = require('busboy');
const { uploadImageToFirebase } = require('./utilities/firebaseUpload');
const os = require('os');
const path = require('path');
const fs = require('fs');
>>>>>>> 5e3bb9a1fa3e663f96cf38f17c672ba04f466121

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

<<<<<<< HEAD
  try {
    const { flipPlan } = event.queryStringParameters;
    const { imageBase64 } = JSON.parse(event.body);

    const response = await fetch('https://api.runwayml.com/v1/inference', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RUNWAY_API_KEY}`,
        'X-Runway-Version': '2024-11-06',
      },
      body: JSON.stringify({
        model: 'gen4_image',
        input: {
          promptText: flipPlan,
          image: imageBase64,
          ratio: '1920:1080',
          seed: Math.floor(Math.random() * 4294967295),
        },
      }),
    });

    const result = await response.json();

    if (!response.ok || !result?.output?.image) {
      console.error('Runway error:', result);
      throw new Error(result?.error || 'Runway API failed.');
    }

    const imgFetch = await fetch(result.output.image);
    const imgBuffer = await imgFetch.arrayBuffer();

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'image/jpeg' },
      body: Buffer.from(imgBuffer).toString('base64'),
      isBase64Encoded: true,
    };
  } catch (error) {
    console.error('Runway Handler Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
=======
  return new Promise((resolve, reject) => {
    const busboy = new Busboy({ headers: event.headers });
    let uploadBuffer = null;
    let prompt = '';

    busboy.on('file', (fieldname, file, filename) => {
      const filepath = path.join(os.tmpdir(), filename);
      const writeStream = fs.createWriteStream(filepath);
      file.pipe(writeStream);
      file.on('data', (data) => {
        if (!uploadBuffer) uploadBuffer = data;
        else uploadBuffer = Buffer.concat([uploadBuffer, data]);
      });
    });

    busboy.on('field', (fieldname, val) => {
      if (fieldname === 'prompt') {
        prompt = val;
      }
    });

    busboy.on('finish', async () => {
      try {
        const firebaseUrl = await uploadImageToFirebase(uploadBuffer, `input-${Date.now()}.jpg`);

        const runwayResponse = await fetch('https://api.runwayml.com/v1/inference/gen4_turbo', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.RUNWAY_API_KEY}`,
          },
          body: JSON.stringify({
            input_image: firebaseUrl,
            prompt: prompt,
          }),
        });

        const result = await runwayResponse.json();

        resolve({
          statusCode: 200,
          body: JSON.stringify(result),
        });
      } catch (error) {
        console.error('Runway Enhance Error:', error);
        reject({
          statusCode: 500,
          body: JSON.stringify({ error: error.message }),
        });
      }
    });

    busboy.end(Buffer.from(event.body, 'base64'));
  });
>>>>>>> 5e3bb9a1fa3e663f96cf38f17c672ba04f466121
};
