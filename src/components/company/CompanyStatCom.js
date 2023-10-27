import React, { useEffect, useState } from "react";
import firebase from "../../firebase/firebase";
import "./CompanyStatCom.css";
import { useNavigate } from "react-router-dom";

const CompanyStatCom = () => {
  const [totalApplicants, setTotalApplicants] = useState(0);
  const [pendingApplicants, setPendingApplicants] = useState(0);
  const [completedApplications, setCompletedApplications] = useState(0);
  const navigate = useNavigate();
  const currentUser = firebase.auth().currentUser;
  const companyUID = currentUser ? currentUser.uid : null;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const db = firebase.firestore();

        if (!companyUID) {
          console.error("No company UID available");
          return;
        }

        const companyJobsQuery = await db
          .collection("jobs")
          .where("uid", "==", companyUID)
          .get();
        const companyJobIds = companyJobsQuery.docs.map((doc) => doc.id);

        const applicantQuery = await db
          .collection("studentApplications")
          .where("jobId", "in", companyJobIds)
          .get();

        let pendingCount = 0;
        let completedCount = 0;

        for (const doc of applicantQuery.docs) {
          // Check if there's an interview document with this application's ID
          const interviewSnapshot = await db
            .collection("interviews")
            .where("applicationId", "==", doc.id)
            .get();

          if (
            interviewSnapshot.empty ||
            !["Scheduled", "Rejected"].includes(
              interviewSnapshot.docs[0].data().interviewStatus
            )
          ) {
            pendingCount++;
          } else {
            completedCount++;
          }
        }

        setTotalApplicants(applicantQuery.size);
        setPendingApplicants(pendingCount);
        setCompletedApplications(completedCount);
      } catch (error) {
        console.error("Error fetching data: ", error.message);
      }
    };

    fetchStats();
  }, [companyUID]);

  return (
    <div className="dashboard-overview">
      <div className="total-applicants">
        <p>Total Applicant</p>
        <h2>{totalApplicants}</h2>
      </div>

      <div
        className="pending-applicants clickable"
        onClick={() => navigate("/view-pending")}
      >
        <p>Pending Applicant</p>
        <h2>{pendingApplicants}</h2>
      </div>

      <div className="completed-applications">
        <p>Completed Applications</p>
        <h2>{completedApplications}</h2>
      </div>
    </div>
  );
};

export default CompanyStatCom;
