import React, { useState, useEffect, useCallback } from "react";
import firebase from "../../../firebase/firebase";
import "./StudentQuizRoom.css";
import { useParams, useNavigate } from "react-router-dom";

const StudentQuizRoom = () => {
  const { quizCode } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [studentFirstName, setStudentFirstName] = useState("");
  const [studentLastName, setStudentLastName] = useState("");
  const [hasAttempted, setHasAttempted] = useState(false);

  useEffect(() => {
    document.title = "Quiz Room";

    return () => {
      document.title = "Original Tab Title";
    };
  }, []);

  useEffect(() => {
    const fetchStudentName = async () => {
      try {
        const user = firebase.auth().currentUser;
        if (user) {
          const db = firebase.firestore();
          const doc = await db.collection("users").doc(user.uid).get();
          if (doc.exists) {
            setStudentFirstName(doc.data().firstName);
            setStudentLastName(doc.data().lastName);
          } else {
            console.log("No such user document!");
          }
        }
      } catch (error) {
        console.error("Error getting document:", error);
      }
    };

    const checkIfAttempted = async () => {
      const userId = firebase.auth().currentUser?.uid;
      if (userId) {
        const db = firebase.firestore();
        const doc = await db
          .collection("studentAnswers")
          .doc(`${quizCode}_${userId}`)
          .get();

        if (doc.exists) {
          setHasAttempted(true);
          alert(
            "You have already attempted this quiz and cannot take it again."
          );
          navigate("/student-dashboard");
        }
      }
    };

    fetchStudentName();
    checkIfAttempted();
  }, [quizCode, navigate]);

  const handleOptionSelect = (questionIndex, optionIndex) => {
    const newSelectedOptions = [...selectedOptions];
    newSelectedOptions[questionIndex] = optionIndex;
    setSelectedOptions(newSelectedOptions);
  };

  const handleSubmit = useCallback(
    async (forced = false) => {
      if (!forced && !window.confirm("Do you want to submit your answers?")) {
        return;
      }

      let correctAnswers = 0;
      quiz.questions.forEach((question, index) => {
        if (selectedOptions[index] === question.correctOption) {
          correctAnswers++;
        }
      });

      setScore(correctAnswers);
      setSubmitted(true);
      alert(`Your score: ${correctAnswers}/${quiz.questions.length}`);
      recordActivity(
        `Submitted quiz with code ${quizCode}. Score: ${correctAnswers}/${quiz.questions.length}`
      );
      navigate("/student-dashboard");

      // Save the result to Firebase
      const userId = firebase.auth().currentUser
        ? firebase.auth().currentUser.uid
        : null;
      if (userId) {
        const db = firebase.firestore();
        await db.collection("studentAnswers").doc(`${quizCode}_${userId}`).set({
          userId,
          quizId: quiz.id,
          selectedOptions,
          score: correctAnswers,
          firstName: studentFirstName,
          lastName: studentLastName,
          createdAt: new Date(),
        });
      } else {
        console.error("User is not authenticated");
      }
    },
    [
      quiz,
      selectedOptions,
      navigate,
      quizCode,
      studentFirstName,
      studentLastName,
    ]
  );

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const db = firebase.firestore();
        const quizQuery = await db
          .collection("quizzes")
          .where("quizCode", "==", quizCode)
          .get();

        if (!quizQuery.empty) {
          const doc = quizQuery.docs[0];
          const quizData = doc.data();
          quizData.id = doc.id;
          setQuiz(quizData);
          setTimeLeft(quizData.duration * 60);
          setSelectedOptions(new Array(quizData.questions.length).fill(null));
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error getting document:", error);
      }
    };

    fetchQuiz();
  }, [quizCode]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timerId = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);

      return () => clearTimeout(timerId);
    } else if (timeLeft === 0 && !submitted) {
      handleSubmit(true);
    }
  }, [timeLeft, submitted, handleSubmit]);

  const recordActivity = async (message) => {
    const userId = firebase.auth().currentUser
      ? firebase.auth().currentUser.uid
      : null;
    if (userId) {
      const db = firebase.firestore();
      await db.collection("recentActivities").add({
        userId,
        message,
        createdAt: new Date(),
      });
    }
  };

  if (hasAttempted) {
    return null;
  }

  if (!quiz) {
    return <div>Loading...</div>;
  }

  const questionsToDisplay = quiz.questions.slice(
    currentPage * 5,
    (currentPage + 1) * 5
  );

  return (
    <div className="student-quiz-room" id="studentQuizRoom">
      <div className="header-section">
        <h1 id="quizSubject">{quiz.subject}</h1>
        <div id="timeLeft">
          {Math.floor(timeLeft / 60)}:{timeLeft % 60 < 10 ? "0" : ""}
          {timeLeft % 60}
        </div>
      </div>
      <div id="lecturerName">
        Lecturer: {quiz.lecturerFirstName} {quiz.lecturerLastName}
      </div>
      <div id="quizCode">Code: {quizCode}</div>
      <div className="question-section" id="questionSection">
        {questionsToDisplay.map((question, index) => {
          const questionIndex = currentPage * 5 + index;

          return (
            <div
              key={questionIndex}
              className={`question ${index % 2 === 0 ? "even" : "odd"}`}
              id={`question${questionIndex}`}
            >
              <h2 id={`questionText${questionIndex}`}>{question.question}</h2>
              <div className="options" id={`options${questionIndex}`}>
                {question.options.map((option, optionIndex) => (
                  <div
                    key={optionIndex}
                    className="option"
                    id={`option${optionIndex}ForQuestion${questionIndex}`}
                    onClick={() =>
                      handleOptionSelect(questionIndex, optionIndex)
                    }
                  >
                    <input
                      type="radio"
                      id={`optionInput${optionIndex}ForQuestion${questionIndex}`}
                      checked={selectedOptions[questionIndex] === optionIndex}
                      readOnly
                    />
                    <label
                      htmlFor={`optionInput${optionIndex}ForQuestion${questionIndex}`}
                    >
                      {option}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        <div className="navigation-buttons" id="navigationButtons">
          <button
            id="previousButton"
            disabled={currentPage === 0}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </button>
          <button
            id="nextButton"
            disabled={(currentPage + 1) * 5 >= quiz.questions.length}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </button>
          {!submitted && (
            <button id="submitButton" onClick={handleSubmit}>
              Submit
            </button>
          )}
        </div>

        {submitted && (
          <div id="scoreDisplay">
            Your score: {score}/{quiz.questions.length}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentQuizRoom;
