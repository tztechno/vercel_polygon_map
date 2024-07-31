import React, { useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { ProgressData } from '../components/Map';
import * as Papa from 'papaparse';

const MapComponent = dynamic(() => import('../components/Map'), { ssr: false });

const IndexPage: React.FC = () => {
    const [progressData, setProgressData] = useState<ProgressData>({});
    const mapRef = useRef<null>(null);

    const handleProgressUpdate = (newProgressData: ProgressData) => {
        setProgressData(newProgressData);
    };

    const handleSaveCSV = () => {
        const csvContent = Papa.unparse(
            Object.entries(progressData).map(([region, progress]) => ({
                region,
                progress,
            }))
        );

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            const date = new Date().toISOString().replace(/[:.]/g, '-');
            link.setAttribute('download', `Progress_${date}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleResetProgress = () => {
        if (mapRef.current) {
            // リセット機能は別ファイルで処理
        }
    };

    return (
        <div style={{ display: 'flex' }}>
            <div style={{ width: '80%' }}>
                <h1>Polygon Map</h1>
                <MapComponent onProgressUpdate={handleProgressUpdate} ref={mapRef} />
            </div>
            <div style={{ width: '20%', padding: '20px' }}>
                <h2>Progress Data</h2>
                <ul>
                    {Object.entries(progressData).map(([region, progress]) => (
                        <li key={region}>
                            {region}: {progress}
                        </li>
                    ))}
                </ul>
                <button onClick={handleSaveCSV}>Save Progress to CSV</button>
                <button onClick={handleResetProgress}>Reset Progress</button>
            </div>
        </div>
    );
};

export default IndexPage;

