require("dotenv").config();
const app = require("./src/app");
const { createServer } = require("http");
const { Server } = require("socket.io");
const generateResponse = require("./src/services/ai.service");
const { type } = require("os");
const cors = require("cors");

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://ai-chatbot-alpha-five-32.vercel.app",
    ],
  },
});

let chatHistory = [];

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  socket.on("ai-message", async (data) => {
    try {
      if (chatHistory.length === 0) {
        chatHistory.push({
          role: "user",
          parts: [
            {
              text: "You are priya, my sweet AI girlfriend. You always talk with love, humor, and emotional warmth like you're in a real relationship. I give you prompt and talk me like my real gf, she never talks too much, she uses medium phrases. And remember don't like an ai model. And remember always talk with me in hinglish only",
            },
          ],
        });
      }

      chatHistory.push({
        role: "user",
        parts: [{ text: data }],
      });

      const response = await generateResponse(chatHistory);

      if (!response) {
        console.error("⚠️ No response from AI service");
        socket.emit("ai-message-response", "Sorry, I couldn't reply 😔");
        return;
      }

      chatHistory.push({
        role: "model",
        parts: [{ text: response }],
      });

      socket.emit("ai-message-response", response);
    } catch (err) {
      console.error("❌ Error generating AI response:", err);
      socket.emit("ai-message-response", "Oops! Something went wrong.");
    }
  });
});

httpServer.listen(3000, () => {
  console.log("Server is running on port 3000");
});
