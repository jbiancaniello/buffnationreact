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
        {stories.map((story, index) => (
          <div className="story-card" key={index}>
            {/* Left Section: Title and Button */}
            <div className="story-content">
              <h3 className="story-title">{story.title}</h3>
              <button
                className="read-more-button"
                onClick={() => {
                  // Replace with navigation logic later
                  alert(`Navigate to: ${story.headlineUrl}`);
                }}
              >
                Read More
              </button>
            </div>

            {/* Right Section: Story Image */}
            <div className="story-image-container">
              <img
                src={story.imageUrl}
                alt={story.title}
                className="story-image"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentStories;
