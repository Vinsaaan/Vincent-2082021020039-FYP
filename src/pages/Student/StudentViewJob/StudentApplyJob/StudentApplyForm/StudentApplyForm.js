import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import countryData from "../../../../../components/share/CountryCodes.json";
import firebase from "../../../../../firebase/firebase";
import "./StudentApplyForm.css";
import AreYouSureApply from "../../../../../components/student/AreYouSureApply";

function StudentApplyForm() {
  useEffect(() => {
    document.title = "Job Application";

    return () => {
      document.title = "Original Tab Title";
    };
  }, []);

  const navigate = useNavigate();
  const [authToken, setAuthToken] = useState("");
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const { jobId } = useParams();
  const [, setDataLoaded] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [formFields, setFormFields] = useState({
    firstname: "",
    lastname: "",
    email: "",
    gender: "",
    areacode: "",
    phone: "",
    "start-date": "",
    country: "",
    state: "",
    city: "",
    address: "",
    "cover-letter": "",
    resume: null,
  });

  const [formErrors, setFormErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormFields((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (name === "upload" && files.length > 0) {
      const file = files[0];
      if (file.size > 10 * 1024 * 1024) {
        // 10MB
        setFormErrors((prevErrors) => ({
          ...prevErrors,
          resume: "File size exceeds 10MB.",
        }));
        return;
      }

      if (file.type !== "application/pdf") {
        setFormErrors((prevErrors) => ({
          ...prevErrors,
          resume: "Only PDF files are allowed.",
        }));
        return;
      }

      setFormFields((prevState) => ({ ...prevState, resume: file }));
    }
  };

  const validateForm = () => {
    let errors = {};
    const requiredFields = [
      "firstname",
      "lastname",
      "email",
      "phone",
      "state",
      "address",
    ];
    for (let key of requiredFields) {
      if (!formFields[key]) {
        errors[key] = `${
          key.charAt(0).toUpperCase() + key.slice(1)
        } is required.`;
      }
    }

    if (!formFields.resume) {
      errors.resume = "Resume is required.";
    }

    setFormErrors(errors);

    return errors;
  };

  const submitApplication = async () => {
    console.log("Attempting to submit application...");

    const applicationsRef = firebase
      .firestore()
      .collection("studentApplications");

    const newApplication = {
      jobId: jobId,
      firstname: formFields.firstname,
      lastname: formFields.lastname,
      email: formFields.email,
      gender: formFields.gender,
      areacode: formFields.areacode,
      phone: formFields.phone,
      startDate: formFields.startDate,
      country: formFields.country,
      state: formFields.state,
      city: formFields.city,
      address: formFields.address,
      coverLetter: formFields.coverLetter,
      studentId: null, // Initialize it as null for now
    };

    // Fetch the current user's UID
    const studentId = firebase.auth().currentUser
      ? firebase.auth().currentUser.uid
      : null;

    if (studentId) {
      // Add user UID to the application data
      newApplication.studentId = studentId;
    }

    const docRef = await applicationsRef.add(newApplication);

    const resumeRef = firebase
      .storage()
      .ref()
      .child(`resumes/${docRef.id}-${formFields.resume.name}`);
    await resumeRef.put(formFields.resume);

    const resumeDownloadURL = await resumeRef.getDownloadURL();

    await docRef.update({
      resumeURL: resumeDownloadURL,
      applicationId: docRef.id, // storing the applicationId (which is the Firestore doc ID) in the document
    });

    return docRef.id; // returning the application ID
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let errors = validateForm();

    if (Object.keys(errors).length === 0) {
      setShowConfirmModal(true);
    }
  };

  const handleConfirmApply = async () => {
    try {
      const applicationId = await submitApplication();

      console.log(`Form submitted successfully with ID: ${applicationId}`);
      recordActivity(`Applied job at ${jobId}.`);
      setShowConfirmModal(false);

      navigate(-1);
    } catch (error) {
      console.error("Error submitting the form:", error);
    }
  };

  useEffect(() => {
    fetch("https://www.universal-tutorial.com/api/getaccesstoken", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "api-token":
          "xTBfQqlQd_ZjrNwH1bbOm5rxqWCWUbETMSU1LOVP9R6Tb_Do-sDYnLwDO73y8hv1q78",
        "user-email": "lauvincent99@gmail.com",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setAuthToken(data.auth_token);
      });
  }, []);

  useEffect(() => {
    if (authToken) {
      fetch("https://www.universal-tutorial.com/api/countries/", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
          Accept: "application/json",
        },
      })
        .then((res) => res.json())
        .then((data) => {
          setCountries(data);
        });
    }
  }, [authToken]);

  const handleCountryChange = (country) => {
    fetch(`https://www.universal-tutorial.com/api/states/${country}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
        Accept: "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setStates(data);
        setFormFields((prevState) => ({
          ...prevState,
          country: country,
          state: "",
          city: "",
        }));
        setDataLoaded(true);
      });
  };

  const handleStateChange = (state) => {
    fetch(`https://www.universal-tutorial.com/api/cities/${state}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
        Accept: "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setCities(data);
        setFormFields((prevState) => ({
          ...prevState,
          state: state,
          city: "",
        }));
        setDataLoaded(true);
      });
  };

  useEffect(() => {
    if (jobId) {
      console.log(`Applying for job with ID: ${jobId}`);
    }
  }, [jobId]);

  const recordActivity = async (message) => {
    const userId = firebase.auth().currentUser
      ? firebase.auth().currentUser.uid
      : null;
    if (userId) {
      const db = firebase.firestore();
      await db.collection("recentActivities").add({
        userId,
        message,
        createdAt: new Date(),
      });
    }
  };

  return (
    <div className="student-apply-form-container">
      <div className="student-apply-form">
        <form onSubmit={handleSubmit}>
          <div className="input-flex">
            <div className="first-name">
              <label htmlFor="firstname" className="form-label">
                First Name
              </label>
              <input
                type="text"
                name="firstname"
                id="firstname"
                placeholder="Your first name"
                className="form-input"
                onChange={handleInputChange}
                required
              />
              {formErrors.firstname && (
                <p className="error">{formErrors.firstname}</p>
              )}
            </div>

            <div className="last-name">
              <label htmlFor="lastname" className="form-label">
                Last Name
              </label>
              <input
                type="text"
                name="lastname"
                id="lastname"
                placeholder="Your last name"
                className="form-input"
                onChange={handleInputChange}
                required
              />
              {formErrors.lastname && (
                <p className="error">{formErrors.lastname}</p>
              )}
            </div>
          </div>

          <div className="input-flex">
            <div className="email">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                placeholder="example@email.com"
                className="form-input"
                onChange={handleInputChange}
                required
              />
              {formErrors.email && <p className="error">{formErrors.email}</p>}
            </div>

            <div className="gender">
              <label className="form-label">Gender</label>
              <select
                className="form-input"
                name="gender"
                id="gender"
                onChange={handleInputChange}
                defaultValue=""
              >
                <option value="" disabled>
                  Select Gender
                </option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>

          <div className="mb-3 phone">
            <label htmlFor="phone" className="form-label">
              Phone
            </label>
            <div className="phone-inputs">
              <select
                name="areacode"
                id="areacode"
                className="form-input w-45"
                defaultValue=""
                onChange={handleInputChange}
              >
                <option value="" disabled></option>
                {countryData.map((country) => (
                  <option key={country.dial_code} value={country.dial_code}>
                    {country.code} {country.dial_code}
                  </option>
                ))}
              </select>
              <input
                type="text"
                name="phone"
                id="phone"
                placeholder="Phone number"
                className="form-input"
                onChange={handleInputChange}
                required
              />
            </div>
            {formErrors.phone && <p className="error">{formErrors.phone}</p>}
          </div>

          <div className="mb-3 start-date">
            <label htmlFor="start-date" className="form-label">
              When can you start?
            </label>
            <input
              type="date"
              name="startDate"
              id="start-date"
              className="form-input"
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="country">
            <label htmlFor="country" className="form-label">
              Country
            </label>
            <select
              className="form-input"
              name="country"
              id="country"
              value={formFields.country} // <-- Syncing with formFields state
              onChange={(e) => handleCountryChange(e.target.value)}
            >
              <option value="" disabled>
                Select Country
              </option>
              {countries.map((country) => (
                <option
                  key={country.country_short_name}
                  value={country.country_name}
                >
                  {country.country_name}
                </option>
              ))}
            </select>
            {formErrors.country && (
              <p className="error">{formErrors.country}</p>
            )}
          </div>

          <div className="state">
            <label htmlFor="state" className="form-label">
              State
            </label>
            <select
              className="form-input"
              name="state"
              id="state"
              onChange={(e) => handleStateChange(e.target.value)}
            >
              <option value="" disabled>
                Select State
              </option>
              {states.map((state) => (
                <option key={state.state_name} value={state.state_name}>
                  {state.state_name}
                </option>
              ))}
            </select>
            {formErrors.state && <p className="error">{formErrors.state}</p>}
          </div>

          <div className="city">
            <label htmlFor="city" className="form-label">
              City
            </label>
            <select
              className="form-input"
              name="city"
              id="city"
              onChange={handleInputChange}
            >
              <option value="" disabled>
                Select City
              </option>
              {cities.map((city) => (
                <option key={city.city_name} value={city.city_name}>
                  {city.city_name}
                </option>
              ))}
            </select>
            {formErrors.city && <p className="error">{formErrors.city}</p>}
          </div>

          <div className="mb-3 address">
            <label htmlFor="address" className="form-label">
              Address
            </label>
            <input
              type="text"
              name="address"
              id="address"
              placeholder="Street address"
              className="form-input mb-3"
              onChange={handleInputChange}
              required
            />
            {formErrors.address && (
              <p className="error">{formErrors.address}</p>
            )}
          </div>

          <div className="mb-3 cover-letter">
            <label htmlFor="cover-letter" className="form-label">
              Cover Letter
            </label>
            <textarea
              rows="6"
              name="coverLetter"
              id="cover-letter"
              className="form-input"
              onChange={handleInputChange}
            ></textarea>
          </div>

          <div className="file-flex">
            <label htmlFor="upload" className="form-label">
              Upload Resume
            </label>
            <input
              type="file"
              name="upload"
              id="upload"
              className="form-file"
              onChange={handleFileChange}
            />
            {formErrors.resume && <p className="error">{formErrors.resume}</p>}
          </div>

          <AreYouSureApply
            show={showConfirmModal}
            onConfirm={handleConfirmApply}
            onCancel={() => setShowConfirmModal(false)}
          />

          <button className="form-btn" onClick={handleSubmit}>
            Apply Now
          </button>
        </form>
      </div>
    </div>
  );
}

export default StudentApplyForm;
