import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import fireIconUrl from "../assets/fire_marker.png";
import newsIconUrl from "../assets/news_marker.png";

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";


L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

interface Story {
    [key: string]: string | undefined;
    3: string; // Additional Info
    4: string; // Location Info
    6: string; // Title
    9: string; // URL
    11: string; // Latitude
    12: string; // Longitude
}

interface Fire {
    [key: string]: string | undefined;
    0: string; // Date
    1: string; // Address
    3: string; // County
    4: string; // Battalion
    5: string; // Department
    6: string; // Description
    10: string; // Latitude
    11: string; // Longitude
}

interface MapSectionProps {
    selectedYear: string;
}

const MapSection: React.FC<MapSectionProps> = ({ selectedYear }) => {
    const mapRef = useRef<L.Map | null>(null);
    const [fireLayer, setFireLayer] = useState<L.LayerGroup | null>(null);
    const [newsLayer, setNewsLayer] = useState<L.LayerGroup | null>(null);

    const apiKey = process.env.REACT_APP_API_KEY;

    const fetchGoogleSheetsData = async (spreadsheetId: string, range: string) => {
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            return data.values || [];
        } catch (error) {
            console.error(`Error fetching data for range ${range}:`, error);
            return [];
        }
    };

    const generateSlug = (headline: string): string => {
        return headline
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
    };

    const processAndAddMarkers = (
        map: L.Map,
        iconUrl: string,
        data: any[],
        popupCallback: (item: any) => string,
        latIndex: number,
        lngIndex: number,
        dateIndex: number // New parameter to specify which index contains the date
    ) => {
        const icon = L.icon({
            iconUrl,
            iconSize: [32, 32],
            iconAnchor: [16, 32],
        });
    
        const layerGroup = L.layerGroup();
    
        data.forEach((item) => {
            const latitude = parseFloat(item[latIndex]);
            const longitude = parseFloat(item[lngIndex]);
            const year = item[dateIndex]?.split("/")[2]; // Extract year from the specified date index
            if (!isNaN(latitude) && !isNaN(longitude) && year === selectedYear) {
                L.marker([latitude, longitude], { icon })
                    .bindPopup(popupCallback(item))
                    .addTo(layerGroup);
            }
        });
    
        layerGroup.addTo(map);
        return layerGroup;
    };
    
    const initializeMap = async () => {
        const mapContainer = document.getElementById("map");
        if (!mapContainer) {
            console.error("Map container not found.");
            return;
        }
    
        if (!mapRef.current) {
            mapRef.current = L.map(mapContainer).setView([40.75072163753773, -72.94043070272603], 10);
    
            L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
            }).addTo(mapRef.current);
        }
    
        if (mapRef.current) {
            const fireSpreadsheetId = "1m1yjSvmhY0HbAePiA8e4td95l9lqOgFoZmlIu8wBTqU";
            const newsSpreadsheetId = "1c0ZiOjzHAkhaEgucExY0logR9P7S6cRbaxtVz4MC2jY";
    
            const fireData1 = await fetchGoogleSheetsData(fireSpreadsheetId, "'Suffolk County Working Fire Total'!A2:L");
            const fireData2 = await fetchGoogleSheetsData(fireSpreadsheetId, "'Nassau County Working Fire Total'!A2:L");
            const combinedFireData = [...fireData1, ...fireData2] as Fire[];
    
            const newsData = (await fetchGoogleSheetsData(newsSpreadsheetId, "'NewsStory'!A2:N")) as Story[];
    
            fireLayer?.clearLayers(); // Clear existing fire markers
            newsLayer?.clearLayers(); // Clear existing news markers
    
            const fireLayerGroup = processAndAddMarkers(
                mapRef.current,
                fireIconUrl,
                combinedFireData,
                (fire) =>
                    `<strong>${fire[5]}</strong><br>${fire[3]}<br>${fire[4]}, NY<br>${fire[1]}<br>${fire[0]}`,
                10, // Latitude index
                11, // Longitude index
                0 // Date index for fire incidents
            );
    
            const newsLayerGroup = processAndAddMarkers(
                mapRef.current,
                newsIconUrl,
                newsData,
                (story) =>
                    `<strong>${story[6]}</strong><br>${story[3]}<br>${story[4]}<br><a href="/story/${generateSlug(story[6])}" target="_blank">Read More</a>`,
                11, // Latitude index
                12, // Longitude index
                2 // Date index for news stories
            );
    
            setFireLayer(fireLayerGroup);
            setNewsLayer(newsLayerGroup);
    
            if (!document.querySelector(".map-control")) {
                const CustomControl = L.Control.extend({
                    onAdd: function () {
                        const div = L.DomUtil.create("div", "map-control");
                        div.innerHTML = `
                            <label><input type="checkbox" id="toggleFires" checked /> Fires</label><br />
                            <label><input type="checkbox" id="toggleNews" checked /> News</label>
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
    
                const control = new CustomControl({ position: "topright" });
                control.addTo(mapRef.current);
            }
    
            document.getElementById("toggleFires")?.addEventListener("change", (e) => {
                const isChecked = (e.target as HTMLInputElement).checked;
                if (mapRef.current && fireLayerGroup) {
                    if (isChecked) {
                        fireLayerGroup.addTo(mapRef.current);
                    } else {
                        mapRef.current.removeLayer(fireLayerGroup);
                    }
                }
            });
    
            document.getElementById("toggleNews")?.addEventListener("change", (e) => {
                const isChecked = (e.target as HTMLInputElement).checked;
                if (mapRef.current && newsLayerGroup) {
                    if (isChecked) {
                        newsLayerGroup.addTo(mapRef.current);
                    } else {
                        mapRef.current.removeLayer(newsLayerGroup);
                    }
                }
            });
        }
    };
    

    useEffect(() => {
        initializeMap();

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [selectedYear]);

    return <div id="map" style={{ width: "100%", height: "500px" }} />;
};

export default MapSection;
