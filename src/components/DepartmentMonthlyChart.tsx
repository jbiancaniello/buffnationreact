import React from "react";
import {
    AreaChart,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Area,
    ResponsiveContainer,
} from "recharts";
import { Incident } from "../types";

interface DepartmentMonthlyChartProps {
    incidents: Incident[];
}

const DepartmentMonthlyChart: React.FC<DepartmentMonthlyChartProps> = ({
    incidents,
}) => {
    const processData = () => {
        const allMonths = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
        ];

        const monthlyCounts: Record<string, number> = {};

        // Populate monthlyCounts with incident data
        incidents.forEach((incident) => {
            const month = new Date(incident["Fire Date"]).toLocaleString(
                "default",
                {
                    month: "short",
                }
            );
            monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;
        });

        // Ensure all months are included in the final data
        const chartData = allMonths.map((month) => ({
            month,
            fires: monthlyCounts[month] || 0,
        }));

        return chartData;
    };

    const chartData = processData();

    return (
        <div className="chart-department-monthly-chart">
            <h3>Monthly Fires</h3>
            <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area
                        type="monotone"
                        dataKey="fires"
                        stroke="#ff3333"
                        fill="#ff6666"
                        fillOpacity={0.3}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default DepartmentMonthlyChart;
