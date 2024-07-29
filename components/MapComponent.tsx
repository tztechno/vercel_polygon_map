import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const MapWithNoSSR = dynamic(() => import('./MapWithLeaflet'), { ssr: false });

const MapComponent: React.FC<{ polygons: any[] }> = ({ polygons }) => {
    const [selectedPolygon, setSelectedPolygon] = useState<number | null>(null);

    const handlePolygonClick = (index: number) => {
        setSelectedPolygon(index);
    };

    if (typeof window === 'undefined') {
        // サーバーサイドでは何もレンダリングしない
        return null;
    }

    return <MapWithNoSSR polygons={polygons} selectedPolygon={selectedPolygon} onPolygonClick={handlePolygonClick} />;
};

export default MapComponent;
