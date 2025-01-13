import React, { useEffect, useRef } from "react";
import { Incident, Story } from "../types";

interface DepartmentMapProps {
  incidents: Incident[];
  stories: Story[];
}

const DepartmentMap: React.FC<DepartmentMapProps> = ({ incidents, stories }) => {
  const mapRef = useRef<any>(null);// comment to force redeploy

  useEffect(() => {
    let L: any;

    const initializeMap = async () => {
      try {
        // Dynamically import Leaflet
        L = await import("leaflet");

        // Initialize the map
        if (!mapRef.current) {
          mapRef.current = L.map("department-map", {
            center: [40.7128, -74.006],
            zoom: 10,
          });

          // Add tile layer
          L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
          }).addTo(mapRef.current);
        }

        // Add icons for markers
        const fireIcon = L.icon({
          iconUrl: "https://cdn.example.com/assets/fire_marker.png", // Replace with your CDN URL
          iconSize: [32, 32],
          iconAnchor: [16, 32],
        });

        const storyIcon = L.icon({
          iconUrl: "https://cdn.example.com/assets/news_marker.png", // Replace with your CDN URL
          iconSize: [32, 32],
          iconAnchor: [16, 32],
        });

        // Add markers for incidents
        const fireMarkers = incidents
          .filter(
            (incident) =>
              !isNaN(parseFloat(incident.Latitude)) && !isNaN(parseFloat(incident.Longitude))
          )
          .map((incident) =>
            L.marker([parseFloat(incident.Latitude), parseFloat(incident.Longitude)], {
              icon: fireIcon,
            }).bindPopup(
              `<strong>${incident.Department}</strong><br>
               <em>${incident.Address.trim()}</em><br>
               <strong>Division:</strong> ${incident.Battalion || "N/A"}<br>
               <strong>Date:</strong> ${incident["Fire Date"] || "N/A"}`
            )
          );

        // Add markers for stories
        const storyMarkers = stories
          .filter(
            (story) =>
              !isNaN(parseFloat(story.Latitude)) && !isNaN(parseFloat(story.Longitude))
          )
          .map((story) =>
            L.marker([parseFloat(story.Latitude), parseFloat(story.Longitude)], {
              icon: storyIcon,
            }).bindPopup(
              `<strong>${story.Headline || "No Title"}</strong><br>
               <em>${story["Location - Street"].trim() || "Unknown Street"}</em><br>
               <strong>Date:</strong> ${story.Date || "N/A"}<br>
               <a href="/story/${story.Headline?.toLowerCase().replace(/\s+/g, "-") || "#"}">Read More</a>`
            )
          );

        // Add layers to map
        const fireLayer = L.layerGroup(fireMarkers);
        const storyLayer = L.layerGroup(storyMarkers);

        fireLayer.addTo(mapRef.current);
        storyLayer.addTo(mapRef.current);

        // Fit bounds to markers
        const allCoords = [
          ...incidents.map((incident) => [parseFloat(incident.Latitude), parseFloat(incident.Longitude)]),
          ...stories.map((story) => [parseFloat(story.Latitude), parseFloat(story.Longitude)]),
        ].filter(([lat, lng]) => !isNaN(lat) && !isNaN(lng));

        if (allCoords.length > 0) {
          const bounds = L.latLngBounds(allCoords as [number, number][]);
          mapRef.current.fitBounds(bounds);
        }
      } catch (error) {
        console.error("Error loading Leaflet or adding markers:", error);
      }
    };

    initializeMap();

    // Cleanup function to avoid memory leaks
    return () => {
      if (mapRef.current) {
        mapRef.current.off();
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [incidents, stories]);

  return <div id="department-map" style={{ height: "500px", width: "100%" }} />;
};

export default DepartmentMap;
