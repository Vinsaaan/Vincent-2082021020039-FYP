import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import firebase from "../../../../firebase/firebase";

import "./EditQuiz.css";

const EditQuiz = () => {
  useEffect(() => {
    document.title = "Edit Quiz";

    return () => {
      document.title = "EduBridge";
    };
  }, []);
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [duration, setDuration] = useState("30");
  const [subject, setSubject] = useState("");

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const db = firebase.firestore();
        const doc = await db.collection("quizzes").doc(quizId).get();
        if (doc.exists) {
          const data = doc.data();
          setQuestions(data.questions);
          setDuration(data.duration);
          setSubject(data.subject);
        } else {
          console.error("No such document!");
        }
      } catch (error) {
        console.error("Error getting document:", error);
      }
    };
    fetchQuiz();
  }, [quizId]);

  const addQuestion = () => {
    if (
      questions[questions.length - 1].question &&
      !questions[questions.length - 1].options.includes("")
    ) {
      setQuestions([
        ...questions,
        { question: "", options: ["", "", "", ""], correctOption: "" },
      ]);
    } else {
      alert("Please fill out the current question and all options first.");
    }
  };

  const deleteQuestion = (index) => {
    if (questions.length > 1) {
      const updatedQuestion = [...questions];
      updatedQuestion.splice(index, 1);
      setQuestions(updatedQuestion);
    } else {
      alert("You cannot delete the last question.");
    }
  };

  const updateQuestion = (index, value) => {
    const newQuestions = [...questions];
    newQuestions[index].question = value;
    setQuestions(newQuestions);
  };

  const updateOption = (qIndex, oIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[oIndex] = value;
    setQuestions(newQuestions);
  };

  const selectCorrectAnswer = (qIndex, oIndex) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].correctOption = oIndex;
    setQuestions(newQuestions);
  };

  const isQuizComplete = () => {
    for (let q of questions) {
      if (
        !q.question.trim() ||
        q.options.some((option) => !option.trim()) ||
        q.correctOption === ""
      ) {
        return false;
      }
    }
    return true;
  };

  const saveActivityLog = async (message) => {
    try {
      const uid = firebase.auth().currentUser.uid;
      if (!uid) {
        console.error("No UID found. User might not be authenticated.");
        return;
      }
      const db = firebase.firestore();
      const res = await db.collection("recentActivities").add({
        message,
        uid,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      });
      console.log("Activity log updated. Document ID:", res.id);
    } catch (error) {
      console.error("Error updating activity log: ", error);
    }
  };

  const saveUpdatedQuiz = async () => {
    if (isQuizComplete()) {
      const updatedQuiz = {
        subject,
        duration,
        questions,
      };

      try {
        const db = firebase.firestore();
        await db.collection("quizzes").doc(quizId).update(updatedQuiz);
        console.log("Quiz updated in the database.");

        const numOfQuestions = questions.length;
        const quizCode = quizId;
        const message = `Quiz '${subject}' edited with ${numOfQuestions} questions. Code: ${quizCode}.`;
        await saveActivityLog(message);

        alert("Quiz updated successfully!");
        navigate("/manage-quiz");
      } catch (error) {
        console.error("Error updating quiz: ", error);
        alert("Failed to update the quiz. Please try again.");
      }
    } else {
      alert("Please complete all fields before saving.");
    }
  };

  return (
    <div className="create-quiz">
      <div className="settings">
        <div className="subject-field">
          <label>Subject: </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
        </div>
        <div className="duration-field">
          <label>Quiz Duration (minutes): </label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            min="1"
            required
          />
        </div>
      </div>

      {questions.map((q, qIndex) => (
        <div key={qIndex} className="question">
          <button
            className="delete-question"
            onClick={() => deleteQuestion(qIndex)}
          >
            Delete
          </button>
          <div className="question-number">
            <strong>
              {qIndex + 1}/{questions.length}
            </strong>
          </div>
          <input
            type="text"
            placeholder="Question"
            value={q.question}
            onChange={(e) => updateQuestion(qIndex, e.target.value)}
            className="question-input"
          />
          <div className="options">
            <div className="option-row">
              {[0, 1].map((oIndex) => (
                <div key={oIndex} className="option">
                  <label className="option-label">
                    {["A", "B", "C", "D"][oIndex]}
                  </label>
                  <input
                    type="radio"
                    name={`correct-answer-${qIndex}`}
                    checked={q.correctOption === oIndex}
                    onChange={() => selectCorrectAnswer(qIndex, oIndex)}
                  />
                  <input
                    type="text"
                    placeholder={`Option ${oIndex + 1}`}
                    value={q.options[oIndex]}
                    onChange={(e) =>
                      updateOption(qIndex, oIndex, e.target.value)
                    }
                    className="option-input"
                  />
                </div>
              ))}
            </div>
            <div className="option-row">
              {[2, 3].map((oIndex) => (
                <div key={oIndex} className="option">
                  <label className="option-label">
                    {["A", "B", "C", "D"][oIndex]}
                  </label>
                  <input
                    type="radio"
                    name={`correct-answer-${qIndex}`}
                    checked={q.correctOption === oIndex}
                    onChange={() => selectCorrectAnswer(qIndex, oIndex)}
                  />
                  <input
                    type="text"
                    placeholder={`Option ${oIndex + 1}`}
                    value={q.options[oIndex]}
                    onChange={(e) =>
                      updateOption(qIndex, oIndex, e.target.value)
                    }
                    className="option-input"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}

      <div className="bottom-buttons">
        <button className="new-question-button" onClick={addQuestion}>
          Add Question
        </button>
        <button className="save-button" onClick={saveUpdatedQuiz}>
          Save
        </button>
      </div>
    </div>
  );
};

export default EditQuiz;
