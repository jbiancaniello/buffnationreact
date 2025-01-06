import React, { useEffect, useState } from "react";
import { Story } from "../types";
import "../styles/AllStoriesPage.css";

const AllStoriesPage: React.FC = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const storiesPerPage = 9;
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
      setError("Failed to fetch stories.");
      return [];
    }
  };

  const extractImageThumbnailUrl = (link: string | undefined): string | undefined => {
    if (!link) {
      return undefined;
    }
    const imageId = link.split("id=")[1];
    return imageId
      ? `https://drive.google.com/thumbnail?id=${imageId}&sz=w1024-h768`
      : undefined;
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
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  useEffect(() => {
    const fetchStories = async () => {
      const data = await fetchGoogleSheetsData("NewsStory");
      setStories(data.reverse()); // Reverse for newest first
    };
    fetchStories();
  }, []);

  const indexOfLastStory = currentPage * storiesPerPage;
  const indexOfFirstStory = indexOfLastStory - storiesPerPage;
  const currentStories = stories.slice(indexOfFirstStory, indexOfLastStory);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="all-stories-page">
      <h1>All News</h1>
      <div className="stories-grid">
        {currentStories.map((story) => {
          const imageUrl = extractImageThumbnailUrl(story["Display Photo"]);
          return (
            <div key={story.id} className="story-card">
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt={story.Headline}
                  className="story-card-image"
                />
              )}
              <div className="story-card-content">
                <h3>{story.Headline}</h3>
                <div className="metadata">
                  <span>{formatDate(story.Date)}</span>
                </div>
                <p>{story["Body Text"]}</p>
                <button
                  className="read-more-button"
                  onClick={() =>
                    (window.location.href = `/story/${generateSlug(
                      story.Headline
                    )}`)
                  }
                >
                  Read More
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      <div className="pagination">
        {Array.from(
          { length: Math.ceil(stories.length / storiesPerPage) },
          (_, i) => (
            <button
              key={i + 1}
              onClick={() => paginate(i + 1)}
              className={currentPage === i + 1 ? "active" : ""}
            >
              {i + 1}
            </button>
          )
        )}
      </div>
    </div>
  );
};

export default AllStoriesPage;
