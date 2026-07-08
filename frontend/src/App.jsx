import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import Auth from "./pages/Auth.jsx";
import Home from "./pages/Home.jsx";
import VideoMeet from "./pages/VideoMeet.jsx";
function App() {
  return (
    <>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/home" element={<Home />}></Route>
            <Route path="/" element={<LandingPage />}></Route>
            <Route path="/auth" element={<Auth />}></Route>
            <Route path="/:url" element={<VideoMeet />}></Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </>
  );
}

export default App;
