import React, { useState, useEffect } from "react";
import firebase from "../../../firebase/firebase";
import StudentHeader from "../../../components/student/StudentHeader";
import "./StudentViewResult.css";

const StudentViewResult = () => {
  useEffect(() => {
    document.title = "Quizzes Result";

    return () => {
      document.title = "Original Tab Title";
    };
  }, []);
  const [results, setResults] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const db = firebase.firestore();
        const user = firebase.auth().currentUser;

        if (user) {
          const answersData = await db
            .collection("studentAnswers")
            .where("userId", "==", user.uid)
            .get();

          if (answersData.empty) {
            console.log("No answers found for the current user.");
            return;
          }

          const resultsArray = await Promise.all(
            answersData.docs.map(async (doc) => {
              const answer = doc.data();
              const quizData = await db
                .collection("quizzes")
                .doc(answer.quizId)
                .get();

              if (!quizData.exists) {
                console.error(`Quiz data not found for ID: ${answer.quizId}`);
                return null;
              }

              const quiz = quizData.data();
              console.log("Retrieved Quiz Data:", quiz);

              const answeredDate = new Date(answer.createdAt.seconds * 1000);
              const formattedDate = `${answeredDate.getDate()}/${
                answeredDate.getMonth() + 1
              }/${answeredDate.getFullYear()}`;

              return {
                subject: quiz.subject,
                quizCode: quiz.quizCode,
                score: answer.score,
                lecturer: `${quiz.lecturerFirstName} ${quiz.lecturerLastName}`,
                totalQuestions: quiz.questions.length,
                createdAt: formattedDate,
              };
            })
          );

          setResults(resultsArray.filter((result) => result !== null));
        } else {
          console.log("User is not authenticated.");
        }
      } catch (error) {
        console.error("Error fetching results: ", error.message);
      }
    };

    fetchResults();
  }, []);

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

  const sortedResults = [...results];
  if (sortConfig.key) {
    sortedResults.sort((a, b) => {
      const valA = a[sortConfig.key];
      const valB = b[sortConfig.key];
      if (valA < valB) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      if (valA > valB) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
      return 0;
    });
  }

  return (
    <>
      <StudentHeader />
      <div className="score-page">
        <h1>My Quiz Results</h1>
        <table className="score-table">
          <thead>
            <tr>
              <th>No.</th>
              <th onClick={() => handleSort("subject")}>Subject</th>
              <th onClick={() => handleSort("quizCode")}>Quiz Code</th>
              <th onClick={() => handleSort("score")}>Score</th>
              <th onClick={() => handleSort("lecturer")}>Lecturer</th>
              <th onClick={() => handleSort("createdAt")}>Date Answered</th>
            </tr>
          </thead>
          <tbody>
            {sortedResults.map((result, index) => (
              <tr key={index} className={index % 2 === 0 ? "even" : "odd"}>
                <td>{index + 1}</td>
                <td>{result.subject}</td>
                <td>{result.quizCode}</td>
                <td>{`${result.score}/${result.totalQuestions}`}</td>
                <td>{result.lecturer}</td>
                <td>{result.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default StudentViewResult;
