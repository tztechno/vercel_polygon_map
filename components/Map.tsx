import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import { FeatureCollection } from 'geojson';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapProps {
    geoJSONData: FeatureCollection;
}

const Map: React.FC<MapProps> = ({ geoJSONData }) => {
    const [map, setMap] = useState<L.Map | null>(null);

    useEffect(() => {
        if (map) {
            const bounds = L.geoJSON(geoJSONData).getBounds();
            map.fitBounds(bounds);
        }
    }, [map, geoJSONData]);

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

    return (
        <MapContainer
            style={{ height: '600px', width: '100%' }}
            center={[0, 0]}
            zoom={2}
            whenCreated={setMap}
        >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <GeoJSON data={geoJSONData} onEachFeature={onEachFeature} />
        </MapContainer>
    );
};

export default Map;