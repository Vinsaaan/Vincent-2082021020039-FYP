import React, { useState, useEffect } from "react";
import StudentHome from "../../assets/images/home/Student_icon.png";
import LecturerHome from "../../assets/images/home/Lecturer_icon.png";
import CompanyHome from "../../assets/images/home/Company_icon.png";

const banners = [
  {
    text: "Step into a World Where Learning and Opportunity Meet.",
    img: StudentHome,
    alt: "Student Icon",
  },
  {
    text: "Where Passion Meets Profession. Teach, Inspire, Repeat.",
    img: LecturerHome,
    alt: "Lecturer Icon",
  },
  {
    text: "Bridging the Gap Between Learning and Earning.",
    img: CompanyHome,
    alt: "Company Icon",
  },
];

function RotatingBanner() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 4500); // changing every 4.5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="banner">
      <img
        src={banners[index].img}
        alt={banners[index].alt}
        className="icon icon-fade"
      />
      <p className="text-fade">{banners[index].text}</p>
    </div>
  );
}

export default RotatingBanner;
