import React from "react";
import { useNavigate } from "react-router-dom";

const BlankComponent = () => {
  const navigate = useNavigate();

  const handleGoClick = () => {
    navigate("/login");
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Welcome to the App</h1>
      <button
        onClick={handleGoClick}
        style={{
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Go to Login
      </button>
    </div>
  );
};

export default BlankComponent;