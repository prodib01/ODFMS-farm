import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import "../css/Dashboard.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { set, setMonth, setYear } from "date-fns";
import useCountUp from "../hooks/useCountUp";
import { CSSTransition } from "react-transition-group";

const Analysis = () => {
  const barChartRef = useRef(null);
  const lineChartRef = useRef(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [salesData, setSalesData] = useState([]);
  const [yearlySalesData, setYearlySalesData] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [staffData, setStaffData] = useState({ totalMales: 0, totalFemales: 0 });
  const barChartInstance = useRef(null);
  const lineChartInstance = useRef(null);
  const token = localStorage.getItem("token");
  const [herdData, setHerdData] = useState({ cows: [], bulls: [] });
  const [breedingData, setBreedingData] = useState({ pregnant: [], notpregnant: [] });
  const [healthData, setHealthData] = useState({ sickly: [], healthy: [] });
  const [taskData, setTaskData] = useState({ complete: [], pending: [], incomplete: [] });
  const [upcomingEvents, setUpcomingEvents] = useState({ upcomingevents: [] });

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const month = selectedDate.getMonth() + 1;
        const year = selectedDate.getFullYear();
        const response = await fetch(
          `http://localhost:8080/sales/getsalesbymonthyear?month=${month}&year=${year}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setSalesData(data.sales);
      } catch (error) {
        console.error("Error fetching sales data:", error);
      }
    };

    fetchSalesData();
  }, [selectedDate]);

  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      try {
        const response = await fetch("http://localhost:8080/calendar/getevents", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();
        const currentDate = new Date();
        const upcomingeventsCount = data.data.filter(
          (event) => new Date(event.date) > currentDate
        ).length;
        setUpcomingEvents({ upcomingevents: upcomingeventsCount });
      } catch (error) {
        console.error("Error fetching upcoming events:", error);
      }
    };

    fetchUpcomingEvents();
  }, []);

  useEffect(() => {
    const fetchYearlySalesData = async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/sales/getsalesbyyear?year=${selectedYear}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const result = await response.json();
        console.log("Yearly Sales Data:", result.data); // Debugging line
        setYearlySalesData(result.data || []);
      } catch (error) {
        console.error("Error fetching yearly sales data:", error);
      }
    };

    fetchYearlySalesData();
  }, [selectedYear]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch("http://localhost:8080/task/gettask", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();

        const completeCount = data.data.filter(
          (task) => task.status.toLowerCase() === "completed"
        ).length;
        const pendingCount = data.data.filter(
          (task) => task.status.toLowerCase() === "pending"
        ).length;
        const incompleteCount = data.data.filter(
          (task) => task.status.toLowerCase() === "incomplete"
        ).length;

        setTaskData({
          complete: completeCount,
          pending: pendingCount,
          incomplete: incompleteCount
        });
      } catch (error) {
        console.error("Error fetching tasks", error);
      }
    };
    fetchTasks();
  }, []);

  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        const response = await fetch(`http://localhost:8080/users/getStaff`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        const totalMales = data.staff.filter(
          (staff) => staff.gender.toLowerCase() === "male"
        ).length;
        const totalFemales = data.staff.filter(
          (staff) => staff.gender.toLowerCase() === "female"
        ).length;
        setStaffData({ totalMales, totalFemales });
      } catch (error) {
        console.error("Error fetching staff data:", error);
      }
    };

    fetchStaffData();
  }, []);

  useEffect(() => {
    const fetchHerdData = async () => {
      try {
        const response = await fetch(`http://localhost:8080/cow/getCowDetailsByOwner`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();

        // Add null checks before calling toLowerCase
        const cows = data.cows.filter(
          (cow) => cow.gender && cow.gender.toLowerCase() === "female"
        ).length;
        const bulls = data.cows.filter(
          (cow) => cow.gender && cow.gender.toLowerCase() === "male"
        ).length;
        setHerdData({ cows, bulls });

        const sickly = data.cows.filter(
          (cow) => cow.health_status && cow.health_status.toLowerCase() === "sickly"
        ).length;
        const healthy = data.cows.filter(
          (cow) => cow.health_status && cow.health_status.toLowerCase() === "healthy"
        ).length;
        setHealthData({ sickly, healthy });
      } catch (error) {
        console.error("Error fetching herd data:", error);
      }
    };
    fetchHerdData();
  }, []);

  useEffect(() => {
    const fetchBreedingData = async () => {
      try {
        const response = await fetch(`http://localhost:8080/breeding/getbreeding`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        const pregnantCount = data.data.filter(
          (breeding) => breeding.pregnancy_status === true
        ).length;
        const notPregnantCount = data.data.filter(
          (breeding) => breeding.pregnancy_status === false
        ).length;
        setBreedingData({ pregnant: pregnantCount, notpregnant: notPregnantCount });
      } catch (error) {
        console.error("Error fetching breeding data:", error);
      }
    };
    fetchBreedingData();
  }, []);

  useEffect(() => {
    const barData = {
      labels: salesData.map((sale) => sale.product_name),
      datasets: [
        {
          label: "Total Sales",
          backgroundColor: "rgba(75,192,192,1)",
          borderColor: "rgba(0,0,0,1)",
          borderWidth: 2,
          data: salesData.map((sale) => sale.totalsales)
        }
      ]
    };

    if (barChartRef.current) {
      if (barChartInstance.current) {
        barChartInstance.current.destroy();
      }
      barChartInstance.current = new Chart(barChartRef.current, {
        type: "bar",
        data: barData,
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }
  }, [salesData]);

  useEffect(() => {
    const monthlySales = Array(12).fill(0);

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December"
    ];

    yearlySalesData.forEach((entry) => {
      const monthIndex = monthNames.indexOf(entry.month);
      if (monthIndex !== -1) {
        monthlySales[monthIndex] = parseFloat(entry.totalsales);
      }
    });

    const lineData = {
      labels: monthNames,
      datasets: [
        {
          label: "Total Sales",
          backgroundColor: "rgba(75,192,192,0.2)",
          borderColor: "rgba(75,192,192,1)",
          borderWidth: 2,
          data: monthlySales,
          fill: false
        }
      ]
    };

    if (lineChartRef.current) {
      if (lineChartInstance.current) {
        lineChartInstance.current.destroy();
      }
      lineChartInstance.current = new Chart(lineChartRef.current, {
        type: "line",
        data: lineData,
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }
  }, [yearlySalesData]);

  const handleDateChange = (date) => {
    setSelectedDate(setYear(setMonth(new Date(), date.getMonth()), date.getFullYear()));
  };

  const handleYearChange = (date) => {
    setSelectedYear(date.getFullYear());
  };

  useEffect(() => {
    return () => {
      if (barChartInstance.current) {
        barChartInstance.current.destroy();
      }
      if (lineChartInstance.current) {
        lineChartInstance.current.destroy();
      }
    };
  }, []);

  const animatedTotalFemales = useCountUp(staffData.totalFemales);
  const animatedTotalMales = useCountUp(staffData.totalMales);
  const animatedTotalCows = useCountUp(herdData.cows);
  const animatedTotalBulls = useCountUp(herdData.bulls);
  const animatedTotalPregnant = useCountUp(breedingData.pregnant);
  const animatedTotalNotPregnant = useCountUp(breedingData.notpregnant);
  const animatedTotalHealthy = useCountUp(healthData.healthy);
  const animatedTotalSickly = useCountUp(healthData.sickly);
  const animatedTotalComplete = useCountUp(taskData.complete);
  const animatedTotalPending = useCountUp(taskData.pending);
  const animatedTotalIncomplete = useCountUp(taskData.incomplete);
  const animatedTotalUpcomingEvents = useCountUp(upcomingEvents.upcomingevents);

  return (
    <div className="analysis">
      <div className="first-container">
        <div className="category-card">
          <h3>Staff</h3>
          <div className="card-content">
            <CSSTransition
              in={!!staffData.totalFemales}
              timeout={500}
              classNames="fade"
              unmountOnExit>
              <div className="females">
                <h3>Females</h3>
                <p>Total: {animatedTotalFemales}</p>
              </div>
            </CSSTransition>
            <CSSTransition
              in={!!staffData.totalMales}
              timeout={500}
              classNames="fade"
              unmountOnExit>
              <div className="males">
                <h3>Males</h3>
                <p>Total: {animatedTotalMales}</p>
              </div>
            </CSSTransition>
          </div>
        </div>
        <div className="category-card">
          <h3>Herd</h3>
          <div className="card-content">
            <CSSTransition in={!!herdData.cows} timeout={500} classNames="fade" unmountOnExit>
              <div className="cows">
                <h3>Cows</h3>
                <p>Total: {animatedTotalCows}</p>
              </div>
            </CSSTransition>
            <CSSTransition in={!!herdData} timeout={500} classNames="fade" unmountOnExit>
              <div className="bulls">
                <h3>Bulls</h3>
                <p>Total: {animatedTotalBulls}</p>
              </div>
            </CSSTransition>
          </div>
        </div>
        <div className="category-card">
          <h3>Pregnancy Status</h3>
          <div className="card-content">
            <CSSTransition
              in={!!breedingData.pregnant}
              timeout={500}
              classNames="fade"
              unmountOnExit>
              <div className="pregnant">
                <h3>Pregnant</h3>
                <p>Total: {animatedTotalPregnant}</p>
              </div>
            </CSSTransition>
            <CSSTransition
              in={!!breedingData.notpregnant}
              timeout={500}
              classNames="fade"
              unmountOnExit>
              <div className="not-pregnant">
                <h3>Not Pregnant</h3>
                <p>Total: {animatedTotalNotPregnant}</p>
              </div>
            </CSSTransition>
          </div>
        </div>
        <div className="category-card">
          <h3>Health Status</h3>
          <div className="card-content">
            <CSSTransition in={!!healthData.healthy} timeout={500} classNames="fade" unmountOnExit>
              <div className="healthy">
                <h3>Healthy</h3>
                <p>Total: {animatedTotalHealthy}</p>
              </div>
            </CSSTransition>
            <CSSTransition in={!!healthData.sickly} timeout={500} classNames="fade" unmountOnExit>
              <div className="sick">
                <h3>Sickly</h3>
                <p>Total: {animatedTotalSickly}</p>
              </div>
            </CSSTransition>
          </div>
        </div>
        <div className="category-card">
          <h3>Tasks</h3>
          <div className="card-content">
            <CSSTransition in={!!taskData.complete} timeout={500} classNames="fade" unmountOnExit>
              <div className="completed">
                <h3>Complete</h3>
                <p>Total: {animatedTotalComplete}</p>
              </div>
            </CSSTransition>
            <CSSTransition in={!!taskData.pending} timeout={500} classNames="fade" unmountOnExit>
              <div className="pending">
                <h3>Pending</h3>
                <p>Total: {animatedTotalPending}</p>
              </div>
            </CSSTransition>
            <CSSTransition in={!!taskData.incomplete} timeout={500} classNames="fade" unmountOnExit>
              <div className="uncompleted">
                <h3>Incomplete</h3>
                <p>Total: {animatedTotalIncomplete}</p>
              </div>
            </CSSTransition>
          </div>
        </div>
        <div className="category-card">
          <h3>Events</h3>
          <div className="card-content">
            <CSSTransition
              in={!!upcomingEvents.upcomingevents}
              timeout={500}
              classNames="fade"
              unmountOnExit>
              <div className="events">
                <h3>Upcoming Events</h3>
                <p>Total: {animatedTotalUpcomingEvents}</p>
              </div>
            </CSSTransition>
          </div>
        </div>
      </div>
      <div className="second-container">
        <div className="bar-graph">
          <div className="filter-container">
            <label>
              Select Month and Year for Bar Chart:
              <DatePicker
                selected={selectedDate}
                onChange={handleDateChange}
                dateFormat="MM/yyyy"
                showMonthYearPicker
              />
            </label>
          </div>
          <div className="chart-container">
            <canvas ref={barChartRef}></canvas>
          </div>
        </div>
        <div className="line-graph">
          <div className="filter-container">
            <label>
              Select Year for Line Chart:
              <DatePicker
                selected={new Date(selectedYear, 0)}
                onChange={handleYearChange}
                dateFormat="yyyy"
                showYearPicker
              />
            </label>
          </div>
          <div className="chart-container">
            <canvas ref={lineChartRef}></canvas>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analysis;
