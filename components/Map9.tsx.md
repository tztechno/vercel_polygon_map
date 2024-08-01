import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap, Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FeatureCollection, Feature, Polygon } from 'geojson';
import wellknown from 'wellknown';
import * as Papa from 'papaparse';

export interface ProgressData {
    [key: string]: number;
}

interface MapProps {
    onProgressUpdate: (progressData: ProgressData) => void;
    progressData: ProgressData;
}


const MapContent: React.FC<{ geoJSONData: FeatureCollection }> = ({ geoJSONData }) => {
    const map = useMap();

    useEffect(() => {
        if (geoJSONData) {
            setGeoJSONData(prevData => ({
                ...prevData,
                features: prevData.features.map(feature => ({
                    ...feature,
                    properties: {
                        ...feature.properties,
                        progress: progressData[feature.properties?.region as string] || 3
                    }
                }))
            }));
        }
    }, [progressData]);

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

// ポリゴンの中心点を計算する関数
const calculatePolygonCenter = (coordinates: number[][][]): [number, number] => {
    let totalLat = 0;
    let totalLng = 0;
    let pointCount = 0;

    coordinates[0].forEach(coord => {
        totalLat += coord[1];
        totalLng += coord[0];
        pointCount++;
    });

    return [totalLat / pointCount, totalLng / pointCount];
};



const Map: React.FC<MapProps> = ({ onProgressUpdate, progressData }) => {
    const [geoJSONData, setGeoJSONData] = useState<FeatureCollection | null>(null);

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

        // 初期状態を灰色（progress 3）に設定
        updateStyle(progressData[regionId] !== undefined ? progressData[regionId] : 3);

        if (layer instanceof L.Polygon || layer instanceof L.Polyline) {
            layer.on({
                click: () => {
                    const currentProgress = progressData[regionId] !== undefined ? progressData[regionId] : 3;
                    const newProgress = (currentProgress + 1) % 4;
                    const newProgressData = { ...progressData, [regionId]: newProgress };
                    updateStyle(newProgress);
                    onProgressUpdate(newProgressData);
                },
            });
        } else {
            console.warn('Unexpected layer type:', layer);
        }
    }, [progressData, onProgressUpdate]);
    

    // progressDataが変更されたときにGeoJSONを更新
    useEffect(() => {
        if (geoJSONData) {
            setGeoJSONData({
                ...geoJSONData,
                features: geoJSONData.features.map(feature => ({
                    ...feature,
                    properties: {
                        ...feature.properties,
                        progress: progressData[feature.properties?.region as string] || 3
                    }
                }))
            });
        }
    }, [progressData]);


    const memoizedGeoJSON = useMemo(() => (
        geoJSONData && (
            <>
                <GeoJSON
                    key={JSON.stringify(progressData)}
                    data={geoJSONData}
                    onEachFeature={onEachFeature}
                />
                {geoJSONData.features.map((feature, index) => {
                    if (feature.geometry.type === 'Polygon') {
                        const center = calculatePolygonCenter((feature.geometry as Polygon).coordinates);
                        return (
                            <Marker
                                key={index}
                                position={[center[0], center[1]]}
                                icon={L.divIcon({
                                    className: 'region-label',
                                    html: `<div style="background-color: white; border: 1px solid black; border-radius: 50%; width: 20px; height: 20px; display: flex; justify-content: center; align-items: center;">${feature.properties?.region}</div>`
                                })}
                            >
                                <Tooltip permanent>
                                    Region {feature.properties?.region}
                                </Tooltip>
                            </Marker>
                        );
                    }
                    return null;
                })}
            </>
        )
    ), [geoJSONData, onEachFeature, progressData]);

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
};


export default Map;