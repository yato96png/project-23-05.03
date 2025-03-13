import React, { useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [image, setImage] = useState(null);

  useEffect(() => {
    socket.on("message", (msg) => {
      setMessages((prev) => [...prev, { type: "text", content: msg }]);
    });

    socket.on("image", (data) => {
      setMessages((prev) => [...prev, { type: "image", content: data.url }]);
    });

    return () => {
      socket.off("message");
      socket.off("image");
    };
  }, []);

  const sendMessage = () => {
    if (message.trim()) {
      socket.send(message);
      setMessage("");
    }
  };

  const sendImage = () => {
    if (!image) return;

    const formData = new FormData();
    formData.append("file", image);

    fetch("http://localhost:5000/upload", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        socket.emit("image", { url: data.url });
      });

    setImage(null);
  };

  return (
    <div>
      <div>
        {messages.map((msg, index) => (
          <div key={index}>
            {msg.type === "text" ? (
              <p>{msg.content}</p>
            ) : (
              <img
                src={msg.content}
                alt="Sent"
                style={{ width: "100px", cursor: "pointer" }}
                onClick={() => window.open(msg.content)}
              />
            )}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
      />
      <button onClick={sendMessage}>Send</button>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImage(e.target.files[0])}
      />
      <button onClick={sendImage}>Send Image</button>
    </div>
  );
}
