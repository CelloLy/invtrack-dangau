const fs = require('fs');
const path = require('path');

const raw = JSON.parse(fs.readFileSync(path.join(__dirname, 'stock_raw.json'), 'utf8'));

// Exact prices from Bon Toko
const BON_TOKO_PRICES = {
  // Thomson
  'GLOBAL CREAM CORN 425GR (24)': 15833,
  'GLOBAL WHOLE CORN 425GR': 13125,
  'CORNICHE 200GR SNOW WHITE': 27750,
  'HEINZ TOMATO PASTA 3.15 KG': 208334,
  'GLOBAL WHOLE MUSHROOM 425 GR': 15833,
  'TTS STRAW MUSHROOM 425GR': 14827,
  'LEE KUM LEE OYSTER 770GR + 255 GR': 56667,
  'KEWPIE SALAD ROASTED SESAME 1L': 88834,
  'SUNBAY EVAPOERATED MILK 380GR': 12211,
  'YO GUAN HENG 620ML SESAME OIL': 37421,
  'KIKKOMAN SOY SAUCE/SHOYU BOTTLE': 125000,
  'HOUSE KARI ALA JEPANG 935GR': 163501,
  // Fajar Abadi
  'KF TUNA CHUNK IN BRINE 1800GR': 124320,
  // Siatan
  'BERAS ROYAL REGAL 20 KG': 17250,
  'BERAS ROYAL REGAL': 17250,
  // Sinar Sumber Sehat
  'L.S MARJAN BOUDOIN MELON': 24975,
  'L.S MARJAN BOUDOIN COCOPANDAN': 24975,
  'L. DMT BB C.S (10 PCH) BBQ 1 KILO': 32967,
  // Metalindo
  'SHOWER CAP + KOTAK LOGO': 850,
  'SANDAL 4MM LOGO 1 WARNA LIST PUTIH': 3300,
  '2 SIKAT GIGI COBRA PANJANG + ODOL + KOTAK': 2150,
  'SHOWER CAP': 850,
  'SHOWERCAP': 850,
  'SANDAL': 3300,
  'SIKAT GIGI': 2150,
  // Multi Arena
  'MINYAK GORENG FILMA 18 LITER': 21791,
  'MINYAK FILMA': 21791,
  'MINYAK BIMOLI 18 LITER': 21500,
  // Surya Putra
  'TEPUNG TERIGU DOUBLE ZERO @25KG': 14652,
  'TEPUNG DOUBLE ZERO': 14652,
  'RS EXTRA VIRGIN OLIVE OIL PET 5 LTR': 188700,
  // Central Kapuas
  'KNORR CHICKEN POWDER REFILL 6X1KG BFLY': 90100,
  'KNORR CHICKEN POWDER': 90100,
  // Gracendo
  'PE SEGITIGA 12X25': 9600,
  'PE TUNA 12X25 @60PK': 5800,
  'PE TUNA 17X40': 5400,
  'PE TUNA 15X30': 5400,
  'HD NICO PUTIH SUSU 17': 16000,
  'HD NICO PUTIH SUSU 24': 16000,
  'HD BECAK PUTIH SUSU 28': 16000,
  'HD NICO PUTIH SUSU 28': 16000,
  'TUSUK BUAH BENING': 7000,
  'MIKA SEKAT 20 ORI PACK': 12000,
  'SENDOK MAKAN VICTORY DOP (PP)': 14000,
  'SENDOK MAKAN VICTORY (PP)': 14000,
  'HD HITAM PAHE JUMBO 50': 30000,
  'HD SAMPAH KOKITA 90X120': 24000,
  'CUP KUE MOTIF 5.5': 18000,
  'CUP KUE UK 5.5': 18000,
  'CUP CAKE MOTIF 7': 23000,
  'CUP KUE UK 70MM': 23000,
  'CUP CAKE 9.5 CM': 29000,
  'CUP KUE UK 95MM': 29000,
  'SEDOTAN STERIL KERTAS PUTIH SB 524': 25000,
  'KOTAK KUE 12X14 POLOS TEBAL': 65000,
  // Cotton Bread
  'ANCHOR MOZZARELLA BLOCK 2X10KG': 158636,
  'ANCHOR CREAM CHEESE': 168000,
  // Sukanda Djaya
  'JUNGLE JUICE LEMON 1 L': 28083,
  'JUICE JUNGLE LEMON': 28083,
  'JUNGLE JUICE ORANGE 1 L': 28083,
  'JUICE JUNGLE ORANGE': 28083,
  'JUNGLE JUICE GUAVA 1 L': 28083,
  'JUICE JUNGLE GUAVA': 28083,
  'JUNGLE JUICE PINEAPPLE 1 L': 28083,
  'JUICE JUNGLE PINEAPPLE': 28083,
  'LIPTON TEA BAG YELLOW LABEL TB ENV 100X2GR': 661,
  'TEH HOTEL ( LIPTON ISI 12)': 661,
  'TEH HOTEL': 661,
  'NUTELLA 350GR (12X350GR)': 71817,
  'NUTTELA': 71817,
  'MILLAC CREAM WHIPPING MILLAC GOLD 1 LT': 19240,
  'SAN REMO PASTA SPAGHETTI #5 500 GR': 25550,
  'SAN REMO SPAGHETTI': 25550,
  'SAN REMO PASTA FETUCCINE #12 500GR': 25550,
  'SAN REMON FETUCINE': 25550,
  'SAN REMO FETTUCCINE': 25550,
  'SAN REMO PASTA MACARONI #38 500GR': 26327,
  'SAN REMO MACARONI': 26327,
  'SAN REMO FUSILLI #56 500 GR': 26327,
  'SAN REMON FUSILI': 26327,
  'SAN REMO PASTA PENNE #18 500 GR': 26327,
  'SAN REMO PENNE': 26327,
  'EDO BKP DANISH PASTRY SHEET 750GR (HITAM)': 45780,
  'EDO BKP PUFF PASTRY SHEET 750GR (KUNING)': 41784,
  'MISSION TORTILLAS CORN YELLOW 6INCH': 80414,
  'MC CAIN FRENCH FRIES GOLD SHOESTRING 1/4 INCH 6LB': 65086,
  'MC CAIN POTATO SUPERPATTIES TRIAGLE 5 LB': 77296,
  'GULARE WHITE SUGAR STICK 100X8GR': 324,
  'GULA HOTEL (100)': 324,
  'DIAMOND UHT MILK FULL CREAM SLEEVE 1000ML': 17547,
  'SUSU UHT': 17547,
  'SHIMADAYA SANUKI UDON TAIKOBAN': 4900,
  'SHIMADAYA RAMEN TAIKOBAN MINI': 5200,
  'MIE UDON': 4900,
  // Borneo Chemical
  'KAPORIT TJIWI KIMIA': 47175,
  // Sinar Ponti Lestari
  'LIVI ECO FACIAL REFILL POP UP 1000GR': 36938,
  'TISU FACIAL  (24)': 36938,
  'TISU POP UP (20)': 22500,
  'LIVI EVERYDAY TOWEL MULTIFOLD 150S (24 PCS)': 12500,
  'TISSU TOWEL/ TISU WASTAFEL (24)': 12500,
  'TISU LIVI EVO PREMIUM (60)': 14000,
  // Toffin
  'DAVINCI SYRUP VANILLA 750ML': 127000,
  'DAVINCI SYRUP HAZELNUT 750ML': 127000,
  'DAVINCI SYRUP CARAMEL 750ML': 127000,
  'TOFFIN MATCHA GREEN TEA FLAVOURED POWDER DRINK': 340000,
  // Rana Rasa
  'PROST PINT 330ML/24': 19050,
  'PROST BREMER 620ML/12': 33150,
  // Soejasch Bali
  'HALAL BEEF RASHER (1 KG/PACK)': 127373,
  'HALAL BEEF PEPPERONI SLICED (500GR/PACK)': 120080,
  'HALAL BEEF BRATWURST 18CM (1 KG/PACK)': 126473,
  'HALAL BEEF COOKED SALAMI SLICED (1 KG/PACK)': 142258,
  // Kopi Surya
  'KOPI BIJI FINE ROBUSTA': 150000,
  'KOPI BIJI': 150000,
  'KOPI BUBUK SURYA': 130000,
  'KOPI SURYA': 130000,
  // Centrum
  '10 KG CORN FLAKES TMB': 75000,
  'CORN FLAKES 500 G': 38000,
  'ZODA SODA WATER 250ML': 4750,
  'ZODA SODA WATER': 4750,
  'PLASTIK WRAP ROLL BEST FRESH 40CM': 200000,
  'BEST FRESH WRAPING': 130000,
  'BEST FRESH WORPING': 130000,
  'MARJAN BOUDOIN SIRUP RASA STRAWBERRY 460ML': 29000,
  'MARJAN STROBERI': 29000,
  'MARJAN BOUDOIN SIRUP RASA LECI 460ML': 29000,
  'MARJAN LECI': 29000,
  'MARJAN COCOPANDAN': 21833,
  'MARJAN BOUDOIN COCOPANDAN 460MLX12BTL': 21833,
  'MARJAN MELON (12)': 24975,
  'GULA HALUS 500G': 11650,
  'GULA HALUS (GULUS)': 11650,
  // Dapur Kita
  'DAGING GILING SAPI': 70600,
  'UDANG KUPAS IQF 61-70/71-90': 110000,
  'KAKI AYAM': 32000,
  'HI-COOK 230G': 19900,
  'HI GAS': 19900,
  'KENTANG SHOESTRING CURAH': 35000,
  'BEST FRESH WRAPPING 30': 130000,
  'BEST FRESH WRAPPING 45': 165000,
  'WRAPPING BESAR': 165000,
  'WRAPPING KECIL': 130000,
  'WRAPING UKURAN 40X500': 165000,
  // Bintang Selatan
  'DAIRY CROWN 24X1KG': 23449,
  'SUSU DAIRY (24)': 23449,
  'CRYSTALIN PET 24X600ML': 2076,
  'CRYSTALIN 600 ML': 2076,
  // Mitra Monas
  'HEINEKEN QUART CTN 12 GID 640 ML + HOLOGRAM': 45830,
  'HEINEKEN PINT CTN 24 GID 330 ML + HOLOGRAM': 27095,
  'BINTANG BREMER 12X620ML HOLOGRAM': 34747,
  'BINTANG PINT 24X330ML + HOLOGRAM': 22011,
  'BINTANG RADLER PINT 24X330ML HOLOGRAM': 22011,
  'GUINNESS QUART DUS 12X620 ML - HOLOGRAM': 45258,
  'GUINNESS PINT DUS HOLOGRAM 24X325ML': 28237,
  'POKKA JASMINE GREEN TEA 24X300ML': 7612,
  // Eco Klin
  'CHLORIN BLEACH/PEMUTIH 5L': 65000,
  'PEMUTIH LAUNDRY': 65000,
  'SUPER SOFTENER BLACK MYSTIQUE 5L': 70000,
  'SOFTENER': 70000,
  'DETERJEN LIQUID STANDARD BLACK MYSTIQUE 5L': 55000,
  'DETERJEN LAUNDRY': 55000,
  'PARFUM LAUNDRY 5L PARIS': 180000,
  'PARFUM LAUNDRY': 180000,
  'PEMBERSIH LANTAI LEMON 5L': 50000,
  'PEMBERSIH LANTAI': 50000,
  'HANDSOAP STRAWBERRY 5L': 55000,
  'HAND SOAP': 55000,
  'KARBOL SEREH 5L': 75000,
  'KARBOL SEREH': 75000,
  // Indogrosir
  'BOLA MAS MIE KRG 600': 135600,
  'MIE BOLA (12)': 11300,
  'BENTUL GARAM 150GR': 1725,
  'GARAM': 1725,
  'KEWPIE WIJEN SANGRAI 1L': 97000,
  'NUTRIJEL PWD LECI 15 GR': 61500,
  'TEPUNG LENCANA MERAH 25 KG': 9500,
  'TEPUNG LENCANA MERAH': 9500,
  'LARRIST GULA KRISTAL 1 KG': 17500,
  'GULA PASIR': 17500,
  'SWALLOW GLOBE AGAR-AGAR PUTIH 7G': 50400,
  'AGAR-AGAR SWALLOW 7GRX12 PCS': 46000,
  'TEPUNG AGAR-AGAR': 4200,
  'INDOMIE SOTO MIE 70GR': 2923,
  'INDOMIE SOTO': 2923,
  'KECAP MANIS INDOFOOD 5.7KG': 135700,
  'KECAP MANIS INDOFOOD 5,7': 135700,
  'STELLA A/F SAKURA 350': 24000,
  'STELLA  (350+50)ML': 24000,
  'STELLA KECIL': 12000,
  'DAIA DTRG BBK FLO 190': 4250,
  'DAIA KECIL (24) (245 GRAM)': 4250,
  'EKONOMI LIQUID JERUK NIPIS 650ML': 7900,
  'EKONOMI (12)': 7900,
  'BAYCLIN REGULAR 500': 10333,
  'BAYCLIN (12)': 10333,
  // Rasa Manis
  'GULA HALUS 500GRX20 BKS': 10500,
  'TEH PRENDJAK ORANGE 50GR': 2850,
  'TEH PRENDJAK': 2850,
  'ROYCO AYAM 460GR X 12 BKS': 18750,
  'ROYCO AYAM 460G (12)': 18750,
  'ROYCO SAPI 460G': 18750,
  'INDOMIE GORENG SPESIAL 85GR X 40 BKS': 3000,
  'INDOMIE GORENG': 3000,
  'INDOMIE KALDU 75 GR X 40 BKS': 2650,
  'INDOMIE KALDU': 2650,
  'AJINOMOTO 500GR X 24 BKS': 25750,
  'AJINOMOTO 500 GRAM  (24)': 25750,
  'DAHLIA F-601 AIR FRESH SACHET 75GR (TEH KERATON)': 10300,
  'PEWANGI DAHLIA': 10300,
  // Berkat Niaga
  'JOSE GOLD': 450000,
  'ABSOLUT VODKA': 500000,
  // Duta Surya
  'CARLSBERG DANSH BOTOL 640 ML': 49151,
  'SAN MIGUEL BOTOL 640ML': 46600,
  'SAN MIGLIGHT BOTOL 330ML': 26193,
  // Classic Fine Food
  'STRERILKOM CRUSHED TOMATO 2,5 KG': 40848,
  'HACO PANNA COTTA 1500GR': 195360,
  // Best Computer
  'TINTA EPSON 003 BLACK': 100000,
  'TINTA EPSON 003 CYAN': 100000,
  'TINTA EPSON 003 MAGENTA': 100000,
  'TINTA EPSON 003 YELLOW': 100000,
  'RIBBON FULLMARK ERC-38': 35000,
  // Sidu Stationary
  'PEN BOLPENKU STARK': 6000,
  'KERTAS FOTOCOPY BRIGHT BMO COPIER A4 75GR': 220000,
  'NOTA KONTAN PAPERLINE 2R KECIL': 3000,
  'TELSTRUK REGISTER 3PLY': 6300,
  'MATERAI TEMPEL RP10,000': 11000,
  'AMPLOP PLASTIK KANCING MERAH': 25000,
  'CF 4 PLY KECIL 9,5X11 PAPERLINE': 350000,
  'ISI STAPLES KANGARO NO 10': 35000,
  'LEM OPP 100Y GOLDTAPE BN': 10000,
  'PAPER CLIP NO 3': 15000,
  'BINDER CLIP NO 105': 29000,
  'BINDER CLIP NO 155': 6000,
  'BINDER CLIP NO 200': 11000,
  'BINDER CLIP NO 300': 47000,
  'ISOLASI GT 1X72 TEBAL CORE HIJAU': 5000,
  'CORRECTION TAPE JOYKO CT-522': 6000,
  'PEN KENKO EASY GEL HITAM': 27000,
  'STICK NOTE VTEC 50X50 SN 225 LBR MIX': 8000
};

