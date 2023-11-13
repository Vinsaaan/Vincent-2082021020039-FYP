import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Feedback.css";
import firebase from "../../../firebase/firebase";
import { serverTimestamp } from "firebase/firestore";

const Feedback = () => {
  useEffect(() => {
    document.title = "User Feedback";

    return () => {
      document.title = "EduBridge";
    };
  }, []);
  const navigate = useNavigate();

  const [feedbackData, setFeedbackData] = useState({
    navigation: 0,
    clarity: 0,
    efficiency: 0,
    suggestions: "",
  });

  const [userData, setUserData] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    const currentUserUid = firebase.auth().currentUser.uid;
    const userRef = firebase
      .firestore()
      .collection("users")
      .doc(currentUserUid);

    userRef
      .get()
      .then((doc) => {
        if (doc.exists) {
          setUserData(doc.data());
        } else {
          console.log("No user data found!");
        }
      })
      .catch((error) => {
        console.error("Error getting user data:", error);
      });
  }, []);

  const handleRatingChange = (key, value) => {
    setFeedbackData((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };

  const handleSuggestionChange = (event) => {
    setFeedbackData((prevState) => ({
      ...prevState,
      suggestions: event.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ... existing validation code ...

    const uid = firebase.auth().currentUser.uid; // Assuming this is the user's UID

    try {
      await firebase
        .firestore()
        .collection("feedbacks")
        .add({
          ...userData,
          ...feedbackData,
          createdAt: serverTimestamp(),
        });

      // Prepare the activity data to be saved
      const recentActivityData = {
        message: "You have submitted a Feedback",
        uid: uid,
        createdAt: serverTimestamp(),
      };

      // Save the activity to the `recentActivities` collection
      await firebase
        .firestore()
        .collection("recentActivities")
        .add(recentActivityData);

      alert("Thank you for submitting your feedback!");
      navigate(-1); // This will take you back to the previous page
    } catch (error) {
      console.error("Error writing document: ", error);
      setError("An error occurred while submitting your feedback.");
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const questions = [
    {
      key: "navigation",
      text: "How easy was it to find what you were looking for on our website?",
    },
    {
      key: "clarity",
      text: "How clear and understandable is the website's content and layout?",
    },
    {
      key: "efficiency",
      text: "Did you accomplish your tasks efficiently on the website?",
    },
  ];

  return (
    <div className="rating-container">
      <form onSubmit={handleSubmit}>
        <h1>User Feedback</h1>
        {questions.map((question, index) => (
          <div
            key={question.key}
            className={`question-container ${index % 2 === 0 ? "even" : "odd"}`}
          >
            <h2>{question.text}</h2>
            <div className="rating">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((value) => (
                <React.Fragment key={`${question.key}-${value}`}>
                  <input
                    type="radio"
                    id={`${question.key}-${value}`}
                    name={question.key}
                    value={value}
                    checked={feedbackData[question.key] === value}
                    onChange={() => handleRatingChange(question.key, value)}
                    className="rating-radio"
                  />
                  <label
                    htmlFor={`${question.key}-${value}`}
                    className="rating-label"
                  >
                    {value}
                  </label>
                </React.Fragment>
              ))}
            </div>
          </div>
        ))}
        <div className="suggestions-container">
          <label htmlFor="suggestions" className="suggestions-label">
            Give Suggestion or Write a Review (optional):
          </label>
          <textarea
            id="suggestions"
            name="suggestions"
            className="suggestions-textarea"
            value={feedbackData.suggestions}
            onChange={handleSuggestionChange}
            placeholder="Your suggestions or review..."
            style={{ resize: "none" }}
          />
        </div>
        <div className="buttons-container">
          <button
            type="button"
            className="feedback-go-back-button"
            onClick={handleGoBack}
          >
            Go Back
          </button>
          <button type="submit" className="submit-button">
            Submit Feedback
          </button>
        </div>
        {error && <div className="error-message">{error}</div>}
      </form>
    </div>
  );
};

export default Feedback;
