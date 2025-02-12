import React from "react";
import { Routes, Route } from "react-router-dom";
import DashboardPage from "../pages/DashboardPage";
import DepartmentLookup from "../pages/DepartmentLookup";
import StoriesPage from "../pages/StoriesPage";
import AllStoriesPage from "../pages/AllStoriesPage";
import StoryDetail from "../pages/StoryDetail";
import About from "../pages/About";

const AppRoutes: React.FC = () => {
    return (
        <Routes>
            <Route path="/" element={<StoriesPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/department-lookup" element={<DepartmentLookup />} />
            <Route path="/news" element={<StoriesPage />} />
            <Route path="/all-stories" element={<AllStoriesPage />} />
            <Route path="/story/:id" element={<StoryDetail />} />
            <Route path="/about" element={<About />} />
        </Routes>
    );
};

export default AppRoutes;
