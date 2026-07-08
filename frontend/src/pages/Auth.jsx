import React, { useContext, useState } from "react";
import "../styles/Auth.css";
import { AuthContext } from "../contexts/AuthContext";

export default function Auth() {
  const [activeTab, setActiveTab] = useState(0);

  // Login State
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register State
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const { handleRegister, handleLogin } = useContext(AuthContext);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    try {
      const result = await handleLogin(loginEmail, loginPassword);
      setMessage(result);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const result = await handleRegister(name, username, email, password);
      setMessage(result);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="AuthContainer">
      <nav>
        <div className="navHeader">
          <h2>Meet Online</h2>
        </div>

        <div className="navList">
          <div>Join As Guest</div>

          <div className="options" onClick={() => setActiveTab(1)}>
            Register
          </div>

          <div className="options" onClick={() => setActiveTab(0)}>
            Login
          </div>
        </div>
      </nav>

      <div className="authCard">
        <div className="tabs">
          <button
            className={activeTab === 0 ? "active" : ""}
            onClick={() => setActiveTab(0)}
          >
            Login
          </button>

          <button
            className={activeTab === 1 ? "active" : ""}
            onClick={() => setActiveTab(1)}
          >
            Sign Up
          </button>
        </div>

        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}

        <div className="forms">
          {/* LOGIN */}

          <form
            className={`loginForm ${activeTab === 0 ? "show" : ""}`}
            onSubmit={handleLoginSubmit}
          >
            <input
              type="email"
              placeholder="Email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
            />

            <button type="submit" className="submitBtn">
              Login
            </button>
          </form>

          {/* SIGNUP */}

          <form
            className={`signupForm ${activeTab === 1 ? "show" : ""}`}
            onSubmit={handleRegisterSubmit}
          >
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <button type="submit" className="submitBtn">
              Create Account
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
