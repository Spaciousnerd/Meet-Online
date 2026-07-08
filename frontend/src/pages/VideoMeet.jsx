import React, { useEffect, useRef, useState } from "react";
import { TextField, Button } from "@mui/material";
import "../styles/VideoMeet.css";
import VideoControls from "../components/VideoControls.jsx";
import ChatWindow from "../components/ChatWindow.jsx";
import io from "socket.io-client";
// backend server link
const server_URL = import.meta.env.VITE_BACKEND_URL;
import withAuth from "../Utils.jsx";
var connections = {};
const peerConfigConnections = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};
function VideoMeet() {
  var socketRef = useRef();
  let socketIdRef = useRef();
  let localVideoRef = useRef();
  let [videoAvailable, setVideoAvailable] = useState(true);
  let [audioAvailable, setAudioAvailable] = useState(true);
  let [video, setVideo] = useState([]);
  let [audio, setAudio] = useState();
  let [screen, setScreen] = useState();
  let [showModal, setModal] = useState();
  let [screenAvailable, setScreenAvailable] = useState();
  let [askForUsername, setAskForUsername] = useState(true);
  let [username, setUsername] = useState("");
  const videoRef = useRef([]);
  let [videos, setVideos] = useState([]);
  const [showControls, setShowControls] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [chatWindowOpen, setChatWindowOpen] = useState(false);
  let [messages, setMessages] = useState([]);
  let [newMessages, setNewMessages] = useState(0);
  const [message, setMessage] = useState("");
  const timer = useRef();
  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setShowControls(false);
    }, 3000); // hide after 3 seconds
  };
  //   if(isChrome()===false){

  //   }
  const getPermissions = async () => {
    try {
      const videoPermission = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      if (videoPermission) setVideoAvailable(true);
      else setVideoAvailable(false);
      const audioPermission = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      if (audioPermission) setAudioAvailable(true);
      else setAudioAvailable(false);
      if (navigator.mediaDevices.getDisplayMedia) setScreenAvailable(true);
      else setScreenAvailable(false);
      if (videoAvailable || audioAvailable) {
        const userMediaStream = await navigator.mediaDevices.getUserMedia({
          video: videoAvailable,
          audio: audioAvailable,
        });
        if (userMediaStream) {
          window.localStream = userMediaStream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = userMediaStream;
          }
        }
      }
    } catch (err) {
      console.log(err?.message);
      return err.message;
    }
  };
  useEffect(() => {
    getPermissions();
  }, []);
  const replaceTracks = (stream) => {
    for (let id in connections) {
      if (id === socketIdRef.current) continue;
      const pc = connections[id];
      stream.getTracks().forEach((track) => {
        const sender = pc
          .getSenders()
          .find((sender) => sender.track?.kind === track.kind);
        if (sender) {
          sender.replaceTrack(track);
        } else {
          pc.addTrack(track, stream);
        }
      });
    }
  };
  let getUserMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach((track) => track.stop());
    } catch (e) {
      console.log(e);
    }
    window.localStream = stream;
    localVideoRef.current.srcObject = stream;
    replaceTracks(stream);
    stream.getTracks().forEach(
      (track) =>
        (track.onended = () => {
          setVideo(false);
          setAudio(false);
          try {
            let tracks = localVideoRef.current.srcObject.getTracks();
            tracks.forEach((track) => track.stop());
          } catch (e) {
            console.log(e);
          }
          //blackspace
          let blackSilence = (...args) =>
            new MediaStream([blackScreen(...args), silence()]);
          window.localStream = blackSilence();
          localVideoRef.current.srcObject = window.localStream;
          replaceTracks(window.localStream);
        }),
    );
  };
  let silence = () => {
    let context = new AudioContext();
    let oscillator = context.createOscillator();
    let dst = oscillator.connect(context.createMediaStreamDestination());
    oscillator.start();
    context.resume();
    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
  };
  let blackScreen = ({ width = 640, height = 480 } = {}) => {
    let canvas = Object.assign(document.createElement("canvas"), {
      width,
      height,
    });
    canvas.getContext("2d").fillRect(0, 0, width, height);
    let stream = canvas.captureStream();
    return Object.assign(stream.getVideoTracks()[0], { enabled: false });
  };
  let getUserMedia = () => {
    if ((video && videoAvailable) || (audio && audioAvailable)) {
      navigator.mediaDevices
        .getUserMedia({ video: video, audio: audio })
        .then(getUserMediaSuccess)
        .then((stream) => {})
        .catch((e) => {
          console.log(e);
        });
    } else {
      try {
        let tracks = localVideoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      } catch (e) {
        console.log(e);
      }
    }
  };
  useEffect(() => {
    if (video && audio) getUserMedia();
  }, [audio, video]);
  // Sets up ICE handling, remote-track handling, and attaches local
  // tracks for a peer connection. Used both when we learn about a new
  // peer via "user-joined" AND when we lazily create a connection
  // because an offer/answer/ICE signal arrives before "user-joined"
  // would have set it up (this is what was missing before, and why
  // the newly-joined user never sent ICE candidates or rendered remote video).
  const setupPeerConnection = (socketListId) => {
    connections[socketListId] = new RTCPeerConnection(peerConfigConnections);
    connections[socketListId].onicecandidate = (event) => {
      console.log("Sending ICE candidate");
      if (event.candidate !== null) {
        socketRef.current.emit(
          "signal",
          socketListId,
          JSON.stringify({ ice: event.candidate }),
        );
      }
    };
    connections[socketListId].ontrack = (event) => {
      const stream = event.streams[0];
      setVideos((prev) => {
        const exists = prev.find((video) => video.socketId === socketListId);
        if (exists) {
          return prev.map((video) =>
            video.socketId === socketListId ? { ...video, stream } : video,
          );
        }
        return [
          ...prev,
          {
            socketId: socketListId,
            stream,
            autoPlay: true,
            playsInline: true,
          },
        ];
      });
    };
    if (window.localStream !== undefined && window.localStream !== null) {
      window.localStream.getTracks().forEach((track) => {
        connections[socketListId].addTrack(track, window.localStream);
      });
    } else {
      let blackSilence = (...args) =>
        new MediaStream([blackScreen(...args), silence()]);
      window.localStream = blackSilence();
      window.localStream.getTracks().forEach((track) => {
        connections[socketListId].addTrack(track, window.localStream);
      });
    }
    return connections[socketListId];
  };
  let gotMessageFromServer = (fromId, message) => {
    console.log("Signal received from:", fromId);
    console.log(JSON.parse(message));
    if (!connections[fromId]) {
      setupPeerConnection(fromId);
    }
    var signal = JSON.parse(message);
    if (fromId === socketIdRef.current) return;
    if (signal.sdp) {
      connections[fromId]
        .setRemoteDescription(new RTCSessionDescription(signal.sdp))
        .then(() => {
          if (signal.sdp.type === "offer") {
            return connections[fromId]
              .createAnswer()
              .then((description) => {
                connections[fromId]
                  .setLocalDescription(description)
                  .then(() => {
                    socketRef.current.emit(
                      "signal",
                      fromId,
                      JSON.stringify({
                        sdp: connections[fromId].localDescription,
                      }),
                    );
                  })
                  .catch((e) => console.log(e));
              })
              .catch((e) => console.log(e));
          }
        })
        .catch((e) => console.log(e));
    }
    if (signal.ice) {
      console.log("Received ICE candidate");
      connections[fromId]
        .addIceCandidate(new RTCIceCandidate(signal.ice))
        .catch((e) => console.log(e));
    }
  };
  let addMessage = (message, sender, socketIdSender) => {
    setMessages((prev) => {
      return [...prev, { message, sender }];
    });
    if (socketIdSender !== socketIdRef.current) {
      setNewMessages((prev) => prev + 1);
    }
  };
  let connectToSocketServer = () => {
    socketRef.current = io.connect(server_URL, { secure: false });
    socketRef.current.on("connect", () => {
      socketIdRef.current = socketRef.current.id;
      socketRef.current.on("signal", gotMessageFromServer);
      socketRef.current.on("chat-message", addMessage);
      socketRef.current.on("user-left", (id) => {
        setVideos((videos) => videos.filter((video) => video.socketId !== id));
        videoRef.current = videoRef.current.filter(
          (video) => video.socketId !== id,
        );
        delete connections[id];
      });
      socketRef.current.on("user-joined", (id, clients) => {
        console.log("user joined:", id);
        console.log("clients:", clients);
        clients.forEach((socketListId) => {
          if (socketListId === socketIdRef.current) return;
          if (!connections[socketListId]) {
            setupPeerConnection(socketListId);
          }
        });
        if (id !== socketIdRef.current) {
          for (let id2 in connections) {
            if (id2 === socketIdRef.current) continue;
            console.log("Creating offer for:", id2);
            console.log("Offer created");
            connections[id2].createOffer().then((description) => {
              connections[id2]
                .setLocalDescription(description)
                .then(() => {
                  console.log("Sending offer");
                  socketRef.current.emit(
                    "signal",
                    id2,
                    JSON.stringify({
                      sdp: connections[id2].localDescription,
                    }),
                  );
                })
                .catch((e) => {
                  console.log(e);
                });
            });
          }
        }
      });
      socketRef.current.emit(
        "join-call",
        window.location.pathname.substring(1),
      );
    });
  };
  let getMedia = () => {
    setVideo(videoAvailable);
    setAudio(audioAvailable);
    connectToSocketServer();
  };
  let connect = () => {
    setAskForUsername(false);
    getMedia();
  };
  const onToggleVideo = () => {
    const stream = window.localStream;
    const track = stream?.getVideoTracks?.()[0];
    if (!track) {
      console.log("NO VIDEO TRACK FOUND");
      return;
    }
    track.enabled = !track.enabled;
    setIsVideoEnabled(track.enabled);
  };
  const onToggleAudio = () => {
    const stream = window.localStream;
    const track = stream?.getAudioTracks?.()[0];
    if (!track) {
      console.log("NO AUDIO TRACK FOUND");
      return;
    }
    track.enabled = !track.enabled;
    setIsAudioEnabled(track.enabled);
  };
  const onToggleScreenShare = async () => {
    setIsScreenSharing(true);
  };
  useEffect(() => {
    if (isScreenSharing) {
      getDisplayMedia();
    }
  }, [isScreenSharing]);
  let getDisplayMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach((track) => track.stop());
    } catch (e) {
      console.log(e);
    }
    window.localStream = stream;
    localVideoRef.current.srcObject = stream;
    replaceTracks(stream);
  };
  let getDisplayMedia = async () => {
    if (navigator.mediaDevices.getDisplayMedia) {
      navigator.mediaDevices
        .getDisplayMedia({
          video: true,
          audio: false,
        })
        .then(getDisplayMediaSuccess)
        .then((stream) => {
          const screenTrack = stream.getVideoTracks()[0];
          setIsScreenSharing(true);
          screenTrack.onended = () => {
            setIsScreenSharing(false);
            getUserMedia();
          };
        })
        .catch((e) => {
          console.log(e);
        });
    }
  };

  const onToggleChatWindow = () => {
    setChatWindowOpen(!chatWindowOpen);
  };
  const sendMessage = () => {
    if (!message.trim()) return;
    socketRef.current.emit("chat-message", message, username);
    setMessage("");
  };
  const leaveCall = () => {
    socketRef.current?.emit("leave-call");
    if (window.localStream) {
      window.localStream.getTracks().forEach((track) => track.stop());
      window.localStream = null;
    }
    Object.values(connections).forEach((pc) => pc.close());
    connections = {};
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    setVideos([]);
    if (socketRef.current?.connected) {
      socketRef.current.disconnect();
    }
    setAskForUsername(true);

    // Only if the lobby needs an immediate camera preview.
    getPermissions();
  };
  return (
    <div className="universalContainer" onMouseMove={handleMouseMove}>
      {chatWindowOpen && (
        <ChatWindow
          onToggleChatWindow={onToggleChatWindow}
          sendMessage={sendMessage}
          message={message}
          setMessage={setMessage}
          messages={messages}
        />
      )}
      {askForUsername === true ? (
        <div className="lobbyContainer">
          <div className="left">
            <h2 className="nav-header">Set username for meeting</h2>
            <div className="usernamefield">
              <TextField
                fullWidth
                id="outlined-basic"
                label="username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                }}
                variant="outlined"
                style={{ background: "#fff" }}
              />
              <Button
                variant="contained"
                onClick={connect}
                style={{ padding: "0.8rem 2rem", margin: "1rem 0" }}
              >
                Connect
              </Button>
            </div>
          </div>
          <div className="right">
            <video
              style={{ borderRadius: "2%", transform: "scaleX(-1)" }}
              className="localVideo"
              ref={localVideoRef}
              autoPlay
              muted
            ></video>
          </div>
        </div>
      ) : (
        <div>
          <div className="selfVideo">
            <video
              ref={localVideoRef}
              autoPlay
              style={{ transform: "scaleX(-1)" }}
            ></video>
          </div>
          {videos.length === 0 ? (
            <h2 className="alone-message">You are alone in this room</h2>
          ) : (
            <div className="video-grid">
              {" "}
              {videos.map((video) => {
                return (
                  <div className="video-card" key={video.socketId}>
                    <h2>Video : {video.socketId}</h2>
                    <video
                      data-socket={video.socketId}
                      ref={(ref) => {
                        if (ref && video.stream) {
                          ref.srcObject = video.stream;
                        }
                      }}
                      autoPlay
                      style={{ transform: "scaleX(-1)" }}
                    ></video>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
      <div className={`controls ${showControls ? "visible" : ""}`}>
        <VideoControls
          isVideoEnabled={isVideoEnabled}
          onToggleVideo={onToggleVideo}
          isAudioEnabled={isAudioEnabled}
          onToggleAudio={onToggleAudio}
          isScreenSharing={isScreenSharing}
          onToggleScreenShare={onToggleScreenShare}
          endCall={leaveCall}
          onToggleChatWindow={onToggleChatWindow}
          askForUsername={askForUsername}
        />
      </div>
    </div>
  );
}
export default withAuth(VideoMeet);
