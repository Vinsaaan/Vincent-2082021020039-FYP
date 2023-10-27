import React, { useState, useEffect } from "react";
import firebase from "../../../../firebase/firebase";
import StudentHeader from "../../../../components/student/StudentHeader";
import "./StudentJobStatus.css";

const StudentJobStatus = () => {
  useEffect(() => {
    document.title = "Job Application Status";

    return () => {
      document.title = "Original Tab Title";
    };
  }, []);

  const [selectedApplication, setSelectedApplication] = useState(null);
  const [applications, setApplications] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });

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

              // Try to fetch the job from the "jobs" collection
              let jobData = await db
                .collection("jobs")
                .doc(application.jobId)
                .get();

              // If the job is not found in "jobs," try "resolvedJobs"
              if (!jobData.exists) {
                jobData = await db
                  .collection("resolvedJobs")
                  .doc(application.jobId)
                  .get();

                // If the job is found in "resolvedJobs," set interviewStatus to "Job Closed"
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
      const valA = a[sortConfig.key];
      const valB = b[sortConfig.key];
      if (valA < valB) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      if (valA > valB) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
      return 0;
    });
  }

  function formatInterviewSchedule(schedule) {
    if (!schedule) return null;

    const scheduleParts = schedule.split(", ");

    const formattedParts = scheduleParts.map((part, index) => {
      const [date, timePart] = part.split(" at ");
      const time = timePart?.trim();

      if (date && time) {
        return (
          <span key={index}>
            <b style={{ color: "blue" }}>{date}</b> at{" "}
            <b style={{ color: "blue" }}>{time}</b>
            {index !== scheduleParts.length - 1 && ", "}
          </span>
        );
      } else {
        return part;
      }
    });

    return formattedParts;
  }

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
                {selectedApplication === index && (
                  <tr className="interview-schedule-row">
                    <td colSpan="6">
                      Interview Schedule:{" "}
                      {formatInterviewSchedule(application.interviewSchedule)}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default StudentJobStatus;
