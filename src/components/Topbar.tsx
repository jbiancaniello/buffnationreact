import React from "react";
import { Link } from "react-router-dom";
import "../styles/Topbar.css";
import logo from "../assets/logo.png"; // Import your logo file

const Topbar: React.FC = () => {
    return (
        <div className="topbar">
            <div className="topbar-left">
                <img src={logo} alt="BuffNation Logo" className="logo-image" />
                <h1 className="logo">Buff Nation</h1>
            </div>
            <div className="topbar-right">
                <Link to="/" className="nav-link">
                    Home
                </Link>
                <Link to="/dashboard" className="nav-link">
                    Dashboard
                </Link>
                <Link to="/news" className="nav-link">
                    Stories
                </Link>
                <Link to="/department-lookup" className="nav-link">
                    Department Search
                </Link>
                <Link to="https://www.youtube.com/@_buffnation/" className="nav-link">
                    YouTube
                </Link>
                <Link to="https://buffnationshop.myshopify.com/" className="nav-link">
                    Store
                </Link>
            </div>
        </div>
    );
};

export default Topbar;
