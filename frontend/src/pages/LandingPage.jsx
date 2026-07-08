import React from "react";
import { Link } from "react-router-dom";
import "../styles/App.css";
export default function LandingPage() {
  return (
    <div className="AuthContainer">
      <nav>
        <div className="navHeader">
          <Link to="/home" style={{ textDecoration: "none" ,color:"white"}}>
            <h2>Meet Online</h2>
          </Link>
        </div>
        <div className="navList">
          <p>Join As Guest</p>
          <p><Link to="/auth" style={{textDecoration:"none" ,color:"white"}}>Register</Link></p>
          <Link to="/auth" className="btn">
            Login
          </Link>
        </div>
      </nav>
      <div className="LandingMainContainer">
        <div>
          {" "}
          <h1>
            <span style={{ color: "orange" }}>Connect</span> with your Loved
            Ones
          </h1>
          <p>Cover distances with Meet-Online</p>
          <Link to="/auth" className="btn" style={{ marginTop: "4rem" }}>
            Get Started
          </Link>
        </div>
        <div className="image-container">
          <img className="landing-page-image" src="mobile.png" alt="" />
        </div>
      </div>
    </div>
  );
}
