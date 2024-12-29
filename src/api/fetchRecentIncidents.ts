import { Incident } from "../types";

const API_KEY = process.env.REACT_APP_API_KEY;
const SPREADSHEET_ID = "1m1yjSvmhY0HbAePiA8e4td95l9lqOgFoZmlIu8wBTqU";

export const fetchRecentIncidents = async (): Promise<Incident[]> => {
  const fetchIncidents = async (sheetName: string): Promise<Incident[]> => {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${sheetName}?key=${API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) {
      console.error(
        `Failed to fetch incidents from ${sheetName}`,
        response.statusText,
      );
      return [];
    }

    const data = await response.json();
    const rows = data.values || [];
    const headers = rows[0];
    const incidents = rows.slice(1).map((row: any[]) =>
      headers.reduce((acc: any, header: string, index: number) => {
        acc[header] = row[index];
        return acc;
      }, {}),
    );
    return incidents;
  };

  try {
    const suffolkIncidents = await fetchIncidents(
      "Suffolk%20County%20Working%20Fire%20Total",
    );
    const nassauIncidents = await fetchIncidents(
      "Nassau%20County%20Working%20Fire%20Total",
    );

    // Combine, sort by date, and limit to 5 most recent
    const allIncidents = [...suffolkIncidents, ...nassauIncidents];
    allIncidents.sort((a, b) => {
      const dateA = new Date(a["Fire Date"]);
      const dateB = new Date(b["Fire Date"]);
      return dateB.getTime() - dateA.getTime(); // Sort descending
    });

    // Return only the 5 most recent incidents
    return allIncidents.slice(0, 5).map((incident) => ({
      ...incident,
      "Fire Date": new Date(incident["Fire Date"]).toLocaleDateString("en-US"),
    }));
  } catch (error) {
    console.error("Error fetching incidents:", error);
    return [];
  }
};
