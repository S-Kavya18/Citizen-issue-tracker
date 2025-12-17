import React, { useState, useRef, useEffect } from "react";

const chatIconStyle = {
  position: "fixed",
  bottom: 32,
  right: 32,
  zIndex: 1001,
  background: "#2d6cdf",
  borderRadius: "50%",
  width: 60,
  height: 60,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
  cursor: "pointer"
};

const closeBtnStyle = {
  position: "absolute",
  top: 8,
  right: 12,
  background: "none",
  border: "none",
  fontSize: 22,
  color: "#2d6cdf",
  cursor: "pointer"
};
const botResponses = [
  {
    keywords: ["hello", "hi", "hey"],
    response: "Hello! How can I assist you today?"
  },
  {
    keywords: ["report", "issue", "problem"],
    response: "You can report a new issue by clicking the 'Report an Issue' button on the home page."
  },
  {
    keywords: ["volunteer", "help"],
    response: "Interested in volunteering? Go to the 'Become a Volunteer' section to get started!"
  },
  {
    keywords: ["status", "track"],
    response: "To track your issue, visit the 'Community Issues' page and search for your report."
  },
  {
    keywords: ["bye", "goodbye"],
    response: "Goodbye! Have a great day!"
  }
];

function getBotReply(message) {
  const msg = message.toLowerCase();
  for (const entry of botResponses) {
    if (entry.keywords.some(k => msg.includes(k))) {
      return entry.response;
    }
  }
  return "I'm here to help! Please ask your question.";
}

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Welcome to AreaAssist! How can I help you?" }
  ]);
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const popupRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e) {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = { sender: "user", text: input };
    const botMsg = { sender: "bot", text: getBotReply(input) };
    setMessages([...messages, userMsg, botMsg]);
    setInput("");
  };

  return (
    <>
      {!open && (
        <div style={chatIconStyle} onClick={() => setOpen(true)} title="Chat with AreaAssist">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="#2d6cdf"/><path d="M7 10h10v2H7v-2zm0 4h7v2H7v-2z" fill="#fff"/></svg>
        </div>
      )}
      {open && (
        <div ref={popupRef} style={{
          position: "fixed",
          bottom: 32,
          right: 32,
          width: 320,
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
          zIndex: 1002,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden"
        }}>
          <button style={closeBtnStyle} onClick={() => setOpen(false)} title="Close">×</button>
          <div style={{ background: "#2d6cdf", color: "#fff", padding: "12px 16px", fontWeight: 700 }}>AreaAssist Chatbot</div>
          <div style={{ flex: 1, padding: 16, overflowY: "auto", maxHeight: 260 }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                textAlign: msg.sender === "bot" ? "left" : "right",
                marginBottom: 8
              }}>
                <span style={{
                  display: "inline-block",
                  background: msg.sender === "bot" ? "#e9eef2" : "#2d6cdf",
                  color: msg.sender === "bot" ? "#222" : "#fff",
                  borderRadius: 12,
                  padding: "8px 12px",
                  maxWidth: "80%"
                }}>{msg.text}</span>
              </div>
            ))}
          </div>
          <form onSubmit={sendMessage} style={{ display: "flex", borderTop: "1px solid #e9eef2" }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type your message..."
              style={{ flex: 1, border: "none", padding: "10px 12px", outline: "none" }}
            />
            <button type="submit" style={{ background: "#2d6cdf", color: "#fff", border: "none", padding: "0 16px", borderRadius: "0 0 16px 0" }}>Send</button>
          </form>
        </div>
      )}
    </>
  );
};

export default Chatbot;
