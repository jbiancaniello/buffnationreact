import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import fireIconUrl from "../assets/fire_marker.png";
import newsIconUrl from "../assets/news_marker.png";
import { Incident, Story } from "../types";

interface DepartmentMapProps {
  incidents: Incident[];
  stories: Story[];
}

const DepartmentMap: React.FC<DepartmentMapProps> = ({ incidents, stories }) => {
  const mapRef = useRef<L.Map | null>(null);
  const fireLayerRef = useRef<L.LayerGroup | null>(null);
  const storyLayerRef = useRef<L.LayerGroup | null>(null);

  const validMarkers = (marker: L.Marker | null): marker is L.Marker => marker !== null;

  useEffect(() => {
    // Initialize map
    if (!mapRef.current) {
      mapRef.current = L.map("department-map", {
        center: [40.7128, -74.006],
        zoom: 10,
      });
  
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
      }).addTo(mapRef.current);
  
      // Add layer toggles
      const customControl = L.Control.extend({
        onAdd: () => {
          const div = L.DomUtil.create("div", "map-control");
          div.innerHTML = `
            <label><input type="checkbox" id="toggleFires" checked /> Fires</label><br />
            <label><input type="checkbox" id="toggleStories" checked /> Stories</label>
          `;
          div.style.background = "#161b22";
          div.style.padding = "10px";
          div.style.borderRadius = "5px";
          div.style.color = "#c9d1d9";
          div.style.fontSize = "14px";
          div.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.2)";
          L.DomEvent.disableClickPropagation(div);
          return div;
        },
      });
  
      new customControl({ position: "topright" }).addTo(mapRef.current);
    }
  
    const createIcon = (iconUrl: string) =>
      L.icon({
        iconUrl,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });
  
    // Initialize fireIcon and storyIcon BEFORE using them
    const fireIcon = createIcon(fireIconUrl);
    const storyIcon = createIcon(newsIconUrl);
  
    fireLayerRef.current = L.layerGroup(
      incidents
        .map((incident) => {
          const lat = parseFloat(incident.Latitude);
          const lng = parseFloat(incident.Longitude);
          if (!isNaN(lat) && !isNaN(lng)) {
            return L.marker([lat, lng], { icon: fireIcon }).bindPopup(
              `<strong>${incident.Department}</strong><br>
               <em>${incident.Address}, ${incident.Town}</em><br>
               <strong>Division:</strong> ${incident.Battalion || "N/A"}<br>
               <strong>Date:</strong> ${incident["Fire Date"] || "N/A"}`
            );
          }
          return null;
        })
        .filter(validMarkers)
    );
  
    storyLayerRef.current = L.layerGroup(
      stories
        .map((story) => {
          const lat = parseFloat(story.Latitude);
          const lng = parseFloat(story.Longitude);
          if (!isNaN(lat) && !isNaN(lng)) {
            return L.marker([lat, lng], { icon: storyIcon }).bindPopup(
              `<strong>${story.Headline || "No Title"}</strong><br>
               <em>${story["Location - Street"] || "Unknown Street"}, ${story["Location - Town"] || "Unknown Town"}</em><br>
               <strong>Date:</strong> ${story.Date || "N/A"}<br>
               <a href="${story["Link to image"] || "#"}" target="_blank">Read More</a>`
            );
          }
          return null;
        })
        .filter(validMarkers)
    );
  
    fireLayerRef.current?.addTo(mapRef.current!);
    storyLayerRef.current?.addTo(mapRef.current!);
  
    const allCoords = [
      ...incidents.map((incident) => [parseFloat(incident.Latitude), parseFloat(incident.Longitude)]),
      ...stories.map((story) => [parseFloat(story.Latitude), parseFloat(story.Longitude)]),
    ].filter(([lat, lng]) => !isNaN(lat) && !isNaN(lng));
  
    if (allCoords.length > 0) {
      const bounds = L.latLngBounds(allCoords as [number, number][]);
      mapRef.current.fitBounds(bounds);
    }
  
    const toggleFires = document.getElementById("toggleFires") as HTMLInputElement;
    const toggleStories = document.getElementById("toggleStories") as HTMLInputElement;
  
    const handleLayerToggle = (
      layer: L.LayerGroup | null,
      toggleElement: HTMLInputElement
    ) => {
      if (layer) {
        if (toggleElement.checked) {
          layer.addTo(mapRef.current!);
        } else {
          layer.remove();
        }
      }
    };
  
    toggleFires?.addEventListener("change", () => handleLayerToggle(fireLayerRef.current, toggleFires));
    toggleStories?.addEventListener("change", () =>
      handleLayerToggle(storyLayerRef.current, toggleStories)
    );
  
    return () => {
      fireLayerRef.current?.clearLayers();
      storyLayerRef.current?.clearLayers();
    };
  }, [incidents, stories]);
  

  return <div id="department-map" style={{ height: "500px", width: "100%" }} />;
};

export default DepartmentMap;
