import React, { useEffect, useState } from 'react';
import MapComponent from '../components/MapComponent';

const HomePage = () => {
    const [polygons, setPolygons] = useState<any[]>([]);

    useEffect(() => {
        const fetchPolygons = async () => {
            const response = await fetch('/api/getKml');
            const data = await response.json();
            setPolygons(data);
        };
        fetchPolygons();
    }, []);

    return <MapComponent polygons={polygons} />;
};

export default HomePage;
