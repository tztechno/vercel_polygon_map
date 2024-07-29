import React, { useEffect, useState } from 'react';
import MapComponent from '../components/MapComponent';

const HomePage = () => {
    const [polygons, setPolygons] = useState<any[]>([]);

    useEffect(() => {
        const fetchPolygons = async () => {
            try {
                const response = await fetch('/api/getKml');
                const data = await response.json();

                if (Array.isArray(data)) {
                    setPolygons(data);
                } else {
                    console.error('Fetched data is not an array:', data);
                }
            } catch (error) {
                console.error('Error fetching polygons:', error);
            }
        };
        fetchPolygons();
    }, []);

    return <MapComponent polygons={polygons} />;
};

export default HomePage;