// Date parser
function parseExpiryDate(ket) {
  if (!ket || typeof ket !== 'string') return null;
  const cleaned = ket.trim().toUpperCase();
  if (cleaned === '-' || cleaned === '') return null;

  // Pattern like "2027-09-15 00:00:00" or "2024-11-16"
  const isoMatch = cleaned.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;

  // Pattern like "24/11/2028"
  const slashMatch = cleaned.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (slashMatch) {
    const day = slashMatch[1].padStart(2, '0');
    const month = slashMatch[2].padStart(2, '0');
    return `${slashMatch[3]}-${month}-${day}`;
  }

  // Indonesian months mapping
  const months = {
    'JANUARI': '01', 'JAN': '01',
    'FEBRUARI': '02', 'FEB': '02', 'FERBUARI': '02',
    'MARET': '03', 'MAR': '03',
    'APRIL': '04', 'APR': '04',
    'MEI': '05', 'MAY': '05',
    'JUNI': '06', 'JUN': '06',
    'JULI': '07', 'JUL': '07',
    'AGUSTUS': '08', 'AGU': '08', 'AGT': '08',
    'SEPTEMBER': '09', 'SEP': '09',
    'OKTOBER': '10', 'OKT': '10',
    'NOVEMBER': '11', 'NOV': '11',
    'DESEMBER': '12', 'DES': '12'
  };

  for (const [mName, mNum] of Object.entries(months)) {
    if (cleaned.includes(mName)) {
      // Find year (4 digits)
      const yearMatch = cleaned.match(/\b(20\d{2})\b/);
      if (yearMatch) {
        const year = yearMatch[1];
        // Find day if present before or after month
        const dayMatch = cleaned.match(/\b(\d{1,2})\b/);
        let day = '01';
        if (dayMatch && parseInt(dayMatch[1], 10) <= 31 && dayMatch[1] !== year.substring(2)) {
          day = dayMatch[1].padStart(2, '0');
        }
        return `${year}-${mNum}-${day}`;
      }
    }
  }

  return null;
}

