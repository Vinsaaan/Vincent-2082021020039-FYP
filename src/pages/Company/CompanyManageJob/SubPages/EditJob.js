import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "./EditJob.css";
import SpecializationOptions from "../../../../components/share/specializationOptions";
import QuillEditor from "../../../../components/share/QuillEditor";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import firebase from "../../../../firebase/firebase";

const EditJob = () => {
  useEffect(() => {
    document.title = "Edit Job";

    return () => {
      document.title = "EduBridge";
    };
  }, []);
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [jobDetails, setJobDetails] = useState({
    title: "",
    description: "",
    type: "Full-Time",
    skills: "",
    country: "",
    state: "",
    city: "",
    salary: "",
    specialization: "",
  });

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [token, setToken] = useState("");
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");

  useEffect(() => {
    const fetchJobData = async () => {
      const doc = await firebase
        .firestore()
        .collection("jobs")
        .doc(jobId)
        .get();
      if (doc.exists) {
        setJobDetails(doc.data());
        setSkills(doc.data().skills || []);
      } else {
        console.error("No job found");
      }
    };

    if (jobId) {
      fetchJobData();
    }
  }, [jobId]);

  const getAccessToken = async () => {
    try {
      const response = await axios.get(
        "https://www.universal-tutorial.com/api/getaccesstoken",
        {
          headers: {
            Accept: "application/json",
            "api-token":
              "xTBfQqlQd_ZjrNwH1bbOm5rxqWCWUbETMSU1LOVP9R6Tb_Do-sDYnLwDO73y8hv1q78",
            "user-email": "lauvincent99@gmail.com",
          },
        }
      );
      setToken(response.data.auth_token);
    } catch (error) {
      console.error("Error getting access token", error);
    }
  };

  useEffect(() => {
    getAccessToken();
  }, []);

  useEffect(() => {
    if (token) {
      axios
        .get("https://www.universal-tutorial.com/api/countries/", {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        })
        .then((response) => {
          setCountries(response.data);
        })
        .catch((error) => {
          console.error("Error retrieving countries!", error);
        });
    }
  }, [token]);

  const handleCountryChange = async (e) => {
    const selectedCountry = e.target.value;
    setJobDetails({
      ...jobDetails,
      country: selectedCountry,
      state: "",
      city: "",
    });

    try {
      const response = await axios.get(
        `https://www.universal-tutorial.com/api/states/${selectedCountry}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );
      setStates(response.data);
      setCities([]);
    } catch (error) {
      console.error("Error retrieving states!", error);
    }
  };

  const handleStateChange = async (e) => {
    const selectedState = e.target.value;
    setJobDetails({ ...jobDetails, state: selectedState, city: "" });

    try {
      const response = await axios.get(
        `https://www.universal-tutorial.com/api/cities/${selectedState}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );
      setCities(response.data);
    } catch (error) {
      console.error("Error retrieving cities!", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = firebase.auth().currentUser;
    if (!user) {
      console.error("User is not authenticated.");
      return;
    }

    const db = firebase.firestore();

    try {
      const updatedJob = {
        ...jobDetails,
        skills: skills,
      };

      await db.collection("jobs").doc(jobId).update(updatedJob);

      // Log the job edit activity in the 'recentActivities' collection
      await db.collection("recentActivities").add({
        createdAt: new Date(),
        message: `${updatedJob.userName} has updated the job: ${updatedJob.title}.`,
        userId: user.uid,
      });

      alert("Job updated!");
      navigate("/companymanagejob");
    } catch (error) {
      console.error("Error updating job:", error);
      alert("Failed to update job. Please try again.");
    }
  };

  const handleDescriptionChange = (value) => {
    setJobDetails((prevDetails) => ({
      ...prevDetails,
      description: value,
    }));
  };

  const addSkill = () => {
    if (skillInput && !skills.includes(skillInput)) {
      setSkills([...skills, skillInput]);
      setSkillInput("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  return (
    <div className="edit-job">
      <h2>Edit Job</h2>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label>
            Job Title:
            <input
              type="text"
              value={jobDetails.title}
              onChange={(e) =>
                setJobDetails({ ...jobDetails, title: e.target.value })
              }
              required
            />
          </label>
          <label>
            Specialization:
            <SpecializationOptions
              selectedSpecialization={jobDetails.specialization}
              onSelectSpecialization={(value) =>
                setJobDetails({ ...jobDetails, specialization: value })
              }
            />
          </label>
        </div>

        <div className="form-group">
          <label>Job Description</label>
          <QuillEditor
            value={jobDetails.description}
            setValue={handleDescriptionChange}
          />
        </div>

        <div className="input-group">
          <label>
            Job Type:
            <select
              value={jobDetails.type}
              onChange={(e) =>
                setJobDetails({ ...jobDetails, type: e.target.value })
              }
              required
            >
              <option value="Full-Time">Full-Time</option>
              <option value="Part-Time">Part-Time</option>
              <option value="Internship">Internship</option>
            </select>
          </label>
        </div>

        <div className="location-group">
          <label>
            Country:
            <select
              name="country"
              value={jobDetails.country}
              onChange={handleCountryChange}
              required
            >
              <option value="">Select Country</option>
              {countries.map((country, index) => (
                <option key={index} value={country.country_name}>
                  {country.country_name}
                </option>
              ))}
            </select>
          </label>

          <label>
            State:
            <select
              name="state"
              value={jobDetails.state}
              onChange={handleStateChange}
              required
            >
              <option value="">Select State</option>
              {states.map((state, index) => (
                <option key={index} value={state.state_name}>
                  {state.state_name}
                </option>
              ))}
            </select>
          </label>

          <label>
            City:
            <select
              name="city"
              value={jobDetails.city}
              onChange={(e) =>
                setJobDetails({ ...jobDetails, city: e.target.value })
              }
              required
            >
              <option value="">Select City</option>
              {cities.map((city, index) => (
                <option key={index} value={city.city_name}>
                  {city.city_name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="skills-group">
          <label htmlFor="skill-input">Required Skills:</label>
          <div className="skills-input">
            <input
              id="skill-input"
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <IconButton
              color="primary"
              aria-label="Add skill"
              component="span"
              onClick={addSkill}
            >
              <AddCircleOutlineIcon />
            </IconButton>
          </div>
          <div className="skills-chips">
            {skills.map((skill, index) => (
              <Chip
                key={index}
                label={skill}
                onDelete={() => setSkills(skills.filter((s) => s !== skill))}
              />
            ))}
          </div>
        </div>

        <div className="salary-group">
          <label>
            Salary:
            <input
              type="text"
              value={jobDetails.salary}
              onChange={(e) =>
                setJobDetails({ ...jobDetails, salary: e.target.value })
              }
              required
            />
          </label>
        </div>

        <div className="buttons-group">
          <button type="submit" className="save-button">
            Update Job
          </button>
          <button
            type="button"
            className="go-back-button"
            onClick={() => navigate(-1)}
          >
            Go Back
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditJob;
