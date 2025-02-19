import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Helmet, HelmetProvider } from "react-helmet-async";
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

    const formatDate = (date: Date): string => {
        if (!(date instanceof Date) || isNaN(date.getTime())) {
            return "Invalid date";
        }
        return date.toISOString(); // ISO format for structured data
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

    const imageUrl = story["Display Photo"];
    const linkToImage = story["Link to image"];
    const publishedDate = formatDate(story.Date);

    // Define JSON-LD structured data
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        headline: story.Headline,
        image: imageUrl || "https://example.com/default-image.jpg",
        datePublished: publishedDate,
        author: {
            "@type": "Person",
            name: "Your Website Name", // Replace with the actual author or site name
        },
        publisher: {
            "@type": "Organization",
            name: "Your Website Name",
            logo: {
                "@type": "ImageObject",
                url: "https://example.com/logo.jpg", // Replace with your website logo
            },
        },
        description: story["Body Text"].substring(0, 150),
        mainEntityOfPage: {
            "@type": "WebPage",
            "@id": window.location.href,
        },
    };

    const imgUrl = imageUrl?.toString();

    return (
        <HelmetProvider>
            <div className="story-details-page">
                {/* Helmet for dynamic meta tags and JSON-LD */}
                <Helmet>
                    <title>{story.Headline} - Latest News</title>
                    <meta
                        name="description"
                        content={story["Body Text"].substring(0, 150)}
                    />
                    <meta property="og:title" content={story.Headline} />
                    <meta
                        property="og:description"
                        content={story["Body Text"].substring(0, 150)}
                    />
                    <meta
                        property="og:image"
                        content={
                            imgUrl || "https://example.com/default-image.jpg"
                        }
                    />
                    <meta property="og:type" content="article" />
                    <meta property="og:url" content={window.location.href} />

                    {/* Add JSON-LD structured data */}
                    <script type="application/ld+json">
                        {JSON.stringify(structuredData)}
                    </script>
                </Helmet>

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
                        <strong>Date:</strong>{" "}
                        {new Date(story.Date).toLocaleDateString()}
                    </p>
                    <p>
                        <strong>Location:</strong> {story["Location - Street"]},{" "}
                        {story["Location - Town"]}
                    </p>
                    <p>{story["Body Text"]}</p>
                </div>
                {/* Back Button */}
                <div>
                    <a
                        href={window.history.length > 1 ? "#" : "/news"}
                        className="back-button"
                        onClick={(e) => {
                            if (window.history.length > 1) {
                                e.preventDefault();
                                window.history.back();
                            }
                        }}>
                        ← Back
                    </a>
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
            </div>
        </HelmetProvider>
    );
};

export default StoryDetailsPage;
