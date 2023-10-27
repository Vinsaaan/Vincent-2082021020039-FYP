import React from "react";
import "./specializationOptions.css";

function SpecializationDropdown({
  selectedSpecialization,
  onSelectSpecialization,
  style,
}) {
  const specializationOptions = [
    "Accounting / Finance",
    "Admin / Human Resources",
    "Sales / Marketing",
    "Art / Media / Communications",
    "Services",
    "Hotel / Restaurant",
    "Education / Training",
    "Computer / Information Technology",
    "Engineering",
    "Manufacturing",
    "Building / Construction",
    "Sciences",
    "Healthcare",
    "Others",
  ];

  const handleSpecializationChange = (event) => {
    onSelectSpecialization(event.target.value);
  };

  return (
    <div className="specialization-container" style={style}>
      <select
        id="specialization"
        name="specialization"
        value={selectedSpecialization}
        onChange={handleSpecializationChange}
      >
        <option value="">Select an option</option>
        {specializationOptions.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

export default SpecializationDropdown;
