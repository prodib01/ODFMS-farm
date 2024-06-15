import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../css/Monitoring.css"; // Ensure this path is correct
import { FaEdit, FaEye, FaTrash } from "react-icons/fa";
import Modal from "react-modal";

Modal.setAppElement("#root");

const Monitoring = () => {
  const navigate = useNavigate();
  const [cowDetails, setCowDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [addModalIsOpen, setAddModalIsOpen] = useState(false);
  const [editModalIsOpen, setEditModalIsOpen] = useState(false);
  const [viewModalIsOpen, setViewModalIsOpen] = useState(false);
  const [selectedCow, setSelectedCow] = useState(null);
  const [healthRecords, setHealthRecords] = useState([]);
  const [editCowData, setEditCowData] = useState({
    breed: "",
    date_of_birth: "",
    weight: "",
    health_status: "",
    gender: ""
  });
    const [editHealthData, setEditHealthData] = useState({
      date: "",
      healthissue: "",
      treatmentgiven: ""
    });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const token = localStorage.getItem("token");

  const fetchCowData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("http://localhost:8080/cow/getCowDetailsByOwner", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch cow data");
      }

      const data = await response.json();
      if (Array.isArray(data.cows)) {
        setCowDetails(data.cows);
      } else {
        console.error("Unexpected response format:", data);
        setError("Unexpected response format");
      }
    } catch (error) {
      console.error("Error fetching cow data", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      navigate("/");
    } else {
      fetchCowData();
    }
  }, [token, navigate, fetchCowData]);

  const handleAddClick = () => {
    setAddModalIsOpen(true);
  };

 const handleEditClick = async (cow) => {
   try {
     // Check if the cow has existing health records
     const response = await fetch(
       `http://localhost:8080/health/getHealthRecordsByCowId/${cow.id}`,
       {
         method: "GET",
         headers: {
           "Content-Type": "application/json",
           Authorization: `Bearer ${token}`
         }
       }
     );

     if (!response.ok) {
       console.error("Failed to fetch health records");
       setError("Failed to fetch health records");
       return;
     }

     const data = await response.json();

     if (data.records && data.records.length > 0) {
       // If health records exist, set data for editing
       const latestRecord = data.records[0]; // Assume the latest record is at index 0
       setEditHealthData({
         date: new Date(latestRecord.date).toISOString().split("T")[0],
         healthissue: latestRecord.healthissue,
         treatmentgiven: latestRecord.treatmentgiven
       });
     } else {
       // No health records, initialize with empty data
       setEditHealthData({
         date: "",
         healthissue: "",
         treatmentgiven: ""
       });

       // Create new health record before editing
       await fetch("http://localhost:8080/health/createCowHealth", {
         method: "POST",
         headers: {
           "Content-Type": "application/json",
           Authorization: `Bearer ${token}`
         },
         body: JSON.stringify({ cowId: cow.id })
       });
     }

     setSelectedCow(cow);
     setEditModalIsOpen(true);
   } catch (error) {
     console.error("Error processing edit action:", error);
     setError("Error processing edit action");
   }
 };