// Category decider
// 1: Bahan Makanan & F&B
// 2: Peralatan & Amenities Kamar
// 3: Pembersih & Hygiene
// 4: Maintenance & Engineering
// 5: Perlengkapan Kantor
function decideCategory(name) {
  const n = name.toUpperCase();
  if (
    n.includes('SABUN') || n.includes('DETERJEN') || n.includes('DETERGENT') || n.includes('BAYCLIN') ||
    n.includes('PEMBERSIH') || n.includes('KARBOL') || n.includes('VIXAL') || n.includes('CLING') ||
    n.includes('SOFTENER') || n.includes('PARFUM LAUNDRY') || n.includes('PEMUTIH') || n.includes('BAYGON') ||
    n.includes('KAPORIT') || n.includes('SPONS') || n.includes('SABUT') || n.includes('LOXUS') ||
    n.includes('CLEANER') || n.includes('MOP') || n.includes('KAIN PEL') || n.includes('HAND SOAP') ||
    n.includes('HANDSOAP') || n.includes('PLEDGE') || n.includes('MAGIC SPONGE') || n.includes('MAGIC BLOCK')
  ) {
    return 3; // Pembersih & Hygiene
  }

  if (
    n.includes('SANDAL') || n.includes('SIKAT GIGI') || n.includes('SHOWERCAP') || n.includes('SHOWER CAP') ||
    n.includes('SISIR') || n.includes('SHAMPOO') || n.includes('BOTOL BODY') || n.includes('BOTOL SHAMPOO') ||
    n.includes('KUNCI HOTEL') || n.includes('LILIN')
  ) {
    return 2; // Peralatan & Amenities Kamar
  }

  if (
    n.includes('KERTAS FOTOCOPY') || n.includes('NOTA KONTAN') || n.includes('TELSTRUK') || n.includes('MATERAI') ||
    n.includes('AMPLOP') || n.includes('STAPLES') || n.includes('LEM OPP') || n.includes('PAPER CLIP') ||
    n.includes('BINDER CLIP') || n.includes('ISOLASI') || n.includes('CORRECTION TAPE') || n.includes('PEN ') ||
    n.includes('BOLPENKU') || n.includes('STICK NOTE') || n.includes('TINTA EPSON') || n.includes('RIBBON') ||
    n.includes('KORAN') || n.includes('NAME CARD')
  ) {
    return 5; // Perlengkapan Kantor
  }

  if (
    n.includes('CEILING LIGHT') || n.includes('ALKALINE') || n.includes('TAFFHOME') || n.includes('STABILIZER') ||
    n.includes('LAMPION') || n.includes('ALAT PEMANGGANG') || n.includes('PENCETAK PIZZA')
  ) {
    return 4; // Maintenance & Engineering
  }

  return 1; // Default to Bahan Makanan & F&B (includes F&B packaging, ingredients, beverages)
}

