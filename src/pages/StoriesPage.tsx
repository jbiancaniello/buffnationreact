import React, { useEffect, useState } from "react";
import { Story } from "../types";
import "../styles/StoriesPage.css";

const StoriesPage: React.FC = () => {
  const [stories, setStories] = useState<Story[]>([]);

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
      .replace(/(^-|-$)/g, ""); // Remove leading or trailing hyphens
  };

  const fetchGoogleSheetsData = async (): Promise<Story[]> => {
    const apiKey = process.env.REACT_APP_API_KEY as string;
    const spreadsheetId = "1c0ZiOjzHAkhaEgucExY0logR9P7S6cRbaxtVz4MC2jY"; // Replace with your Google Sheet ID
    const sheetName = "NewsStory";
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}?key=${apiKey}`;

    try {
      if (!apiKey) {
        console.error("Missing API key");
        return [];
      }

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

  const extractImageThumbnailUrl = (link: string | undefined, isMainStory: boolean = false): string | undefined => {
    if (!link) {
      return undefined; // Return undefined if the link is undefined or empty
    }
    const imageId = link.split("id=")[1];
    return imageId
      ? `https://drive.google.com/thumbnail?id=${imageId}&sz=w1024-h768`
      : undefined; // Return undefined if imageId is not found
  };

  useEffect(() => {
    const fetchStories = async () => {
      const data = await fetchGoogleSheetsData();
      if (!data || data.length === 0) {
        console.warn("No stories found");
        return;
      }

      const formattedStories = data.map((story: any) => ({
        ...story,
        id: generateSlug(story.Headline), // Generate slug here
      }));

      // Reverse the order to get the newest stories first
      setStories(formattedStories.reverse().slice(0, 5));
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
      <h1>Latest Story</h1>

      {/* Main Story */}
      <div className="main-story">
        {extractImageThumbnailUrl(mainStory["Display Photo"], true) ? (
          <img
            src={extractImageThumbnailUrl(mainStory["Display Photo"], true)}
            alt={mainStory.Headline}
            className="main-story-image"
          />
        ) : null}
        <div className="main-story-content">
          <h2>{mainStory.Headline}</h2>
          <div className="metadata">
            <span>{formatDate(new Date(mainStory.Date))}</span> {/* Format the Date */}
          </div>
          <p>{mainStory["Body Text"]}</p>
          <button
            className="read-more-button"
            onClick={() => (window.location.href = `/story/${generateSlug(mainStory.Headline)}`)}
          >
            Read More
          </button>
        </div>
      </div>

      {/* Latest News */}
      <section className="latest-news">
        <div className="latest-news-header">
          <h2>Latest News</h2>
          <a href="/all-stories" className="see-all-link">
            See all
          </a>
        </div>
        <div className="news-grid">
          {otherStories.map((story) => {
            const imageUrl = extractImageThumbnailUrl(story["Display Photo"], false); // Use thumbnail size
            return (
              <div key={story.id} className="news-card">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={story.Headline}
                    className="news-card-image"
                  />
                ) : null}
                <div className="news-card-content">
                  <h3>{story.Headline}</h3>
                  <div className="metadata">
                    <span>{formatDate(new Date(story.Date))}</span>
                  </div>
                  <p>{story["Body Text"]}</p>
                  <button
                    className="read-more-button"
                    onClick={() => (window.location.href = `/story/${generateSlug(story.Headline)}`)}
                  >
                    Read More
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default StoriesPage;
