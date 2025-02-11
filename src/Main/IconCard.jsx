import React from "react";
import { Link } from "react-router-dom";
import "./IconCard.css"; // Create this CSS file for styling

function IconCard({ icon, label, to }) {
  return (
    <Link to={to} className="icon-card">
      <div className="icon-card-content">
        <i className={`bi ${icon}`}></i>
        <span>{label}</span>
      </div>
    </Link>
  );
}

export default IconCard;