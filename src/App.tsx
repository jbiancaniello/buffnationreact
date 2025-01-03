import React from "react";
import AppRoutes from "./routes/Routes";
import Topbar from "./components/Topbar";
import Footer from "./components/Footer";
import "leaflet/dist/leaflet.css";

const App: React.FC = () => {
    return (
        <>
            <Topbar />
            <AppRoutes />
            <Footer />
        </>
    );
};

export default App;
