import React, { useEffect, useState, Suspense } from "react";
import "../styles/Dashboard.css";

const StatsCharts = React.lazy(() => import("../components/StatsCharts"));
const MapSection = React.lazy(() => import("../components/MapSection"));

const DashboardPage: React.FC = () => {
    const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());

    const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedYear(event.target.value);
    };

    useEffect(() => {
        document.title = "Dashboard";
    }, []);

    return (
        <div className="dashboard">
            <header className="dashboard-header">
            <h1>Live Data</h1>
            <div className="year-filter">
                <label htmlFor="year-select">Year:</label>
                <select id="year-select" value={selectedYear} onChange={handleYearChange}>
                {["2025", "2024"].map((year) => (
                    <option key={year} value={year}>
                    {year}
                    </option>
                ))}
                </select>
            </div>
            </header>
            <main>
                <Suspense fallback={<div>Loading...</div>}>
                    <StatsCharts selectedYear={selectedYear} />
                    <MapSection selectedYear={selectedYear} />
                </Suspense>
            </main>
        </div>
    );
};

export default DashboardPage;
