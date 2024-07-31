import { useEffect, useState, useCallback } from 'react';
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

const Map: React.FC<MapProps> = ({ onProgressUpdate }) => {
    const [geoJSONData, setGeoJSONData] = useState<FeatureCollection | null>(null);
    const [progressData, setProgressData] = useState<ProgressData>({});

    useEffect(() => {
        fetch('./Polygon.csv')
            .then((response) => response.text())
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
            });
    }, []);

    useEffect(() => {
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

    const onEachFeature = useCallback((feature: Feature, layer: L.Layer) => {
        const regionId = feature.properties?.region as string;
        const progress = progressData[regionId] || 0;
        const color = getColorByProgress(progress);

        if (layer instanceof L.Polygon || layer instanceof L.Polyline) {
            layer.setStyle({
                fillColor: color,
                fillOpacity: 0.5,
                weight: 2,
                color: 'black',
            });

            layer.on({
                click: (e: L.LeafletMouseEvent) => {
                    const targetLayer = e.target as L.Path;
                    let newProgress = (progressData[regionId] || 0) + 1;
                    if (newProgress > 3) newProgress = 0;

                    const newProgressData = { ...progressData, [regionId]: newProgress };
                    setProgressData(newProgressData);
                    onProgressUpdate(newProgressData);

                    const newColor = getColorByProgress(newProgress);
                    targetLayer.setStyle({
                        fillColor: newColor,
                    });
                },
            });
        } else {
            console.warn('Unexpected layer type:', layer);
        }
    }, [progressData, onProgressUpdate]);

    return (
        <MapContainer
            style={{ height: '600px', width: '100%' }}
            center={[0, 0]}
            zoom={2}
        >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {geoJSONData && (
                <GeoJSON data={geoJSONData} onEachFeature={onEachFeature} />
            )}
            {geoJSONData && <MapContent geoJSONData={geoJSONData} />}
        </MapContainer>
    );
};

export default Map;
