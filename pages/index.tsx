import React, { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { ProgressData } from '../components/Map';
import InitialDataLoader from '../components/InitialDataLoader';
import * as Papa from 'papaparse';

const MapComponent = dynamic(() => import('../components/Map'), { ssr: false });

const IndexPage: React.FC = () => {
    const [progressData, setProgressData] = useState<ProgressData>({});

    const handleProgressUpdate = useCallback((newProgressData: ProgressData) => {
        setProgressData(newProgressData);
    }, []);

    const handleInitialDataLoad = useCallback((data: ProgressData) => {
        setProgressData(prevData => ({ ...prevData, ...data }));
    }, []);

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

    return (
        <div style={{ display: 'flex' }}>
            <div style={{ width: '80%' }}>
                <h1>Polygon Map</h1>
                <MapComponent
                    onProgressUpdate={handleProgressUpdate}
                    progressData={progressData}
                />
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
                <InitialDataLoader onDataLoaded={handleInitialDataLoad} />
                <button onClick={handleSaveCSV}>Save Progress to CSV</button>
            </div>
            <div> <a href="https://docs.google.com/spreadsheets/d/18U4Dam-7jCATZuUEEElAMhb62EqTX0EaspFZKcq0K1U/edit?usp=drive_link" target="_blank">作業進捗を記録</a> </div>
        </div>
    );
};

export default IndexPage;
