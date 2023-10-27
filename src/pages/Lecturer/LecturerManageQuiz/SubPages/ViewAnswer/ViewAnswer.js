import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import firebase from "../../../../../firebase/firebase";
import "./ViewAnswer.css";
import LecturerSidebar from "../../../../../components/lecturer/LecturerSidebar";

const ViewAnswer = () => {
  const { quizId, studentId } = useParams();
  const [answers, setAnswers] = useState([]);
  const [quizInfo, setQuizInfo] = useState(null);
  const [studentInfo, setStudentInfo] = useState(null);
  const [subjectName, setSubjectName] = useState(null);

  const [currentPage, setCurrentPage] = useState(0);
  const questionsPerPage = 5;

  useEffect(() => {
    const fetchAnswersAndQuizInfo = async () => {
      try {
        const db = firebase.firestore();

        // Fetch quiz info
        const quizDoc = await db.collection("quizzes").doc(quizId).get();
        const quizData = quizDoc.data();
        setQuizInfo(quizData);

        // Fetch student's answers
        const answerData = await db
          .collection("studentAnswers")
          .where("userId", "==", studentId)
          .where("quizId", "==", quizId)
          .get();

        answerData.forEach((doc) => {
          const data = doc.data();
          setAnswers(data.selectedOptions);
        });

        // Fetch student information
        const studentDoc = await db.collection("users").doc(studentId).get();
        const studentData = studentDoc.data();
        setStudentInfo(studentData);

        // Fetch subject name
        setSubjectName(quizData.subject);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchAnswersAndQuizInfo();
  }, [quizId, studentId]);

  const onNextPage = () => {
    setCurrentPage(currentPage + 1);
  };

  const onPreviousPage = () => {
    setCurrentPage(currentPage - 1);
  };

  return (
    <div>
      <LecturerSidebar />
      <div className="view-answer-container">
        {quizInfo && answers.length > 0 && studentInfo && subjectName ? (
          <>
            <p className="student-name">
              <strong>Student:</strong>{" "}
              <span>
                {studentInfo.firstName} {studentInfo.lastName}
              </span>
            </p>
            <p className="subject-name">
              <strong>Subject:</strong> <span>{subjectName}</span>
            </p>
            <p className="quiz-code">
              <strong>Code:</strong>{" "}
              <span className="view-answer-code">{quizInfo.quizCode}</span>
            </p>
            <ul>
              {quizInfo.questions
                .slice(
                  currentPage * questionsPerPage,
                  (currentPage + 1) * questionsPerPage
                )
                .map((question, index) => (
                  <li
                    key={index}
                    className={`view-answer-question-item ${
                      index % 2 === 0 ? "even" : "odd"
                    } ${
                      question.correctOption ===
                      answers[currentPage * questionsPerPage + index]
                        ? "correct"
                        : "incorrect"
                    }`}
                  >
                    <p
                      className={
                        question.correctOption ===
                        answers[currentPage * questionsPerPage + index]
                          ? "correct-question"
                          : "incorrect-question"
                      }
                    >
                      <strong>
                        Question {currentPage * questionsPerPage + index + 1}:
                      </strong>{" "}
                      {question.question}
                    </p>
                    {question.options.map((option, optionIndex) => (
                      <div
                        key={optionIndex}
                        className={
                          optionIndex === question.correctOption
                            ? "correct"
                            : ""
                        }
                      >
                        <input
                          type="radio"
                          disabled
                          checked={
                            optionIndex ===
                            answers[currentPage * questionsPerPage + index]
                          }
                        />
                        {option}
                      </div>
                    ))}
                  </li>
                ))}
            </ul>
            <div className="view-answer-radio-and-go-back">
              <div className="view-answer-goback-buttons">
                <button onClick={onPreviousPage} disabled={currentPage === 0}>
                  Previous
                </button>
                <button
                  onClick={onNextPage}
                  disabled={
                    (currentPage + 1) * questionsPerPage >=
                    quizInfo.questions.length
                  }
                >
                  Next
                </button>
              </div>
              <div className="view-answer-goback-buttons">
                <Link
                  to={`/view-score/${quizId}`}
                  className="view-answer-button unique-go-back-button" // Update the class here
                >
                  Go Back
                </Link>
              </div>
            </div>
          </>
        ) : (
          <p>Loading answers...</p>
        )}
      </div>
    </div>
  );
};

export default ViewAnswer;