// Unit decider
function decideUnit(name) {
  const n = name.toUpperCase();
  if (n.includes('LITER') || n.includes(' 5L') || n.includes(' 1L') || n.includes(' 1 LT') || n.includes(' 18 L') || n.includes(' 5 LTR')) {
    if (n.includes('KEN') || n.includes('JERIGEN')) return 'Ken';
    return 'Btl';
  }
  if (n.includes('BTL') || n.includes('BOTOL') || n.includes('SYRUP') || n.includes('SIRUP') || n.includes('VODKA') || n.includes('BEER') || n.includes('PINT') || n.includes('BREMER') || n.includes('VIXAL') || n.includes('MARJAN') || n.includes('HEINEKEN') || n.includes('BINTANG') || n.includes('GUINNESS') || n.includes('ZODA')) {
    return 'Btl';
  }
  if (n.includes('KG') || n.includes('KILO') || n.includes('DAGING') || n.includes('UDANG') || n.includes('AYAM') || n.includes('TEPUNG') || n.includes('BERAS') || n.includes('GULA PASIR') || n.includes('GULA MERAH') || n.includes('GARAM')) {
    if (n.includes('KRG') || n.includes('KARUNG')) return 'Krg';
    return 'KG';
  }
  if (n.includes('ROLL') || n.includes('WRAPING') || n.includes('WRAPPING') || n.includes('TISSU ROLL') || n.includes('SEAL CUP') || n.includes('TELSTRUK')) {
    return 'Roll';
  }
  if (n.includes('DUS') || n.includes('BOX') || n.includes('CTN') || n.includes('KOTAK')) {
    if (n.includes('KOTAK TAKEAWAY') || n.includes('KOTAK NASI') || n.includes('KOTAK KUE') || n.includes('KOTAK PIZZA') || n.includes('KOTAK SUSHI')) {
      return 'PCS';
    }
    return 'Dus';
  }
  if (n.includes('PACK') || n.includes('POUCH') || n.includes('STANDING POUCH') || n.includes('KANTONG') || n.includes('PE ') || n.includes('HD ')) {
    return 'Pack';
  }
  if (n.includes('BKS') || n.includes('BUNGKUS') || n.includes('INDOMIE') || n.includes('ROYCO') || n.includes('MASAKO') || n.includes('SACHET')) {
    return 'Bks';
  }
  if (n.includes('KLG') || n.includes('KALENG') || n.includes('CORN') || n.includes('MUSHROOM') || n.includes('TUNA') || n.includes('HI-COOK') || n.includes('HI GAS')) {
    return 'Klg';
  }
  if (n.includes('PSG') || n.includes('SANDAL')) {
    return 'Psg';
  }
  return 'PCS';
}

