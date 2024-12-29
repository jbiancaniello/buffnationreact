import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import fireIconUrl from "../assets/fire_marker.png";
import newsIconUrl from "../assets/news_marker.png";

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
    11: string; // Latitude
    12: string; // Longitude
}

const MapSection: React.FC = () => {
    const mapRef = useRef<L.Map | null>(null);

    useEffect(() => {
        const apiKey = process.env.REACT_APP_API_KEY;
        const fireSpreadsheetId =
            "1m1yjSvmhY0HbAePiA8e4td95l9lqOgFoZmlIu8wBTqU";
        const newsSpreadsheetId =
            "1c0ZiOjzHAkhaEgucExY0logR9P7S6cRbaxtVz4MC2jY";

        const fetchGoogleSheetsData = async (
            spreadsheetId: string,
            range: string
        ) => {
            const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`;
            try {
                const response = await fetch(url);
                const data = await response.json();
                return data.values || [];
            } catch (error) {
                console.error("Error fetching data:", error);
                return [];
            }
        };

        const processAndAddFireMarkers = async (map: L.Map) => {
            const fireRange1 = "'Suffolk County Working Fire Total'!A2:L";
            const fireRange2 = "'Nassau County Working Fire Total'!A2:L";

            const [fireData1, fireData2] = await Promise.all([
                fetchGoogleSheetsData(fireSpreadsheetId, fireRange1),
                fetchGoogleSheetsData(fireSpreadsheetId, fireRange2),
            ]);

            const combinedFireData = [...fireData1, ...fireData2] as Fire[];

            const fireIcon = L.icon({
                iconUrl: fireIconUrl,
                iconSize: [32, 32],
                iconAnchor: [16, 32],
            });

            combinedFireData.forEach((fire) => {
                const [latitude, longitude] = [fire[11], fire[12]];
                if (latitude && longitude) {
                    L.marker([parseFloat(latitude), parseFloat(longitude)], {
                        icon: fireIcon,
                    })
                        .addTo(map)
                        .bindPopup(
                            `<strong>${fire[5]}</strong><br>${fire[3]}<br>${fire[4]}, NY<br>${fire[6]}<br>${fire[0]}`
                        );
                }
            });
        };

        const processAndAddNewsMarkers = async (map: L.Map) => {
            const newsRange = "'NewsStory'!A2:N";
            const newsData = (await fetchGoogleSheetsData(
                newsSpreadsheetId,
                newsRange
            )) as Story[];

            const newsIcon = L.icon({
                iconUrl: newsIconUrl,
                iconSize: [32, 32],
                iconAnchor: [16, 32],
            });

            newsData.forEach((story) => {
                const [latitude, longitude] = [story[11], story[12]];
                if (latitude && longitude) {
                    L.marker([parseFloat(latitude), parseFloat(longitude)], {
                        icon: newsIcon,
                    })
                        .addTo(map)
                        .bindPopup(
                            `<strong>${story[6]}</strong><br>${story[3]}<br>${story[4]}<br><a href="${story[9]}" target="_blank">Read More</a>`
                        );
                }
            });
        };

        if (!mapRef.current) {
            mapRef.current = L.map("map").setView([40.7128, -74.006], 10); // Default center (NYC)

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution:
                    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }).addTo(mapRef.current);

            processAndAddFireMarkers(mapRef.current);
            processAndAddNewsMarkers(mapRef.current);
        }

        return () => {
            if (mapRef.current) {
                mapRef.current.remove(); // Properly remove the map instance
                mapRef.current = null; // Reset the reference
            }
        };
    }, []);

    return <div id="map" style={{ width: "100%", height: "500px" }} />;
};

export default MapSection;
