import React, { useState } from "react";
import axios from "axios";
import "./LoginPage.css";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:4000/api/auth/login", {
        username,
        password,
      });

      localStorage.setItem("username", username);
      const { role, therapistId } = response.data;

      if (role === "therapist") {
        localStorage.setItem("therapistId", therapistId);
        navigate("/therapistdashboard");
      } else if (role === "superadmin") {
        navigate("/superadmin");
      } else if (role === "child") {
        navigate("/welcomepage");
      } else {
        setError("Unknown user role");
      }
    } catch (err) {
      setError("Invalid username or password");
    }
  };

  return React.createElement(
    "div",
    { className: "loginscreen" },
    React.createElement(
      "section",
      { className: "joyverse-wrapper" },
      React.createElement("h1", { className: "joyverse" }, "JoyVerse")
    ),
    React.createElement(
      "form",
      { className: "usernamecontainer-parent", onSubmit: handleLogin },
      React.createElement("input", {
        className: "usernamecontainer",
        placeholder: "username",
        type: "text",
        value: username,
        onChange: (e) => setUsername(e.target.value),
        required: true,
      }),
      React.createElement("input", {
        className: "passwordcontainer",
        placeholder: "password",
        type: "password",
        value: password,
        onChange: (e) => setPassword(e.target.value),
        required: true,
      }),
      React.createElement(
        "button",
        { className: "login-button", type: "submit" },
        React.createElement("div", { className: "login" }, "login")
      )
    ),
    error && React.createElement("p", { className: "error" }, error)
  );
}

export default LoginPage;
