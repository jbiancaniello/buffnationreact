import React from "react";
import { Story } from "../types";
import "../styles/RecentStories.css";

interface Props {
    stories: Story[];
}

const RecentStories: React.FC<Props> = ({ stories }) => {
    return (
        <div className="recent-stories">
            <h2>Recent Stories</h2>
            <div className="story-list">
                {stories.map((story: Story, index: number) => {
                    const imageId = story.imageUrl?.split("id=")[1];
                    const imageUrl = imageId
                        ? `https://drive.google.com/thumbnail?id=${imageId}&sz=w1024-h768`
                        : "";

                    return (
                        <div className="story-card" key={index}>
                            {/* Left Section: Title and Button */}
                            <div className="story-content">
                                <h3 className="story-title">{story.title}</h3>
                                <button
                                    className="read-more-button"
                                    onClick={() => {
                                        // Replace with navigation logic later
                                        alert(
                                            `Navigate to: ${story.headlineUrl}`
                                        );
                                    }}>
                                    Read More
                                </button>
                            </div>

                            {/* Right Section: Story Image */}
                            {imageUrl ? (
                                <div className="story-image-container">
                                    <img
                                        src={imageUrl}
                                        alt={story.title}
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
