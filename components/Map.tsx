import { useEffect, useState, useCallback, useMemo, useImperativeHandle, forwardRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import * as Papa from 'papaparse';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FeatureCollection, Feature } from 'geojson';
import wellknown from 'wellknown';

export interface ProgressData {
    [key: string]: number;
}

interface MapProps {
    onProgressUpdate: (progressData: ProgressData) => void;
}

const MapContent: React.FC<{ geoJSONData: FeatureCollection }> = ({ geoJSONData }) => {
    const map = useMap();

    useEffect(() => {
        if (map && geoJSONData && geoJSONData.features.length > 0) {
            const geojsonLayer = L.geoJSON(geoJSONData);
            const bounds = geojsonLayer.getBounds();

            if (bounds.isValid()) {
                map.fitBounds(bounds);
            } else {
                console.warn('Invalid bounds:', bounds);
            }
        }
    }, [map, geoJSONData]);

    return null;
};

const getColorByProgress = (progress: number) => {
    switch (progress) {
        case 0:
            return 'red';
        case 1:
            return 'yellow';
        case 2:
            return 'blue';
        case 3:
            return 'gray';
        default:
            return 'black';
    }
};

const parseWKT = (wkt: string): GeoJSON.Geometry | null => {
    try {
        const geojson = wellknown.parse(wkt);
        return geojson;
    } catch (error) {
        console.error('Error parsing WKT:', error);
        return null;
    }
};

const Map = forwardRef<{ loadInitialProgressData: () => void }, MapProps>(({ onProgressUpdate }, ref) => {
    const [geoJSONData, setGeoJSONData] = useState<FeatureCollection | null>(null);
    const [progressData, setProgressData] = useState<ProgressData>(() => {
        const savedProgress = localStorage.getItem('progressData');
        return savedProgress ? JSON.parse(savedProgress) : {};
    });

    useEffect(() => {
        localStorage.setItem('progressData', JSON.stringify(progressData));
        onProgressUpdate(progressData);
    }, [progressData, onProgressUpdate]);

    useEffect(() => {
        fetch('/Polygon.csv')
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .then((csvText) => {
                Papa.parse(csvText, {
                    header: true,
                    complete: (results) => {
                        const features = results.data
                            .filter((row: any) => row.WKT && row.region)
                            .map((row: any) => {
                                const geometry = parseWKT(row.WKT);
                                if (!geometry) {
                                    console.warn('Failed to parse WKT:', row.WKT);
                                    return null;
                                }
                                return {
                                    type: 'Feature',
                                    geometry,
                                    properties: {
                                        region: row.region,
                                        description: row.description,
                                    },
                                };
                            })
                            .filter((feature: any) => feature !== null);

                        setGeoJSONData({
                            type: 'FeatureCollection',
                            features,
                        });
                    },
                });
            })
            .catch((error) => {
                console.error('Error fetching Polygon.csv:', error);
            });
    }, []);

    const loadInitialProgressData = useCallback(() => {
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
    }, [onProgressUpdate]);

    useImperativeHandle(ref, () => ({
        loadInitialProgressData,
    }));

    const onEachFeature = useCallback((feature: Feature, layer: L.Layer) => {
        const regionId = feature.properties?.region as string;

        const updateStyle = (progress: number) => {
            const color = getColorByProgress(progress);
            if (layer instanceof L.Polygon || layer instanceof L.Polyline) {
                layer.setStyle({
                    fillColor: color,
                    fillOpacity: 0.5,
                    weight: 2,
                    color: 'black',
                });
            }
        };

        updateStyle(progressData[regionId] || 0);

        if (layer instanceof L.Polygon || layer instanceof L.Polyline) {
            layer.on({
                click: () => {
                    setProgressData((prevData) => {
                        const currentProgress = prevData[regionId] || 0;
                        const newProgress = (currentProgress + 1) % 4;
                        updateStyle(newProgress);
                        return { ...prevData, [regionId]: newProgress };
                    });
                },
            });
        } else {
            console.warn('Unexpected layer type:', layer);
        }
    }, [progressData]);

    const memoizedGeoJSON = useMemo(() => (
        geoJSONData && (
            <GeoJSON
                data={geoJSONData}
                onEachFeature={onEachFeature}
            />
        )
    ), [geoJSONData, onEachFeature]);

    return (
        <MapContainer
            style={{ height: '600px', width: '100%' }}
            center={[0, 0]}
            zoom={2}
        >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {memoizedGeoJSON}
            {geoJSONData && <MapContent geoJSONData={geoJSONData} />}
        </MapContainer>
    );
});

export default Map;
