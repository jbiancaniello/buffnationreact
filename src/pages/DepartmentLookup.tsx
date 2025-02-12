import React, { useState, Suspense } from "react";
import "../styles/DepartmentLookup.css";
import { Incident, Story } from "../types";

const DepartmentMonthlyChart = React.lazy(() => import("../components/DepartmentMonthlyChart"));
const DepartmentMap = React.lazy(() => import("../components/DepartmentMap"));

const DepartmentLookup: React.FC = () => {
    const [department, setDepartment] = useState<string>("");
    const [year, setYear] = useState<string>("2025");
    const [departmentData, setDepartmentData] = useState<Record<
        string,
        any
    > | null>(null);
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [deptStories, setDeptStories] = useState<Story[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const apiKey = process.env.REACT_APP_API_KEY as string;
    const incidentsSpreadsheetId =
        "1m1yjSvmhY0HbAePiA8e4td95l9lqOgFoZmlIu8wBTqU";
    const storySpreadsheetId = "1c0ZiOjzHAkhaEgucExY0logR9P7S6cRbaxtVz4MC2jY";

    const fetchGoogleSheetsData = async (sheetName: string): Promise<any[]> => {
        let url = "";
        if (sheetName === "NewsStory") {
            url = `https://sheets.googleapis.com/v4/spreadsheets/${storySpreadsheetId}/values/${sheetName}?key=${apiKey}`;
        } else {
            url = `https://sheets.googleapis.com/v4/spreadsheets/${incidentsSpreadsheetId}/values/${sheetName}?key=${apiKey}`;
        }
        try {
            const response = await fetch(url);
            const data = await response.json();
            return data.values || [];
        } catch (error) {
            console.error(
                `Error fetching data from sheet: ${sheetName}`,
                error
            );
            return [];
        }
    };

    const handleSearch = async () => {
        setErrorMessage(null);
        setDepartmentData(null);
        setIncidents([]);
        setDeptStories([]);

        const fetchDepartments = async (
            sheetName: string
        ): Promise<Record<string, any>[]> => {
            const data = await fetchGoogleSheetsData(sheetName);
            const headers: string[] = data[0];
            const rows: string[][] = data.slice(1);
            return rows.map((row) =>
                Object.fromEntries(headers.map((key, i) => [key, row[i]]))
            );
        };

        const fetchIncidents = async (
            sheetName: string,
            deptName: string
        ): Promise<Incident[]> => {
            const data = await fetchGoogleSheetsData(sheetName);
            const headers: string[] = data[0];
            const rows: string[][] = data.slice(1);

            const incidents = rows
                .map((row) => {
                    const incident = Object.fromEntries(
                        headers.map((key, i) => [key, row[i]])
                    ) as unknown as Incident;
                    return incident;
                })
                .filter(
                    (incident) =>
                        incident.Department === deptName &&
                        incident["Fire Date"] &&
                        incident.Address &&
                        incident.Town &&
                        incident.Latitude &&
                        incident.Longitude &&
                        new Date(incident["Fire Date"])
                            .getFullYear()
                            .toString() === year // Filter by year
                );

            return incidents;
        };

        const checkDepartment = async (
            county: string,
            sheetName: string
        ): Promise<Record<string, any> | undefined> => {
            const departments = await fetchDepartments(sheetName);
            const matchingDepartment = departments.find(
                (dept) =>
                    dept.Department.toLowerCase().includes(
                        department.toLowerCase()
                    ) && dept.Year === year
            );

            if (matchingDepartment) {
                return {
                    ...matchingDepartment,
                    County: county,
                };
            }
            return undefined;
        };

        let departmentDetails = await checkDepartment(
            "Suffolk",
            "Suffolk Departments"
        );
        if (!departmentDetails) {
            departmentDetails = await checkDepartment(
                "Nassau",
                "Nassau Departments"
            );
        }

        if (departmentDetails) {
            setDepartmentData(departmentDetails);
            const incidentsSheet =
                departmentDetails.County === "Suffolk"
                    ? "Suffolk County Working Fire Total"
                    : "Nassau County Working Fire Total";

            const fetchedIncidents = await fetchIncidents(
                incidentsSheet,
                departmentDetails.Department
            );

            // Sort incidents by date
            fetchedIncidents.sort((a, b) => {
                const dateA = new Date(a["Fire Date"]);
                const dateB = new Date(b["Fire Date"]);
                return dateA.getTime() - dateB.getTime();
            });

            setIncidents(fetchedIncidents);

            const fetchStories = async (): Promise<Story[]> => {
                const data = await fetchGoogleSheetsData("NewsStory");
                const headers: string[] = data[0];
                const rows: string[][] = data.slice(1);

                const departmentHeader = headers.find((header) =>
                    header.toLowerCase().includes("department")
                );

                if (!departmentHeader) {
                    console.error(
                        "Department header not found in stories sheet."
                    );
                    return [];
                }

                return rows.map(
                    (row) =>
                        Object.fromEntries(
                            headers.map((key, i) => [key, row[i]])
                        ) as unknown as Story
                );
            };

            const stories = await fetchStories();

            const storyHeaders = (await fetchGoogleSheetsData("NewsStory"))[0];
            const departmentHeader = storyHeaders.find((header: string) =>
                header.toLowerCase().includes("department")
            );

            if (!departmentHeader) {
                console.error("Department header not found in stories sheet.");
                setDeptStories([]);
                return;
            }

            const relatedStories = stories.filter(
                (story) =>
                    (story[departmentHeader as keyof Story] as string)
                        ?.toLowerCase()
                        .trim() ===
                    departmentDetails?.Department?.toLowerCase().trim()
            );

            setDeptStories(relatedStories);
        } else {
            setErrorMessage("Department not found.");
        }
    };

    return (
        <div className="department-lookup">
            <h1>Department Lookup</h1>
            <div className="form-container">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSearch();
                    }}
                    className="lookup-form">
                    <div className="form-group">
                        <label htmlFor="department">
                            Enter Department Name:
                        </label>
                        <input
                            type="text"
                            id="department"
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            placeholder="e.g., 2-5-0 Melville F.D."
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="year">Select Year:</label>
                        <select
                            id="year"
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            required>
                            <option value="2025">2025</option>
                            <option value="2024">2024</option>
                        </select>
                    </div>
                    <button type="submit" className="btn-primary">
                        Search
                    </button>
                </form>
            </div>

            {errorMessage && (
                <div className="alert alert-danger">{errorMessage}</div>
            )}

            {departmentData && (
                <>
                    <div className="card">
                        <h2>Department Information</h2>
                        <table>
                            <tbody>
                                <tr>
                                    <th>Name</th>
                                    <td>{departmentData.Department}</td>
                                </tr>
                                <tr>
                                    <th>Year</th>
                                    <td>{departmentData.Year}</td>
                                </tr>
                                <tr>
                                    <th>Number of Fires</th>
                                    <td>{departmentData.Fires}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {incidents.length > 0 && (
                        <>
                            <div className="card">
                                <h3>Incidents</h3>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Address</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {incidents.map((incident, index) => (
                                            <tr key={index}>
                                                <th>{incident["Fire Date"]}</th>
                                                <td>{incident.Address}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <Suspense fallback={<div>Loading...</div>}>
                                <DepartmentMonthlyChart incidents={incidents} />
                                <DepartmentMap
                                    incidents={incidents}
                                    stories={deptStories}
                                />
                            </Suspense>
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default DepartmentLookup;
