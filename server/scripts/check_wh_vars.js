const fs = require('fs');
const path = require('path');

const code = fs.readFileSync(path.join(__dirname, '../../client/src/pages/MasterDashboard.jsx'), 'utf8');
const lines = code.split('\n');

lines.forEach((l, i) => {
  if (l.includes('whWarungDangau') || l.includes('whWhiteHouse')) {
    console.log(`Line ${i + 1}: ${l}`);
  }
});

