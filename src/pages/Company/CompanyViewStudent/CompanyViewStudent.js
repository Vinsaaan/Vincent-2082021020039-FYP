import React, { useState, useEffect, useMemo } from "react";
import firebase from "../../../firebase/firebase";
import CompanySidebar from "../../../components/company/CompanySidebar";
import CompanyStatCom from "../../../components/company/CompanyStatCom";
import "./CompanyViewStudent.css";
import { useNavigate } from "react-router-dom";

const CompanyViewStudent = () => {
  const [students, setStudents] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [listType, setListType] = useState("ApplicantList");
  const [sortConfig, setSortConfig] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Pending List";
    return () => {
      document.title = "EduBridge";
    };
  }, []);

  const formatDate = (firebaseTimestamp) => {
    if (!firebaseTimestamp) return "N/A";
    const date = firebaseTimestamp.toDate();
    const options = {
      year: "2-digit",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };
    return date.toLocaleString("en-US", options).replace(",", "");
  };

  const fetchPendingStudents = async () => {
    try {
      const db = firebase.firestore();
      const currentUser = firebase.auth().currentUser;
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
        if (!companyJob) continue;

        const interviewSnapshot = await db
          .collection("interviews")
          .where("applicationId", "==", application.id)
          .get();
        if (interviewSnapshot.empty) {
          pendingStudents.push({
            id: application.id,
            ...applicationData,
            jobTitle: companyJob.title,
          });
        }
      }

      pendingStudents.sort((a, b) => a.firstname.localeCompare(b.firstname));
      setStudents(pendingStudents);
    } catch (error) {
      console.error("Error fetching students: ", error.message);
    }
  };

  const fetchInterviews = async () => {
    try {
      const db = firebase.firestore();
      const currentUser = firebase.auth().currentUser;

      const jobSnapshot = await db
        .collection("jobs")
        .where("uid", "==", currentUser.uid)
        .get();

      const jobsData = jobSnapshot.docs.reduce((acc, doc) => {
        acc[doc.id] = doc.data().title;
        return acc;
      }, {});

      const interviewSnapshot = await db
        .collection("interviewRoom")
        .where("jobId", "in", Object.keys(jobsData))
        .get();

      const interviewDetails = await Promise.all(
        interviewSnapshot.docs.map(async (doc) => {
          const interviewData = doc.data();
          const studentApplicationSnapshot = await db
            .collection("studentApplications")
            .doc(interviewData.applicationId)
            .get();

          const studentData = studentApplicationSnapshot.data() || {};

          return {
            ...interviewData,
            Name: `${studentData.firstname || ""} ${
              studentData.lastname || ""
            }`,
            Country: studentData.country || "",
            State: studentData.state || "",
            JobTitle: jobsData[interviewData.jobId] || "Unknown",
            InterviewDate: interviewData.dateTime,
          };
        })
      );

      setInterviews(interviewDetails);
    } catch (error) {
      console.error("Error fetching interviews: ", error.message);
    }
  };

  useEffect(() => {
    if (listType === "ApplicantList") {
      fetchPendingStudents();
    } else {
      fetchInterviews();
    }
  }, [listType]);

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

  const toggleListType = () => {
    setListType(
      listType === "ApplicantList" ? "InterviewList" : "ApplicantList"
    );
  };

  const navigateToInterviewRoom = async (applicationId) => {
    try {
      console.log("Navigating with applicationId:", applicationId);

      const db = firebase.firestore();
      const interviewSnapshot = await db
        .collection("interviewRoom")
        .where("applicationId", "==", applicationId)
        .limit(1) // Assuming each application has only one interview room
        .get();

      if (!interviewSnapshot.empty) {
        const interviewRoomId = interviewSnapshot.docs[0].id;
        console.log("Navigating to Interview Room ID:", interviewRoomId);
        navigate(`/interview-room/${interviewRoomId}`);
      } else {
        console.log(
          "No interview room found for applicationId:",
          applicationId
        );
      }
    } catch (error) {
      console.error("Error navigating to interview room:", error);
    }
  };

  const handleItemClick = (path) => {
    window.open(window.location.origin + path, "_blank");
  };

  return (
    <div className="company-view-student">
      <CompanySidebar />
      <div className="content">
        <h1 className="static-title">Pending List</h1>
        <CompanyStatCom />

        <div className="title-button-row">
          <h2 className="dynamic-title">
            {listType === "ApplicantList" ? "Applicant List" : "Interview List"}
          </h2>

          <button
            className={`view-toggle-button ${
              listType === "ApplicantList" ? "blue" : "green"
            }`}
            onClick={toggleListType}
          >
            Show
            <br />
            {listType === "ApplicantList" ? "Interview List" : "Applicant List"}
          </button>
        </div>

        <div className="students-list">
          <div className="table-header">
            <div>No.</div>
            <div onClick={() => requestSort("firstname")}>Name</div>
            <div onClick={() => requestSort("country")}>Country</div>
            <div onClick={() => requestSort("state")}>State</div>
            <div onClick={() => requestSort("jobTitle")}>Job Title</div>
            <div
              onClick={() =>
                requestSort(
                  listType === "ApplicantList" ? "startDate" : "InterviewDate"
                )
              }
            >
              {listType === "ApplicantList" ? "Start Date" : "Interview Date"}
            </div>
          </div>
          {listType === "ApplicantList"
            ? sortedStudents.map((student, index) => (
                <div
                  key={student.id}
                  className={`student-item ${index % 2 === 0 ? "even" : "odd"}`}
                  onClick={() =>
                    handleItemClick("/applicant-detail/" + student.id)
                  }
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
              ))
            : interviews.map((interview, index) => {
                const formattedDate = interview.InterviewDate
                  ? formatDate(interview.InterviewDate)
                  : "N/A";
                return (
                  <div
                    key={interview.applicationId} // Use applicationId for uniqueness
                    className={`student-item ${
                      index % 2 === 0 ? "even" : "odd"
                    }`}
                    onClick={() =>
                      navigateToInterviewRoom(interview.applicationId)
                    }
                  >
                    <div>{index + 1}</div>

                    <div>{interview.Name}</div>
                    <div>{interview.Country}</div>
                    <div>{interview.State}</div>
                    <div>{interview.JobTitle}</div>
                    <div>{formattedDate}</div>
                  </div>
                );
              })}
        </div>
      </div>
    </div>
  );
};

export default CompanyViewStudent;
