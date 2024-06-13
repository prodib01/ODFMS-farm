import React, { useEffect, useRef, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import Modal from "react-bootstrap/Modal";
import "bootstrap/dist/css/bootstrap.min.css";

const Feeding = () => {
  const [feeds, setFeeds] = useState([]);
  const [cows, setCows] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [feed, setFeed] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    name: "",
    cost_per_unit: "",
    unit: "",
    quantity: "",
    feed_id: "",
    cow_tag: "",
    schedule_date: "",
    total_cost: ""
  });

  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);
  const [showDropdown, setShowDropdown] = useState(false);

const fetchFeeds = async () => {
  try {
    const response = await fetch("http://localhost:8080/feed/getFeedingScheduleById", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      if (data && Array.isArray(data.schedule)) {
        setFeeds(data.schedule); // Update state with the fetched feeding schedules
      } else {
        setError("Feeding schedules data is not in the expected format.");
      }
    } else {
      setError("Failed to fetch feeding schedules: " + response.statusText);
    }
  } catch (error) {
    setError("Error fetching feeding schedules: " + error.message);
  } finally {
    setLoading(false);
  }
};

  const fetchCows = async () => {
    try {
      const response = await fetch("http://localhost:8080/cow/getCowDetailsByOwner", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data && Array.isArray(data.cows)) {
          setCows(data.cows);
        } else {
          setError("Cows data is not in the expected format.");
        }
      } else {
        setError("Failed to fetch cows: " + response.statusText);
      }
    } catch (error) {
      setError("Error fetching cows: " + error.message);
    } finally {
      setLoading(false);
    }
  };

