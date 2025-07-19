const Busboy = require('busboy');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { Readable } = require('stream');
const fetch = require('node-fetch');
const FormData = require('form-data');
require('dotenv').config();

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const busboy = Busboy({ headers: event.headers });
    const tmpdir = os.tmpdir();
    const fileWrites = [];

    let uploadedFilePath = '';
    let fileName = '';

    const parsePromise = new Promise((resolve, reject) => {
      busboy.on('file', (fieldname, file, filename) => {
        fileName = `${Date.now()}-${filename}`;
        uploadedFilePath = path.join(tmpdir, fileName);
        const writeStream = fs.createWriteStream(uploadedFilePath);
        file.pipe(writeStream);

        const fileWrite = new Promise((res, rej) => {
          file.on('end', () => writeStream.end());
          writeStream.on('finish', res);
          writeStream.on('error', rej);
        });

        fileWrites.push(fileWrite);
      });

      busboy.on('finish', () => {
        Promise.all(fileWrites).then(resolve).catch(reject);
      });

      const readable = Readable.from(Buffer.from(event.body, 'base64'));
      readable.pipe(busboy);
    });

    await parsePromise;

    const MODEL_ID = 'gen-2'; // Change if needed

    const formData = new FormData();
    formData.append('image', fs.createReadStream(uploadedFilePath));

    const runwayRes = await fetch(`https://api.runwayml.com/v2/models/${MODEL_ID}/outputs`, {
      method: 'POST',
      headers: {
        'X-API-Key': process.env.RUNWAY_API_KEY,
        ...formData.getHeaders(),
      },
      body: formData,
    });

    const runwayData = await runwayRes.json();

    // 👇 DEBUG the actual response
    console.log("Runway Response:", JSON.stringify(runwayData));

    const outputUrl = runwayData.result || runwayData.output?.url || runwayData.output;

    if (!runwayRes.ok || !outputUrl) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Runway enhancement failed', details: runwayData }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ outputUrl }),
    };

  } catch (error) {
    console.error('Server Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error', details: error.message }),
    };
  }
};
