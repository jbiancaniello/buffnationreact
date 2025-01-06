import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Topbar.css";
import logo from "../assets/logo.png"; // Import your logo file

const Topbar: React.FC = () => {
    const [menuOpen, setMenuOpen] = useState(false);

    const toggleMenu = () => {
        setMenuOpen((prev) => !prev);
    };

    return (
        <div className="topbar">
            <div className="topbar-left">
                <img src={logo} alt="BuffNation Logo" className="logo-image" />
                <h1 className="logo">Buff Nation</h1>
                <button
                    className={`menu-toggle ${menuOpen ? "open" : ""}`}
                    onClick={toggleMenu}>
                    ☰
                </button>
            </div>
            <div className={`topbar-right ${menuOpen ? "open" : ""}`}>
                <Link to="/" className="nav-link">
                    Home
                </Link>
                <Link to="/dashboard" className="nav-link">
                    Dashboard
                </Link>
                <Link to="/news" className="nav-link">
                    News
                </Link>
                <Link to="/department-lookup" className="nav-link">
                    Department Search
                </Link>
                <a
                    href="https://www.youtube.com/@_buffnation/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="nav-link">
                    YouTube
                </a>
                <a
                    href="https://buffnationshop.myshopify.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="nav-link">
                    Store
                </a>
            </div>
        </div>
    );
};

export default Topbar;
