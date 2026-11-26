const fs = require('fs');
const path = require('path');

const code = fs.readFileSync(path.join(__dirname, '../../client/src/pages/MasterDashboard.jsx'), 'utf8');
const lines = code.split('\n');

// Let's check Petugas block (lines 345 to 1035)
// Check every identifier used in JSX expressions
const block = lines.slice(345, 1035).join('\n');

const potentialVars = [
  'whWhiteHouseUnits',
  'whWarungDangauUnits',
  'whDangauUnits',
  'whDangauValue',
  'whWhiteHouseValue',
  'emergencyStockList',
  'expiringList',
  'lowStockList',
  'filteredEmergencyList',
  'filteredExpiringList',
  'filteredLowStockList',
  'filteredReceipts',
  'filteredIssues',
  'stockTab',
  'setStockTab',
  'setReviewModalItem',
  'canAccess',
  'isPetugasStock',
  'isGudang',
  'isAdmin',
  'isMaster'
];

console.log('Checking potential variables in Petugas block:');
potentialVars.forEach(v => {
  const count = (block.match(new RegExp('\\b' + v + '\\b', 'g')) || []).length;
  console.log(`- ${v}: ${count} occurrences in Petugas block`);
});

