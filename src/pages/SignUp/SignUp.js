import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "react-phone-number-input/style.css";
import PhoneInput from "react-phone-number-input";
import Select from "react-select";
import Header from "../../components/home/Header";
import "./SignUp.css";
import { createUser } from "../../firebase/firebaseAuth";

const userTypeOptions = [
  { value: "student", label: "Student" },
  { value: "lecturer", label: "Lecturer" },
  { value: "company", label: "Company" },
];

const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

const SignUp = () => {
  const [formData, setFormData] = useState({
    userType: null,
    userName: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    email: "",
    gender: "",
    phoneNumber: "",
  });

  useEffect(() => {
    document.title = "Sign Up | EduBridge";

    return () => {
      document.title = "Original Tab Title";
    };
  }, []);

  const [errors, setErrors] = useState({});
  const [firebaseError, setFirebaseError] = useState("");
  const navigate = useNavigate();

  const validate = () => {
    let tempErrors = {};
    tempErrors.userName =
      formData.userName.length >= 3 && formData.userName.length <= 15
        ? ""
        : "Username should be 3-15 characters long.";
    tempErrors.password =
      formData.password.length >= 3 && formData.password.length <= 15
        ? ""
        : "Password should be 3-15 characters long.";
    tempErrors.confirmPassword =
      formData.password === formData.confirmPassword
        ? ""
        : "Passwords do not match.";
    tempErrors.email = formData.email ? "" : "Email is required.";
    tempErrors.firstName = formData.firstName ? "" : "First Name is required.";
    tempErrors.lastName = formData.lastName ? "" : "Last Name is required.";
    tempErrors.userType =
      formData.userType !== "" ? "" : "User Type is required.";
    tempErrors.gender = formData.gender ? "" : "Gender is required.";
    tempErrors.phoneNumber = formData.phoneNumber
      ? ""
      : "Phone Number is required.";
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

  const handleUserTypeChange = (selectedOption) => {
    setFormData((prevState) => ({
      ...prevState,
      userType: selectedOption ? selectedOption.value : "",
    }));
  };

  const handlePhoneChange = (value) => {
    setFormData((prevState) => ({
      ...prevState,
      phoneNumber: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      try {
        await createUser(formData);
        navigate("/login");
      } catch (error) {
        setFirebaseError(error.message);
      }
    }
  };

  return (
    <div className="index-page">
      <Header />
      <div className="signup-form">
        {firebaseError && <div className="error-message">{firebaseError}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label>User Type:</label>
            <Select
              options={userTypeOptions}
              onChange={handleUserTypeChange}
              placeholder="- Please Select -"
            />
            {errors.userType && (
              <div className="error-message">{errors.userType}</div>
            )}
          </div>

          <div className="form-field">
            <label>Nickname / Company:</label>
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
          <div className="form-field">
            <label>Confirm Password:</label>
            <input
              type="password"
              name="confirmPassword"
              onChange={handleInputChange}
            />
            {errors.confirmPassword && (
              <div className="error-message">{errors.confirmPassword}</div>
            )}
          </div>

          <div className="form-field">
            <label>First Name:</label>
            <input type="text" name="firstName" onChange={handleInputChange} />
            {errors.firstName && (
              <div className="error-message">{errors.firstName}</div>
            )}
          </div>

          <div className="form-field">
            <label>Last Name:</label>
            <input type="text" name="lastName" onChange={handleInputChange} />
            {errors.lastName && (
              <div className="error-message">{errors.lastName}</div>
            )}
          </div>

          <div className="form-field">
            <label>Email:</label>
            <input type="email" name="email" onChange={handleInputChange} />
            {errors.email && (
              <div className="error-message">{errors.email}</div>
            )}
          </div>
          <div className="form-field">
            <label>Gender:</label>
            <div className="gender-container">
              <label>
                <input
                  type="radio"
                  name="gender"
                  options={genderOptions}
                  value="Male"
                  onChange={handleInputChange}
                />
                Male
              </label>
              <label>
                <input
                  type="radio"
                  name="gender"
                  options={genderOptions}
                  value="Female"
                  onChange={handleInputChange}
                />
                Female
              </label>
            </div>
            {errors.gender && (
              <div className="error-message">{errors.gender}</div>
            )}
          </div>

          <div className="form-field">
            <label>Phone Number:</label>
            <PhoneInput
              placeholder="Enter phone number"
              value={formData.phoneNumber}
              onChange={handlePhoneChange}
              defaultCountry="MY"
            />
            {errors.phoneNumber && (
              <div className="error-message">{errors.phoneNumber}</div>
            )}
          </div>

          <button type="submit" className="signup-button">
            Sign Up
          </button>
        </form>
        <div className="login-link">
          Already have an account? <Link to="/login">Log in here</Link>.
        </div>
      </div>
    </div>
  );
};

export default SignUp;
