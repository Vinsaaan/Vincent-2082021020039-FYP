import React, { useEffect, useState } from "react";
import "./ApplicantDetail.css";
import { useParams } from "react-router-dom";
import firebase from "../../../../firebase/firebase";
import ApplicationDecision from "../../../../components/company/ApplicationDecision";

const ApplicantDetail = () => {
  useEffect(() => {
    document.title = "Applicant Detail";

    return () => {
      document.title = "EduBridge";
    };
  }, []);
  const { applicationId } = useParams();
  const [applicantData, setApplicantData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [decisionType, setDecisionType] = useState(null);

  const handleViewFeedback = () => {
    const studentId = applicantData?.studentId;
    if (studentId) {
      const feedbackUrl = `/view-feedback/${applicationId}/${studentId}`;
      window.open(window.location.origin + feedbackUrl, "_blank");
    } else {
      console.error("No student ID found for this application");
    }
  };

  useEffect(() => {
    const fetchApplicantData = async () => {
      try {
        const applicantRef = firebase
          .firestore()
          .collection("studentApplications")
          .doc(applicationId);

        const applicantDoc = await applicantRef.get();

        if (applicantDoc.exists) {
          const data = applicantDoc.data();
          setApplicantData(data);
          setLoading(false);
        } else {
          setError(new Error("Applicant not found"));
          setLoading(false);
        }
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };

    fetchApplicantData();
  }, [applicationId]);

  if (loading) {
    return <p>Loading applicant details...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  const handleProceed = () => {
    setDecisionType("approve");
    setShowDecisionModal(true);
  };

  const handleDecline = () => {
    setDecisionType("decline");
    setShowDecisionModal(true);
  };

  return (
    <div className="applicant-details-container">
      <div className="applicant-details">
        <h2>Applicant Details</h2>

        <div className="applicant-button-group">
          <button
            className="applicant-view-resume-button"
            onClick={() => window.open(applicantData.resumeURL, "_blank")}
          >
            View Resume
          </button>

          <button
            className="applicant-view-feedback-button"
            onClick={handleViewFeedback}
          >
            View Feedback
          </button>
        </div>

        <div className="applicant-input-flex">
          <div className="applicant-detail-first-name">
            <label htmlFor="firstname" className="form-label">
              First Name
            </label>
            <input
              type="text"
              name="firstname"
              id="firstname"
              className="form-input"
              value={applicantData.firstname}
              readOnly
            />
          </div>

          <div className="applicant-detail-last-name">
            <label htmlFor="lastname" className="form-label">
              Last Name
            </label>
            <input
              type="text"
              name="lastname"
              id="lastname"
              className="form-input"
              value={applicantData.lastname}
              readOnly
            />
          </div>
        </div>

        <div className="applicant-input-flex">
          <div className="applicant-detail-email">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              className="form-input"
              value={applicantData.email}
              readOnly
            />
          </div>

          <div className="applicant-detail-gender">
            <label className="form-label">Gender</label>
            <input
              type="text"
              name="gender"
              id="gender"
              className="form-input"
              value={applicantData.gender}
              readOnly
            />
          </div>
        </div>

        <div className="applicant-detail-phone">
          <label htmlFor="phone" className="form-label">
            Phone
          </label>
          <div className="applicant-detail-phone-inputs">
            <input
              type="text"
              name="areacode"
              id="applicant-areacode"
              className="form-input w-45"
              value={applicantData.areacode}
              readOnly
            />
            <input
              type="text"
              name="phone"
              id="applicant-phone"
              className="form-input"
              value={applicantData.phone}
              readOnly
            />
          </div>
        </div>

        <div className="applicant-detail-start-date">
          <label htmlFor="start-date" className="form-label">
            Start Date
          </label>
          <input
            type="text"
            name="startDate"
            id="start-date"
            className="form-input"
            value={applicantData.startDate}
            readOnly
          />
        </div>

        <div className="applicant-detail-country">
          <label htmlFor="country" className="form-label">
            Country
          </label>
          <input
            type="text"
            name="country"
            id="country"
            className="form-input"
            value={applicantData.country}
            readOnly
          />
        </div>

        <div className="applicant-detail-state">
          <label htmlFor="state" className="form-label">
            State
          </label>
          <input
            type="text"
            name="state"
            id="state"
            className="form-input"
            value={applicantData.state}
            readOnly
          />
        </div>

        <div className="applicant-detail-city">
          <label htmlFor="city" className="form-label">
            City
          </label>
          <input
            type="text"
            name="city"
            id="city"
            className="form-input"
            value={applicantData.city}
            readOnly
          />
        </div>

        <div className="applicant-detail-address">
          <label htmlFor="address" className="form-label">
            Address
          </label>
          <input
            type="text"
            name="address"
            id="address"
            className="form-input mb-3"
            value={applicantData.address}
            readOnly
          />
        </div>

        <div className="applicant-detail-cover-letter">
          <label htmlFor="cover-letter" className="form-label">
            Cover Letter
          </label>
          <textarea
            rows="6"
            name="coverLetter"
            id="cover-letter"
            className="form-input"
            value={applicantData.coverLetter}
            readOnly
          ></textarea>
        </div>

        <div className="applicant-job-button-container">
          <button className="applicant-proceed-button" onClick={handleProceed}>
            Proceed
          </button>
          <button className="applicant-decline-button" onClick={handleDecline}>
            Reject
          </button>
          <ApplicationDecision
            show={showDecisionModal}
            decision={decisionType}
            firstname={applicantData ? applicantData.firstname : null}
            lastname={applicantData ? applicantData.lastname : null}
            specialization={applicantData ? applicantData.specialization : null}
            applicationId={applicationId}
            jobId={applicantData ? applicantData.jobId : null}
            title={applicantData ? applicantData.title : null}
            type={applicantData ? applicantData.type : null}
            state={applicantData ? applicantData.state : null}
            city={applicantData ? applicantData.city : null}
            onConfirm={() => {
              setShowDecisionModal(false);
            }}
            onCancel={() => setShowDecisionModal(false)}
          />
        </div>
      </div>
    </div>
  );
};

export default ApplicantDetail;
