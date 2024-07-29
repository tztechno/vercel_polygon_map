import { kml } from '@tmcw/togeojson';
import { DOMParser } from 'xmldom';
import { FeatureCollection } from 'geojson';

export function parseKML(kmlString: string): FeatureCollection {
    const parser = new DOMParser();
    const kmlDoc = parser.parseFromString(kmlString, 'text/xml');
    const geojson = kml(kmlDoc);
    return geojson as FeatureCollection;
}