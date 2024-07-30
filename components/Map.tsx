import { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import { FeatureCollection } from 'geojson';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const progressData = {
    'Region 1': 80,
    'Region 2': 55,
    'Region 3': 30,
    'Region 4': 10,
    // その他の地域データ
};


interface MapProps {
    geoJSONData: FeatureCollection;
    progressData: { [region: string]: number };
}

const MapContent: React.FC<{ geoJSONData: FeatureCollection, progressData: { [region: string]: number } }> = ({ geoJSONData, progressData }) => {
    const map = useMap();

    useEffect(() => {
        const bounds = L.geoJSON(geoJSONData).getBounds();
        map.fitBounds(bounds);
    }, [map, geoJSONData]);

    useEffect(() => {
        geoJSONData.features.forEach((feature) => {
            if (feature.geometry.type === 'Point' && feature.properties && feature.properties.name) {
                const [longitude, latitude] = feature.geometry.coordinates;
                const marker = L.marker([latitude, longitude])
                    .addTo(map)
                    .bindPopup(feature.properties.name);
            }
        });
    }, [map, geoJSONData]);

    return null;
};

const getColorBasedOnProgress = (progress: number) => {
    if (progress >= 75) {
        return 'green';
    } else if (progress >= 50) {
        return 'yellow';
    } else if (progress >= 25) {
        return 'orange';
    } else {
        return 'red';
    }
};

const Map: React.FC<MapProps> = ({ geoJSONData, progressData }) => {
    const [map, setMap] = useState<L.Map | null>(null);

    const onEachFeature = (feature: any, layer: L.Layer) => {
        const regionName = feature.properties.name;
        const progress = progressData[regionName] || 0; // デフォルト値は0
        const color = getColorBasedOnProgress(progress);

        layer.setStyle({
            fillColor: color,
            fillOpacity: 0.7,
            color: 'black',
            weight: 1,
        });

        layer.on({
            click: (e: L.LeafletMouseEvent) => {
                const targetLayer = e.target as L.Path;
                targetLayer.setStyle({
                    fillColor: targetLayer.options.fillColor === 'red' ? 'blue' : 'red',
                });
            },
        });
    };

    const handleMapReady = useCallback(() => {
        // MapContainer が準備できたときの処理
        // 必要に応じて何か処理を追加できます
    }, []);

    return (
        <MapContainer
            style={{ height: '600px', width: '100%' }}
            center={[0, 0]}
            zoom={2}
            whenReady={handleMapReady}
            ref={(mapInstance) => {
                if (mapInstance) {
                    setMap(mapInstance);
                }
            }}
        >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <GeoJSON data={geoJSONData} onEachFeature={onEachFeature} />
            <MapContent geoJSONData={geoJSONData} progressData={progressData} />
        </MapContainer>
    );
};

export default Map;
