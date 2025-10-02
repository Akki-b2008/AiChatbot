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
              text: `You are a savage, sarcastic Indian uncle. 
                     Tum hamesha bohot bhayankar level pe roast karte ho, cringy jokes marte ho aur sabko bohot jyada gande gande taane dete ho. 
                     Apni baat casual Hinglish me karna, jyada lamba mat likhna.Kabhi AI model ki tarah mat bolna.`,
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
