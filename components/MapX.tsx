import { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import { FeatureCollection, Feature, GeoJsonProperties } from 'geojson';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapProps {
    geoJSONData: FeatureCollection;
}

// 色の情報を保存する関数
const saveColors = (regionId: string, colors: Record<string, string>) => {
    const allColors = JSON.parse(localStorage.getItem('allPolygonColors') || '{}');
    allColors[regionId] = colors;
    localStorage.setItem('allPolygonColors', JSON.stringify(allColors));
};

// 色の情報を取得する関数
const loadColors = (regionId: string): Record<string, string> => {
    const allColors = JSON.parse(localStorage.getItem('allPolygonColors') || '{}');
    return allColors[regionId] || {};
};

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
    const [regionId, setRegionId] = useState<string>('');
    const [colors, setColors] = useState<Record<string, string>>({});

    useEffect(() => {
        // geoJSONDataからregionIdを抽出（例：最初のフィーチャのregionプロパティを使用）
        if (geoJSONData.features.length > 0) {
            const firstFeature = geoJSONData.features[0];
            const newRegionId = firstFeature.properties?.region || '';
            setRegionId(newRegionId);
            setColors(loadColors(newRegionId));
        }
    }, [geoJSONData]);

    useEffect(() => {
        if (regionId) {
            saveColors(regionId, colors);
        }
    }, [regionId, colors]);

    const onEachFeature: L.GeoJSONOptions['onEachFeature'] = (feature, layer) => {
        layer.on({
            click: (e: L.LeafletMouseEvent) => {
                const targetLayer = e.target as L.Path;
                const featureId = feature.id?.toString() || '';
                const newColor = colors[featureId] === 'red' ? 'blue' : 'red';
                setColors(prev => ({ ...prev, [featureId]: newColor }));
                targetLayer.setStyle({ fillColor: newColor });
            },
        });
    };

    const style: L.StyleFunction<Feature<Geometry, GeoJsonProperties>> = (feature) => {
        const featureId = feature.id?.toString() || '';
        return {
            fillColor: colors[featureId] || 'blue',
            fillOpacity: 0.4,
            color: 'red',
            weight: 1
        };
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
            <GeoJSON
                data={geoJSONData}
                onEachFeature={onEachFeature}
                style={style}
            />            
            <MapContent geoJSONData={geoJSONData} />
        </MapContainer>
    );
};

export default Map;