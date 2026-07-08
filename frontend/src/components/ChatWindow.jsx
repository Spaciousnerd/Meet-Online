import React from "react";
import "../styles/VideoMeet.css";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import { TextField, IconButton } from "@mui/material";
export default function ChatWindow({
  onToggleChatWindow,
  messages = [],
  message,
  setMessage,
  sendMessage,
}) {
  return (
    <div className="chatWindow">
      <div className="chat-header">
        <h2>Chat</h2>

        <IconButton onClick={onToggleChatWindow}>
          <CloseIcon />
        </IconButton>
      </div>

      <div className="chat-area">
        {messages.length === 0 ? (
          <p className="empty-chat">No messages yet</p>
        ) : (
          messages.map((msg, index) => (
            <div className="message" key={index}>
              <span className="sender">{msg.sender}</span>
              <p>{msg.message}</p>
            </div>
          ))
        )}
      </div>

      <div className="chat-input">
        <TextField
          fullWidth
          placeholder="Type a message..."
          variant="outlined"
          size="small"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
        />
        <IconButton color="primary" onClick={sendMessage}>
          <SendIcon />
        </IconButton>
      </div>
    </div>
  );
}
