import React, { useState } from "react";
// import { useHistory } from "react-router-dom";
import { useNavigate } from "react-router-dom"; // Import useHistory hook from react-router-dom
import "../css/Profile.css"; // Import CSS file for styling

const Profile = () => {
  return (
    <div className="profile-container">
      <h2>Profile</h2>
      <div className="dets">
        <div className="picture-card">
          <label>Profile picture</label>
          <button>Change picture</button>
          <button>Delete picture</button>
        </div>
        <div className="farmname-card">
          <label>Farm Name</label>
          <input type="text"></input>
        </div>
        <div className="owner-card">
          <label>Farm Owner</label>
          <input type="text"></input>
        </div>
        <div className="location-card">
          <label>Farm Location</label>
          <input type="text"></input>
        </div>
        <button>Save Changes</button>
      </div>
    </div>
  );
};

export default Profile;
