const fetch = require('node-fetch');

exports.handler = async function(event) {
  try {
    // Step 1: Parse the input from frontend
    const { flipPlan, imageURL } = JSON.parse(event.body);

    // Sanity check for image URL
    if (!flipPlan || !imageURL) {
      throw new Error("Missing required fields: flipPlan or imageURL");
    }

    // Step 2: Log what we’re sending to Runway for debugging
    console.log("🔍 Sending to Runway:", {
      model: "gen4_turbo",
      input: {
        prompt: flipPlan,
        image: imageURL
      }
    });

    // Step 3: Send request to Runway
    const runwayResponse = await fetch("https://api.runwayml.com/v1/inference", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.RUNWAY_API_KEY}`,
        "X-Runway-Version": "2024-07-01"
      },
      body: JSON.stringify({
        model: "gen4_turbo",
        input: {
          prompt: flipPlan,
          image: imageURL
        }
      })
    });

    const result = await runwayResponse.json();

    // Step 4: Log Runway's raw response
    console.log("🔁 Runway Response:", result);

    // Step 5: Error check response
    if (!runwayResponse.ok || !result?.output?.image) {
      console.error("Runway API Error:", result);
      throw new Error(result?.error || "Runway API failed to generate image.");
    }

    // Step 6: Fetch the generated image
    const imageFetch = await fetch(result.output.image);
    const imageBuffer = await imageFetch.arrayBuffer();

    // Step 7: Return base64 image back to frontend
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "image/jpeg"
      },
      body: Buffer.from(imageBuffer).toString('base64'),
      isBase64Encoded: true
    };

  } catch (error) {
    console.error("❌ RunwayEnhance Error:", error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
