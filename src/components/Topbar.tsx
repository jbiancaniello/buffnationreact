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
                <Link to="/home" className="nav-link" onClick={closeMenu}>
                    <img src="https://storyphotos.s3.us-east-1.amazonaws.com/new-new-logo.png" alt="Logo" className="logo-image" />
                </Link>
                <h1 className="logo">Buff Nation</h1>
                <button
                    className={`menu-toggle ${menuOpen ? "open" : ""}`}
                    onClick={toggleMenu}>
                    ☰
                </button>
            </div>
            <div className={`topbar-right ${menuOpen ? "open" : ""}`}>
                <Link to="/home" className="nav-link" onClick={closeMenu}>
                    Home
                </Link>
                <Link to="/dashboard" className="nav-link" onClick={closeMenu}>
                    Live Data
                </Link>
                <Link to="/news" className="nav-link" onClick={closeMenu}>
                    News
                </Link>
                <Link to="/department-lookup" className="nav-link" onClick={closeMenu}>
                    Department Lookup
                </Link>
                <Link to="/about" className="nav-link" onClick={closeMenu}>
                    About
                </Link>
            </div>
        </div>
    );
};

export default Topbar;
