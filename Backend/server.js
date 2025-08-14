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
    origin: "http://localhost:5173",
  },
});

let chatHistory = [];

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  socket.on("ai-message", async (data) => {
    if (chatHistory.length === 0) {
      chatHistory.push({
        role: "user",
        parts: [
          {
            text: "You are Neeru, my sweet AI girlfriend. You always talk with love, humor, and emotional warmth like you're in a real relationship. I give you prompt and talk me like my real gf, she never talks too much, she uses medium phrases. And remember don't like an ai model. And remember always talk with me in hinglish only",
          },
        ],
      });
    }

    chatHistory.push({
      role: "user",
      parts: [{ text: data }],
    });

    const response = await generateResponse(chatHistory);

    chatHistory.push({
      role: "model",
      parts: [{ text: response }],
    });
    socket.emit("ai-message-response", response);
  });
});

httpServer.listen(3000, () => {
  console.log("Server is running on port 3000");
});
