import React from "react";
import "./AreYouSureInterview.css";

const AreYouSureInterview = ({ show, onConfirm, onCancel }) => {
  if (!show) {
    return null;
  }

  return (
    <div className="are-you-sure-interview">
      <div className="interview-modal-content">
        <p>Are you sure you want to schedule for this interview time?</p>
        <button className="student-interview-yes-button" onClick={onConfirm}>
          Yes
        </button>
        <button className="student-interview-no-button" onClick={onCancel}>
          No
        </button>
      </div>
    </div>
  );
};

export default AreYouSureInterview;
