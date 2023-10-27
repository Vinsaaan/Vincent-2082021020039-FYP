import React, { useState, useEffect, useMemo } from "react";
import firebase from "../../../firebase/firebase";
import CompanySidebar from "../../../components/company/CompanySidebar";
import CompanyStatCom from "../../../components/company/CompanyStatCom";
import "./CompanyViewStudent.css";
import { useNavigate } from "react-router-dom";

const CompanyViewStudent = () => {
  useEffect(() => {
    document.title = "Pending List";

    return () => {
      document.title = "EduBridge";
    };
  }, []);
  const [students, setStudents] = useState([]);
  const [sortConfig, setSortConfig] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPendingStudents = async () => {
      try {
        const db = firebase.firestore();
        const currentUser = firebase.auth().currentUser;

        // Get job IDs and titles posted by the current company/user
        const jobSnapshot = await db
          .collection("jobs")
          .where("uid", "==", currentUser.uid)
          .get();

        const companyJobs = jobSnapshot.docs.map((doc) => ({
          id: doc.id,
          title: doc.data().title,
        }));

        const applicationsSnapshot = await db
          .collection("studentApplications")
          .get();
        const pendingStudents = [];

        for (const application of applicationsSnapshot.docs) {
          const applicationData = application.data();

          const companyJob = companyJobs.find(
            (job) => job.id === applicationData.jobId
          );

          // Only consider applications for jobs posted by the current company/user
          if (!companyJob) continue;

          // Check if there's an associated interview for the application
          const interviewSnapshot = await db
            .collection("interviews")
            .where("applicationId", "==", application.id)
            .get();

          // If there's no associated interview, the status is "Pending"
          if (interviewSnapshot.empty) {
            pendingStudents.push({
              id: application.id,
              ...applicationData,
              jobTitle: companyJob.title,
            });
          }
        }

        // Sort students by name
        pendingStudents.sort((a, b) => a.firstname.localeCompare(b.firstname));

        setStudents(pendingStudents);
      } catch (error) {
        console.error("Error fetching students: ", error.message);
      }
    };

    fetchPendingStudents();
  }, []);

  const sortedStudents = useMemo(() => {
    let sortableStudents = [...students];
    if (sortConfig !== null) {
      sortableStudents.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableStudents;
  }, [students, sortConfig]);

  const requestSort = (key) => {
    let direction = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className="company-view-student">
      <CompanySidebar />
      <div className="content">
        <h1 className="welcome-title">Applicant List (Pending)</h1>
        <CompanyStatCom />
        <div className="students-list">
          <div className="table-header">
            <div>No.</div>
            <div onClick={() => requestSort("firstname")}>Name</div>
            <div onClick={() => requestSort("country")}>Country</div>
            <div onClick={() => requestSort("state")}>State</div>
            <div onClick={() => requestSort("jobTitle")}>Job Title</div>
            <div onClick={() => requestSort("startDate")}>Start Date</div>
          </div>
          {sortedStudents.map((student, index) => (
            <div
              key={student.id}
              className={`student-item ${index % 2 === 0 ? "even" : "odd"}`}
              onClick={() => navigate("/applicant-detail/" + student.id)}
            >
              <div>{index + 1}</div>
              <div>
                {student.firstname} {student.lastname}
              </div>
              <div>{student.country}</div>
              <div>{student.state}</div>
              <div>{student.jobTitle}</div>
              <div>{student.startDate}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CompanyViewStudent;
