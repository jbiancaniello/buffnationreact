import React from "react";
import { Link } from "react-router-dom";
import "../styles/Topbar.css"; // Add a CSS file for better styling

const Topbar: React.FC = () => {
  return (
    <div className="topbar">
      <div className="topbar-left">
        <h1 className="logo">BuffNation</h1>
      </div>
      <div className="topbar-right">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/dashboard" className="nav-link">Dashboard</Link>
      </div>
    </div>
  );
};

export default Topbar;
