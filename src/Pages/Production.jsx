import React, { useState, useEffect, useRef } from "react";
import { CSSTransition } from "react-transition-group";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import "bootstrap/dist/css/bootstrap.min.css";
import "../css/production.css";
import useCountUp from "../hooks/useCountUp";
import { Line } from "react-chartjs-2";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { setMonth, setYear } from "date-fns";

const Production = () => {
  // State Hooks
  const [showModal, setShowModal] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [milkData, setMilkData] = useState({ date: "", time: "", quantity: "" });
  const [salesData, setSalesData] = useState({
    product: "",
    date: "",
    amount: "",
    quantity: "",
    buyer: ""
  });
  const [productData, setProductData] = useState({ product_name: "" });
  const [products, setProducts] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [salesSummary, setSalesSummary] = useState(null);
  const [milkProduction, setMilkProduction] = useState(null);
  const [milkProductionDate, setMilkProductionDate] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState("");
  const dropdownRef = useRef(null);
  const token = localStorage.getItem("token");
  const [weeklySales, setWeeklySales] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weeklyMilk, setWeeklyMilk] = useState([]);
  const [milkDate, setMilkDate] = useState(new Date());

  // Fetch Data
  useEffect(() => {
    fetchProducts();
    fetchSales();
    fetchMilkProduction();
  }, []);

  useEffect(() => {
    const initialYear = milkDate.getFullYear();
    const initialMonth = milkDate.getMonth() + 1;
    fetchWeeklySales(initialYear, initialMonth);
  }, [milkDate]);

  useEffect(() => {
    const initialYear = selectedDate.getFullYear();
    const initialMonth = selectedDate.getMonth() + 1;
    fetchWeeklySales(initialYear, initialMonth);
  }, [selectedDate]);

  const fetchWeeklyMilk = async (year, month) => {
    try {
      const response = await fetch(`http://localhost/8080/milk/getweeklymilk/${year}/${month}`);
      if (response.ok) {
        const data = await response.json();
        if (data.length === 0) {
          console.log("No milk production this month");
          setWeeklyMilk([]);
        } else {
          console.log("Weekly Milk:", data);
          setWeeklyMilk(data);
        }
      } else {
        console.error("Failed to fetch weekly milk records:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching records:", error);
    }
  };

  const fetchMilkProduction = async () => {
    try {
      const response = await fetch("http://localhost:8080/milk/getmilkproduction", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setMilkProduction(data.totalQuantity);
        setMilkProductionDate(data.date);
      } else {
        console.error("Failed to fetch milk production data");
      }
    } catch (error) {
      console.error("Error fetching milk production data:", error);
    }
  };

  const fetchSales = async () => {
    try {
      const response = await fetch("http://localhost:8080/sales/getsales", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        const todaySales = data.sales;
        const totalAmount = todaySales.reduce((acc, sale) => acc + parseFloat(sale.saleamount), 0);
        setSalesSummary({ date: new Date().toISOString().split("T")[0], totalSales: totalAmount });
      } else {
        console.error("Failed to fetch sales data");
      }
    } catch (error) {
      console.error("Error fetching sales data:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch("http://localhost:8080/product/getproducts", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(data.products);
      } else {
        console.error("Failed to fetch products");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchWeeklySales = async (year, month) => {
    try {
      const response = await fetch(`http://localhost:8080/sales/getweeklysales/${year}/${month}`);

      if (response.ok) {
        const data = await response.json();
        if (data.length === 0) {
          console.log("No sales data for this month");
          setWeeklySales([]);
        } else {
          console.log("Weekly sales data:", data);
          setWeeklySales(data);
        }
      } else {
        console.error("Failed to fetch weekly sales data:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching weekly sales data:", error);
    }
  };

  // Handle Actions
  const handleButtonClick = () => {
    setShowDropdown((prev) => !prev);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedOption(null);
    setMilkData({ date: "", time: "", quantity: "" });
    setSalesData({ product: "", date: "", amount: "", quantity: "", buyer: "" });
    setProductData({ product_name: "" });
    window.location.reload();
  };

  const handleOptionClick = (option) => {
    setSelectedOption(option);
    setShowModal(true);
    setShowDropdown(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (selectedOption === "milk") {
      setMilkData({ ...milkData, [name]: value });
    } else if (selectedOption === "sales") {
      setSalesData({ ...salesData, [name]: value });
    } else if (selectedOption === "products") {
      setProductData({ ...productData, [name]: value });
    }
  };

  const handleProductSelect = (productName) => {
    const selectedProduct = products.find((product) => product.product_name === productName);
    if (selectedProduct) {
      setSelectedProduct(productName);
      setSalesData({ ...salesData, product: selectedProduct.id });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let url = "";
    let data = {};

    if (selectedOption === "milk") {
      url = "http://localhost:8080/milk/addmilk";
      data = milkData;
    } else if (selectedOption === "sales") {
      url = "http://localhost:8080/sales/addsales";
      data = { ...salesData, product: parseInt(salesData.product) };
    } else if (selectedOption === "products") {
      url = "http://localhost:8080/product/addproduct";
      data = productData;
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const result = await response.json();
        alert(
          result.message ||
            `${selectedOption.charAt(0).toUpperCase() + selectedOption.slice(1)} record added successfully`
        );
        handleCloseModal();
      } else {
        const errorMessage = await response.text();
        console.error("Error:", errorMessage);
        alert(`Error adding ${selectedOption} record`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert(`Error adding ${selectedOption} record`);
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    fetchWeeklySales(year, month);
  };

  const handleMilkDate = (date) => {
    setMilkDate(date);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    fetchWeeklyMilk(year, month);
  };

  // Render Modal Content
  const renderModalContent = () => {
    switch (selectedOption) {
      case "milk":
        return (
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="date">
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                name="date"
                value={milkData.date}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="time">
              <Form.Label>Time</Form.Label>
              <Form.Control
                type="time"
                name="time"
                value={milkData.time}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="quantity">
              <Form.Label>Quantity</Form.Label>
              <Form.Control
                type="text"
                name="quantity"
                value={milkData.quantity}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              Add
            </Button>
          </Form>
        );
      case "sales":
        return (
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="product">
              <Form.Label>Product</Form.Label>
              <DropdownButton
                title={selectedProduct || "Select Product"}
                onSelect={handleProductSelect}>
                {products.map((product) => (
                  <Dropdown.Item key={product.id} eventKey={product.product_name}>
                    {product.product_name}
                  </Dropdown.Item>
                ))}
              </DropdownButton>
            </Form.Group>
            <Form.Group controlId="date">
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                name="date"
                value={salesData.date}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="amount">
              <Form.Label>Amount</Form.Label>
              <Form.Control
                type="text"
                name="amount"
                value={salesData.amount}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="quantity">
              <Form.Label>Quantity</Form.Label>
              <Form.Control
                type="text"
                name="quantity"
                value={salesData.quantity}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="buyer">
              <Form.Label>Buyer</Form.Label>
              <Form.Control
                type="text"
                name="buyer"
                value={salesData.buyer}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              Add
            </Button>
          </Form>
        );
      case "products":
        return (
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="product_name">
              <Form.Label>Product Name</Form.Label>
              <Form.Control
                type="text"
                name="product_name"
                value={productData.product_name}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              Add
            </Button>
          </Form>
        );
      default:
        return null;
    }
  };

  const generateLineGraph = (weeklyMilk) => {
    const labels = weeklyMilk.map((week) => `Week ${week.week_of_month}`);
    const data = weeklyMilk.map((week) => parseFloat(week.total_quantity));
    return {
      labels: labels,
      datasets: [
        {
          label: "Weekly Milk Production",
          data: data,
          fill: false,
          borderColor: "rgb(75, 192, 192)",
          tension: 0.1
        }
      ]
    };
  };

  const generateLineChartData = (weeklySalesData) => {
    const labels = weeklySalesData.map((week) => `Week ${week.week_of_month}`);
    const data = weeklySalesData.map((week) => parseFloat(week.total_sales));

    return {
      labels: labels,
      datasets: [
        {
          label: "Weekly Sales",
          data: data,
          fill: false,
          borderColor: "rgb(75, 192, 192)",
          tension: 0.1
        }
      ]
    };
  };

  // Handle Click Outside to Close Dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Animated Values
  const animatedSalesTotal = useCountUp(salesSummary ? salesSummary.totalSales : 0);
  const animatedProductCount = useCountUp(products.length);
  const animatedMilkProduction = useCountUp(milkProduction || 0);

  // Render Component
  return (
    <div className="production-container">
      <div style={{ position: "absolute", marginTop: "10px", right: "10px" }}>
        <DropdownButton
          align="end"
          title="Add Records"
          id="dropdown-menu-align-end"
          show={showDropdown}
          onClick={handleButtonClick}>
          <Dropdown.Item onClick={() => handleOptionClick("milk")}>Milk</Dropdown.Item>
          <Dropdown.Item onClick={() => handleOptionClick("sales")}>Sales</Dropdown.Item>
          <Dropdown.Item onClick={() => handleOptionClick("products")}>Products</Dropdown.Item>
        </DropdownButton>
      </div>

      <Modal show={showModal} onHide={handleCloseModal} centered style={{ marginTop: "100px" }}>
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedOption &&
              `Add ${selectedOption.charAt(0).toUpperCase() + selectedOption.slice(1)} Record`}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>{renderModalContent()}</Modal.Body>
      </Modal>

      <div className="first-container">
        <CSSTransition in={!!salesSummary} timeout={300} classNames="fade" unmountOnExit>
          <div className="category-card">
            <div className="category-content">
              {salesSummary ? (
                <>
                  <h3>{new Date(salesSummary.date).toLocaleDateString()}</h3>
                  <h4>Total Daily Sales</h4>
                  <p>
                    {new Intl.NumberFormat("en-KE", {
                      style: "currency",
                      currency: "Shs",
                      minimumFractionDigits: 0
                    })
                      .format(animatedSalesTotal)
                      .replace("Shs", "")
                      .trim()}
                  </p>
                </>
              ) : (
                <p>Loading...</p>
              )}
            </div>
          </div>
        </CSSTransition>

        <CSSTransition in={!!products.length} timeout={300} classNames="fade" unmountOnExit>
          <div className="category-card">
            <h4>Total Products</h4>
            <div className="category-content">
              <p>{animatedProductCount} products</p>
            </div>
          </div>
        </CSSTransition>

        <CSSTransition in={!!milkProduction} timeout={300} classNames="fade" unmountOnExit>
          <div className="category-card">
            <div className="category-content">
              <h3>
                {milkProductionDate
                  ? new Date(milkProductionDate).toLocaleDateString()
                  : "Loading..."}
              </h3>
              <h4>Total Milk Production</h4>
              <p>{animatedMilkProduction} Litres</p>
            </div>
          </div>
        </CSSTransition>
      </div>

      <div className="second-container">
        <div className="line-graph">
          <div className="filter-container">
            <DatePicker
              selected={selectedDate}
              onChange={handleDateChange}
              dateFormat="MM/yyyy"
              showMonthYearPicker
            />
          </div>

          <div className="chart-container">
            {weeklySales.length > 0 ? (
              <Line data={generateLineChartData(weeklySales)} options={{ responsive: true }} />
            ) : (
              <p>No sales data available for this month.</p>
            )}
          </div>
        </div>

        <div className="line-graph">
          <div className="filter-container">
            <DatePicker
              selected={milkDate}
              onChange={handleMilkDate}
              dateFormat="MM/yyyy"
              showMonthYearPicker
            />
          </div>
          <div className="chart-container">
            {weeklyMilk.length > 0 ? (
              <Line data={generateLineGraph(weeklyMilk)} options={{ responsive: true }} />
            ) : (
              <p>No milk records for this month</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Production;
