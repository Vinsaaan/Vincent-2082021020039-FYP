import React, { useState } from "react";
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

  if (!show) {
    return null;
  }

  const validateSchedules = () => {
    for (let schedule of schedules) {
      if (!schedule.date.trim() || !schedule.time.trim()) {
        return false;
      }
    }
    return true;
  };

  const handleAddSchedule = () => {
    if (schedules.length < 3) {
      setSchedules([...schedules, { date: "", time: "" }]);
    }
  };

  const handleSaveSchedules = () => {
    firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        if (!validateSchedules()) {
          alert("Please fill in all date and time fields!");
          return;
        }

        try {
          const interviewDoc = await db.collection("interviews").add({
            jobId,
            schedules,
            applicationId,
            interviewStatus: "Scheduled",
          });
          console.log(`Interview added with ID: ${interviewDoc.id}`);

          onConfirm();
          navigate("/manage-job");
        } catch (error) {
          console.error("Error adding interview schedules: ", error);
          alert("Failed to add interview schedules. Please try again.");
        }
      } else {
        alert("Please sign in first.");
      }
    });
  };

  const handleRejectApplicant = () => {
    firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const interviewDoc = await db.collection("interviews").add({
            jobId,
            applicationId,
            interviewStatus: "Rejected",
          });
          console.log(`Interview rejection added with ID: ${interviewDoc.id}`);

          onConfirm();
          navigate("/manage-job");
        } catch (error) {
          console.error("Error rejecting applicant: ", error);
          alert("Failed to reject. Please try again.");
        }
      } else {
        alert("Please sign in first.");
      }
    });
  };

  const handleRemoveSchedule = () => {
    if (schedules.length > 1) {
      const newSchedules = [...schedules];
      newSchedules.pop();
      setSchedules(newSchedules);
    }
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
                  onChange={(e) => {
                    const newSchedules = [...schedules];
                    newSchedules[index].date = e.target.value;
                    setSchedules(newSchedules);
                  }}
                />
                <input
                  type="time"
                  value={schedule.time}
                  onChange={(e) => {
                    const newSchedules = [...schedules];
                    newSchedules[index].time = e.target.value;
                    setSchedules(newSchedules);
                  }}
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
