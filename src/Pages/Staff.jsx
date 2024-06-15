import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";
import "../css/Staff.css";
import Modal from "react-modal";

const Staff = () => {
  const [staffData, setStaffData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStaff, setCurrentStaff] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const fetchStaffData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8080/users/getStaff", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error("Failed to fetch staff data");
      }
      const data = await response.json();
      setStaffData(data.staff);
    } catch (error) {
      console.error("Error fetching staff data:", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      navigate("/");
    } else {
      fetchStaffData();
    }
  }, [token, navigate, fetchStaffData]);

  const handleAddClick = () => {
    setCurrentStaff(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (staffMember) => {
    setCurrentStaff(staffMember);
    setIsModalOpen(true);
  };

  const handleDelete = async (staffMember) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${staffMember.full_name} from the database?`
    );
    if (confirmDelete) {
      try {
        const response = await fetch(`http://localhost:8080/users/deleteStaff/${staffMember.id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || "Failed to delete staff member");
        }

        setStaffData((prevStaffData) =>
          prevStaffData.filter((staff) => staff.id !== staffMember.id)
        );
      } catch (error) {
        console.error("Error deleting staff member:", error);
      }
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const url = currentStaff
      ? `http://localhost:8080/users/updateStaff/${currentStaff.id}`
      : "http://localhost:8080/users/addStaff";
    const method = currentStaff ? "PATCH" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          full_name: e.target.fullName.value,
          email: e.target.email.value,
          phone: e.target.phoneNumber.value,
          address: e.target.address.value,
          gender: e.target.gender.value,
          position: e.target.position.value,
          department: e.target.department.value,
          state_of_employment: e.target.status.value
        })
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("response", error);
        throw new Error(error.message || "Network response was not ok");
      }

      alert(currentStaff ? "Staff updated successfully" : "Staff added successfully");
      setIsModalOpen(false);
      fetchStaffData();
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
      alert(error.message);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentStaff(null);
  };

  const totalPages = Math.ceil(staffData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentStaffData = staffData.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="staff-container">
      <h2>Staff</h2>
      <div className="add-staff-btn-container">
        <button className="add-staff-btn" onClick={handleAddClick}>
          Add Staff
        </button>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <div className="table-wrapper">
            <table className="staff-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Gender</th>
                  <th>Position</th>
                  <th>Address</th>
                  <th>Department</th>
                  <th>Employment Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentStaffData.map((staffMember) => (
                  <tr key={staffMember.id}>
                    <td>{staffMember.full_name}</td>
                    <td>{staffMember.phone}</td>
                    <td>{staffMember.email}</td>
                    <td>{staffMember.gender}</td>
                    <td>{staffMember.position}</td>
                    <td>{staffMember.address}</td>
                    <td>{staffMember.department}</td>
                    <td>{staffMember.state_of_employment}</td>
                    <td>
                      <button
                        className="action-btn edit-btn"
                        onClick={() => handleEditClick(staffMember)}>
                        <FaEdit />
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDelete(staffMember)}>
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pagination">
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index + 1}
                onClick={() => handlePageChange(index + 1)}
                className={`page-btn ${index + 1 === currentPage ? "active" : ""}`}>
                {index + 1}
              </button>
            ))}
          </div>
        </>
      )}
      <Modal
      isOpen={isModalOpen}
      onRequestClose={closeModal}
      contentLabel="Add/Edit Staff Member"
      style={{
                 content: {
            maxWidth: "500px", 
            width: "80%", 
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "#fff",
            padding: "20px",
            borderRadius: "5px",
            boxShadow: "0 0 10px rgba(0, 0, 0, 0.2)" 
                 }
      }}>
        <button
          onClick={closeModal}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            padding: "5px 10px",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "3px",
            cursor: "pointer"
          }}>
          Close
        </button>
        <h2>{currentStaff ? "Editing Staff Record" : "Adding Staff Record"}</h2>
         <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label htmlFor="fullName">Full Name:</label>
                <input
                  type="text"
                  id="fullName"
                  defaultValue={currentStaff?.full_name || ""}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email:</label>
                <input type="email" id="email" defaultValue={currentStaff?.email || ""} required />
              </div>
              <div className="form-group">
                <label htmlFor="phoneNumber">Phone Number:</label>
                <input
                  type="tel"
                  id="phoneNumber"
                  defaultValue={currentStaff?.phone || ""}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="address">Address:</label>
                <input
                  type="text"
                  id="address"
                  defaultValue={currentStaff?.address || ""}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="gender">Gender:</label>
                <input type="text" id="gender" defaultValue={currentStaff?.gender || ""} required />
              </div>
              <div className="form-group">
                <label htmlFor="position">Position:</label>
                <input
                  type="text"
                  id="position"
                  defaultValue={currentStaff?.position || ""}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="department">Department:</label>
                <input
                  type="text"
                  id="department"
                  defaultValue={currentStaff?.department || ""}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="status">Employment Status:</label>
                <select id="status" defaultValue={currentStaff?.state_of_employment || ""}>
                  <option value="">Select Status</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>
              <button type="submit" className="submit-button">
                {currentStaff ? "Update Staff" : "Add Staff"}
              </button>
            </form>
            </Modal>
    </div>
  );
};

export default Staff;;
