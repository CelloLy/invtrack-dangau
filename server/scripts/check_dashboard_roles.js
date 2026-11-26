const fs = require('fs');
const path = require('path');

const code = fs.readFileSync(path.join(__dirname, '../../client/src/pages/MasterDashboard.jsx'), 'utf8');
const lines = code.split('\n');

lines.forEach((l, i) => {
  if (l.includes('isPetugasStock') || l.includes('isGudang') || l.includes('isMaster') || l.includes('isAdmin')) {
    console.log(`Line ${i + 1}: ${l}`);
  }
});

