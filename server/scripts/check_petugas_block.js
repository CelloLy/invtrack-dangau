const fs = require('fs');
const path = require('path');

const code = fs.readFileSync(path.join(__dirname, '../../client/src/pages/MasterDashboard.jsx'), 'utf8');
const lines = code.split('\n');

const petugasBlock = lines.slice(345, 1035).join('\n');

// Check undefined variables or suspicious calls in petugasBlock
console.log('Petugas block length lines:', 1035 - 345);

// Check all data references like data.something
const matches = petugasBlock.match(/data\.[a-zA-Z0-9_]+/g) || [];
console.log('Unique data properties used in Petugas block:', [...new Set(matches)]);

const otherVars = petugasBlock.match(/[a-zA-Z0-9_]+(?=\.map|\.filter|\.length)/g) || [];
console.log('Array/list variables used:', [...new Set(otherVars)]);

