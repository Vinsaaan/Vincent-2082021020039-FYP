import React, { useState, useEffect } from "react";
import firebase from "../../../firebase/firebase";
import CompanySidebar from "../../../components/company/CompanySidebar";
import "./CompanyAccount.css";

const CompanyAccount = () => {
  useEffect(() => {
    document.title = "Account Setting";

    return () => {
      document.title = "EduBridge";
    };
  }, []);
  const [progress, setProgress] = useState(0);
  const [image, setImage] = useState(null);
  const defaultProfilePic =
    "../../../assets/images/company/account/defaultProfilepic.png";
  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    gender: "",
    phoneNumber: "",
    userName: "",
  });

  const userId = firebase.auth().currentUser.uid;

  const [fileInput, setFileInput] = useState(null);

  useEffect(() => {
    const unsubscribe = firebase
      .firestore()
      .collection("users")
      .doc(userId)
      .onSnapshot(
        (doc) => {
          if (doc.exists) {
            const userData = doc.data();
            setUser(userData);
            if (
              userData.profilePicture &&
              userData.profilePicture !== defaultProfilePic
            ) {
              setImage(userData.profilePicture);
            }
          } else {
            setImage(null);
          }
        },
        (error) => {
          console.error("Error fetching user data:", error);
        }
      );

    return () => unsubscribe();
  }, [userId, defaultProfilePic]);

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

  const [passwordError, setPasswordError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [newData, setNewData] = useState({ ...user });
  const [confirmEmail, setConfirmEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const storageRef = firebase
      .storage()
      .ref(`profile-pictures/${userId}/${file.name}`);
    const uploadTask = storageRef.put(file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        setProgress(progress);
      },
      (error) => {
        console.error("Error uploading image:", error);
      },
      () => {
        uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
          console.log("Download URL:", downloadURL);
          setImage(downloadURL);
          setProgress(0);
          firebase
            .firestore()
            .collection("users")
            .doc(userId)
            .update({
              profilePicture: downloadURL,
            })
            .then(() => {
              console.log("Image URL updated in Firestore");
            })
            .catch((error) => {
              console.error("Error updating image URL in Firestore:", error);
            });
        });
      }
    );
  };

  useEffect(() => {
    if (image) {
      firebase.firestore().collection("users").doc(userId).update({
        profilePicture: image,
      });
    }
  }, [image, userId]);

  const [edit, setEdit] = useState({
    email: false,
    phoneNumber: false,
    gender: false,
    password: false,
    userName: false,
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
      if (field === "userName" && newData.userName.trim() !== "") {
        await firebase
          .firestore()
          .collection("users")
          .doc(userId)
          .update({ userName: newData.userName });

        setUser({ ...user, userName: newData.userName });
        setEdit({ ...edit, userName: false });

        await createActivityLog("Updated username.");
      }

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

        await createActivityLog("Updated gender.");
      }

      if (field === "password" && passwordError === "") {
        await firebase.auth().currentUser.updatePassword(newPassword);
        setEdit({ ...edit, password: false });

        await createActivityLog("Updated password.");
      }
    } catch (error) {
      console.error("Error updating details:", error);
    }
  };

  return (
    <div className="company-account">
      <CompanySidebar />
      <div className="content">
        <h1 className="title-center">{user.userName} Profile Setting</h1>

        {/* Profile Picture Section */}
        <div className="profile-pic" onClick={() => fileInput.click()}>
          <label>Company Photo</label>
          <img
            src={image ? image : defaultProfilePic}
            alt="Profile"
            style={{
              width: "150px",
              height: "150px",
              cursor: "pointer",
            }}
          />
          <input
            type="file"
            ref={(input) => setFileInput(input)}
            style={{ display: "none" }}
            onChange={handleImageUpload}
          />
          {progress > 0 && <progress value={progress} max="100" />}
        </div>

        <div className="user-data">
          {/* New section for editing userName */}
          <div className="input-group">
            <label htmlFor="name">Company</label>
            <div>
              <span className="data-box">{user.userName}</span>
              <span
                className="edit-link"
                onClick={() => handleEdit("userName")}
              >
                [Update Company Name]
              </span>
            </div>
            {edit.userName && (
              <div className="edit-field">
                <input
                  type="text"
                  value={newData.userName}
                  onChange={(e) =>
                    setNewData({ ...newData, userName: e.target.value })
                  }
                  placeholder="New Username"
                />
                <div className="buttons-group">
                  <button onClick={() => handleSave("userName")}>Save</button>
                  <button onClick={() => handleCancel("userName")}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Email */}
          <div className="input-group">
            <label htmlFor="email">Email</label>
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
                  id="newEmail"
                  value={newData.email}
                  onChange={(e) =>
                    setNewData({ ...newData, email: e.target.value })
                  }
                  placeholder="New Email"
                />
                <input
                  type="email"
                  id="confirmNewEmail"
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

          {/* Phone Number */}
          <div className="input-group">
            <label htmlFor="phoneNumber">Phone Number</label>
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
                  id="newPhoneNumber"
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

          {/* Gender */}
          <div className="input-group gender">
            <label htmlFor="gender">Gender</label>
            <div>
              <span className="data-box">{user.gender}</span>
              <span className="edit-link" onClick={() => handleEdit("gender")}>
                [Update Gender]
              </span>
            </div>
            {edit.gender && (
              <div className="edit-field">
                <select
                  id="newGender"
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

          {/* Password */}
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <div>
              <span
                className="edit-link"
                onClick={() => handleEdit("password")}
              >
                [Change Password]
              </span>
            </div>
            {edit.password && (
              <div className="edit-field">
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New Password"
                />
                <input
                  type="password"
                  id="confirmNewPassword"
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

export default CompanyAccount;
