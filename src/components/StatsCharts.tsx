import React, { useEffect, useState } from "react";
import {
    BarChart,
    Bar,
    AreaChart,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    Legend,
} from "recharts";
import "../styles/StatsCharts.css";

interface FiresTodayWeek {
    name: string;
    fires: number;
}

interface FiresByBattalion {
    name: string;
    fires: number;
}

interface FiresByMonth {
    month: string;
    fires: number;
}

interface MostFiresByDept {
    dept: string;
    fires: number;
}

const StatsCharts: React.FC = () => {
    const [firesToday, setFiresToday] = useState<number>(0);
    const [firesThisWeek, setFiresThisWeek] = useState<number>(0);
    const [selectedCounty, setSelectedCounty] = useState<"Suffolk" | "Nassau">(
        "Suffolk"
    );
    const [firesByBattalion, setFiresByBattalion] = useState<FiresByBattalion[]>([]);
    const [suffolkFiresByMonth, setSuffolkFiresByMonth] = useState<FiresByMonth[]>([]);
    const [nassauFiresByMonth, setNassauFiresByMonth] = useState<FiresByMonth[]>([]);
    const [selectedDeptCounty, setSelectedDeptCounty] = useState<"Suffolk" | "Nassau">(
        "Suffolk"
    );

    const [mostFiresByDeptData, setMostFiresByDeptData] = useState<MostFiresByDept[]>([]);
    
    const apiKey = process.env.REACT_APP_API_KEY;

    const fetchGoogleSheetsData = async (spreadsheetId: string, range: string) => {
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            return data.values || [];
        } catch (error) {
            console.error(`Error fetching data for range ${range}:`, error);
            return [];
        }
    };

    const fetchFiresByBattalion = async () => {
        const sheetId = "1m1yjSvmhY0HbAePiA8e4td95l9lqOgFoZmlIu8wBTqU"; // Same spreadsheet ID for both tabs
        const currentYear = new Date().getFullYear();
    
        const range =
            selectedCounty === "Suffolk"
                ? "'Suffolk Divisions'!A2:C" // Suffolk tab
                : "'Nassau Battalion'!A2:C"; // Nassau tab
    
        const data = await fetchGoogleSheetsData(sheetId, range);
        console.log(`${selectedCounty} data:`, data); // Log the fetched data
    
        // Define the order of divisions/battalions
        const order =
            selectedCounty === "Suffolk"
                ? [
                      "1st Division",
                      "2nd Division",
                      "3rd Division",
                      "4th Division",
                      "5th Division",
                      "6th Division",
                      "7th Division",
                      "8th Division",
                      "9th Division",
                      "10th Division",
                  ]
                : [
                      "1st Battalion",
                      "2nd Battalion",
                      "3rd Battalion",
                      "4th Battalion",
                      "5th Battalion",
                      "6th Battalion",
                      "7th Battalion",
                      "8th Battalion",
                      "9th Battalion",
                  ];
    
        // Map data, filter for the current year, and ensure it is in the correct order
        const filteredData = data.filter(
            ([, year]: [string, string, string]) => parseInt(year, 10) === currentYear
        );
    
        const sortedData = order.map((name) => {
            const matchingEntry = filteredData.find(
                ([entryName]: [string, string, string]) => entryName === name
            );
            return {
                name,
                fires: matchingEntry ? parseInt(matchingEntry[2], 10) : 0,
            };
        });
    
        setFiresByBattalion(sortedData);
    };

    const fetchFiresByMonth = async () => {
        const sheetId = "1m1yjSvmhY0HbAePiA8e4td95l9lqOgFoZmlIu8wBTqU"; // Same spreadsheet for both tabs
        const currentYear = new Date().getFullYear();
    
        const suffolkRange = "'Suffolk County Fires by Month'!A2:D";
        const nassauRange = "'Nassau County Fires by Month'!A2:D";
    
        const suffolkData = await fetchGoogleSheetsData(sheetId, suffolkRange);
        const nassauData = await fetchGoogleSheetsData(sheetId, nassauRange);
    
        const processData = (data: any[], county: "Suffolk" | "Nassau") =>
            data
                .filter(
                    ([, year]: [string, string, string, string]) =>
                        parseInt(year, 10) === currentYear
                )
                .map(([month, , monthName, count]: [string, string, string, string]) => ({
                    month: monthName,
                    [`${county}Fires`]: parseInt(count, 10),
                }));
    
        const suffolkProcessed = processData(suffolkData, "Suffolk");
        const nassauProcessed = processData(nassauData, "Nassau");
    
        // Merge Suffolk and Nassau data by month
        const mergedData = [...suffolkProcessed, ...nassauProcessed].reduce(
            (acc: Record<string, any>, item) => {
                const { month, ...fires } = item;
                if (!acc[month]) acc[month] = { month };
                Object.assign(acc[month], fires);
                return acc;
            },
            {}
        );
    
        setSuffolkFiresByMonth(Object.values(mergedData));
    };    

    const fetchMostFiresByDept = async () => {
        const sheetId = "1m1yjSvmhY0HbAePiA8e4td95l9lqOgFoZmlIu8wBTqU"; // Same spreadsheet for both tabs
        const currentYear = new Date().getFullYear();
    
        const range =
            selectedDeptCounty === "Suffolk"
                ? "'Suffolk Departments'!A2:C" // Suffolk tab
                : "'Nassau Departments'!A2:C"; // Nassau tab
    
        const data = await fetchGoogleSheetsData(sheetId, range);
    
        // Filter for the current year, map, sort by count, and limit to the top 10
        const sortedData = data
            .filter(([_, year]: [string, string, string]) => parseInt(year, 10) === currentYear) // Filter by year
            .map(([dept, , count]: [string, string, string]) => ({
                dept,
                fires: parseInt(count, 10),
            }))
            .sort((a: MostFiresByDept, b: MostFiresByDept) => b.fires - a.fires) // Sort by fires (descending)
            .slice(0, 10); // Limit to top 10
    
        setMostFiresByDeptData(sortedData);
    }; 

    useEffect(() => {
        fetchFiresByBattalion();
        fetchFiresByMonth();
        fetchMostFiresByDept();
    }, [selectedCounty, selectedDeptCounty]);

    useEffect(() => {
        const fetchData = async () => {
            const suffolkSheetId = "1m1yjSvmhY0HbAePiA8e4td95l9lqOgFoZmlIu8wBTqU";
            const nassauSheetId = "1c0ZiOjzHAkhaEgucExY0logR9P7S6cRbaxtVz4MC2jY";

            // Fires Today vs This Week
            const suffolkFires = await fetchGoogleSheetsData(
                suffolkSheetId,
                "'Suffolk County Working Fire Total'!A2:A"
            );
            const nassauFires = await fetchGoogleSheetsData(
                nassauSheetId,
                "'Nassau County Working Fire Total'!A2:A"
            );
            const today = new Date().toISOString().split("T")[0];
            const pastWeek = new Date();
            pastWeek.setDate(pastWeek.getDate() - 7);

            const firesTodayCount = [...suffolkFires, ...nassauFires].filter(
                (fire) => fire[0] === today
            ).length;
            const firesThisWeekCount = [...suffolkFires, ...nassauFires].filter(
                (fire) => new Date(fire[0]) >= pastWeek
            ).length;

            setFiresToday(firesTodayCount);
            setFiresThisWeek(firesThisWeekCount);
        };

        fetchData();
    }, []);

    return (
        <div className="stats-charts">
            {/* Fires Today and This Week */}
            <div>
                <div className="live-data-label">Live Data 2024</div>
                <div className="stats-summary">
                    <div className="fires-today">
                        <h3>Fires Today</h3>
                        <p>{firesToday}</p>
                    </div>
                    <div className="fires-this-week">
                        <h3>Fires This Week</h3>
                        <p>{firesThisWeek}</p>
                    </div>
                </div>
            </div>

            {/* Fires by Battalion */}
            <div className="chart fires-by-battalion">
                <div className="chart-header">
                    <h3>{`Total Fires by ${
                        selectedCounty === "Suffolk" ? "Division" : "Battalion"
                    }`}</h3>
                    <div className="county-toggle">
                        <button
                            className={`toggle-button ${
                                selectedCounty === "Suffolk" ? "active" : ""
                            }`}
                            onClick={() => setSelectedCounty("Suffolk")}
                        >
                            Suffolk
                        </button>
                        <button
                            className={`toggle-button ${
                                selectedCounty === "Nassau" ? "active" : ""
                            }`}
                            onClick={() => setSelectedCounty("Nassau")}
                        >
                            Nassau
                        </button>
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={500}>
                    <BarChart data={firesByBattalion}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar
                            dataKey="fires"
                            fill="#ff0000"
                            fillOpacity={0.5}
                            stroke="#ff0000"
                            strokeWidth={2}
                        />
                    </BarChart>
                </ResponsiveContainer>

            </div>

            {/* Fires by Month */}
            <div className="chart fires-by-month">
                <h3>Total Fires by Month</h3>
                <ResponsiveContainer width="100%" height={500}>
                    <AreaChart data={suffolkFiresByMonth}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend 
                            verticalAlign="top" // Position the legend (top, bottom, left, right)
                            align="center" // Align legend items (center, left, right)
                            wrapperStyle={{
                                paddingBottom: 10, // Adjust padding below the legend
                                fontSize: "14px", // Optional: Customize font size
                                color: "#ff0000", // Optional: Customize text color
                            }}
                        />
                        {/* Suffolk Fires Area */}
                        <Area
                            type="monotone"
                            dataKey="SuffolkFires"
                            name="Suffolk"
                            stroke="#ff0000"
                            fill="#ff0000"
                            fillOpacity={0.2}
                            strokeWidth={2}
                            dot={{ r: 4 }} // Adds dots for data points
                        />
                        {/* Nassau Fires Area */}
                        <Area
                            type="monotone"
                            dataKey="NassauFires"
                            name="Nassau"
                            stroke="#ff3333"
                            fill="#ff3333"
                            fillOpacity={0.2}
                            strokeWidth={2}
                            dot={{ r: 4 }} // Adds dots for data points
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>


            {/* Most Fires by Department */}
            <div className="chart most-fires-by-dept">
                <div className="chart-header">
                    <h3>{`Most Working Fires by Department`}</h3>
                    <div className="county-toggle">
                        <button
                            className={`toggle-button ${
                                selectedDeptCounty === "Suffolk" ? "active" : ""
                            }`}
                            onClick={() => setSelectedDeptCounty("Suffolk")}
                        >
                            Suffolk
                        </button>
                        <button
                            className={`toggle-button ${
                                selectedDeptCounty === "Nassau" ? "active" : ""
                            }`}
                            onClick={() => setSelectedDeptCounty("Nassau")}
                        >
                            Nassau
                        </button>
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={500}>
                    <BarChart data={mostFiresByDeptData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="dept" />
                        <YAxis />
                        <Tooltip />
                        <Bar
                            dataKey="fires"
                            fill="#ff0000"
                            fillOpacity={0.5}
                            stroke="#ff0000"
                            strokeWidth={2}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default StatsCharts;
