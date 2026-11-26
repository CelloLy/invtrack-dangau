const fs = require('fs');
const path = require('path');
const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'stock_raw.json'), 'utf8'));

let out = `=== DANGAU ITEMS (Total: ${data.dangau.length}) ===\n`;
data.dangau.forEach((item, i) => {
  out += `${i + 1}. "${item.name}" | Stock: ${item.stock} | Ket: ${item.keterangan || '-'}\n`;
});

out += `\n=== WHITE HOUSE ITEMS (Total: ${data.white_house.length}) ===\n`;
data.white_house.forEach((item, i) => {
  out += `${i + 1}. "${item.name}" | Stock: ${item.stock} | Ket: ${item.keterangan || '-'}\n`;
});

fs.writeFileSync(path.join(__dirname, 'stock_items_list.txt'), out, 'utf8');
console.log('Successfully wrote UTF-8 stock_items_list.txt');
