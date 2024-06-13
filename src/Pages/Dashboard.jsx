import React, { useEffect, useState } from "react";
import "../css/Dashboard.css";
import {
  FaUser,
  FaPowerOff,
  FaSpinner,
  FaProductHunt,
  FaCookieBite,
  FaHippo,
  FaUsers,
  FaCalendarDay,
  FaAddressCard,
  FaCloud,
  FaTable,
  FaBell
} from "react-icons/fa";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const Dashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // State to store user info from the token
  const [userData, setUserData] = useState({
    name: "",
    image: ""
  });
  const [loggedInUserName, setLoggedInUserName] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/");
    } else {
      const decodedToken = jwtDecode(token);
      console.log("Decoded Token:", decodedToken);
      setLoggedInUserName(decodedToken.full_name); 
    }
  }, [token, navigate]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("http://localhost:8080/farm/myFarmDetails", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }
        const data = await response.json();
        setUserData({
          name: data.farm_name,
          image: data.logo
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
        // Handle error
      }
    };

    fetchUserData();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };
  const backendBaseURL = "http://localhost:8080";

  return (
    <div className="dashboard">
      <div className="side-bar">
        <div className="user-info">
          <div className="user-image">
            {userData.image && (
              <img src={`${backendBaseURL}${userData.image}`} alt="User" className="user-avatar" />
            )}
          </div>
          <div className="user-name">{userData.name}</div>
        </div>
        <div className="nav-links">
          <Link to="/dashboard" className="link-item">
            <FaTable />
            <span>Dashboard</span>
          </Link>
          <Link to="staff" className="link-item">
            <FaUsers />
            <span>Staff</span>
          </Link>
          <Link to="monitoring" className="link-item">
            <FaSpinner />
            <span>Monitoring</span>
          </Link>
          <Link to="production" className="link-item">
            <FaProductHunt />
            <span>Production</span>
          </Link>
          <Link to="feeding" className="link-item">
            <FaCookieBite />
            <span>Feeding</span>
          </Link>
          <Link to="breeding" className="link-item">
            <FaHippo />
            <span>Breeding</span>
          </Link>
          <Link to="task" className="link-item">
            <FaCalendarDay />
            <span>Task Management</span>
          </Link>
          <Link to="calendar" className="link-item">
            <FaCloud />
            <span>Calendar</span>
          </Link>
          <Link to="profile" className="link-item">
            <FaAddressCard />
            <span>Profile</span>
          </Link>
        </div>
      </div>
      <div className="content">
        <div className="nav-bar">
          <div className="org-name">System Logo</div>
          <div className="user-section">
            <FaBell className="nav-item" />
            <div className="nav-user-info">
              <div className="nav-user-name">Welcome, {loggedInUserName}</div>{" "}
            </div>
            <FaPowerOff onClick={handleLogout} className="nav-item" />
          </div>
        </div>
        <div className="main-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
