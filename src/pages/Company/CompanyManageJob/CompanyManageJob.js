import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import firebase from "../../../firebase/firebase";
import CompanySidebar from "../../../components/company/CompanySidebar";
import CompanyStatCom from "../../../components/company/CompanyStatCom";
import AreYouSureResolved from "../../../components/share/AreYouSureResolve";
import "./CompanyManageJob.css";

const CompanyManageJob = () => {
  useEffect(() => {
    document.title = "Job Management";

    return () => {
      document.title = "EduBridge";
    };
  }, []);
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobData, setJobData] = useState([]);
  const [applicantCounts, setApplicantCounts] = useState({});
  const [showResolvedModal, setShowResolvedModal] = useState(false);
  const [showResolvedJobs, setShowResolvedJobs] = useState(false);

  useEffect(() => {
    const db = firebase.firestore();
    const user = firebase.auth().currentUser;
    if (!user) {
      return;
    }

    const collection = showResolvedJobs ? "resolvedJobs" : "jobs";

    const unsubscribe = db
      .collection(collection)
      .where("uid", "==", user.uid)
      .onSnapshot(
        (snapshot) => {
          const newData = snapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
          }));
          setJobData(newData);

          // Fetch the number of applicants for each job:
          newData.forEach(async (job) => {
            const applicantCount = await db
              .collection("studentApplications")
              .where("jobId", "==", job.id)
              .get();

            setApplicantCounts((prevCounts) => ({
              ...prevCounts,
              [job.id]: applicantCount.size,
            }));
          });
        },
        (error) => {
          console.error("Error fetching real-time data: ", error.message);
        }
      );

    return () => unsubscribe();
  }, [showResolvedJobs]);

  const handleJobClick = (jobId) => {
    setSelectedJob(selectedJob === jobId ? null : jobId);
  };

  const handleStopRecruit = async (jobId) => {
    try {
      const db = firebase.firestore();
      const user = firebase.auth().currentUser;

      if (!user) {
        alert("No authenticated user found.");
        return;
      }

      const jobDoc = await db.collection("jobs").doc(jobId).get();
      const jobData = jobDoc.data();

      if (jobData) {
        await db.collection("resolvedJobs").doc(jobId).set(jobData);
        await db.collection("jobs").doc(jobId).delete();

        const recentActivity = {
          message: `Job titled '${jobData.title}' was resolved.`,
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          userId: user.uid,
        };

        const activityRef = await db
          .collection("recentActivities")
          .add(recentActivity);

        if (!activityRef.id) {
          throw new Error(
            "Failed to save the recent activity. No ID returned."
          );
        }

        console.log("Recent activity was successfully saved.");
        alert("Job successfully Resolved.");
      } else {
        alert("No action. This job has been Resolved.");
      }
    } catch (error) {
      console.error("Error during recruitment process: ", error.message);
    }
  };

  return (
    <div className="company-manage-job">
      <CompanySidebar />
      <div className="content">
        <h1 className="welcome-title">Company Manage Jobs</h1>
        <CompanyStatCom />
        <div className="header">
          <div className="title-container">
            <h2 className="manage-jobs-title">Manage Jobs</h2>
          </div>

          <Link to="">
            <div className="button-container">
              <button
                className={`create-job-button ${
                  showResolvedJobs ? "view-recruitment" : "view-resolved"
                }`}
                onClick={() => setShowResolvedJobs(!showResolvedJobs)}
              >
                {showResolvedJobs ? "View Recruitment" : "View Resolved"}
              </button>
            </div>
          </Link>
          <Link to="/create-job">
            <div className="button-container">
              <button className="create-job-button">+ Create New Job</button>
            </div>
          </Link>
        </div>
        <div className="job-list">
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Job Title</th>
                <th>Job Type</th>
                <th>Location</th>
                <th>
                  <div className="center-header">
                    Number of
                    <br />
                    Applicant
                  </div>
                </th>
                <th>Date Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobData.map((job, index) => (
                <tr
                  key={job.id}
                  className={`job-item ${index % 2 === 0 ? "even" : "odd"} ${
                    selectedJob === job.id ? "selected" : ""
                  }`}
                  onClick={() => handleJobClick(job.id)}
                >
                  <td>{index + 1}</td>
                  <td>{job.title}</td>
                  <td>{job.type}</td>
                  <td>{`${job.city}, ${job.state}, ${job.country}`}</td>
                  <td>{applicantCounts[job.id] || 0}</td>
                  <td>
                    {new Date(
                      job.createdAt.seconds * 1000
                    ).toLocaleDateString()}
                  </td>
                  <td>
                    {selectedJob === job.id && (
                      <div className="action-buttons">
                        <Link to={`/view-job/${job.id}`}>
                          <button className="view-button">View</button>
                        </Link>
                        <Link to={`/edit-job/${job.id}`}>
                          <button className="edit-button">Edit</button>
                        </Link>
                        <button
                          className="resolved-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedJob(job.id);
                            setShowResolvedModal(true);
                          }}
                        >
                          Resolved
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <AreYouSureResolved
          show={showResolvedModal}
          onConfirm={() => {
            handleStopRecruit(selectedJob);
            setShowResolvedModal(false);
          }}
          onCancel={() => setShowResolvedModal(false)}
        />
      </div>
    </div>
  );
};

export default CompanyManageJob;
