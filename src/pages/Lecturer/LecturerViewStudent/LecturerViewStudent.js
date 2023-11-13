import React, { useState, useEffect } from "react";
import firebase from "../../../firebase/firebase";
import LecturerSidebar from "../../../components/lecturer/LecturerSidebar";
import LecturerStatCom from "../../../components/lecturer/LecturerStatCom";
import "./LecturerViewStudent.css";
import { useNavigate } from "react-router-dom";

const LecturerViewStudent = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    document.title = "Student List";
    document.body.classList.add("lecturer-view-student-background");

    const fetchStudents = async () => {
      try {
        const db = firebase.firestore();
        const user = firebase.auth().currentUser;

        if (user) {
          const quizData = await db
            .collection("quizzes")
            .where("uid", "==", user.uid)
            .get();

          const studentsArray = [];

          for (let quiz of quizData.docs) {
            const quizId = quiz.id;
            const quizCode = quiz.data().quizCode;
            const answersData = await db
              .collection("studentAnswers")
              .where("quizId", "==", quizId)
              .get();

            for (let doc of answersData.docs) {
              const studentId = doc.data().userId;
              const studentData = await db
                .collection("users")
                .doc(studentId)
                .get();
              const student = studentData.data();

              const totalQuestions = quiz.data().questions.length;
              const commentRef = db
                .collection("comments")
                .doc(`${user.uid}_${studentId}`);
              const commentSnap = await commentRef.get();
              const hasComment = commentSnap.exists;

              const existingStudent = studentsArray.find(
                (s) => s.id === studentId
              );

              if (!existingStudent) {
                studentsArray.push({
                  ...student,
                  id: studentId,
                  hasComment: hasComment,
                  courses: [
                    {
                      quizCode,
                      name: quiz.data().subject,
                      score: `${doc.data().score}/${totalQuestions}`,
                    },
                  ],
                });
              } else {
                existingStudent.courses.push({
                  quizCode,
                  name: quiz.data().subject,
                  score: `${doc.data().score}/${totalQuestions}`,
                });
                existingStudent.hasComment = hasComment;
              }
            }
          }

          setStudents(studentsArray);
        }
      } catch (error) {
        console.error("Error fetching students: ", error.message);
      }
    };

    fetchStudents();

    return () => {
      document.title = "EduBridge";
      document.body.classList.remove("lecturer-view-student-background");
    };
  }, []);

  const handleRowClick = (studentId) => {
    setSelectedStudent((prevSelected) =>
      prevSelected === studentId ? null : studentId
    );
  };

  const handleAddOrUpdateComment = (studentId, hasComment) => {
    navigate(`/comment-student/${studentId}`);
  };

  return (
    <div className="lecturer-view-student">
      <LecturerSidebar />

      <div className="content">
        <h1 className="welcome-title">Students List</h1>
        <LecturerStatCom />
        <div className="students-list">
          <div className="table-header">
            <div>No.</div>
            <div>Name</div>
            <div>
              Student
              <br />
              Answered
            </div>
            <div>Email</div>
            <div>Phone</div>
            <div>Action</div>
          </div>
          {students.map((student, index) => (
            <React.Fragment key={student.id}>
              <div
                className={`student-item ${index % 2 === 0 ? "even" : "odd"}`}
                onClick={() => handleRowClick(student.id)}
              >
                <div>{index + 1}</div>
                <div>
                  {student.firstName} {student.lastName}
                </div>
                <div>{student.courses.length}</div>
                <div>{student.email}</div>
                <div>{student.phoneNumber}</div>
                <div>
                  {selectedStudent === student.id && (
                    <button
                      className={
                        student.hasComment ? "update-comment" : "write-comment"
                      }
                      onClick={() =>
                        handleAddOrUpdateComment(student.id, student.hasComment)
                      }
                    >
                      {student.hasComment ? "Update Comment" : "Write Comment"}
                    </button>
                  )}
                </div>
              </div>

              {selectedStudent === student.id && student.courses && (
                <div className="grades">
                  {student.courses.map((course, index) => (
                    <div key={index}>
                      [{course.quizCode}] {course.name}: {course.score}
                    </div>
                  ))}
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LecturerViewStudent;
