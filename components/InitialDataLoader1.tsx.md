import { useCallback } from 'react';
import * as Papa from 'papaparse';
import { ProgressData } from './Map';

interface InitialDataLoaderProps {
    onDataLoaded: (data: ProgressData) => void;
}

const InitialDataLoader: React.FC<InitialDataLoaderProps> = ({ onDataLoaded }) => {
    const loadInitialProgressData = useCallback(() => {
        fetch('https://drive.google.com/uc?export=download&id=1CtqZ9B4CAPJtMeGAdwfs_1kpTpAnD9dq0zMs2r96Gog')
            .then((response) => response.text())
            .then((csvText) => {
                Papa.parse(csvText, {
                    header: true,
                    complete: (results) => {
                        const data: ProgressData = {};
                        results.data.forEach((row: any) => {
                            if (row.region && row.progress) {
                                data[row.region] = Number(row.progress);
                            }
                        });
                        onDataLoaded(data);
                    },
                });
            })
            .catch((error) => {
                console.error('Error loading initial progress data:', error);
            });
    }, [onDataLoaded]);

    return <button onClick={loadInitialProgressData}>Load Initial Data</button>;
};

export default InitialDataLoader;
