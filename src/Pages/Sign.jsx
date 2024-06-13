import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import * as Components from "./Components";
import "./styles.css";
import { BrowserRouter, useNavigate } from "react-router-dom";

const Sign = () => {
  const [signIn, toggle] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
    }
  }, []);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = {
      full_name: e.target.full_name.value,
      email: e.target.email.value,
      phone: e.target.phone.value,
      address: e.target.address.value,
      gender: e.target.gender.value,
      password: e.target.password.value
    };

    try {
      const response = await fetch("http://localhost:8080/users/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSuccessMessage("Signup Successful. Please proceed to login.");
        setErrorMessage("");
        e.target.reset(); // Clear input fields
      } else {
        setErrorMessage("Signup Failed. Please try again.");
        setSuccessMessage("");
      }
    } catch (err) {
      console.error(err.message);
      setErrorMessage("Signup Failed. Please try again.");
      setSuccessMessage("");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const formData = {
      email: e.target.email.value,
      password: e.target.password.value
    };

    try {
      const response = await fetch("http://localhost:8080/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const responseData = await response.json(); // Parse response body
        if (responseData.token) {
          localStorage.setItem("token", responseData.token);
          navigate("/dashboard");
          return;
        }
      }

      // Handling login failure
      setErrorMessage("Login Failed. Please try again.");
      setSuccessMessage("");
    } catch (err) {
      console.error(err.message);
      setErrorMessage("Login Failed. Please try again.");
      setSuccessMessage("");
    }
  };

  return (
    <Components.Container>
      <Components.SignUpContainer signingIn={signIn}>
        <Components.Form onSubmit={handleSubmit}>
          <Components.Title>Create Account</Components.Title>
          <Components.Input type="full-name" name="full_name" placeholder="Full Name" />
          <Components.Input type="email" name="email" placeholder="Email Address" />
          <Components.Input type="phone number" name="phone" placeholder="Phone Number" />
          <Components.Input type="address" name="address" placeholder="Address" />
          <Components.Input type="gender" name="gender" placeholder="Gender" />
          <Components.Input type="password" name="password" placeholder="Password" />
          <Components.Button type="submit">Sign Up</Components.Button>
        </Components.Form>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}
      </Components.SignUpContainer>
      <Components.SignInContainer signingIn={signIn}>
        <Components.Form onSubmit={handleLogin}>
          <Components.Title>Log in</Components.Title>
          <Components.Input type="email" name="email" placeholder="Email" />
          <Components.Input type="password" name="password" placeholder="Password" />
          <Components.Anchor href="#">Forgot your password?</Components.Anchor>
          <Components.Button>Log In</Components.Button>
        </Components.Form>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}
      </Components.SignInContainer>
      <Components.OverlayContainer signingIn={signIn}>
        <Components.Overlay signingIn={signIn}>
          <Components.LeftOverlayPanel signingIn={signIn}>
            <Components.Title>Welcome Back!</Components.Title>
            <Components.Paragraph>
              To keep track of your farm please login with your credentials.
            </Components.Paragraph>
            <Components.GhostButton onClick={() => toggle(true)}>Log In</Components.GhostButton>
          </Components.LeftOverlayPanel>
          <Components.RightOverlayPanel signingIn={signIn}>
            <Components.Title>Hello, Friend!</Components.Title>
            <Components.Paragraph>
              Please create an account to have the best experience
            </Components.Paragraph>
            <Components.GhostButton onClick={() => toggle(false)}>Sign Up</Components.GhostButton>
          </Components.RightOverlayPanel>
        </Components.Overlay>
      </Components.OverlayContainer>
    </Components.Container>
  );
};

const rootElement = document.getElementById("root");
ReactDOM.render(
  <BrowserRouter>
    <Sign />
  </BrowserRouter>,
  rootElement
);

export default Sign;
