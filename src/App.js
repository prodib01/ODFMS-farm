import "./App.css";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Sign from "./Pages/Sign";
import Dashboard from "./Pages/Dashboard";
import Analysis from "./Pages/Analysis";
import Monitoring from "./Pages/Monitoring";
import Production from "./Pages/Production";
import Feeding from "./Pages/Feeding";
import Breeding from "./Pages/Breeding";
import Task from "./Pages/Task";
import Calendar from "./Pages/Calendar";
import Profile from "./Pages/Profile";
import ProtectedRoute from "./Pages/ProtectedRoute";
import { AuthProvider } from "./Pages/AuthContext";
import Staff from "./Pages/Staff";

function App() {
  return (
    <div className="app">
      {/* <button onClick={apiCall}>Make API Call</button> */}

      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Sign />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>

            <Route path="/dashboard" element={<Dashboard />}>
              <Route index element={<Analysis />} />
              <Route path="analysis" element={<Analysis />} />
              <Route path="staff" element={<Staff />} />
              <Route path="monitoring" element={<Monitoring />} />
              <Route path="production" element={<Production />} />
              <Route path="feeding" element={<Feeding />} />
              <Route path="breeding" element={<Breeding />} />
              <Route path="task" element={<Task />} />
              <Route path="calendar" element={<Calendar />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;
