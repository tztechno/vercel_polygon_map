import React from 'react';
import { MapContainer, TileLayer, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface MapWithLeafletProps {
    polygons: any[];
    selectedPolygon: number | null;
    onPolygonClick: (index: number) => void;
}

const MapWithLeaflet: React.FC<MapWithLeafletProps> = ({ polygons, selectedPolygon, onPolygonClick }) => {
    return (
        <MapContainer center={[51.505, -0.09]} zoom={13} style={{ height: '100vh' }}>
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
