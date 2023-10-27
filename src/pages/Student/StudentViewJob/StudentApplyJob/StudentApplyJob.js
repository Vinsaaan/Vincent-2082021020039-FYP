import React, { useState, useEffect } from "react";
import firebase from "../../../../firebase/firebase";
import "./StudentApplyJob.css";
import SpecializationDropdown from "../../../../components/share/specializationOptions";
import StudentHeader from "../../../../components/student/StudentHeader";
import { Link } from "react-router-dom";

const StudentApplyJob = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedSpecialization, setSelectedSpecialization] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [companyProfilePics, setCompanyProfilePics] = useState({});

  const getCompanyProfilePic = async (uid) => {
    const db = firebase.firestore();
    const userDoc = await db.collection("users").doc(uid).get();

    if (userDoc.exists) {
      const userData = userDoc.data();
      return userData.profilePicture;
    }

    return null;
  };
  useEffect(() => {
    document.title = "Jobs Listing";

    return () => {
      document.title = "Original Tab Title";
    };
  }, []);

  useEffect(() => {
    const fetchJobs = async () => {
      const db = firebase.firestore();
      let jobCollection = db.collection("jobs");

      const snapshot = await jobCollection.orderBy("createdAt", "desc").get(); // Sort by createdAt in descending order
      let newJobs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const pics = {};
      await Promise.all(
        newJobs.map(async (job) => {
          pics[job.uid] = await getCompanyProfilePic(job.uid);
        })
      );
      setCompanyProfilePics(pics);

      if (searchTerm) {
        newJobs = newJobs.filter(
          (job) =>
            job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.skills
              .join(", ")
              .toLowerCase()
              .includes(searchTerm.toLowerCase())
        );
      }

      if (location) {
        newJobs = newJobs.filter(
          (job) =>
            job.country.toLowerCase().includes(location.toLowerCase()) ||
            job.state.toLowerCase().includes(location.toLowerCase()) ||
            job.city.toLowerCase().includes(location.toLowerCase())
        );
      }

      if (
        selectedSpecialization &&
        selectedSpecialization !== "Select an option"
      ) {
        newJobs = newJobs.filter(
          (job) => job.specialization === selectedSpecialization
        );
      }

      setJobs(newJobs);
      setSelectedJob(null);
    };

    fetchJobs();
  }, [selectedSpecialization, searchTerm, location]);

  return (
    <>
      <StudentHeader />

      <div id="apply-job-content">
        <div className="specialization-center">
          <input
            type="text"
            placeholder="Search jobs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="job-search-input"
          />

          <input
            type="text"
            placeholder="Search by location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="job-search-input"
          />

          <div className="special-dropdown">
            <SpecializationDropdown
              selectedSpecialization={selectedSpecialization}
              onSelectSpecialization={setSelectedSpecialization}
            />
          </div>
        </div>

        <div className="apply-job-box">
          <div className="left-panel">
            {jobs.map((job) => (
              <div
                key={job.id}
                className={`job-item ${
                  selectedJob?.id === job.id ? "active" : ""
                }`}
                onClick={() => setSelectedJob(job)}
              >
                <div className="user-info">
                  <img
                    src={companyProfilePics[job.uid] || "defaultImageUrl"}
                    alt={job.userName}
                    width={50}
                    className="circle-logo"
                  />
                  <p>
                    <strong>{job.userName}</strong>
                  </p>
                </div>
                <div className="job-details">
                  <p className="job-title">
                    <strong>{job.title}</strong>
                  </p>
                  <p className="job-location">
                    {job.country}, {job.state}, {job.city}
                  </p>
                  <p className="job-type">{job.type}</p>
                  <p className="job-salary">{job.salary}</p>
                </div>
              </div>
            ))}
          </div>

          {selectedJob && (
            <div className="right-side">
              <div className="job-header">
                <div className="header-content">
                  <div className="job-info">
                    <img
                      src={
                        companyProfilePics[selectedJob.uid] || "defaultImageUrl"
                      }
                      alt={selectedJob.userName}
                      className="circle-logo"
                    />
                    <div className="user-info">
                      <strong>
                        <p>{selectedJob.userName}</p>
                      </strong>
                    </div>
                  </div>
                  <div className="job-details">
                    {selectedJob.title && (
                      <p className="job-title">
                        <strong>{selectedJob.title}</strong>
                      </p>
                    )}
                    {selectedJob.type && <p>{selectedJob.type}</p>}
                  </div>
                </div>
                <button className="apply-job-button">
                  <Link to={`/apply-form/${selectedJob.id}`}>Apply Job</Link>
                </button>
              </div>

              <div
                className="scrollable-description"
                dangerouslySetInnerHTML={{ __html: selectedJob.description }}
              />
              <div className="skills">
                Skills: {selectedJob.skills.join(", ")}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default StudentApplyJob;
