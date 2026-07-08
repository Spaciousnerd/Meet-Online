import React from "react";
import "../styles/VideoMeet.css";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import MicNoneIcon from "@mui/icons-material/MicNone";
import MicOffIcon from "@mui/icons-material/MicOff";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";
import CallEndIcon from "@mui/icons-material/CallEnd";
import ChatIcon from "@mui/icons-material/Chat";
export default function VideoControls({
  isVideoEnabled,
  isAudioEnabled,
  onToggleVideo,
  onToggleAudio,
  isScreenSharing,
  onToggleScreenShare,
  onToggleChatWindow,
  endCall,
  askForUsername,
}) {
  return (
    <div className="videoControls">
      <button onClick={onToggleVideo} className="control-button">
        {isVideoEnabled ? <VideocamIcon /> : <VideocamOffIcon />}
      </button>
      <button onClick={onToggleAudio} className="control-button">
        {isAudioEnabled ? <MicNoneIcon /> : <MicOffIcon />}
      </button>
      <button
        onClick={onToggleScreenShare}
        className={`control-button ${askForUsername ? "active" : "inactive"}`}
        disabled={askForUsername}
      >
        {isScreenSharing ? <StopScreenShareIcon /> : <ScreenShareIcon />}
      </button>
      <button
        onClick={onToggleChatWindow}
        className={`control-button ${askForUsername ? "active" : "inactive"}`}
        disabled={askForUsername}
      >
        <ChatIcon />
      </button>
      <button
        className={`control-button ${askForUsername ? "active" : "inactive"}`}
        onClick={endCall}
        style={{ backgroundColor: "red", color: "white" }}
        disabled={askForUsername}
      >
        <CallEndIcon />
      </button>
    </div>
  );
}
