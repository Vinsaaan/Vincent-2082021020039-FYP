import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import studentIcon from "../../assets/images/lecturer/dashboard/studentIcon.png";
import quizIcon from "../../assets/images/lecturer/dashboard/quizIcon.png";
import dashboardIcon from "../../assets/images/lecturer/dashboard/dashboardIcon.png";
import lectureraccountIcon from "../../assets/images/lecturer/dashboard/lectureraccountIcon.png";
import signoutIcon from "../../assets/images/lecturer/dashboard/signoutIcon.png";
import arrowIcon from "../../assets/images/lecturer/dashboard/arrowIcon.png";
import lockIcon from "../../assets/images/lecturer/dashboard/lockIcon.png";
import logo from "../../assets/images/lecturer/dashboard/Logo.png";
import "./LecturerSidebar.css";

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
          <Link to="/view-Student">
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
      <div className="arrow-icon" onClick={toggleSidebarLock}>
        {" "}
        {/* Added a div wrapper */}
        <img
          src={isSidebarLocked ? lockIcon : arrowIcon}
          alt="Toggle Sidebar"
        />
      </div>
    </div>
  );
};

export default LecturerSidebar;
