import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import studentIcon from "../../assets/images/lecturer/dashboard/studentIcon.png";
import quizIcon from "../../assets/images/lecturer/dashboard/quizIcon.png";
import dashboardIcon from "../../assets/images/lecturer/dashboard/dashboardIcon.png";
import lectureraccountIcon from "../../assets/images/lecturer/dashboard/lectureraccountIcon.png";
import feedbackIcon from "../../assets/images/lecturer/dashboard/feedbackIcon.png";
import reportBugIcon from "../../assets/images/lecturer/dashboard/reportBugIcon.png";
import signoutIcon from "../../assets/images/lecturer/dashboard/signoutIcon.png";
import arrowIcon from "../../assets/images/lecturer/dashboard/arrowIcon.png";
import lockIcon from "../../assets/images/lecturer/dashboard/lockIcon.png";
import logo from "../../assets/images/lecturer/dashboard/Logo.png";
import AreYouSureLogOut from "../../components/share/AreYouSureLogOut";
import "../sidebar/LecturerCompanySidebar.css";

const LecturerSidebar = () => {
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const initialState =
    JSON.parse(localStorage.getItem("isSidebarLocked")) || false;
  const [isSidebarLocked, setSidebarLocked] = useState(initialState);
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("isSidebarLocked", JSON.stringify(isSidebarLocked));
  }, [isSidebarLocked]);

  // This will now toggle the visibility of the logout confirmation
  const handleSignOutClick = () => {
    setShowLogoutConfirmation(true);
  };

  // This will be passed to the AreYouSureLogOut component
  const confirmLogout = () => {
    navigate("/");
  };

  // This will also be passed to the AreYouSureLogOut component
  const cancelLogout = () => {
    setShowLogoutConfirmation(false);
  };

  const toggleSidebarLock = () => {
    setSidebarLocked(!isSidebarLocked);
  };

  return (
    <>
      <div className={`sidebar ${isSidebarLocked ? "locked" : ""}`}>
        <img src={logo} alt="LecturerLogo" className="lecturerlogo" />
        <div className="menu-section">
          <ul>
            <li>
              <Link to="/lecturer-dashboard">
                <img src={dashboardIcon} alt="Dashboard" />
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/manage-quiz">
                <img src={quizIcon} alt="Quizzes" />
                Manage Quizzes
              </Link>
            </li>
            <li>
              <Link to="/view-student">
                <img src={studentIcon} alt="Students" />
                View Students
              </Link>
            </li>
            <li>
              <Link to="/lecturer-account">
                <img src={lectureraccountIcon} alt="Account" />
                Account Settings
              </Link>
            </li>
          </ul>
        </div>
        <div className="bottom-links">
          <li>
            <Link to="/feedback">
              <img src={feedbackIcon} alt="Feedback" />
              Feedback
            </Link>
          </li>
          <li>
            <Link to="/report-bug">
              <img src={reportBugIcon} alt="Report Bug" />
              Report Bug
            </Link>
          </li>
          <li id="sidebar-sign-out" onClick={handleSignOutClick}>
            <img src={signoutIcon} alt="Sign Out" />
            Sign Out
          </li>
        </div>
        <div className="arrow-icon" onClick={toggleSidebarLock}>
          <img
            src={isSidebarLocked ? lockIcon : arrowIcon}
            alt="Toggle Sidebar"
          />
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <AreYouSureLogOut
        show={showLogoutConfirmation}
        onConfirm={confirmLogout}
        onCancel={cancelLogout}
      />
    </>
  );
};

export default LecturerSidebar;
