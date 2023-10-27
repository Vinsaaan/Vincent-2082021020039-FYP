import React, { useState, useEffect } from "react";
import "./AreYouSureApply.css";
import firebase from "../../firebase/firebase";
import { useParams } from "react-router-dom";

const AreYouSureApply = ({ show, onConfirm, onCancel }) => {
  const { jobId } = useParams();
  const [jobDetails, setJobDetails] = useState(null);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const docRef = firebase.firestore().collection("jobs").doc(jobId);
        const doc = await docRef.get();

        if (doc.exists) {
          setJobDetails(doc.data());
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching job:", error);
      }
    };

    if (jobId) {
      fetchJobDetails();
    }
  }, [jobId]);

  if (!show) {
    return null;
  }

  return (
    <div className="delete-modal">
      <div className="modal-content">
        <p>
          {jobDetails
            ? `Are you sure you want to apply for the ${jobDetails.title} role at ${jobDetails.userName}?`
            : "Are you sure you want to apply for this job?"}
        </p>
        <button className="yes-apply-button" onClick={onConfirm}>
          Yes
        </button>
        <button className="no-apply-button" onClick={onCancel}>
          No
        </button>
      </div>
    </div>
  );
};

export default AreYouSureApply;
