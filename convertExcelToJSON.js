// File: convertExcelToJson.js
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const workbook = xlsx.readFile(path.resolve(__dirname, 'data/250410_Affil_Import.xlsm'));
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = xlsx.utils.sheet_to_json(worksheet);

const affiliates = data.map(row => ({
    affil_id: row.DONOR_ID,  // Make sure 'code' matches your Excel column name
    name: row.opt_line,
    project: row.last_name
}));

const sortedAffiliates = affiliates.sort((a, b) => {
    const projectA = a.project.toUpperCase();
    const projectB = b.project.toUpperCase();
    if (projectA < projectB) {
        return -1;
    }
    if (projectA > projectB) {
        return 1;
    }
    return 0;
});

// Save to a JSON file
fs.writeFileSync(path.resolve(__dirname, 'public/affiliates.json'), JSON.stringify(sortedAffiliates, null, 2), 'utf8')