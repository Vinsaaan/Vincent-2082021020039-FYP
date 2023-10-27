import React, { useEffect, useState } from "react";
import firebase from "../../../firebase/firebase";
import "./CompanyDashboard.css";
import CompanySidebar from "../../../components/company/CompanySidebar";
import CompanyStatCom from "../../../components/company/CompanyStatCom";

const CompanyDashboard = () => {
  useEffect(() => {
    document.title = "Dashboard";

    return () => {
      document.title = "EduBridge";
    };
  }, []);
  const [userName, setUserName] = useState("");
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    document.body.classList.add("company-background");

    const unsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        const companyUid = user.uid;

        // Fetch the company's name
        const userDoc = await firebase
          .firestore()
          .collection("users")
          .doc(companyUid)
          .get();
        if (userDoc.exists) {
          setUserName(userDoc.data().userName);
        }

        // Fetch the recent activities for the company
        const activitiesRef = firebase
          .firestore()
          .collection("recentActivities");
        const snapshot = await activitiesRef
          .where("userId", "==", companyUid)
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
      document.body.classList.remove("company-background");
      unsubscribe();
    };
  }, []);

  return (
    <div className="company-dashboard">
      <h1 className="welcome-title">Welcome to {userName} Dashboard</h1>
      <CompanyStatCom />

      <CompanySidebar />

      <div className="recent-activity">
        <h2>Recent Activity</h2>
        {recentActivities.map((activity, index) => (
          <p className={`activity ${index % 2 === 0 ? "even" : "odd"}`}>
            {activity.message}
          </p>
        ))}
      </div>
    </div>
  );
};

export default CompanyDashboard;