const openViewModal = async (cowId) => {
  try {
    setLoading(true);
    setError(null);

    const response = await fetch(`http://localhost:8080/health/getHealthRecordsByCowId/${cowId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error("Failed to fetch health records");
    }

    const data = await response.json();
    console.log("Fetched health records:", data);

    if (data.records && Array.isArray(data.records)) {

      const formattedRecords = data.records.map((record) => ({
        ...record,
        date: new Date(record.date).toISOString().split("T")[0]
      }));
      setHealthRecords(formattedRecords);
    } else {
      console.error("Unexpected response format:", data);
      setHealthRecords([]); // Fallback to empty array if not an array
      setError("Unexpected response format");
    }
    setSelectedCow(cowDetails.find((cow) => cow.id === cowId));
    setViewModalIsOpen(true);
  } catch (error) {
    console.error("Error fetching health records", error);
    setError(error.message);
  } finally {
    setLoading(false);
  }
};



  const closeModal = () => {
    setAddModalIsOpen(false);
    setEditModalIsOpen(false);
    setViewModalIsOpen(false);
    setSelectedCow(null);
    setHealthRecords([]);
  };

  const handleDelete = async (cowId) => {
    const cow = cowDetails.find((cow) => cow.id === cowId);
    if (cow && window.confirm(`Are you sure you want to delete cow "${cow.cow_tag}"?`)) {
      try {
        const response = await fetch(`http://localhost:8080/cow/deleteCow/${cowId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || "Failed to delete cow");
        }
        setCowDetails((prevCowDetails) => prevCowDetails.filter((cow) => cow.id !== cowId));
        navigate("/dashboard/monitoring");
      } catch (error) {
        console.error("Error deleting cow", error);
        setError(error.message);
      }
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      breed: formData.get("breed"),
      date_of_birth: formData.get("date_of_birth"),
      weight: formData.get("weight"),
      health_status: formData.get("health_status"),
      gender: formData.get("gender")
    };

    try {
      const response = await fetch("http://localhost:8080/cow/addCow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (response.ok) {
        alert("Cow added successfully!");
        setAddModalIsOpen(false);
        fetchCowData(); // Refresh the cow list
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error: Could not add cow");
    }
  };

 const handleEditSubmit = async (e) => {
   e.preventDefault();
   const formData = new FormData(e.target);
   const data = {
     date: formData.get("date"),
     healthissue: formData.get("healthissue"),
     treatmentgiven: formData.get("treatmentgiven")
   };

   try {
     const response = await fetch(
       `http://localhost:8080/health/updateCowHealth/${selectedCow.id}`,
       {
         method: "PATCH",
         headers: {
           "Content-Type": "application/json",
           Authorization: `Bearer ${token}`
         },
         body: JSON.stringify(data)
       }
     );

     if (!response.ok) {
       let errorData;
       try {
         errorData = await response.json();
       } catch (jsonError) {
         const errorText = await response.text();
         console.error("Error response text:", errorText);
         throw new Error(`Network response was not ok. Status: ${response.status}`);
       }

       console.error("response error", errorData);
       throw new Error(`Network response was not ok. Error: ${errorData.message}`);
     }

     alert("Cow updated successfully");
     setEditModalIsOpen(false);
     fetchCowData(); // Refresh the cow list
   } catch (error) {
     console.error("There was a problem with the fetch operation:", error);
     alert(error.message);
   }
 };


  const totalPages = Math.ceil(cowDetails.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = cowDetails.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="monitoring-container">
      <h2>Monitoring</h2>
      <div className="add-staff-btn-container">
        <button className="add-staff-btn" onClick={handleAddClick}>
          Add Cow
        </button>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div>Error: {error}</div>
      ) : (
        <div className="table-wrapper">
          <table className="cow-table">
            <thead>
              <tr>
                <th>Tag</th>
                <th>Breed</th>
                <th>Weight</th>
                <th>Gender</th>
                <th>Health Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((cow) => (
                <tr key={cow.id}>
                  <td>{cow.cow_tag}</td>
                  <td>{cow.breed}</td>
                  <td>{cow.weight}</td>
                  <td>{cow.gender}</td>
                  <td>{cow.health_status}</td>
                  <td>
                    <button className="action-btn view-btn" onClick={() => openViewModal(cow.id)}>
                      <FaEye />
                    </button>
                    <button className="action-btn edit-btn" onClick={() => handleEditClick(cow)}>
                      <FaEdit />
                    </button>
                    <button className="action-btn delete-btn" onClick={() => handleDelete(cow.id)}>
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
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
      <Modal
        isOpen={addModalIsOpen}
        onRequestClose={closeModal}
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
        <h2>Add Cow</h2>
        <form onSubmit={handleAddSubmit}>
          <div className="form-group">
            <label>
              Breed:
              <input
                type="text"
                name="breed"
                value={editCowData.breed}
                onChange={(e) => setEditCowData({ ...editCowData, breed: e.target.value })}
                required
              />
            </label>
          </div>
          <div className="form-group">
            <label>
              Date of Birth:
              <input
                type="date"
                name="date_of_birth"
                value={editCowData.date_of_birth}
                onChange={(e) => setEditCowData({ ...editCowData, date_of_birth: e.target.value })}
                required
              />
            </label>
          </div>
          <div className="form-group">
            <label>
              Weight:
              <input
                type="number"
                name="weight"
                value={editCowData.weight}
                onChange={(e) => setEditCowData({ ...editCowData, weight: e.target.value })}
                required
              />
            </label>
          </div>
          <div className="form-group">
            <label>
              Health Status:
              <input
                type="text"
                name="health_status"
                value={editCowData.health_status}
                onChange={(e) => setEditCowData({ ...editCowData, health_status: e.target.value })}
                required
              />
            </label>
          </div>
          <div className="form-group">
            <label>
              Gender:
              <select
                name="gender"
                value={editCowData.gender}
                onChange={(e) => setEditCowData({ ...editCowData, gender: e.target.value })}
                required>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </label>
          </div>
          <button type="submit" className="submit-btn">
            Add Cow
          </button>
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
        </form>
      </Modal>
      <Modal
        isOpen={editModalIsOpen}
        onRequestClose={closeModal}
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
        <h2>
          {healthRecords.length > 0
            ? `Edit Health Record for ${selectedCow?.cow_tag}`
            : `Add Health Record for ${selectedCow?.cow_tag}`}
        </h2>
        <form onSubmit={healthRecords.length > 0 ? handleEditSubmit : handleAddSubmit}>
          <div className="form-group">
            <label htmlFor="health-date">Date</label>
            <input
              type="date"
              id="health-date"
              name="date"
              value={editHealthData.date}
              onChange={(e) => setEditHealthData({ ...editHealthData, date: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="health-issue">Health Issue</label>
            <input
              type="text"
              id="health-issue"
              name="healthissue"
              value={editHealthData.healthissue}
              onChange={(e) =>
                setEditHealthData({ ...editHealthData, healthissue: e.target.value })
              }
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="treatment-given">Treatment Given</label>
            <input
              type="text"
              id="treatment-given"
              name="treatmentgiven"
              value={editHealthData.treatmentgiven}
              onChange={(e) =>
                setEditHealthData({ ...editHealthData, treatmentgiven: e.target.value })
              }
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">
            {healthRecords.length > 0 ? "Save Changes" : "Add Health Record"}
          </button>
          <button
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
            }}
            onClick={closeModal}>
            Close
          </button>
        </form>
      </Modal>
      <Modal isOpen={viewModalIsOpen} onRequestClose={closeModal}>
        <h2>Health Records</h2>
        <div className="health-records-table">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Health Issue</th>
                <th>Treatment Given</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(healthRecords) && healthRecords.length > 0 ? (
                healthRecords.map((record) => (
                  <tr key={record.id}>
                    <td>{record.date}</td>
                    <td>{record.healthissue}</td>
                    <td>{record.treatmentgiven}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3">No health records available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <button
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
          }}
          onClick={closeModal}>
          Close
        </button>
      </Modal>
    </div>
  );
};

export default Monitoring;
