import React from "react";
import { useNavigate } from "react-router-dom";
import { Story } from "../types";
import "../styles/RecentStories.css";

interface Props {
    stories: Story[];
}

const RecentStories: React.FC<Props> = ({ stories }) => {
    const navigate = useNavigate(); // Initialize the navigate hook

    return (
        <div className="recent-stories">
            <h2>Recent News</h2>
            <div className="story-list">
                {stories.map((story: Story, index: number) => {
                    console.log(story);
                    const imageId = story["Link to image"].split("id=")[1];
                    const imageUrl = imageId
                        ? `https://drive.google.com/thumbnail?id=${imageId}&sz=w1024-h768`
                        : "";

                    return (
                        <div className="story-card" key={index}>
                            {/* Left Section: Title and Button */}
                            <div className="story-content">
                                <h3 className="story-title">{story.Headline}</h3>
                                <button
                                    className="read-more-button"
                                    onClick={() => navigate(story.headlineUrl)} // Navigate to headlineUrl
                                >
                                    Read More
                                </button>
                            </div>

                            {/* Right Section: Story Image */}
                            {imageUrl ? (
                                <div className="story-image-container">
                                    <img
                                        src={imageUrl}
                                        alt={story.Headline}
                                        className="story-image"
                                    />
                                </div>
                            ) : null}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default RecentStories;
