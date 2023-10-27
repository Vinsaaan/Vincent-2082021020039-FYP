import React from "react";
import loginLogo from "../../assets/images/login/Login-logo.png";

const LoginPhoto = () => {
  return (
    <div className="login-photo">
      <img src={loginLogo} alt="Login Logo" />
    </div>
  );
};

export default LoginPhoto;
