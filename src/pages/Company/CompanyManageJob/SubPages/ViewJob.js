import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CompanySidebar from "../../../../components/company/CompanySidebar";
import firebase from "../../../../firebase/firebase";
import "./ViewJob.css";

const ViewJob = () => {
  useEffect(() => {
    document.title = "Applicants Details List";
    return () => {
      document.title = "EduBridge";
    };
  }, []);

  const { jobId } = useParams();
  const [applicants, setApplicants] = useState([]);
  const [jobInfo, setJobInfo] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

  useEffect(() => {
    const fetchApplicantsAndJobInfo = async () => {
      try {
        const db = firebase.firestore();
        const fetchedApplicants = [];

        let jobDoc = await db.collection("jobs").doc(jobId).get();
        if (!jobDoc.exists) {
          jobDoc = await db.collection("resolvedJobs").doc(jobId).get();
        }

        const jobData = jobDoc.data();
        setJobInfo(jobData);

        const snapshot = await db
          .collection("studentApplications")
          .where("jobId", "==", jobId)
          .get();

        for (const doc of snapshot.docs) {
          const data = doc.data();

          const interviewSnapshot = await db
            .collection("interviews")
            .where("applicationId", "==", doc.id)
            .get();

          let statusData = "Pending"; // default to "Pending"

          if (!interviewSnapshot.empty) {
            statusData = interviewSnapshot.docs[0].data().interviewStatus;
          }

          fetchedApplicants.push({
            applicationId: doc.id,
            firstName: data.firstname,
            lastName: data.lastname,
            country: data.country,
            phoneNumber: `${data.areacode} ${data.phone}`,
            email: data.email,
            gender: data.gender,
            startDate: data.startDate,
            status: statusData,
          });
        }

        setApplicants(fetchedApplicants);
      } catch (error) {
        console.error("Error fetching applicants:", error);
      }
    };

    fetchApplicantsAndJobInfo();
  }, [jobId]);

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

  const sortedApplicants = [...applicants];
  if (sortConfig.key) {
    sortedApplicants.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
      return 0;
    });
  }

  return (
    <div className="job-container">
      {jobInfo ? (
        <>
          <h2>Applicants for {jobInfo.title}</h2>
          <h4>Company: {jobInfo.userName}</h4>
          <CompanySidebar />
          <table className="applicant-table">
            <thead>
              <tr>
                <th>No.</th>
                <th onClick={() => handleSort("firstName")}>First Name</th>
                <th onClick={() => handleSort("lastName")}>Last Name</th>
                <th onClick={() => handleSort("country")}>Country</th>
                <th>Phone Number</th>
                <th>Email</th>
                <th>Gender</th>
                <th onClick={() => handleSort("startDate")}>Available Date</th>
                <th onClick={() => handleSort("status")}>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedApplicants.map((applicant, index) => (
                <tr key={index} className={index % 2 === 0 ? "even" : "odd"}>
                  <td>{index + 1}</td>
                  <td>{applicant.firstName}</td>
                  <td>{applicant.lastName}</td>
                  <td>{applicant.country}</td>
                  <td>{applicant.phoneNumber}</td>
                  <td>{applicant.email}</td>
                  <td>{applicant.gender}</td>
                  <td>{applicant.startDate}</td>
                  <td className={`status-${applicant.status.toLowerCase()}`}>
                    {applicant.status}
                  </td>
                  <td>
                    <button
                      onClick={() => {
                        const win = window.open(
                          `/applicant-detail/${applicant.applicationId}`,
                          "_blank"
                        );
                        win.focus();
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#007bff",
                        cursor: "pointer",
                        textDecoration: "underline",
                      }}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <p>Loading job information...</p>
      )}
    </div>
  );
};

export default ViewJob;
