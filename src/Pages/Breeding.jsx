import { useEffect, useState } from "react";
import Modal from "react-modal";
import { FaEdit, FaTrash } from "react-icons/fa";
import "../css/Breeding.css";

Modal.setAppElement("#root");

const Breeding = () => {
  const [breedingRecords, setBreedingRecords] = useState([]);
  const [cowDetails, setCowDetails] = useState({});
  const [methodDetails, setMethodDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [editRecord, setEditRecord] = useState(null); // State to store the record being edited
  const [newRecord, setNewRecord] = useState({
    cow: "",
    breeding_date: "",
    method: "",
    pregnancy_status: false,
    due_date: ""
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    async function fetchData() {
      await Promise.all([fetchBreedingRecords(), fetchCowDetails(), fetchMethodDetails()]);
      setLoading(false);
    }
    fetchData();
  }, []);

  const fetchBreedingRecords = async () => {
    try {
      const response = await fetch("http://localhost:8080/breeding/getbreeding", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      setBreedingRecords(data.data);
    } catch (error) {
      console.error("Error fetching breeding records:", error);
    }
  };

  const fetchCowDetails = async () => {
    try {
      const response = await fetch("http://localhost:8080/cow/getCowDetailsByOwner", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      const cowDetailsObject = data.cows.reduce((acc, cow) => {
        acc[cow.id] = cow;
        return acc;
      }, {});
      setCowDetails(cowDetailsObject);
    } catch (error) {
      console.error("Error fetching cow details:", error);
    }
  };

  const fetchMethodDetails = async () => {
    try {
      const response = await fetch("http://localhost:8080/breeding/method", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();

      // Safely access the methods array within data
      const methods = data.data || [];
      const methodDetailsObject = methods.reduce((acc, method) => {
        acc[method.id] = method.method;
        return acc;
      }, {});

      setMethodDetails(methodDetailsObject);
    } catch (error) {
      console.error("Error fetching method details:", error);
    }
  };

  const getCowTag = (cowId) => {
    const cow = cowDetails[cowId];
    return cow ? cow.cow_tag : "Unknown";
  };

  const getMethodName = (methodId) => {
    return methodDetails[methodId] || "Unknown";
  };

  const openModal = () => setModalIsOpen(true);
  const closeModal = () => {
    setModalIsOpen(false);
    setEditRecord(null);
  };

  const handleEdit = (record) => {
    setEditRecord(record);
    if (record) {
      setRecord(record);
      setNewRecord({
        cow: record.cow,
        breeding_date: record.breeding_date,
        method: record.method,
        pregnancy_status: record.pregnancy_status,
        due_date: record.due_date
      });
      openModal(); // Open the modal
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "radio") {
      setNewRecord((prev) => ({
        ...prev,
        [name]: value === "true" ? true : false // Convert the string value to a boolean
      }));
    } else {
      setNewRecord((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value
      }));
    }
  };

  const updateBreedingRecord = async (updatedRecord) => {
    try {
      const response = await fetch(
        `http://localhost:8080/breeding/updatebreeding/${editRecord.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(updatedRecord)
        }
      );
      const data = await response.json();
      setBreedingRecords((prevRecords) =>
        prevRecords.map((rec) => (rec.id === editRecord.id ? data.data : rec))
      );
    } catch (error) {
      console.error("Error updating breeding record:", error);
    }
  };

  const handleDelete = async (recordToDelete) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this record from the storage?"
    );
    if (confirmDelete) {
      try {
        const response = await fetch(
          `http://localhost:8080/breeding/deletebreeding/${recordToDelete.id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            }
          }
        );
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || "Failed to delete record");
        }
        setBreedingRecords((prevRecords) =>
          prevRecords.filter((rec) => rec.id !== recordToDelete.id)
        );
      } catch (error) {
        console.error("Error deleting record", error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formattedRecord = {
        ...newRecord,
        breeding_date: new Date(newRecord.breeding_date).toISOString().split("T")[0], // Convert and format date
        due_date: new Date(newRecord.due_date).toISOString().split("T")[0] // Convert and format date
      };
      if (editRecord) {
        await updateBreedingRecord(formattedRecord);
      } else {
        const response = await fetch("http://localhost:8080/breeding/addbreeding", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(formattedRecord)
        });
        const data = await response.json();
        setBreedingRecords((prev) => [...prev, data.data]);
      }
      closeModal();
    } catch (error) {
      console.error("Error adding/updating breeding record:", error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <div className="add-btn-container">
        <button className="add-btn" onClick={openModal}>
          Add Record
        </button>
      </div>
      <h1>Breeding Records</h1>
      <table>
        <thead>
          <tr>
            <th>Cow</th>
            <th>Breeding Date</th>
            <th>Method</th>
            <th>Pregnancy Status</th>
            <th>Due Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {breedingRecords.map((record) => (
            <tr key={record.id}>
              <td>{getCowTag(record.cow)}</td>
              <td>{formatDate(record.breeding_date)}</td>
              <td>{getMethodName(record.method)}</td>
              <td>{record.pregnancy_status ? "Pregnant" : "Not Pregnant"}</td>
              <td>{formatDate(record.due_date)}</td>
              <td>
                <button onClick={() => handleEdit(record)}>
                  <FaEdit />
                </button>
                <button onClick={() => handleDelete(record)}>
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Add Breeding Record"
        style={{
          content: {
            maxWidth: "500px", // Adjust this value as needed
            width: "80%", // Adjust this value as needed
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
        <h2>{editRecord ? "Edit Breeding Record" : "Add Breeding Record"}</h2>
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column"
          }}>
          <label
            style={{
              marginBottom: "10px"
            }}>
            Cow:
            <select
              name="cow"
              value={newRecord.cow}
              onChange={handleChange}
              style={{
                padding: "8px",
                marginBottom: "10px",
                border: "1px solid #ccc",
                borderRadius: "3px",
                width: "100%"
              }}>
              <option value="">Select a cow</option>
              {Object.values(cowDetails).map((cow) => (
                <option key={cow.id} value={cow.id}>
                  {cow.cow_tag}
                </option>
              ))}
            </select>
          </label>
          <label
            style={{
              marginBottom: "10px"
            }}>
            Breeding Date:
            <input
              type="date"
              name="breeding_date"
              value={newRecord.breeding_date}
              onChange={handleChange}
              style={{
                padding: "8px",
                marginBottom: "10px",
                border: "1px solid #ccc",
                borderRadius: "3px",
                width: "100%"
              }}
            />
          </label>
          <label
            style={{
              marginBottom: "10px"
            }}>
            Method:
            <select
              name="method"
              value={newRecord.method}
              onChange={handleChange}
              style={{
                padding: "8px",
                marginBottom: "10px",
                border: "1px solid #ccc",
                borderRadius: "3px",
                width: "100%"
              }}>
              <option value="">Select a method</option>
              {Object.entries(methodDetails).map(([id, method]) => (
                <option key={id} value={id}>
                  {method}
                </option>
              ))}
            </select>
          </label>
          <label
            style={{
              marginBottom: "10px"
            }}>
            Pregnancy Status:
            <div>
              <input
                type="radio"
                name="pregnancy_status"
                value={true}
                checked={newRecord.pregnancy_status === true}
                onChange={handleChange}
                style={{
                  marginRight: "5px"
                }}
              />
              Pregnant
              <input
                type="radio"
                name="pregnancy_status"
                value={false}
                checked={newRecord.pregnancy_status === false}
                onChange={handleChange}
                style={{
                  marginRight: "5px"
                }}
              />
              Not Pregnant
            </div>
          </label>
          <label
            style={{
              marginBottom: "10px"
            }}>
            Due Date:
            <input
              type="date"
              name="due_date"
              value={newRecord.due_date}
              onChange={handleChange}
              style={{
                padding: "8px",
                marginBottom: "10px",
                border: "1px solid #ccc",
                borderRadius: "3px",
                width: "100%"
              }}
            />
          </label>
          <button
            type="submit"
            style={{
              padding: "10px 20px",
              backgroundColor: "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: "3px",
              cursor: "pointer"
            }}>
            {editRecord ? "Update Record" : "Add Record"}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Breeding;
