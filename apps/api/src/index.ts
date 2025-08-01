import { serve } from "@hono/node-server";
import { Server } from "socket.io";

import app from "./app.js";

const httpServer = serve(
  {
    fetch: app.fetch,
    port: 3001,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const callGeminiApi = async (prompt: object, retryCount = 0) => {
    const apiKey = "";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
    const payload = {
        contents: [{
            role: "user",
            parts: [{ text: prompt }]
        }]
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.status === 429 && retryCount < 5) {
            const delay = Math.pow(2, retryCount) * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
            return callGeminiApi(prompt, retryCount + 1);
        }

        const result = await response.json();
        if (result.candidates && result.candidates.length > 0 &&
            result.candidates[0].content && result.candidates[0].content.parts &&
            result.candidates[0].content.parts.length > 0) {
            return result.candidates[0].content.parts[0].text;
        } else {
            console.error("Gemini API response was malformed:", result);
            return null;
        }

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return null;
    }
};

io.on("connection", (clientSocket) => {
  console.log(`Frontend client connected: ${clientSocket.id}`);

  clientSocket.on("sendToGoogleApi", async (data) => {
    console.log(
      `Received prompt from frontend client ${clientSocket.id}:`,
      data
    );

    const aiResponse = await callGeminiApi(data.prompt);

    if (aiResponse) {
      clientSocket.emit("googleApiResponse", { text: aiResponse });
    } else {
      clientSocket.emit("googleApiResponse", {
        text: "Sorry, I could not generate a response.",
      });
    }
  });

  clientSocket.on("disconnect", (reason) => {
    console.log(`Frontend client disconnected: ${clientSocket.id} (${reason})`);
  });
});
