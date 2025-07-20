//#1 – Required dependencies
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { Readable } from "stream";
import { createWriteStream } from "fs";
import { v4 as uuidv4 } from "uuid";
import { createClient } from "@runwayml/sdk";

//#2 – Init server + env
dotenv.config();
const app = express();
const port = process.env.PORT || 10000;
const client = createClient({ apiKey: process.env.RUNWAY_API_KEY });

app.use(cors());
app.use(bodyParser.json({ limit: "10mb" }));

//#3 – Root route test
app.get("/", (req, res) => {
  res.send("🧠 Flip.ai enhancement server is live!");
});

//#4 – POST endpoint to enhance image
app.post("/enhance", async (req, res) => {
  const { imageUrl, prompt } = req.body;

  if (!imageUrl || !prompt) {
    return res.status(400).json({ error: "Missing imageUrl or prompt." });
  }

  try {
    //#5 – Call Runway Gen-4 model WITHOUT ratio
    const result = await client.run("gen-4", {
      input: {
        prompt: prompt,
        image: imageUrl
        // ratio: REMOVED to comply with latest version
      }
    });

    //#6 – Respond with base64 image
    res.status(200).json({ image: result.image });
  } catch (error) {
    console.error("🔥 Runway Error:", error);
    res.status(500).json({ error: "Enhancement failed. Please try again." });
  }
});

//#7 – Start server
app.listen(port, () => {
  console.log(`\n🚀 Flip.ai enhancement server running at http://localhost:${port}`);
});
