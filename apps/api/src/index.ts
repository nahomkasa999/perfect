import { serve } from "@hono/node-server";
import { Server } from "socket.io";
import app from "./app.js";
import { GoogleGenAI } from "@google/genai";

const GOOGLE_API_KEY = "AIzaSyA5y-1WlLrbIVnsda2gkltOkpR8mNO9Gvo";
const GEMINI_MODEL = "gemini-2.5-flash";

const ai = new GoogleGenAI({ apiKey: GOOGLE_API_KEY });

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
    methods: ["GET", "POST"],
  },
});

io.on("connection", (clientSocket) => {
  console.log(`Frontend client connected: ${clientSocket.id}`);

  clientSocket.on("sendToGoogleApi", async (data) => {
    console.log(
      `Received prompt from frontend client ${clientSocket.id}:`,
      data
    );

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents:`you are a grammer teacher and world class writer. your style of writing is similar to Robert Greene the author of power and human nature. correct this sentence, enhance and amplife the grammer and emotion we you do so dont add a lot to the users sentence if the user write one sentence reponed with one sentence with out living users originality` + data.text,
        config: {
           responseMimeType: "application/json",
          thinkingConfig: {
            thinkingBudget: 0,
          },
        },
      });

      const geminiResponse = response.candidates![0].content?.parts

      console.log(
        `Received response from Gemini API for client ${clientSocket.id}:`,
        geminiResponse
      );

      clientSocket.emit("googleApiResponse", {
        text: geminiResponse,
      });
    } catch (error: any) {
      console.error(
        `Error calling Gemini API for client ${clientSocket.id}:`,
        error
      );
      clientSocket.emit("googleApiError", {
        message: `Failed to communicate with Gemini API: ${error.message || "Unknown error"}`,
        details: error,
      });
    }
  });

  clientSocket.on("disconnect", (reason) => {
    console.log(`Frontend client disconnected: ${clientSocket.id} (${reason})`);
  });
});
