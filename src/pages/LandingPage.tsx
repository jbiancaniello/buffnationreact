import React, { useEffect, useState } from "react";
import RecentIncidents from "../components/RecentIncidents";
import RecentStories from "../components/RecentStories";
import { fetchNewsData } from "../api/fetchNewsData";
import { fetchRecentIncidents } from "../api/fetchRecentIncidents";
import { Story, Incident } from "../types";
import "../styles/LandingPage.css";
import "../styles/global.css";

const LandingPage: React.FC = () => {
  const [recentIncidents, setRecentIncidents] = useState<Incident[]>([]);
  const [recentStories, setRecentStories] = useState<Story[]>([]);

  useEffect(() => {
    // Fetch recent incidents
    const fetchIncidents = async () => {
      const incidents = await fetchRecentIncidents();
      setRecentIncidents(incidents);
    };

    // Fetch recent stories
    const fetchStories = async () => {
      const stories = await fetchNewsData();
      setRecentStories(stories);
    };

    fetchIncidents();
    fetchStories();
  }, []);

  return (
    <div className="landing-page">
      <header className="text-center">
        <h1>Welcome to Buff Nation</h1>
        <h2>A dynamic hub for real-time fire data and incidents</h2>
        <h2>Stay connected and informed with us.</h2>
      </header>
      <div className="landing-page-content">
        <div className="recent-incidents">
          <RecentIncidents incidents={recentIncidents} />
        </div>
        <div className="recent-stories">
          <RecentStories stories={recentStories} />
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
