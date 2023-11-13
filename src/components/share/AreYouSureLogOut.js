import React from "react";
import { useNavigate } from "react-router-dom";
import "./AreYouSure.css";

const AreYouSureLogOut = ({ show, onConfirm, onCancel }) => {
  const navigate = useNavigate();

  if (!show) {
    return null;
  }

  const handleFeedbackClick = () => {
    navigate("/feedback");
  };

  return (
    <div className="delete-modal">
      <div className="modal-content">
        <p>Are you sure you want to Log Out?</p>
        <div className="logout-buttons">
          <button className="yes-button" onClick={onConfirm}>
            <strong>Yes</strong>
          </button>
          <button className="no-button" onClick={onCancel}>
            <strong>No</strong>
          </button>
        </div>
        <p className="feedback-message">
          Click{" "}
          <span onClick={handleFeedbackClick} className="feedback-link">
            Here
          </span>{" "}
          to leave a Feedback
        </p>
      </div>
    </div>
  );
};

export default AreYouSureLogOut;
