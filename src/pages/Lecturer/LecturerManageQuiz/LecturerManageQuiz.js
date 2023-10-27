import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import firebase from "../../../firebase/firebase";
import "../../../firebase/firebaseAuth";
import LecturerSidebar from "../../../components/lecturer/LecturerSidebar";
import LecturerStatCom from "../../../components/lecturer/LecturerStatCom";
import AreYouSureDelete from "../../../components/share/AreYouSureDelete";
import "./LecturerManageQuiz.css";

const LecturerManageQuiz = () => {
  useEffect(() => {
    document.title = "Quiz Management";

    return () => {
      document.title = "Original Tab Title";
    };
  }, []);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [quizData, setQuizData] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const db = firebase.firestore();
        const user = firebase.auth().currentUser;
        if (!user) {
          return;
        }
        const data = await db
          .collection("quizzes")
          .where("uid", "==", user.uid)
          .get();
        setQuizData(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
      } catch (error) {
        console.error("Error fetching data: ", error.message);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const db = firebase.firestore();
        const user = firebase.auth().currentUser;
        if (!user) {
          return;
        }
        const quizzesSnap = await db
          .collection("quizzes")
          .where("uid", "==", user.uid)
          .get();

        const quizzes = await Promise.all(
          quizzesSnap.docs.map(async (quizDoc) => {
            const quizData = quizDoc.data();
            const answersSnap = await db
              .collection("studentAnswers")
              .where("quizId", "==", quizDoc.id)
              .get();
            return {
              ...quizData,
              id: quizDoc.id,
              numberOfParticipants: answersSnap.size,
            };
          })
        );
        setQuizData(quizzes);
      } catch (error) {
        console.error("Error fetching data: ", error.message);
      }
    };

    fetchData();
  }, []);

  const handleQuizClick = (quizId) => {
    setSelectedQuiz(selectedQuiz === quizId ? null : quizId);
  };

  const handleDeleteQuiz = (quizId) => {
    setSelectedQuiz(quizId);
    setShowDeleteModal(true);
  };

  const saveActivityLog = async (message) => {
    try {
      const uid = firebase.auth().currentUser.uid;
      console.log(`Logging activity for user ${uid}: ${message}`);

      const db = firebase.firestore();
      await db.collection("recentActivities").add({
        message,
        uid,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      });
      console.log("Activity log updated.");
    } catch (error) {
      console.error("Error updating activity log: ", error);
    }
  };

  const confirmDeleteQuiz = async () => {
    if (!selectedQuiz) return;

    // Getting the quiz data to log
    const quizToDelete = quizData.find((quiz) => quiz.id === selectedQuiz);
    const subject = quizToDelete.subject;
    const numOfQuestions = quizToDelete.questions.length;
    const quizCode = quizToDelete.quizCode;

    try {
      await firebase
        .firestore()
        .collection("quizzes")
        .doc(selectedQuiz)
        .delete();

      // Logging the delete activity
      const message = `Quiz '${subject}' with ${numOfQuestions} questions (Code: ${quizCode}) was deleted.`;
      await saveActivityLog(message);

      const updatedQuizData = quizData.filter(
        (quiz) => quiz.id !== selectedQuiz
      );
      setQuizData(updatedQuizData);
    } catch (error) {
      console.error("Error deleting quiz: ", error);
      alert("Failed to delete quiz. Please try again.");
    } finally {
      setShowDeleteModal(false);
      setSelectedQuiz(null);
    }
  };

  return (
    <div className="lecturer-manage-quiz">
      <LecturerSidebar />
      <div className="content">
        <h1 className="welcome-title">Lecturer Manage Quiz</h1>
        <LecturerStatCom />
        <div className="header">
          <div className="title-container">
            <h2 className="manage-quizzes-title">Manage Quizzes</h2>
          </div>
          <Link to="/create-quiz">
            <div className="button-container">
              <button className="create-quiz-button">
                + Create
                <span className="line">New Quiz</span>
              </button>
            </div>
          </Link>
        </div>
        <div className="quiz-list">
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Quiz ID</th>
                <th>Subject</th>
                <th>
                  <div className="center-header">
                    Number of
                    <br />
                    Quiz
                  </div>
                </th>
                <th>
                  <div className="center-header">
                    Number of
                    <br />
                    Participants
                  </div>
                </th>
                <th>Date Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {quizData.map((quiz, index) => (
                <tr
                  key={quiz.id}
                  className={`quiz-item ${index % 2 === 0 ? "even" : "odd"} ${
                    selectedQuiz === quiz.id ? "selected" : ""
                  }`}
                  onClick={() => handleQuizClick(quiz.id)}
                >
                  <td>{index + 1}</td>
                  <td>{quiz.quizCode}</td>
                  <td>{quiz.subject}</td>
                  <td>{quiz.questions.length}</td>
                  <td>{quiz.numberOfParticipants}</td>
                  <td>
                    {new Date(
                      quiz.createdAt.seconds * 1000
                    ).toLocaleDateString()}
                  </td>
                  <td>
                    {selectedQuiz === quiz.id && (
                      <div className="action-buttons">
                        <Link to={`/view-score/${quiz.id}`}>
                          <button className="view-button">View</button>
                        </Link>
                        <Link to={`/edit-quiz/${quiz.id}`}>
                          <button className="edit-button">Edit</button>
                        </Link>
                        <button
                          className="delete-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteQuiz(quiz.id);
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <AreYouSureDelete
          show={showDeleteModal}
          onConfirm={confirmDeleteQuiz}
          onCancel={() => setShowDeleteModal(false)}
        />
      </div>
    </div>
  );
};

export default LecturerManageQuiz;
