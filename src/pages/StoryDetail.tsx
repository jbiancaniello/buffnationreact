import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Story } from "../types";
import "../styles/StoryDetail.css";

const StoryDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [story, setStory] = useState<Story | null>(null);
    const [error, setError] = useState<string | null>(null);

    const apiKey = process.env.REACT_APP_API_KEY as string;
    const storySpreadsheetId = "1c0ZiOjzHAkhaEgucExY0logR9P7S6cRbaxtVz4MC2jY";

    const fetchGoogleSheetsData = async (
        sheetName: string
    ): Promise<Story[]> => {
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

    const extractImageThumbnailUrl = (
        link: string | undefined
    ): string | undefined => {
        if (!link) {
            return undefined; // Return undefined if the link is undefined or empty
        }
        const imageId = link.split("id=")[1];
        return imageId
            ? `https://drive.google.com/thumbnail?id=${imageId}&sz=w1024-h768`
            : undefined; // Return undefined if imageId is not found
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
            .replace(/(^-|-$)/g, ""); // Remove leading or trailing hyphens
    };

    useEffect(() => {
        const fetchStory = async () => {
            try {
                const stories = await fetchGoogleSheetsData("NewsStory");

                const selectedStory = stories.find(
                    (story) => generateSlug(story.Headline) === id
                );

                if (selectedStory) {
                    setStory(selectedStory);
                } else {
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

    const imageUrl = extractImageThumbnailUrl(story["Display Photo"]);
    const linkToImage = story["Link to image"];

    return (
        <div className="story-details-page">
            <h1>{story.Headline}</h1>
            {imageUrl ? (
                <img
                    src={imageUrl}
                    alt={story.Headline}
                    className="story-image"
                />
            ) : (
                <p>No image available</p>
            )}
            <div className="story-content">
                <p>
                    <strong>Date:</strong> {formatDate(story.Date)}
                </p>
                <p>
                    <strong>Location:</strong> {story["Location - Street"]},{" "}
                    {story["Location - Town"]}
                </p>
                <p>{story["Body Text"]}</p>
            </div>
            {linkToImage && (
                <a
                    href={linkToImage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="view-image-button">
                    View More Photos
                </a>
            )}
        </div>
    );
};

export default StoryDetailsPage;
