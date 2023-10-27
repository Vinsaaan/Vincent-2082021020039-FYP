import React, { useEffect, useState } from "react";
import firebase from "../../../firebase/firebase";
import "./LecturerDashboard.css";
import LecturerSidebar from "../../../components/lecturer/LecturerSidebar";
import LecturerStatCom from "../../../components/lecturer/LecturerStatCom";

const LecturerDashboard = () => {
  useEffect(() => {
    document.title = "Lecturer Dashboard";

    return () => {
      document.title = "EduBridge";
    };
  }, []);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    document.body.classList.add("lecturer-background");

    const unsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        const lecturerUid = user.uid;

        const userDoc = await firebase
          .firestore()
          .collection("users")
          .doc(lecturerUid)
          .get();
        if (userDoc.exists) {
          setFirstName(userDoc.data().firstName);
          setLastName(userDoc.data().lastName);
        }

        // Fetch the recent activities for the lecturer
        const activitiesRef = firebase
          .firestore()
          .collection("recentActivities");
        const snapshot = await activitiesRef
          .where("uid", "==", lecturerUid)
          .orderBy("createdAt", "desc")
          .limit(15)
          .get();

        const activitiesData = [];
        for (let doc of snapshot.docs) {
          const activity = doc.data();

          activitiesData.push({
            message: activity.message, // Use the activity message directly
          });
        }
        setRecentActivities(activitiesData);
      }
    });

    return () => {
      document.body.classList.remove("lecturer-background");
      unsubscribe();
    };
  }, []);

  return (
    <div className="lecturer-dashboard">
      <h1 className="welcome-title">
        Welcome to {firstName} {lastName} Dashboard
      </h1>
      <LecturerStatCom />

      <LecturerSidebar />

      <div className="recent-activity">
        <h2>Recent Activity</h2>
        {recentActivities.map((activity, index) => (
          <p
            className={`activity ${index % 2 === 0 ? "even" : "odd"}`}
            key={index}
          >
            {activity.message}
          </p>
        ))}
      </div>
    </div>
  );
};

export default LecturerDashboard;
