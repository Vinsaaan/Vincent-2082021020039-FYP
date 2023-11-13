import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import studentIcon from "../../assets/images/company/sidebar/studentlistIcon.png";
import jobIcon from "../../assets/images/company/sidebar/jobIcon.png";
import dashboardIcon from "../../assets/images/company/sidebar/dashboardIcon.png";
import companyAccountIcon from "../../assets/images/company/sidebar/companyIcon.png";
import signoutIcon from "../../assets/images/company/sidebar/signoutIcon.png";
import arrowIcon from "../../assets/images/company/sidebar/arrowIcon.png";
import lockIcon from "../../assets/images/company/sidebar/lockIcon.png";
import feedbackIcon from "../../assets/images/company/sidebar/feedbackIcon.png";
import reportBugIcon from "../../assets/images/company/sidebar/reportBugIcon.png";
import logo from "../../assets/images/company/sidebar/Logo.png";
import AreYouSureLogOut from "../../components/share/AreYouSureLogOut";
import "../sidebar/LecturerCompanySidebar.css";

const CompanySidebar = () => {
  const initialState =
    JSON.parse(localStorage.getItem("isSidebarLocked")) || false;
  const [isSidebarLocked, setSidebarLocked] = useState(initialState);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("isSidebarLocked", JSON.stringify(isSidebarLocked));
  }, [isSidebarLocked]);

  const handleSignOut = () => {
    setShowLogoutConfirmation(true);
  };

  const confirmLogout = () => {
    navigate("/");
  };

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
              <Link to="/company-dashboard">
                <img src={dashboardIcon} alt="Dashboard" />
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/manage-job">
                <img src={jobIcon} alt="Quizzes" />
                Manage Quizzes
              </Link>
            </li>
            <li>
              <Link to="/view-pending">
                <img src={studentIcon} alt="Students" />
                View Students
              </Link>
            </li>
            <li>
              <Link to="/company-account">
                <img src={companyAccountIcon} alt="Account" />
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
          <li id="sidebar-sign-out" onClick={handleSignOut}>
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
      <AreYouSureLogOut
        show={showLogoutConfirmation}
        onConfirm={confirmLogout}
        onCancel={cancelLogout}
      />
    </>
  );
};

export default CompanySidebar;
