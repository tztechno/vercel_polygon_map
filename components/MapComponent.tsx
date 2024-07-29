import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const MapWithNoSSR = dynamic(() => import('./MapWithLeaflet'), { ssr: false });

const MapComponent: React.FC<{ polygons: any[] }> = ({ polygons }) => {
    const [selectedPolygon, setSelectedPolygon] = useState<number | null>(null);

    const handlePolygonClick = (index: number) => {
        setSelectedPolygon(index);
    };

    if (!Array.isArray(polygons)) {
        console.error('Polygons data is not an array:', polygons);
        return <div>Error: Polygons data is not valid.</div>;
    }

    return <MapWithNoSSR polygons={polygons} selectedPolygon={selectedPolygon} onPolygonClick={handlePolygonClick} />;
};

export default MapComponent;
