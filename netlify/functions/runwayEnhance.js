// # runwayEnhance.js
const fetch = require('node-fetch');
const Busboy = require('busboy');
const { uploadImageToFirebase } = require('./utilities/firebaseUpload');
const os = require('os');
const path = require('path');
const fs = require('fs');

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

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
};
