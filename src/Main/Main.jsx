import React from "react";
import { Link, Navigate } from "react-router-dom";
import "./Main.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Routes, Route } from "react-router-dom";
import Home from "../Home/Home";
import Doctor from "../Forms/Doctor"; // Import other components as needed
import Staff from "../Forms/Staff";
import Admin from "../Forms/Admin";
import Product from "../Forms/Product";
import Headquarters from "../Forms/Headquarters";
import Create from "../Details/Create";
import SingleReport from "../Details/SingleReport";
import AnnualReport from "../Details/AnnualReport";

function Main({ isAuthenticated }) {
  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <div className="mainhome_app">
      <div className="mainhome_page-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/doctor" element={<Doctor />} />
          <Route path="/staff" element={<Staff />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/product" element={<Product />} />
          <Route path="/headquarters" element={<Headquarters />} />
          <Route path="/create" element={<Create />} />
          <Route path="/single-report" element={<SingleReport />} />
          <Route path="/annual-report" element={<AnnualReport />} />
        </Routes>
      </div>

      {/* Bottom Navigation Bar */}
      <nav className="mainhome_bottom-nav">
        <Link to="/main" className="mainhome_nav-item">
          <i className="bi bi-house-fill"></i>
        </Link>
        <Link to="/main/addpt" className="mainhome_nav-item">
          <i className="bi bi-plus-circle"></i>
        </Link>
        <Link to="/main/ptlist" className="mainhome_nav-item">
          <i className="bi bi-person-fill"></i>
        </Link>
        <Link to="/main/allrepots" className="mainhome_nav-item">
          <i className="bi bi-gear-fill"></i>
        </Link>
      </nav>
    </div>
  );
}

export default Main;