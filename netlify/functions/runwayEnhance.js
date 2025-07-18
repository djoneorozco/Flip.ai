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

    // Upload image to Runway Gen-4
    const formData = new FormData();
    formData.append('image', fs.createReadStream(uploadedFilePath));

    const runwayRes = await fetch('https://api.runwayml.com/v2/models/gen-4/outputs', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RUNWAY_API_KEY}`,
        ...formData.getHeaders()
      },
      body: formData,
    });

    const runwayData = await runwayRes.json();

    if (!runwayData || !runwayData.output || !runwayData.output.url) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Enhancement failed or no output returned.' }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ outputUrl: runwayData.output.url }),
    };

  } catch (error) {
    console.error('Enhancement error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server error during enhancement.' }),
    };
  }
};
