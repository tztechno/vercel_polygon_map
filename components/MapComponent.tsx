import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { GeoJsonObject } from 'geojson';

interface MapComponentProps {
    geoJSONData: GeoJsonObject | null;
}

const MapComponent: React.FC<MapComponentProps> = ({ geoJSONData }) => {
    const [map, setMap] = useState<L.Map | null>(null);

    useEffect(() => {
        const mapInstance = L.map('map').setView([51.505, -0.09], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(mapInstance);
        setMap(mapInstance);
    }, []);

    useEffect(() => {
        if (map && geoJSONData) {
            const geoJSONLayer = L.geoJSON(geoJSONData);
            const bounds = geoJSONLayer.getBounds();

            console.log('geoJSONData:', geoJSONData);
            console.log('bounds:', bounds);

            if (bounds.isValid()) {
                map.fitBounds(bounds);
            } else {
                console.error('Bounds are not valid');
            }

            geoJSONLayer.addTo(map);
        }
    }, [map, geoJSONData]);

    return <div id="map" style={{ height: '100vh', width: '100%' }}></div>;
};

export default MapComponent;
