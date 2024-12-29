import React from "react";
import MapSection from "../components/MapSection";
import StatsCards from "../components/StatsCards";
import "../styles/Dashboard.css";

const Dashboard: React.FC = () => {
    return (
        <div className="dashboard">
            <header>
                <h1>Dashboard</h1>
                <p>A comprehensive view of fire incidents and news.</p>
            </header>
            <main>
                <StatsCards />
                <div className="dashboard-content">
                    <MapSection />
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
