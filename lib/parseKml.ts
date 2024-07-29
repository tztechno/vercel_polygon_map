import fs from 'fs';
import xml2js from 'xml2js';

const parseKml = async (kmlFilePath: string): Promise<any[]> => {
    const kml = fs.readFileSync(kmlFilePath, 'utf-8');
    const result = await xml2js.parseStringPromise(kml);
    // 必要なポリゴン情報を抽出（ここは具体的な解析ロジックに合わせて調整）
    return result;
};

export default parseKml;