import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Topbar.css";

const Topbar: React.FC = () => {
    const [menuOpen, setMenuOpen] = useState(false);

    const toggleMenu = () => {
        setMenuOpen((prev) => !prev);
    };

    const closeMenu = () => {
        setMenuOpen(false);
    };

    return (
        <div className="topbar">
            <div className="topbar-left">
                <img src="https://storyphotos.s3.us-east-1.amazonaws.com/logo.png" alt="Logo" className="logo-image" />
                <h1 className="logo">Buff Nation</h1>
                <button
                    className={`menu-toggle ${menuOpen ? "open" : ""}`}
                    onClick={toggleMenu}>
                    ☰
                </button>
            </div>
            <div className={`topbar-right ${menuOpen ? "open" : ""}`}>
                <Link to="/" className="nav-link" onClick={closeMenu}>
                    Home
                </Link>
                <Link to="/dashboard" className="nav-link" onClick={closeMenu}>
                    Dashboard
                </Link>
                <Link to="/news" className="nav-link" onClick={closeMenu}>
                    News
                </Link>
                <Link to="/department-lookup" className="nav-link" onClick={closeMenu}>
                    Department Search
                </Link>
                <a
                    href="https://www.youtube.com/@_buffnation/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="nav-link"
                    onClick={closeMenu}>
                    YouTube
                </a>
                <a
                    href="https://buffnationshop.myshopify.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="nav-link"
                    onClick={closeMenu}>
                    Store
                </a>
            </div>
        </div>
    );
};

export default Topbar;
