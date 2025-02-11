import React, { useState } from "react";
import "./Home.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link, useNavigate } from "react-router-dom";

function Home() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleLogout = () => {
    navigate("/logout");
  };

  return (
    <div className="HomeApp">
      <header className="HomeTopbar">
        <button className="btn btn-transparent" onClick={toggleDrawer}>
          <i className="bi bi-list"></i>
        </button>
      </header>

      <div className="HomeContent">
        <h2 className="HomeTitle">Home</h2>

        <div className="HomeSection">
          <h3 className="SectionTitle">Registration</h3>
          <div className="IconGrid">
            <Link to="/main/doctor" className="IconItem">
              <i className="bi bi-person-fill"></i>
              <span>Doctor</span>
            </Link>
            <Link to="/main/staff" className="IconItem">
              <i className="bi bi-people-fill"></i>
              <span>Staff</span>
            </Link>
            <Link to="/main/admin" className="IconItem">
              <i className="bi bi-gear-fill"></i>
              <span>Admin</span>
            </Link>
            <Link to="/main/product" className="IconItem">
              <i className="bi bi-cart-fill"></i>
              <span>Product</span>
            </Link>
            <Link to="/main/headquarters" className="IconItem">
              <i className="bi bi-house-door-fill"></i>
              <span>Headquarters</span>
            </Link>
          </div>
        </div>

        <div className="HomeSection">
          <h3 className="SectionTitle">Reports</h3>
          <div className="IconGrid">
            <Link to="/main/create" className="IconItem">
              <i className="bi bi-pencil-square"></i>
              <span>Create</span>
            </Link>
            <Link to="/main/single-report" className="IconItem">
              <i className="bi bi-book-fill"></i>
              <span>Single Report</span>
            </Link>
            <Link to="/main/annual-report" className="IconItem">
              <i className="bi bi-journal-bookmark-fill"></i>
              <span>Annual Report</span>
            </Link>
          </div>
        </div>
      </div>

      <div className={`HomeDrawer ${drawerOpen ? "open" : ""}`}>
        <button className="HomeDrawerCloseButton" onClick={toggleDrawer}>
          <i className="bi bi-arrow-left"></i>
        </button>
        <div className="drawer-content">
          <a href="https://neuraq.github.io/Palliative-Mkba-App-Contact/" target="_blank" rel="noopener noreferrer" className="HomeDrawerButton">
            Contact Us
          </a>
          <a href="https://neuraq.github.io/Palliative-Mkba-App-About/" target="_blank" rel="noopener noreferrer" className="HomeDrawerButton">
            About Us
          </a>
        </div>
        <div className="drawer-footer">
          <button className="HomeDrawerButton btn-danger" onClick={handleLogout}>
            Logout
          </button>
          <div className="powered-by">Powered by neuraq</div>
        </div>
      </div>
    </div>
  );
}

export default Home;
