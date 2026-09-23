import React, { useState ,useEffect } from "react";
import "../styles/details.css";
import { useLocation , useNavigate } from "react-router-dom";
import api from "../api";
import { ACCESS_TOKEN } from "../constants";

const CollectDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const accommodationName = location.state?.accommodationName || "";
  // State for form data
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact_number: "",
    alternate_contact_number: "",
    college_or_workplace: "",
    course: "",
    accommodation: "",
  });

  useEffect(() => {
    if (accommodationName) {
      setFormData((prev) => ({
        ...prev,
        accommodation: accommodationName,
      }));
    }
  }, [accommodationName]);

  // Handle change in input fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const token = localStorage.getItem(ACCESS_TOKEN);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/api/book/", formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      
      ); // Update URL to your backend
      alert("Successfully booked!");
      navigate("/")
    } catch {
      alert("Something went wrong while booking.");
    }
  };

  return (
    <div className="form-container">
       <h2 className="form-title">User Profile</h2>
      <form onSubmit={handleSubmit} className="details-form">
  <div className="form-group">
    <label htmlFor="name">Name</label>
    <input
      type="text"
      id="name"
      name="name"
      value={formData.name}
      onChange={handleChange}
      required
    />
  </div>

  <div className="form-group">
    <label htmlFor="email">Email</label>
    <input
      type="email"
      id="email"
      name="email"
      value={formData.email}
      onChange={handleChange}
      required
    />
  </div>

  <div className="form-group">
    <label htmlFor="contact_number">Contact Number</label>
    <input
      type="tel"
      id="contact_number"
      name="contact_number"
      value={formData.contact_number}
      onChange={handleChange}
      required
    />
  </div>

  <div className="form-group">
    <label htmlFor="alternate_contact_number">Alternate Contact Number</label>
    <input
      type="tel"
      id="alternate_contact_number"
      name="alternate_contact_number"
      value={formData.alternate_contact_number}
      onChange={handleChange}
      required
    />
  </div>

  <div className="form-group">
    <label htmlFor="college_or_workplace">College/Workplace</label>
    <input
      type="text"
      id="college_or_workplace"
      name="college_or_workplace"
      value={formData.college_or_workplace}
      onChange={handleChange}
      required
    />
  </div>

  <div className="form-group">
    <label htmlFor="course">Course</label>
    <input
      type="text"
      id="course"
      name="course"
      value={formData.course}
      onChange={handleChange}
      required
    />
  </div>

  <div className="form-group">
    <label htmlFor="accommodation">Accommodation</label>
    <input
      type="text"
      id="accommodation"
      name="accommodation"
      value={formData.accommodation}
      onChange={handleChange}
      required
    />
  </div>

  <button type="submit" className="submit-btn">
    Submit
  </button>
</form>
    </div>
  );
};

export default CollectDetails;