const fetchFeed = async () => {
  try {
    // Make a request to your backend endpoint for fetching feeds
    const response = await fetch("http://localhost:8080/feed/getfeeds", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      if (data && Array.isArray(data.feeds)) {
        setFeeds(data.feeds); // Update state with the fetched feeds
      } else {
        setError("Feeds data is not in the expected format.");
      }
    } else {
      setError("Failed to fetch feeds: " + response.statusText);
    }
  } catch (error) {
    setError("Error fetching feeds: " + error.message);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchFeeds();
    fetchCows();
    fetchFeed();
  }, [token]);

  const handleEdit = (feed) => {
    setFeed(feed);
    setFormData({
      ...formData,
      name: feed.name,
      cost_per_unit: feed.cost_per_unit,
      unit: feed.unit
    });
    setShowModal(true);
    setSelectedOption("edit");
  };

  const handleDelete = async (feedId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this feed?");

    if (confirmDelete) {
      try {
        const response = await fetch(`http://localhost:8080/feed/deletefeed/${feedId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || "Failed to delete");
        }

        setFeeds((prevFeeds) => prevFeeds.filter((feed) => feed.id !== feedId));
      } catch (error) {
        setError("Error deleting feed: " + error.message);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prevData) => {
      let updatedData = { ...prevData, [name]: value };

      if (name === "cow_tag") {
        const selectedCow = cows.find((cow) => cow.cow_tag === value);
        updatedData.cow_id = selectedCow ? selectedCow.id : "";
      }

      return updatedData;
    });
  };

  const handleClickOutside = (event) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target) &&
      buttonRef.current &&
      !buttonRef.current.contains(event.target)
    ) {
      setShowDropdown(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleButtonClick = () => {
    setShowDropdown((prev) => !prev);
  };

  const handleOptionClick = (option) => {
    setSelectedOption(option);
    setShowModal(true);
    setShowDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const urlMap = {
      feeds: "http://localhost:8080/feed/addfeed",
      inventory: "http://localhost:8080/feed/addfeedinventory",
      schedules: "http://localhost:8080/feed/addfeedingschedules",
      costs: "http://localhost:8080/feed/feedingcosts"
    };

    const endpoint =
      selectedOption === "edit"
        ? `http://localhost:8080/feed/updatefeed/${feed.id}`
        : urlMap[selectedOption];
    const method = selectedOption === "edit" ? "PATCH" : "POST";

    try {
      const response = await fetch(endpoint, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setShowModal(false);
        if (selectedOption === "edit") {
          setFeeds((prevFeeds) =>
            prevFeeds.map((prevFeed) =>
              prevFeed.id === feed.id ? { ...prevFeed, ...formData } : prevFeed
            )
          );
        } else {
          fetchFeeds();
        }
      } else {
        const errorData = await response.json();
        setError(
          `Failed to ${selectedOption === "edit" ? "update" : "add"} record: ${errorData.message || response.statusText}`
        );
      }
    } catch (error) {
      setError(
        `Error ${selectedOption === "edit" ? "updating" : "adding"} record: ${error.message}`
      );
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (feeds.length === 0) {
    return <div>No feeds available.</div>;
  }

  return (
    <div>
      <div style={{ position: "absolute", marginTop: "10px", right: "10px" }}>
        <DropdownButton
          align="end"
          title="Add Records"
          id="dropdown-menu-align-end"
          ref={buttonRef}
          show={showDropdown}
          onClick={handleButtonClick}>
          <Dropdown.Item onClick={() => handleOptionClick("feeds")}>Feeds</Dropdown.Item>
          <Dropdown.Item onClick={() => handleOptionClick("inventory")}>
            Feed Inventory
          </Dropdown.Item>
          <Dropdown.Item onClick={() => handleOptionClick("schedules")}>
            Feeding Schedules
          </Dropdown.Item>
          <Dropdown.Item onClick={() => handleOptionClick("costs")}>Feeding Costs</Dropdown.Item>
        </DropdownButton>
      </div>
      <h1>Feeding Schedules</h1>
      <table>
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
          {feeds.map((schedule) => (
            <tr key={schedule.id}>
              <td>{schedule.cow ? schedule.cow.cow_tag : "Unknown Cow"}</td>
              <td>{feeds.find((feed) => feed.id === schedule.feed_id)?.name}</td>
              <td>{schedule.quantity}</td>
              <td>{schedule.schedule_date}</td>
              <td>
                <button onClick={() => handleEdit(schedule)}>
                  <FaEdit />
                </button>
                <button onClick={() => handleDelete(schedule.id)}>
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedOption
              ? `Add ${selectedOption.charAt(0).toUpperCase() + selectedOption.slice(1)}`
              : ""}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOption === "feeds" && (
            <form onSubmit={handleSubmit}>
              <label>
                Name:
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Cost per Unit:
                <input
                  type="number"
                  name="cost_per_unit"
                  value={formData.cost_per_unit}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Unit:
                <input
                  type="text"
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  required
                />
              </label>
              <button type="submit">Save</button>
            </form>
          )}
          {selectedOption === "inventory" && (
            <form onSubmit={handleSubmit}>
              <label>
                Feed:
                <select name="feed_id" value={formData.feed_id} onChange={handleChange} required>
                  <option value="" disabled>
                    Select Feed
                  </option>
                  {feeds.map((feed) => (
                    <option key={feed.id} value={feed.id}>
                      {feed.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Quantity:
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                />
              </label>
              <button type="submit">Save</button>
            </form>
          )}
          {selectedOption === "schedules" && (
            <form onSubmit={handleSubmit}>
              <label>
                Cow Tag:
                <select name="cow_tag" value={formData.cow_tag} onChange={handleChange} required>
                  <option value="" disabled>
                    Select Cow Tag
                  </option>
                  {cows.map((cow) => (
                    <option key={cow.cow_tag} value={cow.cow_tag}>
                      {cow.cow_tag}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Feed:
                <select name="feed_id" value={formData.feed_id} onChange={handleChange} required>
                  <option value="" disabled>
                    Select Feed
                  </option>
                  {feeds.map((feed) => (
                    <option key={feed.id} value={feed.id}>
                      {feed.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Quantity:
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Schedule Date:
                <input
                  type="date"
                  name="schedule_date"
                  value={formData.schedule_date}
                  onChange={handleChange}
                  required
                />
              </label>
              <button type="submit">Save</button>
            </form>
          )}
          {selectedOption === "costs" && (
            <form onSubmit={handleSubmit}>
              <label>
                Cow Tag:
                <select name="cow_tag" value={formData.cow_tag} onChange={handleChange} required>
                  <option value="" disabled>
                    Select Cow Tag
                  </option>
                  {cows.map((cow) => (
                    <option key={cow.cow_tag} value={cow.cow_tag}>
                      {cow.cow_tag}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Total Cost:
                <input
                  type="number"
                  name="total_cost"
                  value={formData.total_cost}
                  onChange={handleChange}
                  required
                />
              </label>
              <button type="submit">Save</button>
            </form>
          )}
          {selectedOption === "edit" && (
            <form onSubmit={handleSubmit}>
              <label>
                Name:
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Cost per Unit:
                <input
                  type="number"
                  name="cost_per_unit"
                  value={formData.cost_per_unit}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Unit:
                <input
                  type="text"
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  required
                />
              </label>
              <button type="submit">Save</button>
            </form>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Feeding;
