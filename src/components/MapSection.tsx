import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import fireIconUrl from "../assets/fire_marker.png";
import newsIconUrl from "../assets/news_marker.png";

// Fix Leaflet default assets (if default icons are used elsewhere)
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Override default icon options
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

interface Story {
    [key: string]: string | undefined;
    6: string; // Title
    3: string; // Additional Info
    4: string; // Location Info
    9: string; // URL
    11: string; // Latitude
    12: string; // Longitude
}

interface Fire {
    [key: string]: string | undefined;
    5: string; // Department
    3: string; // Address
    4: string; // Town
    6: string; // Description
    0: string; // Date
    10: string; // Latitude
    11: string; // Longitude
}

const MapSection: React.FC = () => {
    const mapRef = useRef<L.Map | null>(null);

    useEffect(() => {
        const apiKey = process.env.REACT_APP_API_KEY;
        const fireSpreadsheetId = "1m1yjSvmhY0HbAePiA8e4td95l9lqOgFoZmlIu8wBTqU";
        const newsSpreadsheetId = "1c0ZiOjzHAkhaEgucExY0logR9P7S6cRbaxtVz4MC2jY";

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

        const processAndAddMarkers = async (
            map: L.Map,
            iconUrl: string,
            data: any[],
            popupCallback: (item: any) => string,
            latIndex: number,
            lngIndex: number
        ) => {
            const icon = L.icon({
                iconUrl,
                iconSize: [32, 32],
                iconAnchor: [16, 32],
            });

            const validLatLngs: [number, number][] = [];

            data.forEach((item) => {
                const latitude = parseFloat(item[latIndex]);
                const longitude = parseFloat(item[lngIndex]);
                if (!isNaN(latitude) && !isNaN(longitude)) {
                    validLatLngs.push([latitude, longitude]);
                    L.marker([latitude, longitude], { icon })
                        .addTo(map)
                        .bindPopup(popupCallback(item));
                }
            });

            return validLatLngs;
        };

        const initializeMap = async () => {
            const mapContainer = document.getElementById("map");
            if (!mapContainer) {
                console.error("Map container not found.");
                return;
            }

            // Check for an existing map instance
            if (!mapRef.current) {
                mapRef.current = L.map(mapContainer).setView([40.7128, -74.006], 10);

                L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
                }).addTo(mapRef.current);

                const fireData1 = await fetchGoogleSheetsData(fireSpreadsheetId, "'Suffolk County Working Fire Total'!A2:L");
                const fireData2 = await fetchGoogleSheetsData(fireSpreadsheetId, "'Nassau County Working Fire Total'!A2:L");
                const combinedFireData = [...fireData1, ...fireData2] as Fire[];

                const newsData = (await fetchGoogleSheetsData(newsSpreadsheetId, "'NewsStory'!A2:N")) as Story[];

                const fireLatLngs = await processAndAddMarkers(
                    mapRef.current,
                    fireIconUrl,
                    combinedFireData,
                    (fire) =>
                        `<strong>${fire[5]}</strong><br>${fire[3]}<br>${fire[4]}, NY<br>${fire[6]}<br>${fire[0]}`,
                    10,
                    11
                );

                const newsLatLngs = await processAndAddMarkers(
                    mapRef.current,
                    newsIconUrl,
                    newsData,
                    (story) =>
                        `<strong>${story[6]}</strong><br>${story[3]}<br>${story[4]}<br><a href="${story[9]}" target="_blank">Read More</a>`,
                    11,
                    12
                );

                const allLatLngs = [...fireLatLngs, ...newsLatLngs];
                if (allLatLngs.length > 0) {
                    const avgLat =
                        allLatLngs.reduce((sum, [lat]) => sum + lat, 0) / allLatLngs.length;
                    const avgLng =
                        allLatLngs.reduce((sum, [, lng]) => sum + lng, 0) / allLatLngs.length;
                    mapRef.current.setView([avgLat, avgLng], 10);
                } else {
                    console.warn("No valid coordinates found. Using default center.");
                }
            }
        };

        initializeMap();

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    return <div id="map" style={{ width: "100%", height: "500px" }} />;
};

export default MapSection;
