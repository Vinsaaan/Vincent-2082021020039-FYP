import React, { useState, useEffect } from "react";
import firebase from "../../../firebase/firebase";
import LecturerSidebar from "../../../components/lecturer/LecturerSidebar";
import "./LecturerAccount.css";

const LecturerAccount = () => {
  useEffect(() => {
    document.title = "Account Setting";

    return () => {
      document.title = "EduBridge";
    };
  }, []);
  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    gender: "",
    phoneNumber: "",
  });

  const createActivityLog = async (action) => {
    try {
      const db = firebase.firestore();
      await db.collection("activityLogs").add({
        uid: userId,
        action,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      });
      console.log("Activity log created successfully");
    } catch (error) {
      console.error("Error creating activity log:", error);
    }
  };

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
    try {
      if (field === "name") {
        if (newData.firstName.trim() !== "" && newData.lastName.trim() !== "") {
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

          // Log the activity
          await createActivityLog("Updated name.");
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
        await firebase.auth().currentUser.updateEmail(newData.email);
        await firebase
          .firestore()
          .collection("users")
          .doc(userId)
          .update({ email: newData.email });

        setUser({ ...user, email: newData.email });
        setEdit({ ...edit, email: false });

        // Log the activity
        await createActivityLog("Updated email.");
      } else if (field === "email") {
        setEmailError("Emails do not match or are empty!");
      }

      if (field === "phone" && newData.phoneNumber.trim() !== "") {
        await firebase
          .firestore()
          .collection("users")
          .doc(userId)
          .update({ phoneNumber: newData.phoneNumber });

        setUser({ ...user, phoneNumber: newData.phoneNumber });
        setEdit({ ...edit, phone: false });

        // Log the activity
        await createActivityLog("Updated phone number.");
      }

      if (field === "gender") {
        await firebase
          .firestore()
          .collection("users")
          .doc(userId)
          .update({ gender: newData.gender });

        setUser({ ...user, gender: newData.gender });
        setEdit({ ...edit, gender: false });

        // Log the activity
        await createActivityLog("Updated gender.");
      }

      if (field === "password" && passwordError === "") {
        await firebase.auth().currentUser.updatePassword(newPassword);
        setEdit({ ...edit, password: false });

        // Log the activity
        await createActivityLog("Updated password.");
      }
    } catch (error) {
      console.error("Error updating details:", error);
    }
  };

  return (
    <div className="lecturer-account">
      <LecturerSidebar />
      <div className="content">
        <h1 className="title-center">Lecturer Account</h1>

        {/* Display and Edit Name */}
        <div className="input-group">
          <label>Name</label>
          <div>
            <span className="data-box">
              {user.firstName} {user.lastName}
            </span>
            <span className="edit-link" onClick={() => handleEdit("name")}>
              [Update Name]
            </span>
          </div>
          {edit.name && (
            <div className="edit-field">
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
      </div>

      {/* Display and Edit Email */}
      <div className="input-group">
        <label>Email</label>
        <div>
          <span className="data-box">{user.email}</span>
          <span className="edit-link" onClick={() => handleEdit("email")}>
            [Update Email]
          </span>
        </div>
        {edit.email && (
          <div className="edit-field">
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
            {emailError && <div className="error-message">{emailError}</div>}
            <div className="buttons-group">
              <button onClick={() => handleSave("email")}>Save</button>
              <button onClick={() => handleCancel("email")}>Cancel</button>
            </div>
          </div>
        )}
      </div>

      {/* Display and Edit Phone Number */}
      <div className="input-group">
        <label>Phone Number</label>
        <div>
          <span className="data-box">{user.phoneNumber}</span>
          <span className="edit-link" onClick={() => handleEdit("phone")}>
            [Update Phone]
          </span>
        </div>
        {edit.phone && (
          <div className="edit-field">
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
      <div className="input-group gender">
        <label>Gender</label>
        <div>
          <span className="data-box">{user.gender}</span>
          <span className="edit-link" onClick={() => handleEdit("gender")}>
            [Update Gender]
          </span>
        </div>
        {edit.gender && (
          <div className="edit-field">
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
      <div className="input-group">
        <label>Password</label>
        <div>
          <span className="edit-link" onClick={() => handleEdit("password")}>
            [Change Password]
          </span>
        </div>
        {edit.password && (
          <div className="edit-field">
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
              <button onClick={() => handleCancel("password")}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LecturerAccount;
