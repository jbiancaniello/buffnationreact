import React from "react";
import AppRoutes from "./routes/Routes";
import Topbar from "./components/Topbar";
import Footer from "./components/Footer";
import "leaflet/dist/leaflet.css";
import "./styles/global.css";

const App: React.FC = () => {
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
