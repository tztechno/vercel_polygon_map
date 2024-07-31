import { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import * as Papa from 'papaparse';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FeatureCollection } from 'geojson';
import wellknown from 'wellknown';


interface ProgressData {
    [key: string]: number;
}

const MapContent: React.FC<{ geoJSONData: FeatureCollection }> = ({ geoJSONData }) => {
    const map = useMap();

    useEffect(() => {
        if (map && geoJSONData && geoJSONData.features.length > 0) {
            const geojsonLayer = L.geoJSON(geoJSONData);
            const bounds = geojsonLayer.getBounds();

            // Bounds が有効か確認
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
        default:
            return 'gray';
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

const Map: React.FC = () => {
    const [geoJSONData, setGeoJSONData] = useState<FeatureCollection | null>(null);
    const [progressData, setProgressData] = useState<ProgressData>({});

    useEffect(() => {
        fetch('./Polygon.csv') // Polygon.csv のリンク
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
        fetch('./Progress.csv') // Progress.csv のリンク
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
                    },
                });
            });
    }, []);

    const onEachFeature = (feature: any, layer: L.Layer) => {
        const regionId = feature.properties.region;
        const progress = progressData[regionId];
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
                    const currentColor = targetLayer.options.fillColor;
                    targetLayer.setStyle({
                        fillColor: currentColor === 'red' ? 'blue' : 'red',
                    });
                },
            });
        } else {
            console.warn('Unexpected layer type:', layer);
        }
    };


    const handleMapReady = useCallback(() => {
        // MapContainer が準備できたときの処理
    }, []);

    return (
        <MapContainer
            style={{ height: '600px', width: '100%' }}
            center={[0, 0]}
            zoom={2}
            whenReady={handleMapReady}
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
