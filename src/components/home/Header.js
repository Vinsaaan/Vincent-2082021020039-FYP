import React from "react";
import { Link } from "react-router-dom";
import "./Header.css";
import logo from "../../assets/images/home/Logo.png";

const Header = () => {
  return (
    <header className="app-header">
      <nav className="navigation">
        <Link to="/" className="logo-link">
          <img src={logo} alt="EduBridge Logo" className="logo" id="logo" />
        </Link>
        <Link
          to="/company-overview"
          className="nav-item for-company bold-text"
          id="company-link"
        >
          For Company
        </Link>
        <span className="for-schools nav-item bold-text" id="for-schools">
          For Schools
          <div className="dropdown">
            <Link
              to="/student-overview"
              className="bold-text"
              id="student-overview-link"
            >
              Student Overview
            </Link>
            <Link
              to="/lecturer-overview"
              className="bold-text"
              id="lecturer-overview-link"
            >
              Lecturer Overview
            </Link>
          </div>
        </span>
        <div className="auth-buttons" id="auth-buttons">
          <Link to="/login" className="nav-item bold-text" id="login-link">
            <button className="button button1" id="login-button">
              Login
            </button>{" "}
          </Link>
          <Link to="/signup" className="nav-item bold-text" id="signup-link">
            <button className="button button2" id="signup-button">
              Sign Up
            </button>{" "}
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Header;
