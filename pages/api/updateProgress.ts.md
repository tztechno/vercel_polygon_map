import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import * as Papa from 'papaparse';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { regionId, progress } = req.body;

        const filePath = path.join(process.cwd(), 'public', 'Progress.csv');

        try {
            // CSVファイルを読み込む
            const fileContent = fs.readFileSync(filePath, 'utf8');
            const { data } = Papa.parse(fileContent, { header: true });

            // データを更新
            const updatedData = data.map((row: any) => {
                if (row.region === regionId) {
                    return { ...row, progress: progress.toString() };
                }
                return row;
            });
/*
            // 更新されたデータをCSVに書き込む
            const csv = Papa.unparse(updatedData);
            fs.writeFileSync(filePath, csv);

            res.status(200).json({ message: 'Progress updated successfully' });
*/
        } catch (error) {
            console.error('Error updating CSV:', error);
            res.status(500).json({ message: 'Error updating progress' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}