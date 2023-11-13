import React, { useEffect, useState } from "react";
import Header from "../../components/home/Header";
import RotatingBanner from "../../components/home/RotatingBanner";
import Feature from "./Feature";
import EarlyAccessSignup from "./EarlyAccessSignup";
import Footer from "./Footer";
import { isMobile } from "react-device-detect"; // Import the isMobile function from react-device-detect

import "./HomePage.css";

const HomePage = () => {
  const headingStyle = {
    fontFamily: "Playfair Display, serif",
    fontWeight: 700,
    fontSize: "85px",
    color: "white",
  };

  const [isFeatureVisible, setIsFeatureVisible] = useState(false);

  useEffect(() => {
    document.title = "Welcome to EduBridge";

    document.body.classList.add("homepage-locked");

    const handleScroll = () => {
      const featureSection = document.querySelector(".HomePage-index");
      if (featureSection) {
        const featureRect = featureSection.getBoundingClientRect();
        setIsFeatureVisible(featureRect.top <= window.innerHeight);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      document.title = "Original Tab Title";
      document.body.classList.remove("homepage-locked");
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Check if it's a mobile device and display the message
  if (isMobile) {
    return (
      <div className="index-page">
        <Header />
        <div className={`HomePage-index animate-feature`}>
          <h1 style={headingStyle}>Mobile Layout is not available</h1>
          <p>
            We apologize, but the mobile version of this app is currently under
            development.
          </p>
          <Footer />
        </div>
      </div>
    );
  }

  // If it's not a mobile device, render the normal content
  return (
    <div className="index-page">
      <Header />
      <div
        className={`HomePage-index ${
          isFeatureVisible ? "animate-feature" : ""
        }`}
      >
        <h1 style={headingStyle}>Welcome to EduBridge</h1>
        <RotatingBanner />
        <Feature isFeatureVisible={isFeatureVisible} />
        <EarlyAccessSignup />
        <Footer />
      </div>
    </div>
  );
};

export default HomePage;
