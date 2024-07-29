import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import xml2js from 'xml2js';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const kmlFilePath = path.resolve('./public/kml/file.kml');
    const kml = fs.readFileSync(kmlFilePath, 'utf-8');
    try {
        const result = await xml2js.parseStringPromise(kml);

        const polygons = result.kml.Placemark.map((placemark: any) => {
            return placemark.Polygon[0].outerBoundaryIs[0].LinearRing[0].coordinates[0]
                .split(' ')
                .filter(coord => coord.trim() !== '')
                .map((coord: string) => {
                    const [lng, lat] = coord.split(',').map(Number);
                    return [lat, lng]; // [lat, lng] 形式に変換
                });
        });

        res.status(200).json(polygons);
    } catch (error) {
        res.status(500).json({ error: 'Error parsing KML file' });
    }
};

export default handler;
