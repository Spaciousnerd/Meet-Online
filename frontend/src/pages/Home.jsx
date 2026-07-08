import React, { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { TextField, IconButton } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";
import withAuth from "../Utils.jsx";
import { AuthContext } from "../contexts/AuthContext";
import "./Home.css";
function Home() {
  const { getHistoryOfUser, addHistoryofUser, clearHistory } =
    useContext(AuthContext);
  let navigate = useNavigate();
  const [data, setData] = useState([]);
  const [meetingCode, setMeetingCode] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const token = localStorage.getItem("token");
  let handleFetchHistory = async () => {
    const history = await getHistoryOfUser();
    console.log(history);
    setData(history);
    setShowHistory(true);
  };
  const handleClearHistory = async () => {
    await clearHistory();
    setData([]);
  };
  let handleJoinVideoCall = async (code) => {
    setMeetingCode(code);
    await navigate(`/${code}`);
    await addHistoryofUser(code);
    setMeetingCode("");
  };
  const hostNewMeeting = async () => {
    const randomString = Array.from({ length: 6 }, () =>
      Math.floor(Math.random() * 10),
    ).join("");
    console.log(randomString);
    await handleJoinVideoCall(randomString);
  };
  const handleLogout = () => {
    localStorage.clear(); // or removeItem("token")
    sessionStorage.clear();
    navigate("/");
  };
  return (
    <div className="HomePageContainer">
      <nav className="navbar">
        <div className="nav-header">Meet-Online</div>
        <div>
          <button onClick={handleFetchHistory} className="button">
            History
          </button>
          <button className="button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>
      {showHistory && (
        <History
          data={data}
          setShowHistory={setShowHistory}
          handleClearHistory={handleClearHistory}
        />
      )}
      <div className="meeting-window">
        <div className="meetingPanel">
          <h2 className="meeting-header">Enter Meeting Code</h2>
          <TextField
            fullWidth
            placeholder="Type a message..."
            variant="outlined"
            size="medium"
            value={meetingCode}
            onChange={(e) => setMeetingCode(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleJoinVideoCall(meetingCode);
            }}
            sx={{
              margin: "1rem",
              width: "80%",
              "& .MuiOutlinedInput-root": {
                color: "white",
                backgroundColor: "rgba(255,255,255,0.1)",
                borderRadius: "10px",
                "& fieldset": {
                  borderColor: "white",
                },
                "&:hover fieldset": {
                  borderColor: "#aaa",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#785aff",
                },
              },
              "& .MuiInputBase-input::placeholder": {
                color: "gray",
                opacity: 1,
              },
            }}
          />
          <button
            onClick={() => handleJoinVideoCall(meetingCode)}
            className="button"
          >
            Launch
          </button>
          <button onClick={hostNewMeeting} className="button">
            Host New Meeting
          </button>
        </div>
        <div className="image-container">
          <img src="logo3.png" alt="" />
        </div>
      </div>
    </div>
  );
}
function History({ data, setShowHistory, handleClearHistory }) {
  return (
    <div className="history-container">
      <div className="history-header">
        <button onClick={handleClearHistory} style={{ padding: "12px" }}>
          ClearHistory
        </button>
        <button onClick={(prev) => setShowHistory(!prev)} className="close-btn">
          <CloseIcon />
        </button>
      </div>
      <h2 className="heading">Previous Meetings</h2>
      <div className="history-area">
        {" "}
        {data.length === 0 ? (
          <p className="empty-chat">No Meeting Records yet</p>
        ) : (
          data.map((meeting, index) => (
            <div className="meetingCode" key={index}>
              <div className="date-time">
                <span className="date">
                  {new Date(meeting.date).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>{" "}
                <span className="time">
                  {new Date(meeting.date).toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <p>{`Code : ${meeting.meetingCode}`}</p>
            </div>
          ))
        )}{" "}
      </div>
    </div>
  );
}
export default withAuth(Home);
