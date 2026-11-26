const fs = require('fs');
const path = require('path');

const code = fs.readFileSync(path.join(__dirname, '../../client/src/pages/MasterDashboard.jsx'), 'utf8');
const lines = code.split('\n');

for (let i = 145; i < 345; i++) {
  console.log(`${i + 1}: ${lines[i]}`);
}

