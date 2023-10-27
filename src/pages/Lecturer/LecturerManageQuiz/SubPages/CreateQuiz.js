import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import firebase from "../../../../firebase/firebase";
import "./CreateQuiz.css";

const CreateQuiz = () => {
  useEffect(() => {
    document.title = "Create Quiz";

    return () => {
      document.title = "EduBridge";
    };
  }, []);
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([
    { question: "", options: ["", "", "", ""], correctOption: "" },
  ]);
  const [duration, setDuration] = useState("");
  const [subject, setSubject] = useState("");

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
      setQuestions([
        { question: "", options: ["", "", "", ""], correctOption: "" },
      ]);
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

  const saveQuizToFirebase = async (quiz) => {
    try {
      const db = firebase.firestore();
      await db.collection("quizzes").add(quiz);
      alert("Quiz successfully created!");
      navigate("/manage-quiz");
    } catch (error) {
      console.error("Error adding quiz: ", error);
      alert("Failed to create quiz. Please try again.");
    }
  };

  const generateUniqueCode = () => {
    const length = 6;
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters.charAt(randomIndex);
    }
    return result;
  };

  const logRecentActivity = async (subject, numOfQuestions, quizCode) => {
    try {
      const db = firebase.firestore();
      const uid = firebase.auth().currentUser.uid;
      const message = `Quiz '${subject}' created with ${numOfQuestions} questions. Code: ${quizCode}.`;
      await db.collection("recentActivities").add({
        message,
        uid,
        createdAt: new Date(),
      });

      console.log("Recent activity logged successfully:", message);
    } catch (error) {
      console.error("Error logging recent activity:", error);
    }
  };

  const saveQuiz = async () => {
    if (!duration || !subject) {
      alert("Please fill in the subject and duration.");
      return;
    }

    if (isQuizComplete()) {
      console.log("Quiz is complete, generating unique code");

      let quizCode = generateUniqueCode();
      console.log("Initial code:", quizCode);

      const isUnique = await checkCodeUniqueness(quizCode);
      if (!isUnique) {
        console.log("Code is not unique, generating a new one");
        while (!(await checkCodeUniqueness(quizCode))) {
          quizCode = generateUniqueCode();
          console.log("New code:", quizCode);
        }
      }

      const uid = firebase.auth().currentUser.uid;

      // Fetching the lecturer’s first name and last name
      const lecturerData = await firebase
        .firestore()
        .collection("users")
        .doc(uid)
        .get();
      const { firstName, lastName } = lecturerData.data() || {};

      const quiz = {
        uid,
        quizCode,
        subject,
        duration,
        questions,
        createdAt: new Date(),
        lecturerFirstName: firstName,
        lecturerLastName: lastName,
      };

      console.log("Saving quiz to Firebase", quiz);

      await saveQuizToFirebase(quiz);
      console.log("Quiz saved successfully");

      // Log the activity
      await logRecentActivity(subject, questions.length, quizCode);
    } else {
      console.log("Quiz is not complete");
      alert(
        "Please complete all questions, options, and select the correct answers before saving."
      );
    }
  };

  const checkCodeUniqueness = async (code) => {
    try {
      const uid = firebase.auth().currentUser.uid;
      const db = firebase.firestore();
      const doc = await db
        .collection("quizzes")
        .where("quizCode", "==", code)
        .where("uid", "==", uid)
        .get();

      return doc.empty;
    } catch (error) {
      console.error("Error checking code uniqueness: ", error);
      return false;
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
          />
        </div>
        <div className="duration-field">
          {" "}
          <label>Quiz Duration (minutes): </label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            min="1"
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
            {[0, 2].map((oIndex) => (
              <div className="option-pair" key={oIndex}>
                {[oIndex, oIndex + 1].map((i) => (
                  <div key={i} className="option">
                    <label className="option-label">
                      {["A", "B", "C", "D"][i]}
                    </label>
                    <input
                      type="radio"
                      name={`correct-answer-${qIndex}`}
                      checked={q.correctOption === i}
                      onChange={() => selectCorrectAnswer(qIndex, i)}
                    />
                    <input
                      type="text"
                      placeholder={`Option ${i + 1}`}
                      value={q.options[i]}
                      onChange={(e) => updateOption(qIndex, i, e.target.value)}
                      className="option-input"
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="bottom-buttons">
        <button className="new-question-button" onClick={addQuestion}>
          Add Question
        </button>
        <button
          className="go-back-button"
          onClick={() => {
            if (
              window.confirm(
                "Do you want to go back? Your progress will be unsaved."
              )
            ) {
              navigate(-1);
            }
          }}
        >
          Go Back
        </button>
        <button className="save-button" onClick={saveQuiz}>
          Save
        </button>
      </div>
    </div>
  );
};

export default CreateQuiz;
