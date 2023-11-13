import React, { useState, useEffect } from "react";
import firebase from "../../../../firebase/firebase";
import StudentHeader from "../../../../components/student/StudentHeader";
import "./StudentJobStatus.css";
import AreYouSureInterview from "../../../../components/share/AreYouSureInterview";
import { Timestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const StudentJobStatus = () => {
  const navigate = useNavigate();
  useEffect(() => {
    document.title = "Job Application Status";

    return () => {
      document.title = "Original Tab Title";
    };
  }, []);

  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [applications, setApplications] = useState([]);
  const [confirmedInterviewTimes, setConfirmedInterviewTimes] = useState({});
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });
  const [confirmationAction, setConfirmationAction] = useState(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const db = firebase.firestore();
        const user = firebase.auth().currentUser;

        if (user) {
          const applicationsData = await db
            .collection("studentApplications")
            .where("email", "==", user.email)
            .get();

          if (applicationsData.empty) {
            console.log("No applications found for the current user.");
            return;
          }

          const applicationsArray = await Promise.all(
            applicationsData.docs.map(async (doc) => {
              const application = doc.data();

              let jobData = await db
                .collection("jobs")
                .doc(application.jobId)
                .get();

              if (!jobData.exists) {
                jobData = await db
                  .collection("resolvedJobs")
                  .doc(application.jobId)
                  .get();

                if (jobData.exists) {
                  application.applicationStatus = "Job Closed";
                }
              }

              const job = jobData.exists ? jobData.data() : null;

              const interviewData = await db
                .collection("interviews")
                .where("applicationId", "==", doc.id)
                .get();

              const interview = interviewData.docs[0]?.data();
              const interviewStatus = interview
                ? interview.interviewStatus
                : "Pending";

              const interviewSchedule =
                interview && interview.schedules
                  ? interview.schedules
                      .map((schedule) => `${schedule.date} at ${schedule.time}`)
                      .join(", ")
                  : "No Schedule";

              return {
                applicationId: doc.id,
                jobId: application.jobId,
                jobTitle: job ? job.title : "Unknown Job Title",
                companyName: job ? job.userName : "Unknown Company",
                state: job ? job.state : "Unknown State",
                city: job ? job.city : "Unknown City",
                applicationStatus:
                  application.applicationStatus || interviewStatus,
                interviewSchedule: interviewSchedule,
              };
            })
          );

          const confirmedTimesData = await db
            .collection("interviewRoom")
            .where("uid", "==", user.uid)
            .get();

          const confirmedTimes = {};
          confirmedTimesData.forEach((doc) => {
            const data = doc.data();
            const date = data.dateTime.toDate();
            const localDateString = date.toLocaleString("en-US", {
              timeZone: "Asia/Shanghai",
            });
            confirmedTimes[data.applicationId] = {
              timeString: localDateString,
              docId: doc.id, // Store the document ID as well
            };
          });

          setConfirmedInterviewTimes(confirmedTimes);

          setApplications(applicationsArray);
        } else {
          console.log("User is not authenticated.");
        }
      } catch (error) {
        console.error("Error fetching applications: ", error.message);
      }
    };

    fetchApplications();
  }, []);

  const handleSort = (key) => {
    let direction = "ascending";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "ascending"
    ) {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const sortedApplications = [...applications];
  if (sortConfig.key) {
    sortedApplications.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
      return 0;
    });
  }

  const confirmInterviewTime = (date, time, applicationId, jobId) => {
    // Open the confirmation popup
    setShowConfirmationPopup(true);

    // Store the confirmation action in a variable
    const confirmationAction = async () => {
      const user = firebase.auth().currentUser;
      if (user) {
        try {
          const combinedDateTimeString = `${date}T${time}:00.000`;

          const dateTime = new Date(combinedDateTimeString);

          if (isNaN(dateTime)) {
            throw new Error("Invalid date or time provided.");
          }

          const firestoreTimestamp = Timestamp.fromDate(dateTime);

          // Add the interview time to Firestore
          const interviewRoomRef = await firebase
            .firestore()
            .collection("interviewRoom")
            .add({
              dateTime: firestoreTimestamp,
              applicationId: applicationId,
              jobId: jobId,
              uid: user.uid,
            });

          // Navigate to the interview room using the newly created interview room ID
          navigate(`/interview-room/${interviewRoomRef.id}`);
        } catch (error) {
          console.error("Error saving the interview time: ", error.message);
        }
      } else {
        console.log("User is not authenticated.");
      }

      // Close the confirmation popup
      setShowConfirmationPopup(false);
    };

    // Set the confirmation action
    setConfirmationAction(() => confirmationAction);
  };

  const navigateToInterviewRoom = (interviewRoomDocId) => {
    navigate(`/interview-room/${interviewRoomDocId}`);
  };

  const formatInterviewSchedule = (
    schedule,
    applicationId,
    jobId,
    application
  ) => {
    if (!schedule) return null;

    const confirmedTime = confirmedInterviewTimes[applicationId];
    const isAnyTimeConfirmed = confirmedTime !== undefined;

    return schedule.split(", ").map((part, index) => {
      const [date, timePart] = part.split(" at ");
      const time = timePart?.trim();
      const localDateTime = new Date(`${date}T${time}:00`);
      const localDateTimeString = localDateTime.toLocaleString("en-US", {
        timeZone: "Asia/Shanghai",
      });

      const isSelectedTime =
        confirmedInterviewTimes[applicationId] &&
        localDateTimeString ===
          confirmedInterviewTimes[applicationId].timeString;

      if (date && time) {
        return (
          <tr key={index} className="interview-time-row">
            <td colSpan="6">
              <div className="interview-time-section">
                <span>
                  <b style={{ color: "blue" }}>{date}</b> at{" "}
                  <b style={{ color: "blue" }}>{time} </b>
                </span>
                {isSelectedTime && (
                  <span
                    className="join-interview"
                    onClick={() =>
                      navigateToInterviewRoom(
                        confirmedInterviewTimes[applicationId].docId
                      )
                    }
                  >
                    [Join Interview]
                  </span>
                )}
                {!isAnyTimeConfirmed &&
                  application.applicationStatus !== "Job Closed" && (
                    <button
                      className="confirm-interview-button"
                      onClick={() =>
                        confirmInterviewTime(date, time, applicationId, jobId)
                      }
                      disabled={isSelectedTime}
                    >
                      Confirm
                    </button>
                  )}
              </div>
            </td>
          </tr>
        );
      } else {
        return (
          <tr key={index}>
            <td colSpan="6">{part}</td>
          </tr>
        );
      }
    });
  };

  return (
    <>
      <StudentHeader />
      <div className="applications-page">
        <h1>My Job Applications</h1>
        <table className="applications-table">
          <thead>
            <tr>
              <th>No.</th>
              <th onClick={() => handleSort("jobTitle")}>Job Title</th>
              <th onClick={() => handleSort("companyName")}>Company Name</th>
              <th onClick={() => handleSort("state")}>State</th>
              <th onClick={() => handleSort("city")}>City</th>
              <th onClick={() => handleSort("applicationStatus")}>
                Application Status
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedApplications.map((application, index) => (
              <React.Fragment key={index}>
                <tr
                  className={index % 2 === 0 ? "even" : "odd"}
                  onClick={() =>
                    setSelectedApplication(
                      selectedApplication === index ? null : index
                    )
                  }
                >
                  <td>{index + 1}</td>
                  <td>{application.jobTitle}</td>
                  <td>{application.companyName}</td>
                  <td>{application.state}</td>
                  <td>{application.city}</td>
                  <td
                    className={
                      application.applicationStatus.toLowerCase() ===
                      "job closed"
                        ? "job-closed"
                        : application.applicationStatus.toLowerCase() ===
                          "pending"
                        ? "pending"
                        : application.applicationStatus.toLowerCase() ===
                          "scheduled"
                        ? "scheduled"
                        : application.applicationStatus.toLowerCase() ===
                          "rejected"
                        ? "rejected"
                        : ""
                    }
                  >
                    {application.applicationStatus}
                  </td>
                </tr>
                {selectedApplication === index &&
                  formatInterviewSchedule(
                    application.interviewSchedule,
                    application.applicationId,
                    application.jobId,
                    application
                  )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {showConfirmationPopup && (
        <AreYouSureInterview
          show={showConfirmationPopup}
          onConfirm={() => {
            if (confirmationAction) {
              confirmationAction();
            }
          }}
          onCancel={() => {
            setShowConfirmationPopup(false);
          }}
        />
      )}
    </>
  );
};

export default StudentJobStatus;
