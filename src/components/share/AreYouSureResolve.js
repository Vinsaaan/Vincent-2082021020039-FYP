import React from "react";
import "./AreYouSure.css";

const AreYouSureResolved = ({ show, onConfirm, onCancel }) => {
  if (!show) {
    return null;
  }

  return (
    <div className="delete-modal">
      <div className="modal-content">
        <p>Are you sure you want to resolve this item?</p>
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

export default AreYouSureResolved;
