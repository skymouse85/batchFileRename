// File: convertExcelToJson.js
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const dataDir = path.resolve(__dirname, 'data');
const files = fs.readdirSync(dataDir);
const excelFile = files.find(file => file.endsWith('.xlsm'));

if (!excelFile) {
    console.error('😔 No Excel file found in the data folder 😔');
    process.exit(1);
}

const workbook = xlsx.readFile(path.join(dataDir, excelFile));
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = xlsx.utils.sheet_to_json(worksheet);



const affiliates = data.map(row => ({


    affil_id: row.DONOR_ID,  // Make sure 'code' matches your Excel column name
    name: row.opt_line,
    project: row.last_name

}));

const sortedAffiliates = affiliates.sort((a, b) => {
    const projectA = a.project || '';
    const projectB = b.project || '';

    if (!projectA) console.warn(`⚠️ Missing project name for affil_id: ${a.affil_id}`);
    if (!projectB) console.warn(`⚠️ Missing project name for affil_id: ${b.affil_id}`);

    return projectA.localeCompare(projectB, undefined, { sensitivity: 'base' });
});

// Save to a JSON file
fs.writeFileSync(path.resolve(__dirname, 'public/affiliates.json'), JSON.stringify(sortedAffiliates, null, 2), 'utf8');
console.log(`✅ Parsed and saved ${sortedAffiliates.length} affiliates from ${excelFile}`);