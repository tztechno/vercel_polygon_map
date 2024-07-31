import { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import { FeatureCollection } from 'geojson';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapProps {
    geoJSONData: FeatureCollection;
}

const MapContent: React.FC<{ geoJSONData: FeatureCollection }> = ({ geoJSONData }) => {
    const map = useMap();

    useEffect(() => {
        const bounds = L.geoJSON(geoJSONData).getBounds();
        map.fitBounds(bounds);
    }, [map, geoJSONData]);

    return null;
};

const Map: React.FC<MapProps> = ({ geoJSONData }) => {
    const [map, setMap] = useState<L.Map | null>(null);

    const onEachFeature = (feature: any, layer: L.Layer) => {
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
            <MapContent geoJSONData={geoJSONData} />
        </MapContainer>
    );
};

export default Map;