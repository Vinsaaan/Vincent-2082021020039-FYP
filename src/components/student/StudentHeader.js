import React from "react";
import { Link } from "react-router-dom";
import "./StudentHeader.css";
import logo from "../../assets/images/home/Logo.png";

const StudentHeader = () => {
  return (
    <header className="app-header">
      <div className="left">
        {/* Wrap the <img> element with a <Link> */}
        <Link to="/student-dashboard">
          <img src={logo} alt="EduBridge Logo" className="logo" />
        </Link>
      </div>

      <nav className="navigation">
        <Link to="/student-dashboard" className="nav-item">
          Your Activity
        </Link>
        <div className="nav-item with-dropdown">
          Education
          <div className="dropdown">
            <Link to="/view-result">View Result</Link>
          </div>
        </div>
        <div className="nav-item with-dropdown">
          Jobs
          <div className="dropdown">
            <Link to="/apply-job">Apply New Job</Link>
            <Link to="/application-status">Your Application</Link>
          </div>
        </div>
        <Link to="/student-account" className="nav-item">
          Profile
        </Link>
      </nav>

      <div className="right">
        <Link to="/login" className="nav-item">
          <button className="button button1">Logout</button>
        </Link>
      </div>
    </header>
  );
};

export default StudentHeader;
