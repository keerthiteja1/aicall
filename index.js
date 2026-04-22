const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// 🔑 API Keys (set in Railway variables)
const SARVAM_API_KEY = process.env.SARVAM_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// 🧠 Main route
app.post("/voice", async (req, res) => {
  try {
    const userText = req.body?.message || "Hello";

    console.log("User:", userText);

    // 🧠 Step 1: Get response from Gemini
    const geminiResponse = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: `You are a helpful Indian AI assistant. 
Reply in the same language as the user (Hindi, English, Hinglish, Telugu, etc).
Keep the reply short (1-2 sentences max).

User: ${userText}`
              }
            ]
          }
        ]
      }
    );

    const reply =
      geminiResponse.data.candidates[0].content.parts[0].text;

    console.log("AI Reply:", reply);

    // 🔊 Step 2: Convert text → speech using Sarvam
    const ttsResponse = await axios.post(
      "https://api.sarvam.ai/text-to-speech",
      {
        text: reply,
        voice: "hindi_female" // you can change later
      },
      {
        headers: {
          Authorization: `Bearer ${SARVAM_API_KEY}`
        },
        responseType: "arraybuffer"
      }
    );

    // 🔁 Step 3: Convert audio to base64
    const audioBase64 = Buffer.from(ttsResponse.data).toString("base64");

    // 🔄 Step 4: Send back to Vapi
    res.json({
      type: "audio",
      audio: `data:audio/wav;base64,${audioBase64}`
    });

  } catch (error) {
    console.error("ERROR:", error.response?.data || error.message);

    res.json({
      type: "text",
      text: "Sorry, kuch error ho gaya"
    });
  }
});

// 🚀 Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
