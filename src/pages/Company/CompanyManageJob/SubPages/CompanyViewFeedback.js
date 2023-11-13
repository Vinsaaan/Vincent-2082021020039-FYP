import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import firebase from "../../../../firebase/firebase";
import Rating from "react-rating-stars-component";
import "./CompanyViewFeedback.css";

const CompanyViewFeedback = () => {
  const { studentId } = useParams();
  const [comments, setComments] = useState([]);
  const [student, setStudent] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const commentsPerPage = 5;

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const studentRef = firebase
          .firestore()
          .collection("users")
          .doc(studentId);
        const studentDoc = await studentRef.get();

        if (studentDoc.exists) {
          setStudent(studentDoc.data());
        } else {
          setError("Student not found");
        }
      } catch (err) {
        console.error("Error fetching student: ", err);
        setError(err);
      }
    };

    const fetchComments = async () => {
      try {
        const commentsRef = firebase
          .firestore()
          .collection("comments")
          .where("studentId", "==", studentId);
        const snapshot = await commentsRef.get();

        if (!snapshot.empty) {
          const fetchedComments = [];
          for (const doc of snapshot.docs) {
            const lecturerId = doc.data().lecturerId;
            const lecturerRef = firebase
              .firestore()
              .collection("users")
              .doc(lecturerId);
            const lecturerDoc = await lecturerRef.get();

            fetchedComments.push({
              id: doc.id,
              ...doc.data(),
              lecturerName: lecturerDoc.exists
                ? `${lecturerDoc.data().firstName} ${
                    lecturerDoc.data().lastName
                  }`
                : "Unknown Lecturer",
            });
          }
          setComments(fetchedComments);
        }
      } catch (err) {
        console.error("Error fetching comments: ", err);
        setError(err);
      }
      setLoading(false);
    };

    fetchStudent();
    fetchComments();
  }, [studentId]);

  const indexOfLastComment = currentPage * commentsPerPage;
  const indexOfFirstComment = indexOfLastComment - commentsPerPage;
  const currentComments = comments.slice(
    indexOfFirstComment,
    indexOfLastComment
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return <div>Loading feedback...</div>;
  }

  if (error) {
    return <div>Error loading feedback: {error.message}</div>;
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return "";

    const date = timestamp.toDate();

    const formattedDate = `${
      date.getMonth() + 1
    }-${date.getDate()}-${date.getFullYear()}`;

    return formattedDate;
  };

  return (
    <div className="company-feedback-container">
      <h1 className="company-feedback-heading">
        {student ? `${student.firstName} ${student.lastName}` : "Student"}{" "}
        Feedback
      </h1>
      {currentComments.length === 0 ? (
        <p className="company-feedback-text">
          No feedback available for this student.
        </p>
      ) : (
        currentComments.map((comment, index) => (
          <div
            key={index}
            className={`company-feedback-card ${
              index % 2 === 0 ? "even" : "odd"
            }`}
          >
            <h2 className="company-feedback-heading">
              Comment from Lecturer ({comment.lecturerName}
              {comment.lecturerLastName}) :
            </h2>
            <p className="company-feedback-date">
              <strong>Updated date: {formatDate(comment.createdAt)}</strong>
            </p>
            <p className="company-feedback-text">{comment.comment}</p>
            {comment.skills && comment.skills.length > 0 && (
              <div className="company-skills-section">
                <strong>Skills:</strong>
                <div className="company-skill-ratings-container">
                  {comment.skills.map((skill, skillIndex) => (
                    <div key={skillIndex} className="company-skill-rating">
                      <span className="company-skill-name">{skill.name}</span>{" "}
                      <Rating
                        count={5}
                        value={skill.rating}
                        size={24}
                        activeColor="#ffd700"
                        edit={false} // makes the rating read-only
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))
      )}

      <div className="pagination">
        <button
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>

        {/* Page number buttons */}
        {Array.from(
          { length: Math.ceil(comments.length / commentsPerPage) },
          (_, i) => (
            <button
              key={i + 1}
              onClick={() => paginate(i + 1)}
              className={currentPage === i + 1 ? "active" : ""}
            >
              {i + 1}
            </button>
          )
        )}

        <button
          onClick={() => paginate(currentPage + 1)}
          disabled={
            currentPage === Math.ceil(comments.length / commentsPerPage)
          }
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default CompanyViewFeedback;
