import React, { useState, useEffect, useRef } from "react";
import "./CompanyOverview.css";
import Header from "../../components/home/Header";
import photo1 from "../../../src/assets/ScreenShot/Company/ManageJob.jpg";
import photo2 from "../../../src/assets/ScreenShot/Company/ApplicantList.jpg";
import photo3 from "../../../src/assets/ScreenShot/Company/CreateJob.jpg";
import photo4 from "../../../src/assets/ScreenShot/Company/PendingList.jpg";
import leftArrow from "../../assets/images/overview/leftArrow.png";
import rightArrow from "../../assets/images/overview/rightArrow.png";
import logo2 from "../../assets/images/login/Login-logo.png";

const photos = [photo1, photo2, photo3, photo4];
const descriptions = [
  <>
    MANAGE YOU JOB LIST
    <br /> EASIER THAN EVER
  </>,
  <>
    HIRE YOUR
    <br /> IDEA CANDIDATE
    <br />
    WITH A SIMPLE CLICK
  </>,
  <>
    CREATE JOBS
    <br /> AND MAKE
    <br />
    OPPOTUNITIES
  </>,
  <>
    TRACK YOUR <br /> APPLICANT
    <br />
    AND NEVER <br />
    MISS A CANDIDATE
  </>,
];

const CompanyOverview = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(false);

  const timerRef = useRef(null); // Reference to the timer

  // Function to start the slideshow timer
  const startSlideshowTimer = () => {
    // Clear any existing timer
    clearTimeout(timerRef.current);

    // Start a new timer to advance to the next slide after 3 seconds
    timerRef.current = setTimeout(() => {
      handleNext();
    }, 3000); // Adjust the timing (3 seconds) as needed
  };

  const handleNext = () => {
    if (currentIndex < photos.length - 1) {
      setFade(true);
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
        setFade(false);
      }, 500);
    } else {
      // Wrap back to the first slide when reaching the end
      setCurrentIndex(0);
    }

    // Start the slideshow timer after advancing to the next slide
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
      // Wrap to the last slide when at the beginning
      setCurrentIndex(photos.length - 1);
    }

    // Start the slideshow timer after going back to the previous slide
    startSlideshowTimer();
  };

  useEffect(() => {
    document.title = "Company Overview";

    // Start the initial slideshow timer when the component mounts
    startSlideshowTimer();

    return () => {
      document.title = "EduBridge";
      // Clear the timer when the component unmounts
      clearTimeout(timerRef.current);
    };
  });

  return (
    <div className="landing-page">
      <div className="header-container">
        <Header />
      </div>
      <div className="main-content">
        <div className="content-container">
          <div className="photo-container">
            <h1 className="image-caption">Company Overview</h1>{" "}
            <div className={`photo-slide ${fade ? "fade-out" : ""}`}>
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
          <div className={`description-container photo-${currentIndex}`}>
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

export default CompanyOverview;
