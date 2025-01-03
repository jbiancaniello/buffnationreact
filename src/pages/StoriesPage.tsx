import React, { useEffect, useState } from "react";
import { Story } from "../types";
import "../styles/StoriesPage.css";

const StoriesPage: React.FC = () => {
  const [stories, setStories] = useState<Story[]>([]);

  const generateSlug = (headline: string): string => {
    return headline
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric characters with hyphens
      .replace(/(^-|-$)/g, ""); // Remove leading or trailing hyphens
  };

  const fetchGoogleSheetsData = async (): Promise<Story[]> => {
    const apiKey = process.env.REACT_APP_API_KEY as string;
    const spreadsheetId = "1c0ZiOjzHAkhaEgucExY0logR9P7S6cRbaxtVz4MC2jY"; // Replace with your Google Sheet ID
    const sheetName = "NewsStory";
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}?key=${apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (!data.values) {
        throw new Error("No data found in the sheet.");
      }

      const headers = data.values[0];
      const rows = data.values.slice(1);

      return rows.map((row: string[]) => {
        const story = Object.fromEntries(headers.map((key: string, i: number) => [key, row[i]]));
        return {
          ...story,
          id: generateSlug(story.Headline),
        } as Story;
      });
    } catch (error) {
      console.error("Error fetching stories from Google Sheets:", error);
      return [];
    }
  };

  useEffect(() => {
    const fetchStories = async () => {
      const data = await fetchGoogleSheetsData();
      const formattedStories = data.map((story: any) => ({
        ...story,
        id: generateSlug(story.Headline), // Generate slug here
      }));
      
      console.log("Formatted stories with ids:", formattedStories); // Log the stories with ids
      setStories(formattedStories.slice(0, 5)); // Limit to 5 most recent stories
    };
    fetchStories();
  }, []);  

  if (stories.length === 0) {
    return <div>Loading stories...</div>;
  }

  const mainStory = stories[0];
  const otherStories = stories.slice(1, 5);

  return (
    <div className="stories-page">
      <h1>Latest Stories</h1>

      {/* Main Story */}
      <div className="main-story">
        <img
          src={mainStory["Link to image"]}
          alt={mainStory.Headline}
          className="main-story-image"
        />
        <div className="main-story-content">
          <h2>{mainStory.Headline}</h2>
          <p>{mainStory["Body Text"]}</p>
          <button
            className="read-more-button"
            onClick={() => window.location.href = `/story/${generateSlug(mainStory.Headline)}`}
          >
            Read More
          </button>
        </div>
      </div>

      {/* Other Stories */}
      <div className="other-stories">
        {otherStories.map((story) => (
          <div key={story.id} className="story-card">
            <img
              src={story["Link to image"]}
              alt={story.Headline}
              className="story-card-image"
            />
            <div className="story-card-content">
              <h3>{story.Headline}</h3>
              <p>{story["Body Text"]}</p>
              <button
                className="read-more-button"
                onClick={() => window.location.href = `/story/${generateSlug(story.Headline)}`}
              >
                Read More
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* See All Stories Button */}
      <div className="see-all-stories">
        <button
          className="see-all-button"
          onClick={() => (window.location.href = "/all-stories")}
        >
          See All Stories
        </button>
      </div>
    </div>
  );
};

export default StoriesPage;
