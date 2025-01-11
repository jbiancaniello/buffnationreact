import React, { useEffect, useState } from "react";
import {
    BarChart,
    Bar,
    AreaChart,
    XAxis,
    YAxis,
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

interface StatsChartsProps {
    selectedYear: string;
}

interface FiresByMonth {
    month: string;
    SuffolkFires: number;
    NassauFires: number;
}

const StatsCharts: React.FC<StatsChartsProps> = ({ selectedYear }) => {
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
        const sheetId = "1m1yjSvmhY0HbAePiA8e4td95l9lqOgFoZmlIu8wBTqU";
        const range =
            selectedCounty === "Suffolk"
                ? "'Suffolk Divisions'!A2:C"
                : "'Nassau Battalion'!A2:C";
    
        const data = await fetchGoogleSheetsData(sheetId, range);
    
        // Convert year to string for safe comparison
        const filteredData = data.filter(
            ([, year]: [string, string, string]) => year.toString() === selectedYear
        );
    
        const order =
            selectedCounty === "Suffolk"
                ? ["1st Division", "2nd Division", "3rd Division", "4th Division", "5th Division", "6th Division", "7th Division", "8th Division", "9th Division", "10th Division"]
                : ["1st Battalion", "2nd Battalion", "3rd Battalion", "4th Battalion", "5th Battalion", "6th Battalion", "7th Battalion", "8th Battalion", "9th Battalion"];
    
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
        const sheetId = "1m1yjSvmhY0HbAePiA8e4td95l9lqOgFoZmlIu8wBTqU";
        const suffolkRange = "'Suffolk County Fires by Month'!A2:D";
        const nassauRange = "'Nassau County Fires by Month'!A2:D";
    
        const suffolkData = await fetchGoogleSheetsData(sheetId, suffolkRange);
        const nassauData = await fetchGoogleSheetsData(sheetId, nassauRange);
    
        const processData = (data: any[], county: "Suffolk" | "Nassau") =>
            data
                .filter(
                    ([, year]: [string, string, string, string]) =>
                        year.toString() === selectedYear
                )
                .map(([month, , monthName, count]: [string, string, string, string]) => ({
                    month: monthName || month, // Use display name if available
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
        const sheetId = "1m1yjSvmhY0HbAePiA8e4td95l9lqOgFoZmlIu8wBTqU";
        const range =
            selectedDeptCounty === "Suffolk"
                ? "'Suffolk Departments'!A2:C"
                : "'Nassau Departments'!A2:C";

        const data = await fetchGoogleSheetsData(sheetId, range);
        const filteredData = data.filter(
            ([, year]: [string, string, string]) => year === selectedYear
        );

        const sortedData = filteredData
            .map(([dept, , count]: [string, string, string]) => ({
                dept,
                fires: parseInt(count, 10),
            }))
            .sort((a: MostFiresByDept, b: MostFiresByDept) => b.fires - a.fires)
            .slice(0, 10);

        setMostFiresByDeptData(sortedData);
    };

    const calculateYAxisDomain = (data: { fires: number }[]) => {
        const max = Math.max(...data.map((d) => d.fires), 0);
        return [0, max + Math.ceil(max * 0.2)];
    };

    const calculateTotalFiresForBattalion = () =>
        firesByBattalion.reduce((sum, item) => sum + item.fires, 0);

    const calculateTotalFiresForDepartment = () =>
        mostFiresByDeptData.reduce((sum, item) => sum + item.fires, 0);

    useEffect(() => {
        fetchFiresByBattalion();
        fetchFiresByMonth();
        fetchMostFiresByDept();
    }, [selectedCounty, selectedDeptCounty, selectedYear]);

    useEffect(() => {
        const fetchData = async () => {
            const suffolkSheetId = "1m1yjSvmhY0HbAePiA8e4td95l9lqOgFoZmlIu8wBTqU";
            const nassauSheetId = "1c0ZiOjzHAkhaEgucExY0logR9P7S6cRbaxtVz4MC2jY";

            const suffolkFires = await fetchGoogleSheetsData(
                suffolkSheetId,
                "'Suffolk County Working Fire Total'!A2:A"
            );
            const nassauFires = await fetchGoogleSheetsData(
                nassauSheetId,
                "'Nassau County Working Fire Total'!A2:A"
            );

            const day = new Date();
            const estOffset = day.getTimezoneOffset() + 300; // EST is UTC-5 (300 minutes)
            day.setMinutes(day.getMinutes() - estOffset);
            const today = day.toISOString().split("T")[0];
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

    const AngledXAxisTick = (props: any) => {
        const { x, y, payload } = props;
      
        return (
          <g transform={`translate(${x},${y})`}>
            <text
              x={0}
              y={20} // Adjusted to position the label below the axis
              transform="rotate(-45)" // Rotate the text around its origin
              textAnchor="end" // Align text to the end for better spacing
              fill="#ffffff" // Ensure text is white
              fontSize="11px" // Adjust for readability
            >
              {payload.value}
            </text>
          </g>
        );
      };
      
    const customTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div
                    style={{
                        backgroundColor: "#fff",
                        padding: "10px",
                        border: "1px solid #ccc",
                    }}
                >
                    {/* Render the X value (label) in black */}
                    <p style={{ color: "#000", margin: 0 }}>{label}</p>
                    {/* Render the Y value (fires) in the default color */}
                    <p style={{ color: "#ff0000", margin: 0 }}>{`${payload[0].name}: ${payload[0].value}`}</p>
                </div>
            );
        }

        return null;
    };

    const customTooltip2 = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div
                    style={{
                        backgroundColor: "#fff",
                        padding: "10px",
                        border: "1px solid #ccc",
                    }}
                >
                    {/* Render the X value (label) in black */}
                    <p style={{ color: "#000", margin: 0 }}>{label}</p>
                    {/* Render the Y value (fires) in the default color */}
                    <p style={{ color: "#ff0000", margin: 0 }}>{`${payload[0].name}: ${payload[0].value}`}</p>

                    <p style={{ color: "#ff3333", margin: 0 }}>{`${payload[1].name}: ${payload[1].value}`}</p>
                </div>
            );
        }

        return null;
    };

    const CustomBarShape = (props: any) => {
        const { x, y, width, height, fill, fillOpacity, stroke, strokeWidth } = props;
      
        if (height <= 0) return null; // Skip rendering invalid shapes
      
        // Total perimeter of the rectangle
        const perimeter = 2 * (width + height);
      
        // Offset to start the dash pattern at the top-left corner, excluding the bottom border
        const dashOffset = height;
      
        return (
          <g>
            {/* Bar rectangle without bottom border */}
            <path
              d={`M${x},${y} L${x + width},${y} L${x + width},${y + height} L${x},${y + height} Z`}
              fill={fill}
              fillOpacity={fillOpacity}
              stroke={stroke}
              strokeWidth={strokeWidth}
              vectorEffect="non-scaling-stroke"
              style={{
                strokeDasharray: `${width + 2 * height}, ${width}`, // Define dashes to exclude bottom
                strokeDashoffset: dashOffset, // Start the dash pattern at the top-left corner
              }}
            />
          </g>
        );
      };
      
      

    return (
        <div className="stats-charts">
            {/* Fires Today and This Week */}
            <div className="stats-summary fires-today-and-week">
                <div className="fires-today">
                    <h3>Fires Today</h3>
                    <p>{firesToday}</p>
                </div>
                <div className="divider"></div>
                <div className="fires-this-week">
                    <h3>Fires This Week</h3>
                    <p>{firesThisWeek}</p>
                </div>
            </div>

            {/* Fires by Battalion */}
            <div className="chart fires-by-battalion">
                <div className="chart-header">
                    <h3>{`Total Fires by ${
                        selectedCounty === "Suffolk" ? "Division" : "Battalion"
                    }`}</h3>
                    <p className="chart-total">
                        Total Fires: {calculateTotalFiresForBattalion()}
                    </p>
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
                    <BarChart data={firesByBattalion} margin={{bottom: 50}}>
                        <XAxis dataKey="name" interval={0} tick={<AngledXAxisTick />} />
                        <YAxis domain={calculateYAxisDomain(firesByBattalion)} allowDecimals={false} />
                        <Tooltip content={customTooltip} />
                        <Bar
                            dataKey="fires"
                            fill="#ff0000"
                            fillOpacity={0.5}
                            stroke="#ff0000"
                            strokeWidth={2}
                            shape={<CustomBarShape />}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Fires by Month */}
            <div className="chart fires-by-month">
                <h3>Total Fires by Month</h3>
                <ResponsiveContainer width="100%" height={500}>
                    <AreaChart data={suffolkFiresByMonth}  margin={{right: 20, bottom: 75}}>
                        <XAxis dataKey="month" interval={0} tick={<AngledXAxisTick />} />
                        <YAxis allowDecimals={false}/>
                        <Tooltip content={customTooltip2}/>
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
                    <p className="chart-total">
                        Total Fires: {calculateTotalFiresForDepartment()}
                    </p>
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
                <ResponsiveContainer width="100%" height={450}>
                    <BarChart data={mostFiresByDeptData} margin={{bottom: 110}}>
                        <XAxis dataKey="dept" interval={0} tick={<AngledXAxisTick />} />
                        <YAxis domain={calculateYAxisDomain(mostFiresByDeptData)} allowDecimals={false}/>
                        <Tooltip content={customTooltip} />
                        <Bar
                            dataKey="fires"
                            fill="#ff0000"
                            fillOpacity={0.5}
                            stroke="#ff0000"
                            strokeWidth={2}
                            shape={<CustomBarShape />}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default StatsCharts;
