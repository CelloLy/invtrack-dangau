const fs = require('fs');
const path = require('path');

const files = [
  'client/src/components/MasterPrintReportModal.jsx',
  'client/src/components/RejectPRModal.jsx',
  'client/src/pages/BarangMasuk.jsx',
  'client/src/pages/PermintaanPembelian.jsx',
  'client/src/pages/StokOpname.jsx'
];

files.forEach(relPath => {
  const fullPath = path.join(__dirname, '../../', relPath);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    if (content.includes('Rumah Bos')) {
      console.log('Replacing in:', relPath);
      // Replace WH-RB with WH-WH if needed, and Rumah Bos with White House
      content = content.replace(/Gudang Rumah Bos/g, 'Gudang White House');
      content = content.replace(/Rumah Bos/g, 'White House');
      content = content.replace(/WH-RB/g, 'WH-WH');
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log('Done:', relPath);
    }
  }
});

