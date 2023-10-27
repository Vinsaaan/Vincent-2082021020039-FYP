import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import firebase from "../../../firebase/firebase";
import StudentHeader from "../../../components/student/StudentHeader";
import "./StudentDashboard.css";
import StudentQuizTOS from "../../../components/student/StudentQuizTOS";

const StudentDashboard = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [quizCode, setQuizCode] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [joinedQuiz, setJoinedQuiz] = useState(false);
  const [latestJobs, setLatestJobs] = useState([]);
  const [companyProfilePics, setCompanyProfilePics] = useState({});
  const [recentActivities, setRecentActivities] = useState([]);

  const navigate = useNavigate();

  const getCompanyProfilePic = async (uid) => {
    const db = firebase.firestore();
    const userDoc = await db.collection("users").doc(uid).get();

    if (userDoc.exists) {
      const userData = userDoc.data();
      return userData.profilePicture;
    }

    return null;
  };

  useEffect(() => {
    document.title = "Student Dashboard";

    return () => {
      document.title = "Original Tab Title";
    };
  }, []);

  useEffect(() => {
    const db = firebase.firestore();

    // Fetch latest jobs from Firebase
    const fetchLatestJobs = async () => {
      const snapshot = await db
        .collection("jobs")
        .orderBy("createdAt", "desc")
        .limit(5)
        .get();

      const jobsArray = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const pics = {};
      await Promise.all(
        jobsArray.map(async (job) => {
          pics[job.uid] = await getCompanyProfilePic(job.uid);
        })
      );
      setCompanyProfilePics(pics);
      setLatestJobs(jobsArray);
    };

    const fetchRecentActivities = async (studentUid) => {
      const snapshot = await db
        .collection("recentActivities")
        .where("userId", "==", studentUid)
        .orderBy("createdAt", "desc")
        .limit(15)
        .get();

      let activitiesArray = snapshot.docs.map((doc) => doc.data().message);

      // Helper function to get job data from a specific collection
      const getJobDataFromCollection = async (collectionName, jobUid) => {
        const jobSnapshot = await db
          .collection(collectionName)
          .doc(jobUid)
          .get();
        return jobSnapshot.exists ? jobSnapshot.data() : null;
      };

      for (let i = 0; i < activitiesArray.length; i++) {
        const jobIdMatch = activitiesArray[i].match(/Applied job at (\w+)\./);
        if (jobIdMatch && jobIdMatch[1]) {
          const jobUid = jobIdMatch[1];

          let jobData = await getJobDataFromCollection("jobs", jobUid);

          if (!jobData) {
            jobData = await getJobDataFromCollection("resolvedJobs", jobUid);
          }

          if (jobData) {
            activitiesArray[i] = (
              <>
                Applied job at <b>{jobData.userName}</b>, Position:{" "}
                <b>{jobData.title}</b>.
              </>
            );
          }
        }
      }

      setRecentActivities(activitiesArray);
    };

    fetchLatestJobs();

    const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        const studentUid = user.uid;

        fetchRecentActivities(studentUid); // Call the function with the studentUid

        firebase
          .firestore()
          .collection("users")
          .doc(studentUid)
          .get()
          .then((doc) => {
            if (doc.exists) {
              const data = doc.data();
              setFirstName(data.firstName);
              setLastName(data.lastName);
            } else {
              console.log("No such document!");
            }
          })
          .catch((error) => {
            console.log("Error getting document:", error);
          });
      } else {
        console.log("No user is signed in");
      }
    });

    return () => unsubscribe();
  }, []);

  const joinQuiz = async () => {
    try {
      const db = firebase.firestore();
      const doc = await db
        .collection("quizzes")
        .where("quizCode", "==", quizCode)
        .get();

      if (!doc.empty) {
        setJoinedQuiz(true);
        setShowModal(true);
      } else {
        alert("Invalid quiz code!");
      }
    } catch (error) {
      console.error("Error joining quiz:", error);
      alert("Error joining quiz, please try again.");
    }
  };

  const handleAcceptTerms = () => {
    if (quizCode) {
      navigate(`../quiz-room/${quizCode}`);
    } else {
      alert("Quiz code is missing.");
    }
    setShowModal(false);
  };

  return (
    <>
      <StudentHeader
        joinQuiz={joinQuiz}
        showModal={showModal}
        setShowModal={setShowModal}
      />
      <div className="student-dashboard-page">
        <h1 className="student-welcome-title">
          Welcome back, {firstName} {lastName}
        </h1>
        <div className="student-dashboard-content">
          <div className="student-recent-activity">
            <h2>Recent Activity</h2>
            {recentActivities.map((activity, index) => (
              <p
                key={index}
                className={`student-activity ${
                  index % 2 === 0 ? "student-even" : "student-odd"
                }`}
              >
                {activity}
              </p>
            ))}
          </div>
          <div className="student-right-side-content">
            <div className="student-quiz-code-box">
              <h2>Enter Quiz Code</h2>
              <div className="student-quiz-input-section">
                <input
                  type="text"
                  value={quizCode}
                  onChange={(e) => setQuizCode(e.target.value)}
                  placeholder="Enter Code"
                  id="student-quiz-code-field"
                />
                <button
                  type="button"
                  id="student-code-button"
                  onClick={joinQuiz}
                >
                  Join
                </button>
              </div>
            </div>
            {joinedQuiz && showModal && (
              <StudentQuizTOS
                showModal={showModal}
                setShowModal={setShowModal}
                onAcceptTerms={handleAcceptTerms}
              />
            )}
            <div className="student-job-listing-box">
              <h2>Latest Job Listing</h2>
              <ul>
                {latestJobs.map((job) => (
                  <li
                    key={job.id}
                    onClick={() => navigate(`/apply-form/${job.id}`)}
                  >
                    <img
                      src={companyProfilePics[job.uid] || "defaultImageUrl"}
                      alt={`${job.userName} logo`}
                      width={50}
                      height={50}
                      style={{ borderRadius: "50%" }}
                    />
                    {job.title} - {job.userName}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentDashboard;
