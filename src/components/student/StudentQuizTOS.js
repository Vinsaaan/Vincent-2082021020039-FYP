import React, { useState } from "react";
import "./StudentQuizTOS.css"; // Import CSS file for styling

const StudentQuizTOS = ({ showModal, setShowModal, onAcceptTerms }) => {
  const [acceptTerms, setAcceptTerms] = useState(false);

  const acceptAndCloseTerms = () => {
    if (acceptTerms) {
      onAcceptTerms();
    } else {
      alert("Please accept the terms.");
    }
  };

  const closeTerms = () => {
    setShowModal(false);
  };

  return (
    <div className={`student-quiz-modal ${showModal ? "show" : ""}`}>
      <div className="student-quiz-content">
        <h2>Terms of Service</h2>
        <ol>
          <li>Users cannot leave the Quiz room once entered.</li>
          <li>You can only leave after finishing all the questions.</li>
        </ol>
        <label>
          <input
            type="checkbox"
            checked={acceptTerms}
            onChange={() => setAcceptTerms(!acceptTerms)}
            className="student-quiz-checkbox"
          />{" "}
          I accept the terms
        </label>
        <div className="student-quiz-button-container">
          <button
            type="button"
            className={`student-quiz-accept-button ${
              acceptTerms ? "enabled" : ""
            }`}
            onClick={acceptAndCloseTerms}
          >
            Accept
          </button>
          <button
            type="button"
            className="student-quiz-close-button"
            onClick={closeTerms}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentQuizTOS;
