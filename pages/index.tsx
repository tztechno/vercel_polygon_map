import React, { useEffect, useState } from 'react';
import MapComponent from '../components/MapComponent';
import parseKml from '../lib/parseKml';

const HomePage = () => {
    const [polygons, setPolygons] = useState([]);

    useEffect(() => {
        const fetchPolygons = async () => {
            const data = await parseKml('/path/to/your/file.kml');
            setPolygons(data);
        };
        fetchPolygons();
    }, []);

    return <MapComponent polygons={polygons} />;
};

export default HomePage;
