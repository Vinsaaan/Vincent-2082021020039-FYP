import { serverTimestamp } from "firebase/firestore";
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./LecturerCommentStudent.css";
import firebase from "../../../../firebase/firebase";
import Rating from "react-rating-stars-component";
import delIcon from "../../../../assets/images/lecturer/commentStudent/delIcon.png";
import addIcon from "../../../../assets/images/lecturer/commentStudent/addIcon.png";

const LecturerCommentStudent = () => {
  const { studentId } = useParams();
  const [comment, setComment] = useState("");
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState("");
  const [lecturerId, setLecturerId] = useState(null);
  const [student, setStudent] = useState(null);
  const [skillErrors, setSkillErrors] = useState({});
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLecturerIdAndComment = async () => {
      const user = firebase.auth().currentUser;
      if (user) {
        const currentLecturerId = user.uid;
        setLecturerId(currentLecturerId);

        if (studentId && currentLecturerId) {
          const commentsRef = firebase
            .firestore()
            .collection("comments")
            .where("studentId", "==", studentId)
            .where("lecturerId", "==", currentLecturerId);

          const commentsSnap = await commentsRef.get();
          if (!commentsSnap.empty) {
            const commentsData = commentsSnap.docs.map((doc) => doc.data());

            setComment(commentsData[0].comment);
            setSkills(commentsData[0].skills || []);
          }
        }

        if (studentId) {
          const studentRef = firebase
            .firestore()
            .collection("users")
            .doc(studentId);
          const studentDoc = await studentRef.get();
          if (studentDoc.exists) {
            setStudent(studentDoc.data());
          }
        }
      }
    };

    fetchLecturerIdAndComment();
  }, [studentId]);

  const handleCommentChange = (e) => {
    setComment(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let hasError = false;
    const newSkillErrors = {};
    skills.forEach((skill, index) => {
      if (skill.rating === 0) {
        newSkillErrors[index] = "Rating cannot be empty";
        hasError = true;
      }
    });

    setSkillErrors(newSkillErrors);

    if (hasError) {
      return;
    }

    try {
      const commentDocId = `${lecturerId}_${studentId}`;

      const commentRef = firebase
        .firestore()
        .collection("comments")
        .doc(commentDocId);

      await commentRef.set(
        {
          lecturerId: lecturerId,
          studentId: studentId,
          comment: comment,
          skills: skills,
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );

      alert("Comment and skills updated successfully!");
      navigate(-1);
    } catch (error) {
      console.error("Error writing comment:", error.message);
      setError("Failed to update comment and skills.");
    }
  };

  const handleSkillChange = (index, newValue) => {
    const updatedSkills = skills.map((skill, idx) => {
      if (idx === index) {
        return { ...skill, rating: newValue };
      }
      return skill;
    });
    setSkills(updatedSkills);

    const newSkillErrors = { ...skillErrors };
    if (newValue > 0) {
      delete newSkillErrors[index];
    } else {
      newSkillErrors[index] = "Rating cannot be empty";
    }
    setSkillErrors(newSkillErrors);
  };

  const addSkill = () => {
    if (!newSkill.trim()) {
      setError("Please insert skill before add a new one.");
      return;
    }
    setError("");
    setSkills([...skills, { name: newSkill.trim(), rating: 0 }]);
    setNewSkill("");
  };

  const removeSkill = (index) => {
    const updatedSkills = [...skills];
    updatedSkills.splice(index, 1);
    setSkills(updatedSkills);

    const newSkillErrors = { ...skillErrors };
    delete newSkillErrors[index];
    setSkillErrors(newSkillErrors);
  };

  const handleNewSkillChange = (e) => {
    setNewSkill(e.target.value);
    if (skillErrors.newSkill) {
      const newSkillErrors = { ...skillErrors };
      delete newSkillErrors.newSkill;
      setSkillErrors(newSkillErrors);
    }
  };

  return (
    <div className="comment-container">
      <h2>
        Comment on{" "}
        {student ? `${student.firstName} ${student.lastName}` : "Student"}
      </h2>
      {lecturerId ? (
        <form onSubmit={handleSubmit}>
          <div className="comment-section">
            <textarea
              className="comment-field"
              value={comment}
              onChange={handleCommentChange}
              placeholder="Write your comment"
            />
          </div>
          <div className="skills-section">
            {skills.map((skill, index) => (
              <div key={index} className="skill-rating">
                <span>{skill.name}: </span>
                <Rating
                  count={5}
                  value={skill.rating}
                  size={24}
                  activeColor="#ffd700"
                  onChange={(newValue) => handleSkillChange(index, newValue)}
                />
                <img
                  src={delIcon}
                  alt="Delete"
                  onClick={() => removeSkill(index)}
                  className="clickable-icon"
                />
                {skillErrors[index] && (
                  <div className="error-message">{skillErrors[index]}</div>
                )}
              </div>
            ))}
            <div className="new-skill-with-message">
              <div className="new-skill">
                <input
                  className="new-skill-field"
                  type="text"
                  value={newSkill}
                  onChange={handleNewSkillChange}
                  placeholder="Add a skill"
                />
                <img
                  src={addIcon}
                  alt="Add"
                  onClick={addSkill}
                  className="clickable-icon"
                />
              </div>
              {error && <div className="error-message">{error}</div>}
            </div>
          </div>
          <div className="submit-section">
            <button type="submit">Save Comment</button>
          </div>
        </form>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default LecturerCommentStudent;
