import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Custom marker icons
const fireMarkerIconUrl = "https://storyphotos.s3.us-east-1.amazonaws.com/fire_marker.png";

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

    const processAndAddMarkers = (
        map: L.Map,
        iconUrl: string,
        data: any[],
        popupCallback: (item: any) => string,
        latIndex: number,
        lngIndex: number,
        dateIndex: number
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
            const year = item[dateIndex]?.split("/")[2]; // Extract year from the date field

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
        if (!mapRef.current) {
            mapRef.current = L.map("map").setView([40.7507, -72.9404], 10);

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }).addTo(mapRef.current);
        }

        if (mapRef.current) {
            const fireSpreadsheetId = "1m1yjSvmhY0HbAePiA8e4td95l9lqOgFoZmlIu8wBTqU";

            const fireData1 = await fetchGoogleSheetsData(fireSpreadsheetId, "'Suffolk County Working Fire Total'!A2:L");
            const fireData2 = await fetchGoogleSheetsData(fireSpreadsheetId, "'Nassau County Working Fire Total'!A2:L");
            const combinedFireData = [...fireData1, ...fireData2] as Fire[];

            fireLayer?.clearLayers();

            const fireLayerGroup = processAndAddMarkers(
                mapRef.current,
                fireMarkerIconUrl,
                combinedFireData,
                (fire) =>
                    `<strong>${fire[5]}</strong><br>${fire[3]}<br>${fire[4]}, NY<br>${fire[1]}<br>${fire[0]}`,
                10, // Latitude index
                11, // Longitude index
                0 // Date index
            );

            setFireLayer(fireLayerGroup);
        }
    };

    useEffect(() => {
        initializeMap();
        return () => {
            mapRef.current?.remove();
            mapRef.current = null;
        };
    }, [selectedYear]);

    return <div id="map" style={{ width: "100%", height: "500px" }} />;
};

export default MapSection;
