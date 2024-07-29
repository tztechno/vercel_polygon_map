declare module '@tmcw/togeojson' {
    import { FeatureCollection } from 'geojson';
    export function kml(doc: Document): FeatureCollection;
}