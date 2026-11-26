const fs = require('fs');
const path = require('path');

const code = fs.readFileSync(path.join(__dirname, '../../client/src/pages/MasterDashboard.jsx'), 'utf8');
const lines = code.split('\n');

const petugasLines = lines.slice(345, 1035);

petugasLines.forEach((line, idx) => {
  const lineNum = 346 + idx;
  // look for .map, .filter, undefined property accesses like foo.bar.baz
  // or function calls that might not exist
  if (line.includes('undefined') || line.includes('.sku') || line.includes('.toFixed') || line.includes('new Date(')) {
    console.log(`${lineNum}: ${line}`);
  }
});

