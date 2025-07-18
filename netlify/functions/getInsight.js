// ================================
// Flip.ai — getInsight.js (Netlify Function)
// Business Logic: 70% Rule + ROI
// ================================

const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

exports.handler = async (event) => {
  try {
    const { purchasePrice, arv, renoCost } = JSON.parse(event.body);

    const profit = arv - purchasePrice - renoCost;
    const seventyRuleMax = arv * 0.7 - renoCost;
    const pass = purchasePrice <= seventyRuleMax;

    // 🧠 Optional: Enhance with OpenAI logic
    const prompt = `
You're a real estate investment analyst. A client wants to assess this flip:

- Purchase Price: $${purchasePrice}
- ARV: $${arv}
- Renovation Cost: $${renoCost}

1. Calculate the net profit.
2. Determine if it passes the 70% rule (0.7 * ARV - Reno Cost >= Purchase Price).
3. Provide a one-paragraph summary advising if this is a solid flip or too risky.

Give just the summary only.
    `;

    const aiRes = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7
    });

    const summary = aiRes.choices[0].message.content;

    return {
      statusCode: 200,
      body: JSON.stringify({
        profit: Math.round(profit),
        pass,
        summary
      })
    };
  } catch (err) {
    console.error('getInsight error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
