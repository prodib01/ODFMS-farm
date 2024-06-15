import React, { useEffect, useState } from "react";
import { FaEdit, FaEye, FaTrash } from "react-icons/fa";
import Modal from "react-modal";
import "../css/task.css";

Modal.setAppElement("#root"); // Assuming "root" is your root element ID

const Task = () => {
  const token = localStorage.getItem("token");
  const [taskData, setTaskData] = useState([]);
  const [userDetails, setUserDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [newTask, setNewTask] = useState({
    id: 0,
    title: "",
    description: "",
    priority: "Low",
    due_date: "",
    category: "",
    status: "",
    assigned_to: ""
  });
   const [currentPage, setCurrentPage] = useState(1);
   const [itemsPerPage] = useState(8);
  const [detailsModalIsOpen, setDetailsModalIsOpen] = useState(false);
  const [viewTask, setViewTask] = useState(null);

  const openModal = () => setModalIsOpen(true);
  const closeModal = () => {
    setModalIsOpen(false);
    setEditTask(null);
  };

  const openDetailsModal = () => setDetailsModalIsOpen(true);
  const closeDetailsModal = () => setDetailsModalIsOpen(false);

  useEffect(() => {
    async function fetchData() {
      await Promise.all([fetchTasks(), fetchUser()]);
      setLoading(false);
    }
    fetchData();
  }, []);

 useEffect(() => {
   if (editTask) {
     const formattedDate = new Date(editTask.due_date).toISOString().split("T")[0];
     setNewTask({
       id: editTask.id,
       title: editTask.title,
       description: editTask.description,
       priority: editTask.priority,
       due_date: formattedDate,
       category: editTask.category,
       status: editTask.status,
       assigned_to: editTask.assigned_to
     });
   } else {
     setNewTask({
       id: 0,
       title: "",
       description: "",
       priority: "Low",
       due_date: "",
       category: "",
       status: "",
       assigned_to: ""
     });
   }
 }, [editTask]);


const fetchTasks = async () => {
  try {
    const response = await fetch("http://localhost:8080/task/gettask", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      }
    });
    const data = await response.json();
    setTaskData(data.data); // Assuming data.data contains the array of tasks
  } catch (error) {
    console.error("Error fetching tasks:", error);
  }
};



  const fetchUser = async () => {
    try {
      const response = await fetch("http://localhost:8080/users/getStaff", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      const userObject = data.staff.map((user) => ({
        [user.id]: user.full_name
      }));
      setUserDetails(Object.assign({}, ...userObject));
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = value;

    if (type === "checkbox") {
      newValue = checked ? value : "";
    } else if (name === "priority") {
      // If the priority slider is used, convert it to a string matching the labels
      newValue = value;
    } else if (type === "date") {
      const formattedDate = new Date(value).toISOString().split("T")[0];
      setNewTask((prevTask) => ({
        ...prevTask,
        [name]: formattedDate
      }));
    }

    setNewTask((prev) => ({
      ...prev,
      [name]: newValue
    }));
  };

 const handleSubmit = async (e) => {
   e.preventDefault();

   const priorityMapping = {
     1: "Low",
     2: "Medium",
     3: "High"
   };

   const taskToSubmit = {
     ...newTask,
     priority: priorityMapping[newTask.priority] || newTask.priority
   };

   try {
     if (editTask) {
       const response = await fetch(`http://localhost:8080/task/updatetask/${taskToSubmit.id}`, {
         method: "PATCH",
         headers: {
           "Content-Type": "application/json",
           Authorization: `Bearer ${token}`
         },
         body: JSON.stringify(taskToSubmit)
       });
       const data = await response.json();
       setTaskData((prev) => prev.map((task) => (task.id === editTask.id ? data.data : task)));
     } else {
       const response = await fetch("http://localhost:8080/task/addtask", {
         method: "POST",
         headers: {
           "Content-Type": "application/json",
           Authorization: `Bearer ${token}`
         },
         body: JSON.stringify(taskToSubmit)
       });
       const data = await response.json();
       setTaskData((prev) => [...prev, data.data]);
     }
     closeModal();
     window.location.reload(); // <-- Refresh the page
   } catch (error) {
     console.error("Error adding/updating task:", error);
   }
 };



  const handleViewTask = (task) => {
    setViewTask({
      ...task,
      due_date: new Date(task.due_date).toISOString().split("T")[0] // Format the due_date
    });
    openDetailsModal();
  };

  if (loading) return <p>Loading.....</p>;

  const getPriorityLabel = (value) => {
    switch (value) {
      case "1":
        return "Low";
      case "2":
        return "Medium";
      case "3":
        return "High";
      default:
        return "Low";
    }
  };

const handleDelete = async (taskToDelete) => {
  const confirmDelete = window.confirm(
    "Are you sure you want to delete this record from the storage?"
  );
  if (confirmDelete) {
    try {
      const response = await fetch(`http://localhost:8080/task/deletetask/${taskToDelete.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error("Error deleting task");
      }
      setTaskData((prevRecords) => prevRecords.filter((rec) => rec.id !== taskToDelete.id));
      window.location.reload(); // <-- Refresh the page
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  }
};

    const totalPages = Math.ceil(taskData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currenttaskData = taskData.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (page) => {
      if (page > 0 && page <= totalPages) {
        setCurrentPage(page);
      }
    };

  return (
    <div task-container>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "10px"
        }}>
        <button
          onClick={openModal}
          style={{
            padding: "8px 10px",
            backgroundColor: "007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
          }}>
          Add Task
        </button>
      </div>
      <div className="table-wrapper">
        <table className="task-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {taskData.length > 0 ? (
              currenttaskData.map((task) => {
                if (!task || !task.title || !task.id) return null; // <-- Check for task existence and title

                return (
                  <tr key={task.id}>
                    <td>{task.title}</td>
                    <td>{task.category}</td>
                    <td>{task.priority}</td>
                    <td>{task.status}</td>
                    <td>
                      <button className="action-btn view-btn" onClick={() => handleViewTask(task)}>
                        <FaEye />
                      </button>
                      <button
                        className="action-btn edit-btn"
                        onClick={() => {
                          setEditTask(task);
                          openModal();
                        }}>
                        <FaEdit />
                      </button>
                      <button className="action-btn delete-btn" onClick={() => handleDelete(task)}>
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5">No tasks available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for Adding/Editing Task */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Add Task"
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
        <h2>{editTask ? "Edit Task" : "Add New Task"}</h2>
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column"
          }}>
          <label style={{ marginBottom: "10px" }}>
            Title:
            <input
              type="text"
              name="title"
              value={newTask.title}
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
          <label style={{ marginBottom: "10px" }}>
            Description:
            <textarea
              name="description"
              value={newTask.description}
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
          <label style={{ marginBottom: "10px" }}>
            Priority:
            <input
              type="range"
              name="priority"
              value={newTask.priority}
              onChange={handleChange}
              min="1"
              max="3"
              step="1"
              style={{
                marginBottom: "10px",
                width: "100%"
              }}
            />
            <span>{getPriorityLabel(newTask.priority)}</span>
          </label>
          <label style={{ marginBottom: "10px" }}>
            Due Date:
            <input
              type="date"
              format="yyyy-mm-dd"
              name="due_date"
              value={newTask.due_date}
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
          <label style={{ marginBottom: "10px" }}>
            Category:
            <input
              type="text"
              name="category"
              value={newTask.category}
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
          <label style={{ marginBottom: "10px" }}>Status:</label>
          <div style={{ display: "flex", flexDirection: "row", marginBottom: "10px" }}>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                marginRight: "20px"
              }}>
              <input
                type="checkbox"
                name="status"
                value="Incomplete"
                checked={newTask.status === "Incomplete"}
                onChange={handleChange}
                style={{ marginRight: "5px" }}
              />
              <span>Incomplete</span>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                marginRight: "20px"
              }}>
              <input
                type="checkbox"
                name="status"
                value="Pending"
                checked={newTask.status === "Pending"}
                onChange={handleChange}
                style={{ marginRight: "5px" }}
              />
              <span>Pending</span>
            </div>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
              <input
                type="checkbox"
                name="status"
                value="Complete"
                checked={newTask.status === "Complete"}
                onChange={handleChange}
                style={{ marginRight: "5px" }}
              />
              <span>Complete</span>
            </div>
          </div>

          <label style={{ marginBottom: "10px" }}>
            Assigned to:
            <select
              name="assigned_to"
              value={newTask.assigned_to}
              onChange={handleChange}
              style={{
                padding: "8px",
                marginBottom: "10px",
                border: "1px solid #ccc",
                borderRadius: "3px",
                width: "100%"
              }}>
              <option value="">Select a user</option>
              {Object.entries(userDetails).map(([id, full_name]) => (
                <option key={id} value={id}>
                  {full_name}
                </option>
              ))}
            </select>
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
            {editTask ? "Update Task" : "Add Task"}
          </button>
        </form>
      </Modal>

      {/* Modal for Viewing Task Details */}
      {viewTask && (
        <Modal
          isOpen={detailsModalIsOpen}
          onRequestClose={closeDetailsModal}
          contentLabel="Task Details"
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
            onClick={closeDetailsModal}
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
          <h2>Task Details</h2>
          <div style={{ marginBottom: "10px" }}>
            <strong>Title:</strong> {viewTask.title}
          </div>
          <div style={{ marginBottom: "10px" }}>
            <strong>Description:</strong> {viewTask.description}
          </div>
          <div style={{ marginBottom: "10px" }}>
            <strong>Priority:</strong> {viewTask.priority}
          </div>
          <div style={{ marginBottom: "10px" }}>
            <strong>Due Date:</strong> {viewTask.due_date}
          </div>
          <div style={{ marginBottom: "10px" }}>
            <strong>Category:</strong> {viewTask.category}
          </div>
          <div style={{ marginBottom: "10px" }}>
            <strong>Status:</strong> {viewTask.status}
          </div>
          <div style={{ marginBottom: "10px" }}>
            <strong>Assigned to:</strong> {userDetails[viewTask.assigned_to]}
          </div>
        </Modal>
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
    </div>
  );
};

export default Task;
