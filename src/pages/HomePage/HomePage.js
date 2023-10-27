import React, { useEffect } from "react";
import Header from "../../components/home/Header";
import RotatingBanner from "../../components/home/RotatingBanner";
import "./HomePage.css";

const HomePage = () => {
  const headingStyle = {
    fontFamily: "Playfair Display, serif",
    fontWeight: 700,
    fontSize: "70px",
    color: "white",
  };

  useEffect(() => {
    document.title = "Welcome to EduBridge";

    return () => {
      document.title = "Original Tab Title";
    };
  }, []);

  return (
    <div className="index-page">
      <Header />
      <div className="App-index">
        <h1 style={headingStyle}>Welcome to EduBridge</h1>
        <RotatingBanner />
      </div>
    </div>
  );
};

export default HomePage;
