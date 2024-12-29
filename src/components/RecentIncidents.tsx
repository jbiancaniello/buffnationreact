import React from "react";
import { Incident } from "../types";
import "../styles/RecentIncidents.css";

interface Props {
    incidents: Incident[];
}

const RecentIncidents: React.FC<Props> = ({ incidents }) => {
    return (
        <div className="recent-incidents">
            <h2 className="section-title">Recent Working Fires</h2>
            <div className="incident-list">
                {incidents.map((incident, index) => (
                    <div className="incident-card" key={index}>
                        <p className="incident-date">{incident["Fire Date"]}</p>
                        <p className="incident-address">{incident.Address}</p>
                        <p className="incident-town">{incident.Department}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecentIncidents;
