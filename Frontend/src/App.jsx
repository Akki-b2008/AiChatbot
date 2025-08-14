import { useState, useRef, useEffect } from "react";
import { io } from "socket.io-client";
import "./App.css";

function App() {
  const socket = useRef(null);
  const [messages, setMessages] = useState([
    { sender: "ai" },
  ]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);

  // ✅ Connect to the socket server at localhost:3000
  useEffect(() => {
    socket.current = io(
      window.location.hostname === "localhost"
        ? "http://localhost:3000"
        : "https://aichatbot-tlzb.onrender.com/"
    );
    // Optional: log connection status
    socket.current.on("connect", () => {
      console.log("Connected to socket server");
    });

    // Listen for AI message from server
    socket.current.on("ai-message-response", (text) => {
      setMessages((msgs) => [...msgs, { sender: "ai", text }]);
    });

    // Cleanup
    return () => {
      socket.current.disconnect();
    };
  }, []);

  // Scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();

    // Show user message
    setMessages((msgs) => [...msgs, { sender: "user", text: userText }]);
    setInput("");

    // Emit message to server
    socket.current.emit("ai-message", userText);
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <span className="chat-title">AI Chatbot</span>
      </div>
      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`chat-bubble ${msg.sender === "user" ? "user" : "ai"}`}
          >
            {msg.text}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      <form className="chat-input-area" onSubmit={handleSend}>
        <input
          className="chat-input"
          type="text"
          placeholder="Type your message…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button className="send-btn" type="submit">
          ➤
        </button>
      </form>
    </div>
  );
}

export default App;

