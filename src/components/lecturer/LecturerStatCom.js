import React, { useEffect, useState } from "react";
import firebase from "../../firebase/firebase"; // Adjust the path according to your project structure
import "./LecturerStatCom.css";

const LecturerStatCom = () => {
  const [totalStudents, setTotalStudents] = useState(0);
  const [ongoingQuizzes, setOngoingQuizzes] = useState(0);
  const [completedQuizzes, setCompletedQuizzes] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const db = firebase.firestore();
        const user = firebase.auth().currentUser;

        if (user) {
          // Fetch ongoing quizzes
          const quizQuery = await db
            .collection("quizzes")
            .where("uid", "==", user.uid)
            .get();
          setOngoingQuizzes(quizQuery.size);

          // Fetch completed quizzes and total students
          const studentAnswerQuery = await db
            .collection("studentAnswers")
            .where(
              "quizId",
              "in",
              quizQuery.docs.map((doc) => doc.id)
            )
            .get();

          setCompletedQuizzes(studentAnswerQuery.size);

          const uniqueStudentIds = new Set(
            studentAnswerQuery.docs.map((doc) => doc.data().userId)
          );
          setTotalStudents(uniqueStudentIds.size);
        }
      } catch (error) {
        console.error("Error fetching data: ", error.message);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="dashboard-overview">
      <div className="total-students">
        <p>Total Students</p>
        <h2>{totalStudents}</h2>
      </div>

      <div className="ongoing-quizzes">
        <p>Ongoing Quizzes</p>
        <h2>{ongoingQuizzes}</h2>
      </div>

      <div className="completed-quizzes">
        <p>Completed Quizzes</p>
        <h2>{completedQuizzes}</h2>
      </div>
    </div>
  );
};

export default LecturerStatCom;
