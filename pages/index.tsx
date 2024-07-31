import React from 'react';
import dynamic from 'next/dynamic';

// MapComponent を動的インポート
const MapComponent = dynamic(() => import('../components/Map'), { ssr: false });

const IndexPage: React.FC = () => {
    return (
        <div>
            <h1>Polygon Map</h1>
            <MapComponent />
        </div>
    );
};

export default IndexPage;