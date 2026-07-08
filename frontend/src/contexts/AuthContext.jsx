import { createContext, useContext, useState } from "react";
import httpStatus from "http-status";
import { useNavigate } from "react-router-dom";
import axios from "axios";
export const AuthContext = createContext({});
const API_URL = import.meta.env.VITE_BACKEND_URL;
const client = axios.create({
  baseURL: `${API_URL}/api/v1/users`,
});
export const AuthProvider = ({ children }) => {
  const authContext = useContext(AuthContext);
  const [userData, setUserData] = useState(authContext);
  const router = useNavigate();
  const handleRegister = async (name, username, email, password) => {
    try {
      let request = await client.post("/register", {
        name: name,
        username: username,
        email: email,
        password: password,
      });
      if (request.status === httpStatus.CREATED) return request.data.message;
    } catch (err) {
      throw err;
    }
  };
  const handleLogin = async (email, password) => {
    try {
      let request = await client.post("/login", {
        email: email,
        password: password,
      });
      if (request.status === httpStatus.OK) {
        localStorage.setItem("token", request.data.token);
        router("/home"); // or "/", "/home", "/meeting", etc.
        return request.data.message;
      }
    } catch (err) {
      throw err;
    }
  };
  const getHistoryOfUser = async () => {
    try {
      let request = await client.get("/get_all_activity", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      console.log("History fetched");
      return request.data;
    } catch (err) {
      throw err;
    }
  };
  const addHistoryofUser = async (meetingCode) => {
    try {
      let request = await client.post("/add_to_activity", {
        token: localStorage.getItem("token"),
        meetingCode: meetingCode,
      });
      console.log("Meeting Added");
      return request;
    } catch (err) {
      throw err;
    }
  };
  const clearHistory = async () => {
    try {
      await client.post("/clear_history", {
        token: localStorage.getItem("token"),
      });
    } catch (err) {
      throw err;
    }
  };
  const data = {
    userData,
    setUserData,
    handleRegister,
    handleLogin,
    getHistoryOfUser,
    addHistoryofUser,
    clearHistory,
  };
  return <AuthContext.Provider value={data}>{children}</AuthContext.Provider>;
};