// Fallback pricing estimation for items without bon toko
function estimatePrice(name, categoryId, unit) {
  const n = name.toUpperCase();

  // Specific F&B packaging
  if (n.includes('KOTAK TAKEAWAY') || n.includes('LUNCH BOX')) return 1650;
  if (n.includes('BOX 20X20') || n.includes('KOTAK NASI 20X20') || n.includes('K.20X20')) return 1850;
  if (n.includes('BOX MAHKOTA')) return 1500;
  if (n.includes('BOX PIZZA') || n.includes('KOTAK PIZZA')) return 3200;
  if (n.includes('BOX DANGAU PUTIH')) return 2200;
  if (n.includes('KOTAK KUE')) return 2500;
  if (n.includes('KOTAK SUSHI') || n.includes('BROWNIES SUSHI')) return 2200;
  if (n.includes('BROWNIES') || n.includes('BRONIES') || n.includes('MIKA BROWNIES')) return 1800;
  if (n.includes('THINWALL 1000ML')) return 3200;
  if (n.includes('THINWALL 750')) return 2800;
  if (n.includes('THINWALL 400') || n.includes('THINWALL 150')) return 1900;
  if (n.includes('THINWALL 25ML') || n.includes('THINWALL 20ML')) return 850;
  if (n.includes('THINWALL')) return 2200;
  if (n.includes('STANDING POUCH')) return 1650;
  if (n.includes('KANTONG') || n.includes('K.') || n.includes('PLASTIK')) {
    if (n.includes('LAUNDRY') || n.includes('80X130') || n.includes('90 X 120') || n.includes('SAMPAH')) return 24000;
    return 12000;
  }
  if (n.includes('SEDOTAN') || n.includes('STRAW')) return 15000;
  if (n.includes('SENDOK') || n.includes('GARPU')) return 14000;
  if (n.includes('CUP KUE') || n.includes('CUP CAKE')) return 18000;
  if (n.includes('GELAS LOGO DANGAU') || n.includes('GELAS 12') || n.includes('GELAS 14') || n.includes('GELAS')) return 650;
  if (n.includes('ALAS GELAS') || n.includes('ALAS NASI')) return 350;
  if (n.includes('ROL PLASTIK') || n.includes('SEAL CUP')) return 115000;
  if (n.includes('KERTAS BAKPAO') || n.includes('KERTAS BAKPAU') || n.includes('KERTAS BAPAU') || n.includes('KERTAS DIMSUM')) return 18000;
  if (n.includes('MIKA NASI') || n.includes('MIKA SEKAT') || n.includes('MIKA BENTO') || n.includes('BENTO')) return 12000;

  // Amenities
  if (n.includes('SISIR')) return 1250;
  if (n.includes('SHAMPOO') || n.includes('BODY SOAP')) return 1800;
  if (n.includes('SABUN CAP KUCING') || n.includes('SABUN MERAH') || n.includes('SABUN HIJAU')) return 3500;
  if (n.includes('STERNO')) return 6000;
  if (n.includes('SWALLOW BALL')) return 18000;

  // F&B ingredients
  if (n.includes('TELUR KAMPUNG')) return 3000;
  if (n.includes('TELUR')) return 2200;
  if (n.includes('BERAS KARYAWAN') || n.includes('BERAS SOVIA')) return 14500;
  if (n.includes('BLU9') || n.includes('CLUB GELAS') || n.includes('PASQUA') || n.includes('NESTLE')) return 2500;
  if (n.includes('SANTAN KARA') || n.includes('SANTAN')) return 3800;
  if (n.includes('BLUEBAND')) return 12500;
  if (n.includes('SAOS SAMBAL') || n.includes('SAOS TOMAT') || n.includes('SAUS')) return 18500;
  if (n.includes('KECAP ASIN') || n.includes('KECAP IKAN') || n.includes('KECAP BANGO') || n.includes('KECAP')) return 22000;
  if (n.includes('KOPI NESCAFE')) return 1850;
  if (n.includes('TEH KOTAK') || n.includes('TEH CAP BOTOL') || n.includes('THE KOTAK')) return 4000;
  if (n.includes('CHOCOCHIPS') || n.includes('COLLATA') || n.includes('COKLAT') || n.includes('MEISES')) return 45000;
  if (n.includes('JAGUNG HALUS') || n.includes('JAGUNG KASAR')) return 12000;
  if (n.includes('TEPUNG')) return 14000;
  if (n.includes('ASAM JAWA')) return 8000;
  if (n.includes('EMPING') || n.includes('KERUPUK')) return 28000;
  if (n.includes('CAPPUCINO') || n.includes('INDOCAFE')) return 3500;
  if (n.includes('NUTRISARI')) return 18500;
  if (n.includes('CUKA MAKAN')) return 6500;
  if (n.includes('GULA MERAH')) return 24000;
  if (n.includes('MAIZENA')) return 7500;
  if (n.includes('MASAKO')) return 18500;
  if (n.includes('V60') || n.includes('FILTER KOPI') || n.includes('FILTER BAG')) return 28000;
  if (n.includes('NORI')) return 38000;
  if (n.includes('PASTA PANDAN') || n.includes('PASTA KACANG') || n.includes('PERISA') || n.includes('KOEPOE')) return 12500;
  if (n.includes('TOFFIECO')) return 48000;
  if (n.includes('SRIRACHA') || n.includes('TABASCO') || n.includes('TOBASIO')) return 38000;
  if (n.includes('TAKUMI') || n.includes('HONDASHI') || n.includes('KATSUODASHI')) return 42000;
  if (n.includes('DANCOW') || n.includes('FRISAN FLAG')) return 16500;
  if (n.includes('BIO BIANCA')) return 65000;
  if (n.includes('FRUTANEIRA LYCHEE') || n.includes('LONGAN') || n.includes('NATA DE COCO')) return 32000;
  if (n.includes('KACANG METE') || n.includes('ALMOND') || n.includes('BIJI KUACI') || n.includes('BIJI LABU')) return 45000;
  if (n.includes('ABON TUNA') || n.includes('ABON AYAM')) return 35000;
  if (n.includes('OREO')) return 12500;

  // Maintenance & Engineering
  if (n.includes('ALKALINE')) return 18000;
  if (n.includes('ALAT PEMANGGANG')) return 185000;
  if (n.includes('CEILING LIGHT')) return 85000;
  if (n.includes('LAMPION')) return 35000;
  if (n.includes('TAFFHOME')) return 45000;
  if (n.includes('STABILIZER')) return 285000;
  if (n.includes('PENCETAK PIZZA')) return 65000;

  // Cleaning
  if (n.includes('PEMBERSIH KACA') || n.includes('CLING')) return 12500;
  if (n.includes('PEMBERSIH CLOSET')) return 24000;
  if (n.includes('LOXUS CLEANER')) return 65000;
  if (n.includes('PRO CLEAN MAGIC')) return 14000;
  if (n.includes('KRISBOW MOP') || n.includes('KAIN PEL')) return 55000;
  if (n.includes('BAYGON')) return 38500;
  if (n.includes('SPONS')) return 4500;

  // Default based on category
  if (categoryId === 1) return 15000;
  if (categoryId === 2) return 5000;
  if (categoryId === 3) return 25000;
  if (categoryId === 4) return 50000;
  if (categoryId === 5) return 15000;

  return 10000;
}

