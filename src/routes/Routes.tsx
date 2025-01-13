import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";

// Lazy load all the pages
const LandingPage = React.lazy(() => import("../pages/LandingPage"));
const DashboardPage = React.lazy(() => import("../pages/DashboardPage"));
const DepartmentLookup = React.lazy(() => import("../pages/DepartmentLookup"));
const StoriesPage = React.lazy(() => import("../pages/StoriesPage"));
const StoryDetail = React.lazy(() => import("../pages/StoryDetail"));
const AllStoriesPage = React.lazy(() => import("../pages/AllStoriesPage"));

const AppRoutes: React.FC = () => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/department-lookup" element={<DepartmentLookup />} />
                <Route path="/news" element={<StoriesPage />} />
                <Route path="/all-stories" element={<AllStoriesPage />} />
                <Route path="/story/:id" element={<StoryDetail />} />
            </Routes>
        </Suspense>
    );
};

export default AppRoutes;
