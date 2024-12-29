import { Story } from "../types";

export const fetchNewsData = async (): Promise<Story[]> => {
  const API_KEY = process.env.REACT_APP_API_KEY;
  const SPREADSHEET_ID = "1c0ZiOjzHAkhaEgucExY0logR9P7S6cRbaxtVz4MC2jY";
  const SHEET_NAME = "NewsStory";

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}?key=${API_KEY}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error("Failed to fetch news data:", response.statusText);
      return [];
    }

    const data = await response.json();
    const rows = data.values || [];

    // Transform rows into story objects
    const stories: Story[] = rows.slice(1).map((row: string[]) => ({
      title: row[6] || "Untitled Story",
      imageUrl: row[10]
        ? `https://drive.google.com/thumbnail?id=${row[10].split("id=")[1]}&sz=w1024-h768`
        : "",
      headlineUrl: `/story/${(row[6] || "untitled-story")
        .replace(/\s+/g, "-")
        .toLowerCase()}`,
      description: row[8] || "",
      photoGallery: row[9] || "",
      date: new Date(row[0]), // Assuming row[0] contains the date
    }));

    // Sort stories by date descending and return the 4 most recent
    return stories
      .sort((a: Story, b: Story) => b.date.getTime() - a.date.getTime()) // Explicitly type a and b
      .slice(0, 4); // Get the 4 most recent
  } catch (error) {
    console.error("Error fetching news data:", error);
    return [];
  }
};
