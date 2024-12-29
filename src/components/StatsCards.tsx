import React from "react";
import "../styles/StatsCards.css";

const StatsCards: React.FC = () => {
    const stats = [
        { label: "Total Fires", value: 150 },
        { label: "News Stories", value: 75 },
        { label: "Departments Involved", value: 20 },
    ];

    return (
        <div className="stats-cards">
            {stats.map((stat, index) => (
                <div className="stats-card" key={index}>
                    <h3>{stat.value}</h3>
                    <p>{stat.label}</p>
                </div>
            ))}
        </div>
    );
};

export default StatsCards;
