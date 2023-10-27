import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import firebase from "../../firebase/firebase";
import "react-phone-number-input/style.css";
import "./Login.css";
import LoginPhoto from "../../components/login/LoginPhoto";
import Header from "../../components/home/Header";

const Login = () => {
  const [formData, setFormData] = useState({
    userName: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Login | EduBridge";

    return () => {
      document.title = "Original Tab Title";
    };
  }, []);

  const validate = () => {
    let tempErrors = {};

    tempErrors.userName = formData.userName ? "" : "Username is required.";
    tempErrors.password = formData.password ? "" : "Password is required.";

    setErrors(tempErrors);

    return Object.values(tempErrors).every((value) => value === "");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      try {
        // Authenticate user with Firebase
        const userCredential = await firebase
          .auth()
          .signInWithEmailAndPassword(formData.userName, formData.password);

        const user = userCredential.user;
        console.log("User UID: ", user.uid); // Log the user's UID

        // Get user type from Firestore
        const userDoc = await firebase
          .firestore()
          .collection("users")
          .doc(user.uid)
          .get();

        const userType = userDoc.data().userType;

        // Redirect user based on their user type
        switch (userType) {
          case "student":
            navigate("/student-dashboard");
            break;
          case "lecturer":
            navigate("/lecturer-dashboard");
            break;
          case "company":
            navigate("/company-dashboard");
            break;
          default:
            console.error("Invalid user type");
            break;
        }
      } catch (error) {
        console.log("Error during login:", error);

        if (
          error.code === "auth/wrong-password" ||
          error.code === "auth/user-not-found"
        ) {
          setErrors({ ...errors, firebase: "Email or Password is incorrect." });
        } else {
          setErrors({ ...errors, firebase: "Email or Password is incorrect." });
        }
      }
    }
  };

  return (
    <div className="login-page">
      <Header />
      <div className="login-container">
        <LoginPhoto />
        <div className="login-form">
          <h2 className="welcome-message">Welcome Back</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <label>Email:</label>
              <input type="text" name="userName" onChange={handleInputChange} />
              {errors.userName && (
                <div className="error-message">{errors.userName}</div>
              )}
            </div>

            <div className="form-field">
              <label>Password:</label>
              <input
                type="password"
                name="password"
                onChange={handleInputChange}
              />
              {errors.password && (
                <div className="error-message">{errors.password}</div>
              )}
            </div>

            <button type="submit" className="login-button">
              Log In
            </button>
            <div className="forgot-password">
              <Link to="/forgot-password">Forgot password?</Link>
            </div>
          </form>
          {errors.firebase && (
            <div className="error-message">{errors.firebase}</div>
          )}
          <p className="login-link">
            Don't have an account? <Link to="/signup">Sign up here</Link>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
