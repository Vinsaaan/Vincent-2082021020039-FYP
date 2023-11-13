import React from "react";
import "./AreYouSure.css";

const AreYouSureLeave = ({ show, onConfirm, onCancel }) => {
  console.log("AreYouSureLeave render attempt, show is:", show);

  if (!show) {
    return null;
  }

  return (
    <div className="delete-modal">
      <div className="modal-content">
        <p>Are you sure you want to LEAVE the interview?</p>
        <button className="yes-button" onClick={onConfirm}>
          Yes
        </button>
        <button className="no-button" onClick={onCancel}>
          No
        </button>
      </div>
    </div>
  );
};

export default AreYouSureLeave;
