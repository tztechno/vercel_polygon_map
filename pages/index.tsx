import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { parseKML } from '../lib/kmlParser';
import { FeatureCollection } from 'geojson';

const Map = dynamic(() => import('../components/Map'), { ssr: false });

export default function Home() {
    const [geoJSONData, setGeoJSONData] = useState<FeatureCollection | null>(null);

    useEffect(() => {
        async function fetchKML() {
            try {
                const response = await fetch('/sample.kml');
                const kmlString = await response.text();
                const geojson = parseKML(kmlString);
                setGeoJSONData(geojson);
            } catch (error) {
                console.error('Error fetching or parsing KML:', error);
            }
        }
        fetchKML();
    }, []);

    if (!geoJSONData) return <div>Loading...</div>;

    return (
        <div>
            <h1>KML Map</h1>
            <Map geoJSONData={geoJSONData} />
        </div>
    );
}