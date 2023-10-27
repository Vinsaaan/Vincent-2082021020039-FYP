import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import studentIcon from "../../assets/images/company/sidebar/studentlistIcon.png";
import quizIcon from "../../assets/images/company/sidebar/jobIcon.png";
import dashboardIcon from "../../assets/images/company/sidebar/dashboardIcon.png";
import lectureraccountIcon from "../../assets/images/company/sidebar/companyIcon.png";
import signoutIcon from "../../assets/images/company/sidebar/signoutIcon.png";
import arrowIcon from "../../assets/images/company/sidebar/arrowIcon.png";
import lockIcon from "../../assets/images/company/sidebar/lockIcon.png";
import logo from "../../assets/images/company/sidebar/Logo.png";
import "./CompanySidebar.css";

const LecturerSidebar = () => {
  const initialState =
    JSON.parse(localStorage.getItem("isSidebarLocked")) || false;
  const [isSidebarLocked, setSidebarLocked] = useState(initialState);
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("isSidebarLocked", JSON.stringify(isSidebarLocked));
  }, [isSidebarLocked]);

  const handleSignOut = () => {
    if (window.confirm("Are you sure you want to sign out?")) {
      navigate("/");
    }
  };

  const toggleSidebarLock = () => {
    setSidebarLocked(!isSidebarLocked);
  };

  return (
    <div className={`sidebar ${isSidebarLocked ? "locked" : ""}`}>
      <img src={logo} alt="LecturerLogo" className="lecturerlogo" />
      <ul>
        {/* Updated the list items */}
        <li onClick={handleSignOut} className="sign-out">
          <img src={signoutIcon} alt="Sign Out" />
          Sign Out
        </li>
        <li>
          <Link to="/company-dashboard">
            <img src={dashboardIcon} alt="Dashboard" />
            Dashboard
          </Link>
        </li>
        <li>
          <Link to="/manage-job">
            <img src={quizIcon} alt="Quizzes" />
            Manage Job
          </Link>
        </li>
        <li>
          <Link to="/view-pending">
            <img src={studentIcon} alt="Students" />
            Pending List
          </Link>
        </li>
        <li>
          <Link to="/company-account">
            <img src={lectureraccountIcon} alt="Account" />
            Account Settings
          </Link>
        </li>
      </ul>
      <div className="arrow-icon" onClick={toggleSidebarLock}>
        <img
          src={isSidebarLocked ? lockIcon : arrowIcon}
          alt="Toggle Sidebar"
        />
      </div>
    </div>
  );
};

export default LecturerSidebar;
