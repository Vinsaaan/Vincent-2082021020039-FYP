import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import firebase from "../../../../firebase/firebase";

import "./ViewScore.css";
import LecturerSidebar from "../../../../components/lecturer/LecturerSidebar";

const ViewScore = () => {
  const { quizId } = useParams();
  const [studentScores, setStudentScores] = useState([]);
  const [quizInfo, setQuizInfo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchScoresAndQuizInfo = async () => {
      try {
        const db = firebase.firestore();
        const scores = [];

        const quizDoc = await db.collection("quizzes").doc(quizId).get();
        const quizData = quizDoc.data();
        setQuizInfo(quizData);

        const snapshot = await db
          .collection("studentAnswers")
          .where("quizId", "==", quizId)
          .get();

        snapshot.forEach((doc) => {
          const data = doc.data();
          scores.push({
            studentId: data.userId,
            studentName: `${data.firstName} ${data.lastName}`,
            score: `${data.score}/${quizData.questions.length}`,
          });
        });

        setStudentScores(scores);
      } catch (error) {
        console.error("Error fetching scores:", error);
      }
    };

    fetchScoresAndQuizInfo();
  }, [quizId]);

  const navigateToAnswers = (studentId) => {
    navigate(`/view-answer/${quizId}/${studentId}`);
  };

  return (
    <div>
      <LecturerSidebar />
      <div className="score-container">
        {quizInfo ? (
          <>
            <h2>Student Scores for {quizInfo.subject}</h2>
            <h4>
              Code: <span className="code">{quizInfo.quizCode}</span>
            </h4>
            <table className="score-table">
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Student Name</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {studentScores.map((score, index) => (
                  <tr key={index} className={index % 2 === 0 ? "even" : "odd"}>
                    <td>{index + 1}</td>
                    <td>{score.studentName}</td>
                    <td>
                      <span
                        className="score"
                        onClick={() => navigateToAnswers(score.studentId)}
                      >
                        {score.score}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <p>Loading quiz information...</p>
        )}
      </div>
    </div>
  );
};

export default ViewScore;
