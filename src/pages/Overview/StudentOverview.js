import React, { useState, useEffect, useRef } from "react";
import "./StudentOverview.css";
import Header from "../../components/home/Header";
import photo1 from "../../../src/assets/ScreenShot/Student/Dashboard.jpg";
import photo2 from "../../../src/assets/ScreenShot/Student/JobList.jpg";
import photo3 from "../../../src/assets/ScreenShot/Student/ApplicationList.jpg";
import photo4 from "../../../src/assets/ScreenShot/Student/QuizRoom.jpg";
import photo5 from "../../../src/assets/ScreenShot/Student/ViewResult.jpg";
import leftArrow from "../../assets/images/overview/leftArrow.png";
import rightArrow from "../../assets/images/overview/rightArrow.png";
import logo2 from "../../assets/images/login/Login-logo.png";

const photos = [photo1, photo2, photo3, photo4, photo5];
const descriptions = [
  <>
    REAL-TIME
    <br /> DASHBOARD <br />
    ACTIVITY
  </>,
  <>
    JOBS
    <br /> OPPOTUNITIES
  </>,
  <>
    JOB APPLICATION
    <br /> TRACKING
  </>,
  <>
    QUIZ ROOM
    <br />
    WITH A FRIENDLY
    <br />
    ENVIRONMENT
  </>,
  <>
    SIMPLIFY STUDENTS
    <br />
    SCORE MANAGEMENT
  </>,
];

const StudentOverview = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const timerRef = useRef(null);

  const startSlideshowTimer = () => {
    clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      if (!isPaused) {
        handleNext();
      }
    }, 3000);
  };

  const handleNext = () => {
    if (currentIndex < photos.length - 1) {
      setFade(true);
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
        setFade(false);
      }, 500);
    } else {
      setCurrentIndex(0);
    }

    startSlideshowTimer();
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setFade(true);
      setTimeout(() => {
        setCurrentIndex((prev) => prev - 1);
        setFade(false);
      }, 500);
    } else {
      setCurrentIndex(photos.length - 1);
    }

    startSlideshowTimer();
  };

  useEffect(() => {
    document.title = "Student Overview";

    startSlideshowTimer();

    return () => {
      document.title = "EduBridge";
      clearTimeout(timerRef.current);
    };
  });

  const handleImageClick = () => {
    setIsPaused(!isPaused);
  };

  return (
    <div className="landing-page">
      <div className="header-container">
        <Header />
      </div>
      <div className="main-content">
        <div className="content-container">
          <div className="photo-container" onClick={handleImageClick}>
            <h1 className="image-caption">Student Overview</h1>{" "}
            <div
              className={`photo-slide ${fade ? "fade-out" : ""}`}
              onClick={handleImageClick}
            >
              <div className="click-zone left" onClick={handlePrevious}></div>
              <img
                src={photos[currentIndex]}
                alt="company overview"
                className="photo"
              />
              <div className="click-zone right" onClick={handleNext}></div>
            </div>
            <div className="arrow left" onClick={handlePrevious}>
              <img src={leftArrow} alt="Left" />
            </div>
            <div className="arrow right" onClick={handleNext}>
              <img src={rightArrow} alt="Right" />
            </div>
          </div>
          <div
            className={`student-description-container photo-${currentIndex}`}
          >
            {descriptions[currentIndex]}
          </div>
          <div className="logo2">
            <img src={logo2} alt="company overview" className="photo" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentOverview;
