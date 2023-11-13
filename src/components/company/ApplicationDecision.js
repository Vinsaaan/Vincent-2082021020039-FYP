import React, { useState, useEffect } from "react";
import firebase from "../../firebase/firebase";
import addIcon from "../../assets/images/company/schedule/addIcon.png";
import delIcon from "../../assets/images/company/schedule/delIcon.png";
import "./ApplicationDecision.css";
import { useNavigate } from "react-router-dom";

const ApplicationDecision = ({
  show,
  decision,
  jobId,
  applicationId,
  onConfirm,
  onCancel,
}) => {
  const [schedules, setSchedules] = useState([{ date: "", time: "" }]);
  const db = firebase.firestore();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Set up the auth state changed listener
    const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      setUser(user);
    });

    // Clean up the listener when the component unmounts
    return () => unsubscribe();
  }, []);

  if (!show) {
    return null;
  }

  const validateSchedules = () => {
    return schedules.every(
      (schedule) => schedule.date.trim() && schedule.time.trim()
    );
  };

  const addOrUpdateInterview = async (interviewData) => {
    if (!user) {
      alert("Please sign in first.");
      return;
    }

    try {
      const interviewDoc = await db.collection("interviews").add(interviewData);
      console.log(`Interview added with ID: ${interviewDoc.id}`);
      onConfirm();
      navigate("/manage-job");
    } catch (error) {
      console.error("Error adding interview: ", error);
      alert("Failed to add interview. Please try again.");
    }
  };

  const handleAddSchedule = () => {
    if (schedules.length < 3) {
      setSchedules([...schedules, { date: "", time: "" }]);
    }
  };

  const handleSaveSchedules = () => {
    if (!validateSchedules()) {
      alert("Please fill in all date and time fields!");
      return;
    }
    addOrUpdateInterview({
      jobId,
      schedules,
      applicationId,
      interviewStatus: "Scheduled",
    });
  };

  const handleRejectApplicant = () => {
    addOrUpdateInterview({
      jobId,
      applicationId,
      interviewStatus: "Rejected",
    });
  };

  const handleRemoveSchedule = () => {
    if (schedules.length > 1) {
      setSchedules(schedules.slice(0, -1));
    }
  };

  const handleScheduleChange = (index, field, value) => {
    const updatedSchedules = schedules.map((schedule, i) =>
      i === index ? { ...schedule, [field]: value } : schedule
    );
    setSchedules(updatedSchedules);
  };

  return (
    <div className="decision-modal">
      <div className="modal-content">
        {decision === "approve" ? (
          <>
            <h2>Interview Schedule</h2>
            {schedules.map((schedule, index) => (
              <div key={index} className="schedule-item">
                <input
                  type="date"
                  value={schedule.date}
                  onChange={(e) =>
                    handleScheduleChange(index, "date", e.target.value)
                  }
                />
                <input
                  type="time"
                  value={schedule.time}
                  onChange={(e) =>
                    handleScheduleChange(index, "time", e.target.value)
                  }
                />
              </div>
            ))}
            <img
              src={addIcon}
              alt="Add Schedule"
              className="schedule-button-add"
              onClick={handleAddSchedule}
            />
            <img
              src={delIcon}
              alt="Remove Schedule"
              className="schedule-button-delete"
              onClick={handleRemoveSchedule}
            />
            <p>
              Are you sure you want to{" "}
              <span className="proceed-text">PROCEED</span> the applicant?
            </p>
            <button
              className="interview-yes-button"
              onClick={handleSaveSchedules}
            >
              Yes
            </button>
            <button className="interview-no-button" onClick={onCancel}>
              No
            </button>
          </>
        ) : decision === "decline" ? (
          <>
            <p>
              Are you sure you want to{" "}
              <span className="reject-text">REJECT</span> the applicant?
            </p>
            <button className="yes-button" onClick={handleRejectApplicant}>
              Yes
            </button>
            <button className="no-button" onClick={onCancel}>
              No
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default ApplicationDecision;
