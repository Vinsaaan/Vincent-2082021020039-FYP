import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import firebase from "../../../firebase/firebase";
import { serverTimestamp } from "firebase/firestore";
import { useDropzone } from "react-dropzone";
import delIcon from "../../../assets/images/feedback/delIcon.png";
import "./ReportBug.css";

const ReportBug = () => {
  useEffect(() => {
    document.title = "Report Bug";

    return () => {
      document.title = "EduBridge";
    };
  }, []);

  const navigate = useNavigate();
  const [bugReportData, setBugReportData] = useState({
    userType: "",
    description: "",
    images: [],
  });
  const [error, setError] = useState("");

  const onDrop = (acceptedFiles) => {
    const currentSize = bugReportData.images.reduce(
      (total, file) => total + file.size,
      0
    );
    const newSize = acceptedFiles.reduce((total, file) => total + file.size, 0);

    if (currentSize + newSize > 5000000) {
      setError("Total file size exceeds the 5MB limit.");
      return;
    }

    setBugReportData((prevState) => ({
      ...prevState,
      images: [...prevState.images, ...acceptedFiles],
    }));
  };

  const onDropRejected = () => {
    setError("A file you are trying to upload exceeds the 5MB size limit.");
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    onDropRejected,
    accept: "image/*",
    maxSize: 5000000, // 5MB limit
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setBugReportData({
      ...bugReportData,
      [name]: value,
    });
  };

  const handleImageDelete = (index) => {
    setBugReportData((prevState) => ({
      ...prevState,
      images: prevState.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = firebase.auth().currentUser;
    if (!user) {
      setError("No user is signed in.");
      return;
    }

    if (!bugReportData.userType) {
      setError("Please select a user type.");
      return;
    }

    if (!bugReportData.description.trim()) {
      setError("Please describe the bug.");
      return;
    }

    // Assuming the UID comes from the currently authenticated user
    const uid = firebase.auth().currentUser.uid;

    // Get user data from Firestore
    const userRef = firebase.firestore().collection("users").doc(uid);
    let userData = {};
    try {
      const userDoc = await userRef.get();
      if (userDoc.exists) {
        userData = userDoc.data();
      } else {
        setError("User data not found.");
        return;
      }
    } catch (error) {
      console.error("Error fetching user data: ", error);
      setError("An error occurred while fetching user data.");
      return;
    }

    const imageUrls = [];
    const storageRef = firebase.storage().ref("report-bugs");

    for (const image of bugReportData.images) {
      const imageRef = storageRef.child(image.name);
      try {
        await imageRef.put(image);
        const imageUrl = await imageRef.getDownloadURL();
        imageUrls.push(imageUrl);
      } catch (error) {
        console.error("Error uploading image: ", error);
        setError("An error occurred while uploading images.");
        return;
      }
    }

    // Now, let's prepare the bug report data with user data and image URLs
    const bugReportWithUserData = {
      ...bugReportData,
      images: imageUrls,
      user: {
        email: userData.email,
        firstName: userData.firstName,
        gender: userData.gender,
        lastName: userData.lastName,
        phoneNumber: userData.phoneNumber,
        profilePicture: userData.profilePicture || null,
        uid: uid,
      },
      createdAt: serverTimestamp(),
    };

    // Add bug report data to Firestore with image URLs
    firebase
      .firestore()
      .collection("bugReports")
      .add(bugReportWithUserData)
      .then(async (docRef) => {
        // Record the activity after the bug report is successful
        const activity = {
          createdAt: serverTimestamp(),
          message: "You have reported a Bug.",
          uid: uid,
        };

        try {
          await firebase
            .firestore()
            .collection("recentActivities")
            .add(activity);
          alert("Thank you for reporting the bug!");
          navigate(-1);
        } catch (activityError) {
          console.error("Error writing activity: ", activityError);
        }
      })
      .catch((error) => {
        console.error("Error writing document: ", error);
        setError("An error occurred while submitting your bug report.");
      });
  };

  return (
    <div className="bug-report-container">
      <form onSubmit={handleSubmit} className="bug-report-form">
        {/* User type selection */}
        <div className="input-group">
          <label htmlFor="userType">User Type:</label>
          <select
            name="userType"
            id="userType"
            value={bugReportData.userType}
            onChange={handleInputChange}
            required
          >
            <option value="">Select user type</option>
            <option value="Student">Student</option>
            <option value="Lecturer">Lecturer</option>
            <option value="Company">Company</option>
          </select>
        </div>

        {/* Bug Description input */}
        <div className="input-group">
          <label htmlFor="description">Bug Description:</label>
          <textarea
            name="description"
            id="description"
            value={bugReportData.description}
            onChange={handleInputChange}
            required
          />
        </div>

        {/* Image upload area */}
        <div className="file-upload-container">
          <label htmlFor="bugImages" className="file-upload-label">
            Upload Images (up to 10):
          </label>
          <div {...getRootProps()} className="dropzone">
            <input {...getInputProps()} />
            <p>Drag 'n' drop some files here, or click to select files</p>
          </div>
          <div className="image-preview-container">
            {bugReportData.images.map((image, index) => (
              <div key={index} className="image-preview">
                <img
                  src={URL.createObjectURL(image)}
                  alt={`Screenshot ${index + 1}`}
                  style={{ width: "100px", height: "100px" }}
                />
                <div className="button-report-container">
                  <img
                    src={delIcon} // this is the path to your delete icon image
                    className="delete-image-icon"
                    onClick={() => handleImageDelete(index)}
                    alt="Delete"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit and Go Back buttons */}
        <div className="button-report-container">
          <button
            type="button"
            className="report-go-back-button"
            onClick={() => navigate(-1)}
          >
            Go Back
          </button>
          <button type="submit" className="report-submit-button">
            Submit Bug Report
          </button>
        </div>

        {/* Error message display */}
        {error && <div className="error-message">{error}</div>}
      </form>
    </div>
  );
};

export default ReportBug;
