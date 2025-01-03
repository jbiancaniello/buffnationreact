import React, { useState } from "react";
import StatsCharts from "../components/StatsCharts";
import MapSection from "../components/MapSection";
import "../styles/Dashboard.css";

const DashboardPage: React.FC = () => {
    const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());

    const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedYear(event.target.value);
    };

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <h1>Dashboard</h1>
                <div className="year-filter">
                    <label htmlFor="year-select">Year:</label>
                    <select id="year-select" value={selectedYear} onChange={handleYearChange}>
                        {/* Dynamically populate years */}
                        {["2025", "2024"].map((year) => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </select>
                </div>
            </header>
            <main>
                <StatsCharts selectedYear={selectedYear} />
                <MapSection selectedYear={selectedYear} />
            </main>
        </div>
    );
};

export default DashboardPage;
