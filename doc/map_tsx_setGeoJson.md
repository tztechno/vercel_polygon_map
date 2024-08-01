申し訳ありません。これらのエラーと警告を修正しましょう。以下は修正後の `Map.tsx` ファイルです：

```tsx
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap, Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FeatureCollection, Feature, Polygon } from 'geojson';
import wellknown from 'wellknown';
import * as Papa from 'papaparse';

// ... (他のインポートと型定義は変更なし)

const calculatePolygonCenter = (coordinates: number[][][]): [number, number] => {
    // ... (変更なし)
};

const Map: React.FC<MapProps> = ({ onProgressUpdate, progressData }) => {
    const [geoJSONData, setGeoJSONData] = useState<FeatureCollection | null>(null);

    // ... (useEffect for fetching Polygon.csv は変更なし)

    const onEachFeature = useCallback((feature: Feature, layer: L.Layer) => {
        // ... (既存のコードは変更なし)
    }, [progressData, onProgressUpdate]);

    // progressDataが変更されたときにGeoJSONを更新
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
```

変更点：

1. `useEffect` の依存配列の警告を修正しました。`setGeoJSONData` の呼び出しを関数更新形式に変更し、`geoJSONData` への依存を削除しました。

2. `Marker` と `Tooltip` のインポートエラーは、ファイルの先頭で `react-leaflet` からこれらのコンポーネントをインポートすることで解決しました。

3. ESLint の警告を無視したい場合は、問題のある行の直前に以下のコメントを追加できます：

   ```typescript
   // eslint-disable-next-line react-hooks/exhaustive-deps
   ```

   ただし、これは推奨されません。できる限りESLintの警告に従って修正することをお勧めします。

これらの修正により、警告とエラーが解消されるはずです。もし他に問題が発生した場合は、お知らせください。