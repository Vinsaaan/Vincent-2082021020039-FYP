import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import AreYouSureLogOut from "../../components/share/AreYouSureLogOut";
import "./StudentHeader.css";
import logo from "../../assets/images/home/Logo.png";

const StudentHeader = () => {
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const navigate = useNavigate();

  const confirmLogout = () => {
    navigate("/login");
  };

  const cancelLogout = () => {
    setShowLogoutConfirmation(false);
  };

  return (
    <>
      <header className="app-header">
        <div className="left">
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
          <div className="nav-item with-dropdown">
            Feedback
            <div className="dropdown">
              <Link to="/feedback">Submit Feedback</Link>
              <Link to="/report-bug">Report Bug</Link>
            </div>
          </div>
        </nav>

        <div className="right">
          {/* Use an onClick event handler to trigger the logout modal */}
          <div
            className="nav-item"
            onClick={() => setShowLogoutConfirmation(true)}
          >
            <button className="button button1">Logout</button>
          </div>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      <AreYouSureLogOut
        show={showLogoutConfirmation}
        onConfirm={confirmLogout}
        onCancel={cancelLogout}
      />
    </>
  );
};

export default StudentHeader;
