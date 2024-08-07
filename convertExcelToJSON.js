// File: convertExcelToJson.js
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const workbook = xlsx.readFile(path.resolve(__dirname, 'data/240802_affiliate_export.xlsx'));
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = xlsx.utils.sheet_to_json(worksheet);

const affiliates = data.map(row => ({
    affil_id: row.id,  // Make sure 'code' matches your Excel column name
    name: row.name,
    project: row.project
      // Make sure 'description' matches your Excel column name
}));

// Save to a JSON file
fs.writeFileSync(path.resolve(__dirname, 'public/affiliates.json'), JSON.stringify(affiliates, null, 2), 'utf8')