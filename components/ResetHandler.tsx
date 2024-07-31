// components/ResetHandler.tsx
import React, { useImperativeHandle, forwardRef, useCallback } from 'react';
import { ProgressData } from './Map';
import * as Papa from 'papaparse';

export interface ResetHandlerProps {
    onProgressUpdate: (progressData: ProgressData) => void;
    setProgressData: React.Dispatch<React.SetStateAction<ProgressData>>;
}

const ResetHandler = forwardRef<{ resetProgress: () => void }, ResetHandlerProps>(({ onProgressUpdate, setProgressData }, ref) => {
    const resetProgress = useCallback(() => {
        fetch('./Progress.csv')
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
                        setProgressData(data);
                        onProgressUpdate(data);
                    },
                });
            });
    }, [onProgressUpdate, setProgressData]);

    useImperativeHandle(ref, () => ({
        resetProgress,
    }));

    return null;
});

ResetHandler.displayName = 'ResetHandler';

export default ResetHandler;
