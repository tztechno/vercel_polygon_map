import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polygon, MapContainerProps } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

interface MapWithLeafletProps {
    polygons: any[];
    selectedPolygon: number | null;
    onPolygonClick: (index: number) => void;
}

const MapWithLeaflet: React.FC<MapWithLeafletProps> = ({ polygons, selectedPolygon, onPolygonClick }) => {
    const [map, setMap] = useState<L.Map | null>(null);

    useEffect(() => {
        if (map && polygons.length > 0) {
            const bounds = polygons.flatMap(coords => coords);
            const latLngBounds = L.latLngBounds(bounds);

            map.fitBounds(latLngBounds, { padding: [50, 50] });
        }
    }, [map, polygons]);

    return (
        <MapContainer
            center={[51.505, -0.09]} // 初期中心
            zoom={13}
            style={{ height: '100vh' }}
            whenReady={(e) => setMap(e.target)} // 修正
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {polygons.map((coords, index) => (
                <Polygon
                    key={index}
                    positions={coords}
                    color={selectedPolygon === index ? 'red' : 'blue'}
                    eventHandlers={{
                        click: () => onPolygonClick(index),
                    }}
                />
            ))}
        </MapContainer>
    );
};

export default MapWithLeaflet;

