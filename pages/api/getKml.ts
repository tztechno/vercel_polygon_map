import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import xml2js from 'xml2js';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const kmlFilePath = path.resolve('./public/kml/file.kml');
    const kml = fs.readFileSync(kmlFilePath, 'utf-8');
    const result = await xml2js.parseStringPromise(kml);

    // 必要なポリゴン情報を抽出（ここは具体的な解析ロジックに合わせて調整）
    res.status(200).json(result);
};

export default handler;
