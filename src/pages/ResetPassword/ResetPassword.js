import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import firebase from "../../firebase/firebase";
import "./ResetPassword.css";
import LoginPhoto from "../../components/login/LoginPhoto";
import Header from "../../components/home/Header";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Reset Password | EduBridge";

    return () => {
      document.title = "Original Tab Title";
    };
  }, []);

  const handleInputChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setErrors({ email: "Email is required." });
      return;
    }

    try {
      await firebase.auth().sendPasswordResetEmail(email);
      setMessage("Reset password link has been sent to your email.");
    } catch (error) {
      console.log("Error during password reset:", error);
      setErrors({ firebase: error.message });
    }
  };

  const navigateToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="login-page">
      <Header />
      <div className="login-container">
        <LoginPhoto />
        <div className="login-form">
          <h2 className="welcome-message">Reset Password</h2>
          {message ? (
            <div className="success-message">{message}</div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-field">
                <label>Email:</label>
                <input type="email" name="email" onChange={handleInputChange} />
                {errors.email && (
                  <div className="error-message">{errors.email}</div>
                )}
              </div>

              <button type="submit" className="login-button">
                Send Reset Link
              </button>
            </form>
          )}
          {errors.firebase && (
            <div className="error-message">{errors.firebase}</div>
          )}
          <p className="login-link">
            Remembered your password?{" "}
            <span
              onClick={navigateToLogin}
              style={{ cursor: "pointer", color: "rgb(55, 142, 255)" }}
            >
              Login here
            </span>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
