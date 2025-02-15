import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import ReactGA from "react-ga4";

import AppRoutes from "./routes/Routes";
import Topbar from "./components/Topbar";
import Footer from "./components/Footer";
import "leaflet/dist/leaflet.css";
import "./styles/global.css";

const TRACKING_ID = "G-WTFGF8SH1Q"; // Replace with your GA4 Measurement ID

const App: React.FC = () => {
    const location = useLocation();

    useEffect(() => {
        // Initialize Google Analytics
        ReactGA.initialize(TRACKING_ID);
    }, []);

    useEffect(() => {
        // Track page views correctly in GA4
        ReactGA.send("page_view");
    }, [location]);

    return (
        <div className="app-container">
            <Topbar />
            <div className="app-content">
                <AppRoutes />
            </div>
            <Footer />
        </div>
    );
};

export default App;
