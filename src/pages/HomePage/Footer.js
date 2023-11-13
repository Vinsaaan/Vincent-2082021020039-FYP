import React from "react";
import Facebook from "../../assets/images/home/Footer/FB.png";
import Instagram from "../../assets/images/home/Footer/Instagram.png";
import WhatsApp from "../../assets/images/home/Footer/WhatsApp.png";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h5 className="footer-header">About Us</h5>
          <p className="footer-text">
            Developed by Vincent. <br />
            <br />
            EduBridge is a free web app built for a portfolio and final-year
            Computer Science projects, inviting users to explore the
            intersection of technology and education.
          </p>
        </div>
        <div className="footer-section">
          <h5 className="footer-header">Contact Us</h5>
          <p className="footer-text">+60-175673368</p>
          <p className="footer-text">lauvincent99@gmail.com</p>
        </div>
        <div className="footer-section">
          <h5 className="footer-header">Social Media</h5>
          <a
            href="https://www.facebook.com/iiV2C"
            className="social-media-link"
            target="_blank"
            rel="noreferrer"
          >
            <img src={Facebook} alt="Facebook" />
          </a>
          <a
            href="https://www.instagram.com/vinsaaan"
            className="social-media-link"
            target="_blank"
            rel="noreferrer"
          >
            <img src={Instagram} alt="Instagram" />
          </a>
          <a
            href="https://wa.me/60175673368"
            className="social-media-link"
            target="_blank"
            rel="noreferrer"
          >
            <img src={WhatsApp} alt="WhatsApp" />
          </a>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2023 EduBridge. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
