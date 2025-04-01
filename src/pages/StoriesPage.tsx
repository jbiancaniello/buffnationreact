import React, { useEffect, useState } from "react";
import { Story, Incident } from "../types";
import { fetchRecentIncidents } from "../api/fetchRecentIncidents"; // ✅ Import the function
import "../styles/StoriesPage.css";

const StoriesPage: React.FC = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);

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

  const fetchStoriesWithPhotos = async () => {
    const data = await fetchGoogleSheetsData();
    if (!data || data.length === 0) {
      console.warn("No stories found");
      return;
    }

    const storiesWithPhotos = data.map((story) => {
      const photoUrl = story["Display Photo"] ? story["Display Photo"].trim() : null;
      return { ...story, photoUrl };
    });

    setStories(storiesWithPhotos.reverse().slice(0, 5)); // Show latest 5 stories
  };

  const BreakingNewsTicker: React.FC<{ incidents: Incident[] }> = ({ incidents }) => {
    return (
      <div className="breaking-news-container">
        <div className="breaking-news-ticker">
          Recent Working Fires: 
          {incidents.map((incident, index) => (
            <span key={index} className="ticker-item">
              {incident["Fire Date"]} - {incident.Address}, {incident.Department} &nbsp; | &nbsp;
            </span>
          ))}
        </div>
      </div>
    );
  };

  useEffect(() => {
    document.title = "News";
    fetchStoriesWithPhotos();

    const fetchIncidents = async () => {
      const incidentData = await fetchRecentIncidents(); // ✅ Use the shared method
      setIncidents(incidentData); // It already returns the latest 5 incidents
    };

    fetchIncidents();
  }, []);

  if (stories.length === 0) {
    return <div>Loading stories...</div>;
  }

  const mainStory = stories[0];
  const otherStories = stories.slice(1, 5);

  return (
    <div className="stories-page">
      <BreakingNewsTicker incidents={incidents} />

      <h1>Top Story</h1>

      {/* Main Story */}
      <div className="main-story">
        {mainStory.photoUrl ? (
          <img src={mainStory.photoUrl} alt={mainStory.Headline} className="main-story-image" />
        ) : null}
        <div className="main-story-content">
          <h2>{mainStory.Headline}</h2>
          <div className="metadata">
            <span>{formatDate(new Date(mainStory.Date))}</span>
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

      <section className="advertisement-section">
        <div className="advertisement-row">
          <a href="https://jrliindustries.com/estimate-inquiry/" target="_blank" rel="noopener noreferrer">
            <img src="/advertisements/IMG_0663.PNG" alt="Advertisement" className="ad-image ad-image-1" />
          </a>

          <div className="ad-text-block">
            <div className="ad-text-line">Junk Removal & Demolition</div>
            <div className="ad-phone">631-600-0262</div>
          </div>

          <a href="https://jrliindustries.com/estimate-inquiry/" target="_blank" rel="noopener noreferrer">
            <img src="/advertisements/IMG_0662.PNG" alt="Advertisement" className="ad-image ad-image-2" />
          </a>
        </div>
      </section>

      {/* Latest News */}
      <section className="latest-news">
        <div className="latest-news-header">
          <h2>Latest News</h2>
          <a href="/news" className="see-all-link">
            See all
          </a>
        </div>
        <div className="news-grid">
          {otherStories.map((story) => (
            <div key={story.id} className="news-card">
              {story.photoUrl ? (
                <img src={story.photoUrl} alt={story.Headline} className="news-card-image" />
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
          ))}
        </div>
      </section>
    </div>
  );
};

export default StoriesPage;