// Find price for item name
function resolvePrice(itemName, categoryId, unit) {
  const norm = itemName.trim().toUpperCase();

  // 1. Direct match in Bon Toko
  if (BON_TOKO_PRICES[norm]) {
    return { price: BON_TOKO_PRICES[norm], source: 'bon_toko_exact' };
  }

  // 2. Substring match in Bon Toko
  for (const [key, val] of Object.entries(BON_TOKO_PRICES)) {
    if (norm.includes(key) || key.includes(norm)) {
      return { price: val, source: 'bon_toko_match' };
    }
  }

  // 3. Estimate reasonable price
  const est = estimatePrice(norm, categoryId, unit);
  return { price: est, source: 'estimated' };
}

console.log('Testing price resolution for sample items:');
['AJINOMOTO 500 GRAM  (24)', 'BERAS ROYAL REGAL', 'SIKAT GIGI', 'KOTAK TAKEAWAY DANGAU 20X20', 'ANCHOR CREAM CHEESE', 'TELUR', 'KAPORIT TJIWI KIMIA'].forEach(name => {
  const cat = decideCategory(name);
  const unit = decideUnit(name);
  const res = resolvePrice(name, cat, unit);
  console.log(`- ${name} -> Cat: ${cat}, Unit: ${unit}, Price: Rp ${res.price.toLocaleString('id-ID')} (${res.source})`);
});

