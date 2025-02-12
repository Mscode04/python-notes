import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaLightbulb } from "react-icons/fa";
import "./TorchComponent.css";

const BlankComponent = () => {
  const [isOn, setIsOn] = useState(false);
  const navigate = useNavigate();
  let holdTimeout;

  const handleTorchClick = () => {
    setIsOn(prev => !prev);
  };

  const handleMouseDown = () => {
    holdTimeout = setTimeout(() => {
      navigate("/login");
    }, 10000);
  };

  const handleMouseUp = () => {
    clearTimeout(holdTimeout);
  };

  return (
    <div className={`torch-container ${isOn ? "light" : "dark"}`}>
      <h1 className="app-title">Welcome to the App</h1>
      <div 
        className="torch-body" 
        onClick={handleTorchClick}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
      >
        <FaLightbulb className="torch-icon" />
      </div>
    </div>
  );
};

export default BlankComponent;