import React, { useEffect, useState } from "react";
import DropdownButton from "react-bootstrap/DropdownButton";
import Dropdown from "react-bootstrap/Dropdown";
import Modal from "react-bootstrap/Modal";
import { FaEdit, FaTrash } from "react-icons/fa";
import '../css/feeding.css';

const Feeding = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    cost_per_unit: "",
    unit: "",
    feed_id: "",
    quantity: "",
    cow: "",
    schedule_date: "",
    feeding_schedule_id: ""
  });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(8);
  const [error, setError] = useState(null);
  const [cows, setCows] = useState([]);
  const [feeds, setFeeds] = useState([]);
  const [feedingSchedules, setFeedingSchedules] = useState([]);
  const [refreshTable, setRefreshTable] = useState(false); // State for triggering page refresh
  const token = localStorage.getItem("token");
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const cowsResponse = await fetch("http://localhost:8080/cow/getCowDetailsByOwner", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (!cowsResponse.ok) throw new Error("Failed to fetch cows");
        const cowsData = await cowsResponse.json();
        setCows(cowsData.cows || []);

        const feedsResponse = await fetch("http://localhost:8080/feed/getfeeds", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (!feedsResponse.ok) throw new Error("Failed to fetch feeds");
        const feedsData = await feedsResponse.json();
        setFeeds(feedsData.feeds || []);

        const feedingSchedulesResponse = await fetch("http://localhost:8080/feed/getschedules", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (!feedingSchedulesResponse.ok) throw new Error("Failed to fetch feeding schedules");
        const feedingSchedulesData = await feedingSchedulesResponse.json();

        const schedules = Array.isArray(feedingSchedulesData.schedules)
          ? feedingSchedulesData.schedules.map((schedule) => ({
              feeding_schedule_id: schedule.id,
              cow_id: schedule.cow,
              feed_id: schedule.feed_id,
              quantity: schedule.quantity,
              schedule_date: new Date(schedule.schedule_date).toISOString().split("T")[0],
              total_cost: schedule.total_cost
            }))
          : [];

        setFeedingSchedules(schedules);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to fetch data");
      }
    };

    fetchData();
  }, [token, refreshTable]); // Include refreshTable in dependencies to trigger reload

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    setIsEditing(false);
    setFormData({
      name: "",
      cost_per_unit: "",
      unit: "",
      feed_id: "",
      quantity: "",
      cow: "",
      schedule_date: "",
      feeding_schedule_id: ""
    });
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (
      name === "quantity" ||
      name === "cow" ||
      name === "feed_id" ||
      name === "feeding_schedule_id"
    ) {
      setFormData({
        ...formData,
        [name]: parseInt(value, 10) || 0 // Ensure quantity is parsed to integer
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleEditClick = (record) => {
    setSelectedOption(record.hasOwnProperty("name") ? "feeds" : "feedingSchedule");
    setFormData({
      ...record,
      name: record.name || "",
      cost_per_unit: record.cost_per_unit || "",
      unit: record.unit || "",
      feed_id: record.feed_id,
      quantity: record.quantity || "",
      cow: record.cow_id || "",
      schedule_date: record.schedule_date
        ? new Date(record.schedule_date).toISOString().split("T")[0]
        : "",
      feeding_schedule_id: record.feeding_schedule_id
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDeleteClick = async (id) => {
    const endpoint = `http://localhost:8080/feed/deletefeedingschedules/${id}`;
    try {
      const response = await fetch(endpoint, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete record");
      }
      console.log("Record deleted successfully");
      setRefreshTable(!refreshTable); // Toggle refreshTable state to trigger reload
    } catch (error) {
      console.error("Error deleting record:", error);
      setError(error.message || "Failed to delete record");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    let endpoint = "";
    let method = "POST";
    if (isEditing) {
      endpoint = `http://localhost:8080/feed/${selectedOption === "feeds" ? "updatefeedingschedules" : "updatefeedingschedules"}/${selectedOption === "feeds" ? formData.feed_id : formData.feeding_schedule_id}`;
      method = "PATCH";
    } else {
      switch (selectedOption) {
        case "feeds":
          endpoint = "http://localhost:8080/feed/addfeed";
          break;
        case "feedingSchedule":
          endpoint = "http://localhost:8080/feed/addfeedingschedules";
          break;
        case "feedInventory":
          endpoint = "http://localhost:8080/feed/addfeedinventory";
          break;
        default:
          break;
      }
    }

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add/update record");
      }
      console.log("Record added/updated successfully");
      setShowModal(false);
      setRefreshTable(!refreshTable); // Trigger page reload
    } catch (error) {
      console.error("Error adding/updating record:", error);
      setError(error.message || "Failed to add/update record");
    }
  };

  const getCowTag = (cowId) => {
    const cow = cows.find((cow) => cow.id === cowId);
    return cow ? cow.cow_tag : "Unknown";
  };

  const getFeedName = (feedId) => {
    const feed = feeds.find((feed) => feed.id === feedId);
    return feed ? feed.name : "Unknown";
  };

  const totalPages = Math.ceil(feedingSchedules.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentfeedingSchedules = feedingSchedules.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };



  return (
    <div className="feeding-container">
      <DropdownButton
        id="dropdown-item-button"
        title="Add Records"
        style={{
          padding: "10px 20px",
          color: "white",
          borderRadius: "4px",
          border: "none",
          cursor: "pointer",
          fontSize: "14px"
        }}>
        <Dropdown.Item as="button" onClick={() => handleOptionSelect("feeds")}>
          Feeds
        </Dropdown.Item>
        <Dropdown.Item as="button" onClick={() => handleOptionSelect("feedingSchedule")}>
          Feeding Schedule
        </Dropdown.Item>
        <Dropdown.Item as="button" onClick={() => handleOptionSelect("feedInventory")}>
          Feed Inventory
        </Dropdown.Item>
      </DropdownButton>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {isEditing ? "Edit" : "Add"} {selectedOption} Record
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <div style={{ color: "red" }}>{error}</div>}
          <form onSubmit={handleSubmit}>
            {selectedOption === "feeds" && (
              <>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px"
                  }}>
                  Name:
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  style={{
                    width: "calc(100% -16px)",
                    padding: "8px",
                    boxSizing: "border-box",
                    marginBottom: "8px"
                  }}
                />
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px"
                  }}>
                  Cost per Unit:
                </label>
                <input
                  type="number"
                  name="cost_per_unit"
                  value={formData.cost_per_unit}
                  onChange={handleChange}
                  required
                  style={{
                    width: "calc(100% -16px)",
                    padding: "8px",
                    boxSizing: "border-box",
                    marginBottom: "8px"
                  }}
                />
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px"
                  }}>
                  Unit:
                </label>
                <input
                  type="text"
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  required
                  style={{
                    width: "calc(100% -16px)",
                    padding: "8px",
                    boxSizing: "border-box",
                    marginBottom: "8px"
                  }}
                />
              </>
            )}
            {selectedOption === "feedingSchedule" && (
              <>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px"
                  }}>
                  Cow:
                </label>
                <select
                  name="cow"
                  value={formData.cow}
                  onChange={handleChange}
                  required
                  style={{
                    width: "calc(100% -16px)",
                    padding: "8px",
                    boxSizing: "border-box",
                    marginBottom: "8px"
                  }}>
                  <option value="">Select Cow</option>
                  {cows.map((cow) => (
                    <option key={cow.id} value={cow.id}>
                      {cow.cow_tag}
                    </option>
                  ))}
                </select>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px"
                  }}>
                  Feed:
                </label>
                <select
                  name="feed_id"
                  value={formData.feed_id}
                  onChange={handleChange}
                  required
                  style={{
                    width: "calc(100% -16px)",
                    padding: "8px",
                    boxSizing: "border-box",
                    marginBottom: "8px"
                  }}>
                  <option value="">Select Feed</option>
                  {feeds.map((feed) => (
                    <option key={feed.id} value={feed.id}>
                      {feed.name}
                    </option>
                  ))}
                </select>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px"
                  }}>
                  Quantity:
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                  style={{
                    width: "calc(100% -16px)",
                    padding: "8px",
                    boxSizing: "border-box",
                    marginBottom: "8px"
                  }}
                />
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px"
                  }}>
                  Schedule Date:
                </label>
                <input
                  type="date"
                  name="schedule_date"
                  value={formData.schedule_date}
                  onChange={handleChange}
                  required
                  style={{
                    width: "calc(100% -16px)",
                    padding: "8px",
                    boxSizing: "border-box",
                    marginBottom: "8px"
                  }}
                />
              </>
            )}
            {selectedOption === "feedInventory" && (
              <>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px"
                  }}>
                  Feed:
                </label>
                <select
                  name="feed_id"
                  value={formData.feed_id}
                  onChange={handleChange}
                  required
                  style={{
                    width: "calc(100% -16px)",
                    padding: "8px",
                    boxSizing: "border-box",
                    marginBottom: "8px"
                  }}>
                  <option value="">Select Feed</option>
                  {feeds.map((feed) => (
                    <option key={feed.id} value={feed.id}>
                      {feed.name}
                    </option>
                  ))}
                </select>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px"
                  }}>
                  Quantity:
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                  style={{
                    width: "calc(100% -16px)",
                    padding: "8px",
                    boxSizing: "border-box",
                    marginBottom: "8px"
                  }}
                />
              </>
            )}
            <button
              type="submit"
              style={{
                display: "block",
                backgroundColor: "#4caf50",
                color: "white",
                padding: "10px 20px",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer"
              }}>
              Submit
            </button>
          </form>
        </Modal.Body>
      </Modal>

      <div className="table-wrapper">
        <table className="feeding-table">
          <thead>
            <tr>
              <th>Cow Tag</th>
              <th>Feed</th>
              <th>Quantity</th>
              <th>Schedule Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {feedingSchedules.length > 0 ? (
              currentfeedingSchedules.map((schedule) => (
                <tr key={schedule.feeding_schedule_id}>
                  <td>{getCowTag(schedule.cow_id)}</td>
                  <td>{getFeedName(schedule.feed_id)}</td>
                  <td>{schedule.quantity}</td>
                  <td>{new Date(schedule.schedule_date).toLocaleDateString()}</td>{" "}
                  <td>
                    <button
                      className="action-btn edit-btn"
                      onClick={() => handleEditClick(schedule)}>
                      <FaEdit />
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleDeleteClick(schedule.feeding_schedule_id)}>
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">Loading...</td>
              </tr>
            )}
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
    </div>
  );
};

export default Feeding;
