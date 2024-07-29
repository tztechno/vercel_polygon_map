import React, { useState } from 'react';
import { MapContainer, TileLayer, Polygon } from 'react-leaflet';

interface MapComponentProps {
    polygons: any[];
}

const MapComponent: React.FC<MapComponentProps> = ({ polygons }) => {
    const [selectedPolygon, setSelectedPolygon] = useState<number | null>(null);

    const handlePolygonClick = (index: number) => {
        setSelectedPolygon(index);
    };

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
                    onClick={() => handlePolygonClick(index)}
                />
            ))}
        </MapContainer>
    );
};

export default MapComponent;
