import React, { useEffect, useRef } from "react";
import "./Feature.css"; // Make sure your CSS file is updated as well
import educationIcon from "../../assets/images/home/Feature/education.png";
import studentIcon from "../../assets/images/home/Feature/student.png";
import lecturerIcon from "../../assets/images/home/Feature/lecturer.png";
import companyIcon from "../../assets/images/home/Feature/company.png";

const Feature = () => {
  const featureRef = useRef(null);

  useEffect(() => {
    let observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Assuming .feature-item is the direct child of .feature-container
          const featureItems = entry.target.querySelectorAll(".feature-item");
          if (entry.isIntersecting) {
            featureItems.forEach((item, index) => {
              // Adding different animations based on index
              if (index % 2 === 0) {
                item.classList.add("slide-in-left");
              } else {
                item.classList.add("slide-in-right");
              }
            });
          } else {
            // This will ensure that the animation re-triggers every time
            featureItems.forEach((item) => {
              item.classList.remove("slide-in-left", "slide-in-right");
            });
          }
        });
      },
      {
        rootMargin: "0px",
        threshold: 0.1,
      }
    );

    if (featureRef.current) {
      observer.observe(featureRef.current);
    }

    return () => {
      if (featureRef) {
        observer.disconnect();
      }
    };
  }, []);

  return (
    <div className="feature-container" ref={featureRef}>
      <div className="feature-item">
        <img src={educationIcon} alt="Education" className="feature-icon" />
        <div className="feature-text">
          <div className="feature-title">
            <strong>Connecting you to a world of opportunities</strong>
          </div>
          <div className="feature-description">
            Whether you're studying, teaching, or hiring, find your perfect
            match here and step into the future with confidence.
          </div>
        </div>
      </div>

      <div className="feature-item">
        <img src={studentIcon} alt="Student" className="feature-icon" />
        <div className="feature-text">
          <div className="feature-title">
            <strong>
              Ignite your learning journey and career aspirations in one go
            </strong>
          </div>
          <div className="feature-description">
            Connect with educators, access a vast repository of academic
            content, and discover internships and job opportunities designed to
            put your education into action. Start building your future with us
            today!
          </div>
        </div>
      </div>

      <div className="feature-item">
        <img src={companyIcon} alt="Company" className="feature-icon" />
        <div className="feature-text">
          <div className="feature-title">
            <strong>Find the leaders of tomorrow, today</strong>
          </div>
          <div className="feature-description">
            EduBridge connects you with a vibrant talent pool of students and
            graduates eager to bring fresh ideas to the table. Post job
            openings, offer internships, and scout for potential in a place
            where academia meets industry.
          </div>
        </div>
      </div>

      <div className="feature-item">
        <img src={lecturerIcon} alt="Lecturer" className="feature-icon" />
        <div className="feature-text">
          <div className="feature-title">
            <strong>Enhance Learning and Support Careers</strong>
          </div>
          <div className="feature-description">
            Join a passionate educator community to share knowledge, create
            courses, and guide future leaders. Collaborate, innovate, and
            inspire on a platform that values your expertise.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feature;
