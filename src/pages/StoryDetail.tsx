import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Story } from "../types";

const StoryDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [story, setStory] = useState<Story | null>(null);
  const [error, setError] = useState<string | null>(null);

  const apiKey = process.env.REACT_APP_API_KEY as string;
  const storySpreadsheetId = "1c0ZiOjzHAkhaEgucExY0logR9P7S6cRbaxtVz4MC2jY";

  const fetchGoogleSheetsData = async (sheetName: string): Promise<Story[]> => {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${storySpreadsheetId}/values/${sheetName}?key=${apiKey}`;
    try {
      const response = await fetch(url);
      const data = await response.json();

      if (!data.values) return [];
      const headers = data.values[0];
      const rows = data.values.slice(1);

      return rows.map((row: string[]) => {
        const story = Object.fromEntries(
          headers.map((key: string, i: number) => [key, row[i]])
        ) as Story;

        if (story.Date) {
          story.Date = new Date(story.Date);
        }

        return story;
      });
    } catch (error) {
      console.error("Error fetching data from Google Sheets:", error);
      return [];
    }
  };

  const formatDate = (date: Date): string => {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return "Invalid date";
    }
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const generateSlug = (headline: string): string => {
    return headline
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric characters with hyphens
      .replace(/(^-|-$)/g, "");   // Remove leading or trailing hyphens
  };  

  useEffect(() => {
    const fetchStory = async () => {
      try {
        const stories = await fetchGoogleSheetsData("NewsStory");
        
        console.log("Fetched stories:", stories); // Log all stories fetched
        console.log("URL id:", id);               // Log the `id` from the URL
    
        const selectedStory = stories.find(
          (story) => generateSlug(story.Headline) === id
        );
    
        if (selectedStory) {
          console.log("Selected story:", selectedStory); // Log the matched story
          setStory(selectedStory);
        } else {
          console.error("Story not found for slug:", id); // Log the unmatched slug
          setError("Story not found.");
        }
      } catch (err) {
        console.error("Error in fetchStory:", err);
        setError("An error occurred while fetching the story.");
      }
    };    

    fetchStory();
  }, [id]);

  if (error) {
    return <div>{error}</div>;
  }

  if (!story) {
    return <div>Loading story...</div>;
  }

  return (
    <div className="story-details-page">
      <h1>{story.Headline}</h1>
      <img
        src={story["Link to image"]}
        alt={story.Headline}
        className="story-image"
      />
      <div>
        <p><strong>Date:</strong> {formatDate(story.Date)}</p>
        <p><strong>Location:</strong> {story["Location - Street"]}, {story["Location - Town"]}</p>
        <p>{story["Body Text"]}</p>
      </div>
    </div>
  );
};

export default StoryDetailsPage;
