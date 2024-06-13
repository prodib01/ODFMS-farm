import React, { useEffect, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import Modal from "react-modal";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../css/Calendar.css";
import { FaEdit, FaTrash } from "react-icons/fa";

Modal.setAppElement("#root");

const localizer = momentLocalizer(moment);

const Weather = () => {
  const [loading, setLoading] = useState(true);
  const [eventData, setEventData] = useState([]);
  const [selectedDateEvents, setSelectedDateEvents] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentEvent, setCurrentEvent] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const token = localStorage.getItem("token");

  const fetchEvents = async () => {
    try {
      const response = await fetch("http://localhost:8080/calendar/getevents", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      setEventData(data.data);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  useEffect(() => {
    async function fetchData() {
      await fetchEvents();
      setLoading(false);
    }
    fetchData();
  }, []);

  const handleDateSelect = (slotInfo) => {
    const selectedDate = moment(slotInfo.start).format("YYYY-MM-DD");
    const eventsForDate = eventData.filter(
      (event) => moment(event.date).format("YYYY-MM-DD") === selectedDate
    );

    if (eventsForDate.length === 0) {
      const confirmAddEvent = window.confirm("Do you want to add an event for this date?");
      if (confirmAddEvent) {
        setShowAddModal(true);
        setCurrentEvent({ date: selectedDate }); // Pre-fill the date
      }
    } else {
      setSelectedDateEvents(eventsForDate);
      setShowEventModal(true);
    }
  };

  const handleEventClick = (event) => {
    const selectedDate = moment(event.date).format("YYYY-MM-DD");
    const eventsForDate = eventData.filter(
      (ev) => moment(ev.date).format("YYYY-MM-DD") === selectedDate
    );
    setSelectedDateEvents(eventsForDate);
    setShowEventModal(true);
  };

  const handleCloseEventModal = () => {
    setShowEventModal(false);
    setSelectedDateEvents([]);
  };

  const handleAddButtonClick = () => {
    setShowAddModal(true);
    setCurrentEvent({ date: selectedDateEvents[0].date }); // Use the selected date
    setShowEventModal(false); // Close the event modal
  };

  const handleEdit = (event) => {
    setCurrentEvent(event);
    setShowEditModal(true);
  };

  const handleDelete = async (eventToDelete) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this event?");
    if (confirmDelete) {
      try {
        const response = await fetch(
          `http://localhost:8080/calendar/deleteevent/${eventToDelete.id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            }
          }
        );
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error deleting event:", errorData);
          throw new Error(`Error deleting event: ${errorData.message}`);
        }
        setEventData((prevRecords) => prevRecords.filter((rec) => rec.id !== eventToDelete.id));
        setSelectedDateEvents((prevEvents) =>
          prevEvents.filter((event) => event.id !== eventToDelete.id)
        );
      } catch (error) {
        console.error("Error deleting event:", error);
      }
    }
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setCurrentEvent((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `http://localhost:8080/calendar/updateevent/${currentEvent.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(currentEvent)
        }
      );
      if (!response.ok) {
        throw new Error("Error updating event");
      }
      setEventData((prev) =>
        prev.map((event) => (event.id === currentEvent.id ? currentEvent : event))
      );
      setShowEditModal(false);
    } catch (error) {
      console.error("Error updating event:", error);
    }
  };

  const handleAddFormSubmit = async (formData) => {
    try {
      const response = await fetch("http://localhost:8080/calendar/addevent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (!response.ok) {
        throw new Error("Error adding new entry");
      }
      const newEntry = await response.json();
      setEventData((prev) => [...prev, newEntry.data]);
      setShowAddModal(false);
    } catch (error) {
      console.error("Error adding new entry:", error);
    }
  };

  const events = eventData.map((event) => ({
    ...event,
    start: new Date(event.date),
    end: new Date(event.date)
  }));

  const eventStyleGetter = () => ({
    style: {
      backgroundColor: "#3174ad"
    }
  });

  const modalStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      backgroundColor: "#FFF",
      opacity: 1,
      padding: "20px",
      borderRadius: "8px",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)"
    },
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.75)",
      zIndex: 1000
    }
  };

  return (
    <div className="calendar-container">
      <div className="calendar">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 500, width: 800 }}
          selectable
          onSelectSlot={handleDateSelect}
          onSelectEvent={handleEventClick}
          eventPropGetter={eventStyleGetter}
        />
      </div>
      <Modal
        isOpen={showEventModal}
        onRequestClose={handleCloseEventModal}
        contentLabel="Event Details"
        style={modalStyles}>
        {selectedDateEvents.length > 0 ? (
          <div>
            <div className="add-btn-container">
              <button className="add-btn" onClick={handleAddButtonClick}>
                Add Event
              </button>
            </div>
            <h2>Events on {selectedDateEvents[0].date}</h2>
            {selectedDateEvents.length > 1 ? (
              <p>{`+${selectedDateEvents.length - 1} more events`}</p>
            ) : null}
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {selectedDateEvents.map((event) => (
                  <tr key={event.id}>
                    <td>{event.title}</td>
                    <td>{event.description}</td>
                    <td>{event.start_time}</td>
                    <td>{event.end_time}</td>
                    <td>
                      <button onClick={() => handleEdit(event)}>
                        <FaEdit />
                      </button>
                      <button onClick={() => handleDelete(event)}>
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={handleCloseEventModal}>Close</button>
          </div>
        ) : (
          <div>
            <h2>No events on this date</h2>
            <button onClick={handleCloseEventModal}>Close</button>
          </div>
        )}
      </Modal>
      <Modal
        isOpen={showEditModal}
        onRequestClose={() => setShowEditModal(false)}
        contentLabel="Edit Event"
        style={modalStyles}>
        <h2>Edit Event</h2>
        <form onSubmit={handleEditFormSubmit}>
          <label>
            Title:
            <input
              type="text"
              name="title"
              value={currentEvent?.title || ""}
              onChange={handleEditFormChange}
            />
          </label>
          <br />
          <label>
            Description:
            <input
              type="text"
              name="description"
              value={currentEvent?.description || ""}
              onChange={handleEditFormChange}
            />
          </label>
          <br />
          <label>
            Date:
            <input
              type="date"
              name="date"
              value={currentEvent?.date || ""}
              onChange={handleEditFormChange}
            />
          </label>
          <br />
          <label>
            Start Time:
            <input
              type="time"
              name="start_time"
              value={currentEvent?.start_time || ""}
              onChange={handleEditFormChange}
            />
          </label>
          <br />
          <label>
            End Time:
            <input
              type="time"
              name="end_time"
              value={currentEvent?.end_time || ""}
              onChange={handleEditFormChange}
            />
          </label>
          <br />
          <button type="submit">Save</button>
          <button type="button" onClick={() => setShowEditModal(false)}>
            Cancel
          </button>
        </form>
      </Modal>
      <Modal
        isOpen={showAddModal}
        onRequestClose={() => setShowAddModal(false)}
        contentLabel="Add Entry"
        style={modalStyles}>
        <h2>Add Event</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formattedDate = new Date(currentEvent.date).toISOString().split("T")[0];
            handleAddFormSubmit({
              title: e.target.title.value,
              description: e.target.description.value,
              date: currentEvent && formattedDate ? formattedDate : "", // Check if currentEvent is defined and has a date property
              start_time: e.target.start_time.value,
              end_time: e.target.end_time.value
            });
            window.location.reload();
          }}>
          <label>
            Title:
            <input type="text" name="title" required />
          </label>
          <br />
          <label>
            Description:
            <input type="text" name="description" />
          </label>
          <br />
          {currentEvent && currentEvent.date && (
            <label>
              Date:
              <span>{currentEvent.date}</span> {/* Render the date as text */}
            </label>
          )}
          <br />
          <label>
            Start Time:
            <input type="time" name="start_time" required />
          </label>
          <br />
          <label>
            End Time:
            <input type="time" name="end_time" required />
          </label>
          <br />
          <button type="submit">Save</button>
          <button type="button" onClick={() => setShowAddModal(false)}>
            Cancel
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Weather;
