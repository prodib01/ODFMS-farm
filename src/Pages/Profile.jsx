import React, { useState } from 'react';
// import { useHistory } from "react-router-dom"; 
import {  useNavigate } from'react-router-dom'; // Import useHistory hook from react-router-dom
import '../css/Profile.css'; // Import CSS file for styling

const Profile = () => {
  // State to hold profile data including logo file
  const [profileData, setProfileData] = useState({
    farmName: '',
    location: '',
    logo: null, // Store file object for the logo
    // Add more fields as needed
  });

  const navigate = useNavigate(); // Initialize useHistory hook for navigation

  // Function to handle input changes including file upload
  const handleInputChange = (event) => {
    const { name, value, type, files } = event.target;
    // If input type is file, update the state with the file object
    const updatedValue = type === 'file' ? files[0] : value;
    setProfileData({
      ...profileData,
      [name]: updatedValue,
    });
  };

  // Function to handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent default form submission
  
    try {
      const token = localStorage.getItem('token'); // Retrieve the token from local storage
      if (!token) {
        // Handle case where token is not present
        console.error('Authorization token is missing');
        return;
      }
  
      const formData = new FormData(); // Create FormData object
      formData.append('farm_name', profileData.farmName);
      formData.append('location', profileData.location);
      formData.append('logo', profileData.logo);
  
      const response = await fetch("http://localhost:8080/farm/addFarm", {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}` // Attach the token to the request headers
        },
        body: formData // Send FormData instead of JSON
      });
  
      if (response.ok) {
        // Redirect to dashboard after successful submission
        navigate("/dashboard");
      } else {
        console.error('Failed to submit form:', response.statusText);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };
  

  return (
    <div className="profile-container">
      <h2>Profile</h2>
      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-group">
          <label htmlFor="farmName">Farm Name:</label>
          <input
            type="text"
            id="farmName"
            name="farmName"
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="location">Location:</label>
          <input
            type="text"
            id="location"
            name="location"
            value={profileData.location}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="logo">Logo:</label>
          <input
            type="file"
            id="logo"
            name="logo"
            accept="image/*" // Allow only image files
            onChange={handleInputChange}
          />
        </div>
        {/* Add more fields as needed */}
        <button type="submit">Save Profile</button>
      </form>
    </div>
  );
};

export default Profile;
