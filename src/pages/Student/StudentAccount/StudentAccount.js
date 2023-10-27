import React, { useState, useEffect } from "react";
import firebase from "../../../firebase/firebase";
import StudentHeader from "../../../components/student/StudentHeader";
import "./StudentAccount.css";

const StudentAccount = () => {
  useEffect(() => {
    document.title = "Student Profile Setting";

    return () => {
      document.title = "Original Tab Title";
    };
  }, []);
  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    gender: "",
    phoneNumber: "",
  });

  const userId = firebase.auth().currentUser.uid;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDoc = await firebase
          .firestore()
          .collection("users")
          .doc(userId)
          .get();

        if (userDoc.exists) {
          setUser(userDoc.data());
        } else {
          console.error("No user found");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [userId]);

  const [passwordError, setPasswordError] = useState("");
  const [emailError, setEmailError] = useState("");

  const [newData, setNewData] = useState({ ...user });
  const [confirmEmail, setConfirmEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [edit, setEdit] = useState({
    email: false,
    phoneNumber: false,
    gender: false,
    password: false,
  });

  useEffect(() => {
    if (
      newPassword === confirmPassword &&
      newPassword.trim() !== "" &&
      newPassword.length >= 5 &&
      newPassword.length <= 15
    ) {
      setPasswordError("");
    } else {
      setPasswordError(
        "Passwords do not match or are not within 5-15 characters long!"
      );
    }
  }, [newPassword, confirmPassword]);

  const handleEdit = (field) => setEdit({ ...edit, [field]: true });

  const handleCancel = (field) => setEdit({ ...edit, [field]: false });

  const handleSave = async (field) => {
    if (field === "name") {
      if (newData.firstName.trim() !== "" && newData.lastName.trim() !== "") {
        try {
          await firebase.firestore().collection("users").doc(userId).update({
            firstName: newData.firstName,
            lastName: newData.lastName,
          });

          setUser((prevUser) => ({
            ...prevUser,
            firstName: newData.firstName,
            lastName: newData.lastName,
          }));

          setEdit({ ...edit, name: false });
        } catch (error) {
          console.error("Error updating name:", error);
        }
      } else {
        console.error("Both first and last name fields should be non-empty.");
      }
    }

    if (
      field === "email" &&
      newData.email === confirmEmail &&
      newData.email.trim() !== ""
    ) {
      setEmailError("");
      try {
        await firebase.auth().currentUser.updateEmail(newData.email);
        await firebase
          .firestore()
          .collection("users")
          .doc(userId)
          .update({ email: newData.email });
        setUser({ ...user, email: newData.email });
        setEdit({ ...edit, email: false });
      } catch (error) {
        console.error("Error updating email:", error);
        setEmailError("Failed to update email.");
      }
    } else if (field === "email") {
      setEmailError("Emails do not match or are empty!");
    }

    if (field === "phone" && newData.phone.trim() !== "") {
      try {
        await firebase
          .firestore()
          .collection("users")
          .doc(userId)
          .update({ phone: newData.phone });
        setUser({ ...user, phone: newData.phone });
        setEdit({ ...edit, phone: false });
      } catch (error) {
        console.error("Error updating phone number:", error);
      }
    }

    if (field === "gender") {
      try {
        await firebase
          .firestore()
          .collection("users")
          .doc(userId)
          .update({ gender: newData.gender });
        setUser({ ...user, gender: newData.gender });
        setEdit({ ...edit, gender: false });
      } catch (error) {
        console.error("Error updating gender:", error);
      }
    }

    if (field === "password" && passwordError === "") {
      try {
        await firebase.auth().currentUser.updatePassword(newPassword);
        setEdit({ ...edit, password: false });
      } catch (error) {
        console.error("Error updating password:", error);
        setPasswordError("Failed to update password.");
      }
    }
  };

  return (
    <div className="student-account-background">
      <StudentHeader />

      <div className="student-account">
        <div className="student-content">
          <h1 className="title-center">Student Account</h1>

          {/* Display and Edit Name */}
          <div className="student-input-group">
            <label>Name</label>
            <div>
              <span className="student-data-box">
                {user.firstName} {user.lastName}
              </span>
              <span
                className="student-edit-link"
                onClick={() => handleEdit("name")}
              >
                [Update Name]
              </span>
            </div>
            {edit.name && (
              <div className="student-edit-field">
                <input
                  type="text"
                  value={newData.firstName}
                  onChange={(e) =>
                    setNewData({ ...newData, firstName: e.target.value })
                  }
                  placeholder="First Name"
                />
                <input
                  type="text"
                  value={newData.lastName}
                  onChange={(e) =>
                    setNewData({ ...newData, lastName: e.target.value })
                  }
                  placeholder="Last Name"
                />
                <div className="buttons-group">
                  <button onClick={() => handleSave("name")}>Save</button>
                  <button onClick={() => handleCancel("name")}>Cancel</button>
                </div>
              </div>
            )}
          </div>

          {/* Display and Edit Email */}
          <div className="student-input-group">
            <label>Email</label>
            <div>
              <span className="student-data-box">{user.email}</span>
              <span
                className="student-edit-link"
                onClick={() => handleEdit("email")}
              >
                [Update Email]
              </span>
            </div>
            {edit.email && (
              <div className="student-edit-field">
                <input
                  type="email"
                  value={newData.email}
                  onChange={(e) =>
                    setNewData({ ...newData, email: e.target.value })
                  }
                  placeholder="New Email"
                />
                <input
                  type="email"
                  value={confirmEmail}
                  onChange={(e) => setConfirmEmail(e.target.value)}
                  placeholder="Confirm New Email"
                />
                {emailError && (
                  <div className="error-message">{emailError}</div>
                )}
                <div className="buttons-group">
                  <button onClick={() => handleSave("email")}>Save</button>
                  <button onClick={() => handleCancel("email")}>Cancel</button>
                </div>
              </div>
            )}
          </div>

          {/* Display and Edit Phone Number */}
          <div className="student-input-group">
            <label>Phone Number</label>
            <div>
              <span className="student-data-box">{user.phoneNumber}</span>
              <span
                className="student-edit-link"
                onClick={() => handleEdit("phone")}
              >
                [Update Phone]
              </span>
            </div>
            {edit.phone && (
              <div className="student-edit-field">
                <input
                  type="text"
                  value={newData.phoneNumber}
                  onChange={(e) =>
                    setNewData({ ...newData, phoneNumber: e.target.value })
                  }
                  placeholder="New Phone Number"
                />
                <div className="buttons-group">
                  <button onClick={() => handleSave("phone")}>Save</button>
                  <button onClick={() => handleCancel("phone")}>Cancel</button>
                </div>
              </div>
            )}
          </div>

          {/* Display and Edit Gender */}
          <div className="student-input-group student-gender">
            <label>Gender</label>
            <div>
              <span className="student-data-box">{user.gender}</span>
              <span
                className="student-edit-link"
                onClick={() => handleEdit("gender")}
              >
                [Update Gender]
              </span>
            </div>
            {edit.gender && (
              <div className="student-edit-field">
                <select
                  value={newData.gender}
                  onChange={(e) =>
                    setNewData({ ...newData, gender: e.target.value })
                  }
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
                <div className="buttons-group">
                  <button onClick={() => handleSave("gender")}>Save</button>
                  <button onClick={() => handleCancel("gender")}>Cancel</button>
                </div>
              </div>
            )}
          </div>

          {/* Change Password */}
          <div className="student-input-group">
            <label>Password</label>
            <div>
              <span
                className="student-edit-link"
                onClick={() => handleEdit("password")}
              >
                [Change Password]
              </span>
            </div>
            {edit.password && (
              <div className="student-edit-field">
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New Password"
                />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm New Password"
                />
                {passwordError && (
                  <div className="error-message">{passwordError}</div>
                )}
                <div className="buttons-group">
                  <button onClick={() => handleSave("password")}>Save</button>
                  <button onClick={() => handleCancel("password")}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAccount;
