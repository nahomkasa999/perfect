"use client"
import React from 'react'
import { io, Socket } from "socket.io-client";

const socket: Socket = io("http://localhost:3001");

function AIPrompt() {
    const [prompt, setPrompt] = React.useState("");
    const [aiResponse, setAiResponse] = React.useState("");

    React.useEffect(() => {
        const handleAiResponse = (data: { text: string }) => {
            console.log("Received AI response:", data.text);
            setAiResponse(data.text);
        };

        socket.on("aiResponse", handleAiResponse);

        return () => {
            socket.off("aiResponse", handleAiResponse);
        };
    }, []);

    const onSendHandler = () => {
        if (prompt.trim() !== "") {
            socket.emit("sendPromptToAI", { prompt });
            console.log("sending prompt:", prompt);
            setPrompt("");
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        onSendHandler();
      }
    };

    return (
        <div className='w-full bg-red-400 p-4 rounded-md'>
            <h1 className="text-xl font-bold mb-2">AI Prompt</h1>
            <div className="flex space-x-2">
                <input
                    className="w-full p-2 border rounded-md"
                    type="text"
                    placeholder="Enter your prompt..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <button
                    className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700"
                    onClick={onSendHandler}
                >
                    Send
                </button>
            </div>
            {aiResponse && (
                <div className="mt-4 p-4 bg-gray-100 rounded-md">
                    <p className="text-gray-800">{aiResponse}</p>
                </div>
            )}
        </div>
    )
}

export default AIPrompt
