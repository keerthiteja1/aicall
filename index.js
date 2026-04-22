const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const SARVAM_API_KEY = process.env.SARVAM_API_KEY;

// main route
app.post("/voice", async (req, res) => {
  try {
    const userText = req.body?.message || "Hello";

    const reply =  ${userText};

    // Sarvam TTS
    const response = await axios.post(
      "https://api.sarvam.ai/text-to-speech",
      {
        text: reply,
        voice: "hindi_female"
      },
      {
        headers: {
          Authorization: `Bearer ${SARVAM_API_KEY}`
        },
        responseType: "arraybuffer"
      }
    );

    // convert to base64
    const audioBase64 = Buffer.from(response.data).toString("base64");

    res.json({
      type: "audio",
      audio: `data:audio/wav;base64,${audioBase64}`
    });

  } catch (err) {
    console.log(err.message);
    res.json({
      type: "text",
      text: "Error happened"
    });
  }
});

app.listen(3000, () => console.log("Server running"));
