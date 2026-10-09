const XLSX = require('xlsx');
const fs = require('fs');

try {
  const workbook = XLSX.readFile('./invitation/ref.xlsx');
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet);
  
  console.log(JSON.stringify(data, null, 2));
} catch (error) {
  console.error('Error reading Excel file:', error.message);
}
