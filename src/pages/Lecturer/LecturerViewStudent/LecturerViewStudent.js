import React, { useState, useEffect } from "react";
import firebase from "../../../firebase/firebase";
import LecturerSidebar from "../../../components/lecturer/LecturerSidebar";
import LecturerStatCom from "../../../components/lecturer/LecturerStatCom";
import "./LecturerViewStudent.css";

const LecturerViewStudent = () => {
  useEffect(() => {
    document.title = "Student List";

    return () => {
      document.title = "EduBridge";
    };
  }, []);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    document.body.classList.add("lecturer-view-student-background");
    return () => {
      document.body.classList.remove("lecturer-view-student-background");
    };
  }, []);

  useEffect(() => {
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

              const existingStudent = studentsArray.find(
                (s) => s.id === studentId
              );

              if (!existingStudent) {
                studentsArray.push({
                  ...student,
                  id: studentId,
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
  }, []);

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
              Student <br /> Answered
            </div>{" "}
            {/* Modified Column */}
            <div>Email</div>
            <div>Phone</div>
          </div>
          {students.map((student, index) => (
            <>
              <div
                key={student.id}
                className={`student-item ${index % 2 === 0 ? "even" : "odd"}`}
                onClick={() =>
                  setSelectedStudent(
                    student.id === selectedStudent ? null : student.id
                  )
                }
              >
                <div>{index + 1}</div>
                <div>
                  {student.firstName} {student.lastName}
                </div>
                <div>{student.courses.length}</div> {/* Updated Data */}
                <div>{student.email}</div>
                <div>{student.phoneNumber}</div>
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
            </>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LecturerViewStudent;
