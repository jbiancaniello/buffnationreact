import { Story } from "../types";

export const fetchNewsData = async (): Promise<Story[]> => {
  const API_KEY = process.env.REACT_APP_API_KEY;
  const SPREADSHEET_ID = "1c0ZiOjzHAkhaEgucExY0logR9P7S6cRbaxtVz4MC2jY";
  const SHEET_NAME = "NewsStory";

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}?key=${API_KEY}`;

  const generateSlug = (headline: string): string => {
    return headline
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric characters with hyphens
      .replace(/(^-|-$)/g, "");   // Remove leading or trailing hyphens
  };

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error("Failed to fetch news data:", response.statusText);
      return [];
    }

    const data = await response.json();
    const rows = data.values || [];
    const headers = rows[0];
    const rowData = rows.slice(1);

    // Transform rows into story objects
    const stories: Story[] = rowData.map((row: string[]) => {
      const rawDate = row[0]; // Assuming the first column contains the date
      const parsedDate = new Date(rawDate);

      const headline = row[6] || "Untitled Story";

      return {
        Headline: headline,
        "Link to image": row[10]
          ? `https://drive.google.com/thumbnail?id=${row[10].split("id=")[1]}&sz=w1024-h768`
          : "",
        "Body Text": row[8] || "",
        photoGallery: row[9] || "",
        Date: !isNaN(parsedDate.getTime()) ? parsedDate : new Date(),
        "Location - Street": row[2] || "Unknown Street",
        "Location - Town": row[3] || "Unknown Town",
        Latitude: row[4] || "",
        Longitude: row[5] || "",
        Department: row[1] || "Unknown Department",
        headlineUrl: `/story/${generateSlug(headline)}`, // Use the generateSlug function for consistency
        id: generateSlug(headline), // Use slugified headline as id
      };
    });

    // Sort stories by Date descending and return the 4 most recent
    return stories
      .filter((story) => !isNaN(story.Date.getTime())) // Ensure valid dates
      .sort((a, b) => b.Date.getTime() - a.Date.getTime())
      .slice(0, 4);
  } catch (error) {
    console.error("Error fetching news data:", error);
    return [];
  }
};
