import React from "react";
import { Routes, Route } from "react-router-dom";
import LandingPage from "../pages/LandingPage";
import DashboardPage from "../pages/DashboardPage";
import DepartmentLookup from "../pages/DepartmentLookup";
import StoriesPage from "../pages/StoriesPage";
import StoryDetail from "../pages/StoryDetail";

const AppRoutes: React.FC = () => {
    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/department-lookup" element={<DepartmentLookup />} />
            <Route path="/news" element={<StoriesPage />} />
            <Route path="/story/:id" element={<StoryDetail />} />
        </Routes>
    );
};

export default AppRoutes;
