const fs = require('fs');
const path = require('path');
const { Pool } = require('../node_modules/pg');
require('../node_modules/dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:cello@localhost:5432/invtrack_dangau'
});

const rawData = JSON.parse(fs.readFileSync(path.join(__dirname, 'stock_raw.json'), 'utf8'));

// Exact prices from Bon Toko
const BON_TOKO_PRICES = {
  // PT Thomson
  'GLOBAL CREAM CORN 425GR (24)': 15833,
  'GLOBAL WHOLE CORN 425GR': 13125,
  'CORNICHE 200GR SNOW WHITE': 27750,
  'HEINZ TOMATO PASTA 3.15 KG': 208334,
  'GLOBAL WHOLE MUSHROOM 425 GR': 15833,
  'GLOBAL MUSHROOM': 15833,
  'TTS STRAW MUSHROOM 425GR': 14827,
  'TTS MUSCHROOM': 14827,
  'LEE KUM LEE OYSTER 770GR + 255 GR': 56667,
  'LEE KUM KEE 770 G': 56667,
  'LEE KUM KEE GRATIS (KECIL)': 18500,
  'KEWPIE SALAD ROASTED SESAME 1L': 88834,
  'SUNBAY EVAPOERATED MILK 380GR': 12211,
  'EVAPORATED MILK SUNBAY': 12211,
  'YO GUAN HENG 620ML SESAME OIL': 37421,
  'MINYAK WIJEN YO GUAN HENG': 37421,
  'MINYAK WIJEN': 37421,
  'KIKKOMAN SOY SAUCE/SHOYU BOTTLE': 125000,
  'KIKKOMAN KECAP ASIN': 65000,
  'KIKKOMAN SAUS MANIS': 45000,
  'KIKKOMAN SAUS PEDAS/GOCUJANG': 48000,
  'KIKKOMAN YAKINIKU': 52000,
  'HOUSE KARI ALA JEPANG 935GR': 163501,
  'KARI HOUSE JEPANG': 163501,

  // PD Fajar Abadi
  'KF TUNA CHUNK IN BRINE 1800GR': 124320,
  'TUNA KING FISHER': 38000,
  'CHRISTA TUNA': 32000,

  // PD Siatan
  'BERAS ROYAL REGAL 20 KG': 17250,
  'BERAS ROYAL REGAL': 17250,

  // PT Sinar Sumber Sehat
  'L.S MARJAN BOUDOIN MELON': 24975,
  'L.S MARJAN BOUDOIN COCOPANDAN': 24975,
  'L. DMT BB C.S (10 PCH) BBQ 1 KILO': 32967,
  'SAOS BBQ': 32967,

  // CV Metalindo Jaya (Amenities)
  'SHOWER CAP + KOTAK LOGO': 850,
  'SHOWER CAP': 850,
  'SHOWERCAP': 850,
  'SANDAL 4MM LOGO 1 WARNA LIST PUTIH': 3300,
  'SANDAL': 3300,
  '2 SIKAT GIGI COBRA PANJANG + ODOL + KOTAK': 2150,
  'SIKAT GIGI': 2150,

  // PT Multi Arena Sentosa
  'MINYAK GORENG FILMA 18 LITER': 21791,
  'MINYAK FILMA': 21791,
  'MINYAK BIMOLI 18 LITER': 21500,

  // CV Surya Putra
  'TEPUNG TERIGU DOUBLE ZERO @25KG': 14652,
  'TEPUNG DOUBLE ZERO': 14652,
  'RS EXTRA VIRGIN OLIVE OIL PET 5 LTR': 188700,
  'EXTRA VIRGIN OLIVE OIL': 188700,

  // PT Central Kapuas Utama
  'KNORR CHICKEN POWDER REFILL 6X1KG BFLY': 90100,
  'KNORR CHICKEN POWDER': 90100,
  'KNORR BEEF': 92000,
  'KNORR DEMI GLACE': 98000,

  // PT Gracendo Jaya (Packaging)
  'PE SEGITIGA 12X25': 9600,
  'PE TUNA 12X25 @60PK': 5800,
  'K.12X25 (TUNA)': 5800,
  'PE TUNA 17X40': 5400,
  'K.17X40 (ISI 5) TUNA': 5400,
  'PE TUNA 15X30': 5400,
  'K.15X30': 5400,
  'HD NICO PUTIH SUSU 17': 16000,
  'KANTONG PUTIH HD 17': 16000,
  'HD NICO PUTIH SUSU 24': 16000,
  'KANTONG HD 24': 16000,
  'HD BECAK PUTIH SUSU 28': 16000,
  'HD NICO PUTIH SUSU 28': 16000,
  'KANTONG PUTIH 28': 16000,
  'KANTONG P SUSU UK 28': 16000,
  'TUSUK BUAH BENING': 7000,
  'GARPU BUAH': 7000,
  'GARPU PLASTIK BUAH': 7000,
  'MIKA SEKAT 20 ORI PACK': 12000,
  'MIKA SEKAT NASI': 12000,
  'MIKA NASI': 12000,
  'SENDOK MAKAN VICTORY DOP (PP)': 14000,
  'SENDOK MAKAN VICTORY (PP)': 14000,
  'HD HITAM PAHE JUMBO 50': 30000,
  'KANTONG UK 50': 30000,
  'HD SAMPAH KOKITA 90X120': 24000,
  'KANTONG 90 X 120': 24000,
  'CUP KUE MOTIF 5.5': 18000,
  'CUP KUE UK 5.5': 18000,
  'CUP CAKE MOTIF 7': 23000,
  'CUP KUE UK 70MM': 23000,
  'CUP CAKE 70CM': 23000,
  'CUP CAKE 9.5 CM': 29000,
  'CUP KUE UK 95MM': 29000,
  'CUP CAKE 9CM': 29000,
  'CUP CAKE 5 CM': 15000,
  'CUP CAKE UK 55 MM': 18000,
  'SEDOTAN STERIL KERTAS PUTIH SB 524': 25000,
  'SEDOTAN SAMURAI DANGAU': 25000,
  'SEDOTAN FLEXIBLE STRAW': 15000,
  'KOTAK KUE 12X14 POLOS TEBAL': 65000,

  // CV Cotton Bread
  'ANCHOR MOZZARELLA BLOCK 2X10KG': 158636,
  'ANCHOR CREAM CHEESE': 168000,
  'MAG CHEESE': 145000,

  // PT Sukanda Djaya
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
  'PENNE': 26327,
  'LA FONTE FETTUCINE': 22500,
  'EDO BKP DANISH PASTRY SHEET 750GR (HITAM)': 45780,
  'EDO BKP PUFF PASTRY SHEET 750GR (KUNING)': 41784,
  'MISSION TORTILLAS CORN YELLOW 6INCH': 80414,
  'MC CAIN FRENCH FRIES GOLD SHOESTRING 1/4 INCH 6LB': 65086,
  'MC CAIN POTATO SUPERPATTIES TRIAGLE 5 LB': 77296,
  'GULARE WHITE SUGAR STICK 100X8GR': 324,
  'GULARE': 324,
  'GULA HOTEL (100)': 324,
  'DIAMOND UHT MILK FULL CREAM SLEEVE 1000ML': 17547,
  'SUSU UHT': 17547,
  'SHIMADAYA SANUKI UDON TAIKOBAN': 4900,
  'SHIMADAYA RAMEN TAIKOBAN MINI': 5200,
  'MIE UDON': 4900,

  // CV Borneo Chemical
  'KAPORIT TJIWI KIMIA': 47175,

  // PT Sinar Ponti Lestari (Tisu)
  'LIVI ECO FACIAL REFILL POP UP 1000GR': 36938,
  'TISU FACIAL  (24)': 36938,
  'TISU POP UP (20)': 22500,
  'LIVI EVERYDAY TOWEL MULTIFOLD 150S (24 PCS)': 12500,
  'TISSU TOWEL/ TISU WASTAFEL (24)': 12500,
  'TISU LIVI EVO PREMIUM (60)': 14000,
  'TISSU ROLL (144)': 3800,
  'TISSU SENDOK (60)': 8500,
  'TISSU BOX (24)': 14500,
  'TISU PULPIES': 12000,
  'TISU TAMU': 9500,

  // CV Toffin
  'DAVINCI SYRUP VANILLA 750ML': 127000,
  'DAVINCI SYRUP HAZELNUT 750ML': 127000,
  'DAVINCI SYRUP CARAMEL 750ML': 127000,
  'TOFFIN MATCHA GREEN TEA FLAVOURED POWDER DRINK': 340000,

  // CV Rana Rasa
  'PROST PINT 330ML/24': 19050,
  'PROST BREMER 620ML/12': 33150,

  // PT Soejasch Bali (Meats)
  'HALAL BEEF RASHER (1 KG/PACK)': 127373,
  'HALAL BEEF PEPPERONI SLICED (500GR/PACK)': 120080,
  'HALAL BEEF BRATWURST 18CM (1 KG/PACK)': 126473,
  'HALAL BEEF COOKED SALAMI SLICED (1 KG/PACK)': 142258,

  // Kopi Bubuk Surya
  'KOPI BIJI FINE ROBUSTA': 150000,
  'KOPI BIJI': 150000,
  'KOPI BUBUK SURYA': 130000,
  'KOPI SURYA': 130000,
  'KOPI JANGKAR': 115000,
  'KOPI BUBUK': 120000,

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
  'MARJAN GRORADINO': 24975,
  'GULA HALUS 500G': 11650,
  'GULA HALUS (GULUS)': 11650,

  // Dapur Kita Fresh Market
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

  // CV Bintang Selatan Cemerlang
  'DAIRY CROWN 24X1KG': 23449,
  'SUSU DAIRY (24)': 23449,
  'CRYSTALIN PET 24X600ML': 2076,
  'CRYSTALIN 600 ML': 2076,

  // PT Mitra Monas Sejahtera
  'HEINEKEN QUART CTN 12 GID 640 ML + HOLOGRAM': 45830,
  'HEINEKEN PINT CTN 24 GID 330 ML + HOLOGRAM': 27095,
  'BINTANG BREMER 12X620ML HOLOGRAM': 34747,
  'BINTANG PINT 24X330ML + HOLOGRAM': 22011,
  'BINTANG RADLER PINT 24X330ML HOLOGRAM': 22011,
  'GUINNESS QUART DUS 12X620 ML - HOLOGRAM': 45258,
  'GUINNESS PINT DUS HOLOGRAM 24X325ML': 28237,
  'POKKA JASMINE GREEN TEA 24X300ML': 7612,

  // Eco Klin (Hygiene Chemicals)
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
  'KWEPIE MAYO': 97000,
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
  'KECAP MANIS INDOFOOD 725': 24000,
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

  // PT Berkat Niaga Sejahtera
  'JOSE GOLD': 450000,
  'ABSOLUT VODKA': 500000,

  // PT Duta Surya Sejati
  'CARLSBERG DANSH BOTOL 640 ML': 49151,
  'SAN MIGUEL BOTOL 640ML': 46600,
  'SAN MIGLIGHT BOTOL 330ML': 26193,

  // PT Classic Fine Food Indonesia
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

function parseExpiryDate(ket) {
  if (!ket || typeof ket !== 'string') return null;
  const cleaned = ket.trim().toUpperCase();
  if (cleaned === '-' || cleaned === '') return null;

  const isoMatch = cleaned.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;

  const slashMatch = cleaned.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (slashMatch) {
    const day = slashMatch[1].padStart(2, '0');
    const month = slashMatch[2].padStart(2, '0');
    return `${slashMatch[3]}-${month}-${day}`;
  }

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
      const yearMatch = cleaned.match(/\b(20\d{2})\b/);
      if (yearMatch) {
        const year = yearMatch[1];
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

  return 1; // Default to Bahan Makanan & F&B
}

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

function estimatePrice(name, categoryId) {
  const n = name.toUpperCase();

  // F&B packaging
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

  // Category fallback
  if (categoryId === 1) return 15000;
  if (categoryId === 2) return 5000;
  if (categoryId === 3) return 25000;
  if (categoryId === 4) return 50000;
  if (categoryId === 5) return 15000;

  return 10000;
}

function resolvePrice(itemName, categoryId) {
  const norm = itemName.trim().toUpperCase();

  if (BON_TOKO_PRICES[norm]) {
    return { price: BON_TOKO_PRICES[norm], source: 'bon_toko_exact' };
  }

  for (const [key, val] of Object.entries(BON_TOKO_PRICES)) {
    if (norm === key || norm.includes(key) || key.includes(norm)) {
      return { price: val, source: 'bon_toko_match' };
    }
  }

  const est = estimatePrice(norm, categoryId);
  return { price: est, source: 'estimated' };
}

async function seed() {
  console.log('=== STARTING ACTUAL STOCK SEEDING ===');

  // 1. Update Warehouses
  await pool.query(`
    UPDATE warehouses 
    SET warehouse_code = 'WH-WH', 
        warehouse_name = 'Gudang White House', 
        location = 'Gudang White House / Kediaman Owner' 
    WHERE id = 2
  `);
  console.log('1. Updated warehouse 2 to "Gudang White House".');

  // 2. Ensure all units exist
  const additionalUnits = [
    'Dus', 'Pack', 'Bks', 'Klg', 'Ken', 'Krg', 'Psg', 'Lsn', 'Ktk', 'Lbr', 'Slop', 'Set', 'Unit', 'Can', 'Ball'
  ];
  for (const u of additionalUnits) {
    await pool.query(`
      INSERT INTO units (unit_name) 
      VALUES ($1) 
      ON CONFLICT (unit_name) DO NOTHING
    `, [u]);
  }
  const unitsRes = await pool.query('SELECT id, unit_name FROM units');
  const unitMap = {};
  unitsRes.rows.forEach(r => {
    unitMap[r.unit_name.toUpperCase()] = r.id;
  });
  console.log('2. Synced units table:', Object.keys(unitMap).length, 'units available.');

  // 3. Clear dependent transaction tables & items
  console.log('3. Clearing existing dummy transactions and items...');
  await pool.query(`
    DELETE FROM inventory_movements;
    DELETE FROM stock_opname_items;
    DELETE FROM stock_opnames;
    DELETE FROM goods_receipt_items;
    DELETE FROM goods_receipts;
    DELETE FROM goods_issue_items;
    DELETE FROM goods_issues;
    DELETE FROM purchase_order_items;
    DELETE FROM purchase_orders;
    DELETE FROM purchase_request_items;
    DELETE FROM purchase_requests;
    DELETE FROM inventory;
    DELETE FROM items;
  `);

  // Reset sequences
  const seqs = [
    'items_id_seq',
    'inventory_id_seq',
    'purchase_requests_id_seq',
    'purchase_request_items_id_seq',
    'purchase_orders_id_seq',
    'purchase_order_items_id_seq',
    'goods_receipts_id_seq',
    'goods_receipt_items_id_seq',
    'goods_issues_id_seq',
    'goods_issue_items_id_seq',
    'stock_opnames_id_seq',
    'stock_opname_items_id_seq',
    'inventory_movements_id_seq'
  ];
  for (const seq of seqs) {
    try {
      await pool.query(`ALTER SEQUENCE ${seq} RESTART WITH 1`);
    } catch (e) {
      // ignore if seq does not exist
    }
  }
  console.log('3. Sequences reset.');

  // 4. Build consolidated master catalog
  const itemsCatalog = new Map();

  function addItem(rawItem, warehouseId) {
    const rawName = rawItem.name.trim();
    const key = rawName.toUpperCase();

    if (!itemsCatalog.has(key)) {
      const catId = decideCategory(rawName);
      const unitName = decideUnit(rawName);
      const unitId = unitMap[unitName.toUpperCase()] || unitMap['PCS'] || 1;
      const { price, source } = resolvePrice(rawName, catId);
      const expiry = parseExpiryDate(rawItem.keterangan);

      itemsCatalog.set(key, {
        displayName: rawName,
        categoryId: catId,
        unitId: unitId,
        unitName: unitName,
        unitPrice: price,
        priceSource: source,
        expiryDate: expiry,
        dangauStock: 0,
        whiteHouseStock: 0
      });
    }

    const entry = itemsCatalog.get(key);
    if (warehouseId === 1) {
      entry.dangauStock = rawItem.stock;
    } else if (warehouseId === 2) {
      entry.whiteHouseStock = rawItem.stock;
    }

    if (!entry.expiryDate && rawItem.keterangan) {
      entry.expiryDate = parseExpiryDate(rawItem.keterangan);
    }
  }

  rawData.dangau.forEach(item => addItem(item, 1));
  rawData.white_house.forEach(item => addItem(item, 2));

  console.log(`4. Prepared ${itemsCatalog.size} unique master items across both warehouses.`);

  // 5. Insert into items table and inventory table
  let itemCounter = 1;
  const insertedItems = [];

  for (const [key, data] of itemsCatalog.entries()) {
    const internalSku = `ITM-${String(itemCounter).padStart(5, '0')}`;

    const totalPhysical = data.dangauStock + data.whiteHouseStock;
    let minStock = 10;
    let critStock = 5;
    if (totalPhysical > 1000) {
      minStock = 100;
      critStock = 30;
    } else if (totalPhysical > 200) {
      minStock = 40;
      critStock = 15;
    } else if (totalPhysical > 50) {
      minStock = 20;
      critStock = 8;
    } else if (totalPhysical === 0) {
      minStock = 10;
      critStock = 5;
    }

    const itemRes = await pool.query(`
      INSERT INTO items (
        sku,
        item_name,
        category_id,
        unit_id,
        minimum_stock,
        critical_stock,
        unit_price,
        status,
        expiry_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, item_name, unit_price
    `, [
      internalSku,
      data.displayName,
      data.categoryId,
      data.unitId,
      minStock,
      critStock,
      data.unitPrice,
      'Active',
      data.expiryDate
    ]);

    const itemId = itemRes.rows[0].id;
    insertedItems.push({
      id: itemId,
      name: data.displayName,
      price: data.unitPrice,
      unitName: data.unitName,
      dangauStock: data.dangauStock,
      whiteHouseStock: data.whiteHouseStock
    });

    // Gudang Dangau (id 1)
    await pool.query(`
      INSERT INTO inventory (item_id, warehouse_id, current_stock, updated_at)
      VALUES ($1, 1, $2, CURRENT_TIMESTAMP)
    `, [itemId, data.dangauStock]);

    // Gudang White House (id 2)
    await pool.query(`
      INSERT INTO inventory (item_id, warehouse_id, current_stock, updated_at)
      VALUES ($1, 2, $2, CURRENT_TIMESTAMP)
    `, [itemId, data.whiteHouseStock]);

    itemCounter++;
  }

  console.log(`5. Inserted ${insertedItems.length} items and ${insertedItems.length * 2} inventory records.`);

  // 6. Seed Realistic In & Out Transactions
  console.log('6. Seeding sample realistic transactions for Beranda Master mutasi...');

  // Get active users:
  // id 1: Accounting Manager (Master)
  // id 2: Accounting Supervisor (Admin)
  // id 3: Budi Santoso (Petugas Gudang)
  const masterUserId = 1;
  const adminUserId = 2;
  const warehouseUserId = 3;

  const findItem = (namePart) => insertedItems.find(i => i.name.toUpperCase().includes(namePart.toUpperCase())) || insertedItems[0];

  const itemBeras = findItem('BERAS ROYAL REGAL');
  const itemMinyak = findItem('MINYAK GORENG FILMA') || findItem('MINYAK');
  const itemSandal = findItem('SANDAL');
  const itemSabun = findItem('DETERJEN LAUNDRY') || findItem('SABUN');
  const itemLipton = findItem('LIPTON') || findItem('TEH HOTEL');
  const itemGula = findItem('GULA PASIR') || findItem('LARRIST');

  // A. Purchase Request
  const prRes = await pool.query(`
    INSERT INTO purchase_requests (
      pr_number, user_id, warehouse_id, status, notes, created_at
    ) VALUES (
      'PR-202611-0001', $1, 1, 'Disetujui', 'Restock rutin bahan pokok resto dan amenities', CURRENT_TIMESTAMP - INTERVAL '2 days'
    ) RETURNING id
  `, [warehouseUserId]);
  const prId = prRes.rows[0].id;

  await pool.query(`
    INSERT INTO purchase_request_items (purchase_request_id, item_id, quantity, urgency, status)
    VALUES 
      ($1, $2, 20, 'Normal', 'Disetujui'),
      ($1, $3, 10, 'Tinggi', 'Disetujui')
  `, [prId, itemBeras.id, itemMinyak.id]);

  // B. Purchase Order
  const poRes = await pool.query(`
    INSERT INTO purchase_orders (
      po_number, purchase_request_id, supplier_id, warehouse_id, po_date, status, total_amount, notes, created_by
    ) VALUES (
      'PO-202611-0001', $1, 2, 1, CURRENT_DATE - INTERVAL '1 day', 'Disetujui', $2, 'Pengadaan bahan baku resto Dangau', $3
    ) RETURNING id
  `, [prId, (itemBeras.price * 20) + (itemMinyak.price * 10), adminUserId]);
  const poId = poRes.rows[0].id;

  await pool.query(`
    INSERT INTO purchase_order_items (purchase_order_id, item_id, quantity, unit_price, total_price)
    VALUES 
      ($1, $2, 20, $3, $4),
      ($1, $5, 10, $6, $7)
  `, [
    poId, itemBeras.id, itemBeras.price, itemBeras.price * 20,
    itemMinyak.id, itemMinyak.price, itemMinyak.price * 10
  ]);

  // C. Goods Receipts (Ringkasan IN Terbaru)
  // GR 1: Beras & Minyak di Gudang Dangau
  const gr1Res = await pool.query(`
    INSERT INTO goods_receipts (
      gr_number, po_id, supplier_id, warehouse_id, receipt_date, notes, created_by
    ) VALUES (
      'GR-202611-0001', $1, 2, 1, CURRENT_TIMESTAMP - INTERVAL '1 day', 'Penerimaan stok bahan makanan resto Dangau', $2
    ) RETURNING id
  `, [poId, warehouseUserId]);
  const gr1Id = gr1Res.rows[0].id;

  await pool.query(`
    INSERT INTO goods_receipt_items (goods_receipt_id, item_id, quantity, unit_name)
    VALUES 
      ($1, $2, 16, $3),
      ($1, $4, 10, $5)
  `, [gr1Id, itemBeras.id, itemBeras.unitName, itemMinyak.id, itemMinyak.unitName]);

  // GR 2: Sandal Hotel & Tisu di Gudang Dangau
  const gr2Res = await pool.query(`
    INSERT INTO goods_receipts (
      gr_number, po_id, supplier_id, warehouse_id, receipt_date, notes, created_by
    ) VALUES (
      'GR-202611-0002', NULL, 1, 1, CURRENT_TIMESTAMP - INTERVAL '5 hours', 'Penerimaan amenities kamar hotel Dangau', $1
    ) RETURNING id
  `, [warehouseUserId]);
  const gr2Id = gr2Res.rows[0].id;

  await pool.query(`
    INSERT INTO goods_receipt_items (goods_receipt_id, item_id, quantity, unit_name)
    VALUES ($1, $2, 500, $3)
  `, [gr2Id, itemSandal.id, itemSandal.unitName]);

  // GR 3: Restock Gudang White House
  const gr3Res = await pool.query(`
    INSERT INTO goods_receipts (
      gr_number, po_id, supplier_id, warehouse_id, receipt_date, notes, created_by
    ) VALUES (
      'GR-202611-0003', NULL, 3, 2, CURRENT_TIMESTAMP - INTERVAL '2 hours', 'Penerimaan persediaan gudang White House', $1
    ) RETURNING id
  `, [masterUserId]);
  const gr3Id = gr3Res.rows[0].id;

  await pool.query(`
    INSERT INTO goods_receipt_items (goods_receipt_id, item_id, quantity, unit_name)
    VALUES ($1, $2, 24, $3)
  `, [gr3Id, itemLipton.id, itemLipton.unitName]);

  // D. Goods Issues (Ringkasan OUT Terbaru) - 4 Outlet Resmi
  // GI 1: Pengeluaran ke Warung Dangau
  const gi1Res = await pool.query(`
    INSERT INTO goods_issues (
      gi_number, warehouse_id, requester_name, outlet_name, issue_date, status, notes, created_by
    ) VALUES (
      'GI-202611-0001', 1, 'Chef Rudi', 'Warung Dangau', CURRENT_TIMESTAMP - INTERVAL '18 hours', 'Disetujui', 'Bahan masak buffet sarapan Warung Dangau', $1
    ) RETURNING id
  `, [warehouseUserId]);
  const gi1Id = gi1Res.rows[0].id;

  await pool.query(`
    INSERT INTO goods_issue_items (goods_issue_id, item_id, quantity, unit_name)
    VALUES 
      ($1, $2, 4, $3),
      ($1, $4, 2, $5)
  `, [gi1Id, itemBeras.id, itemBeras.unitName, itemMinyak.id, itemMinyak.unitName]);

  // GI 2: Pengeluaran Amenities ke Hotel Dangau
  const gi2Res = await pool.query(`
    INSERT INTO goods_issues (
      gi_number, warehouse_id, requester_name, outlet_name, issue_date, status, notes, created_by
    ) VALUES (
      'GI-202611-0002', 1, 'Supervisor Linda', 'Hotel Dangau', CURRENT_TIMESTAMP - INTERVAL '4 hours', 'Disetujui', 'Drop sandal dan amenities kamar Hotel Dangau', $1
    ) RETURNING id
  `, [warehouseUserId]);
  const gi2Id = gi2Res.rows[0].id;

  await pool.query(`
    INSERT INTO goods_issue_items (goods_issue_id, item_id, quantity, unit_name)
    VALUES 
      ($1, $2, 80, $3),
      ($1, $4, 2, $5)
  `, [gi2Id, itemSandal.id, itemSandal.unitName, itemSabun.id, itemSabun.unitName]);

  // GI 3: Pengeluaran ke Tanggooe Pizzeria
  const gi3Res = await pool.query(`
    INSERT INTO goods_issues (
      gi_number, warehouse_id, requester_name, outlet_name, issue_date, status, notes, created_by
    ) VALUES (
      'GI-202611-0003', 2, 'Agus Staff', 'Tanggooe Pizzeria', CURRENT_TIMESTAMP - INTERVAL '1 hour', 'Disetujui', 'Kebutuhan minuman resto Tanggooe Pizzeria', $1
    ) RETURNING id
  `, [masterUserId]);
  const gi3Id = gi3Res.rows[0].id;

  await pool.query(`
    INSERT INTO goods_issue_items (goods_issue_id, item_id, quantity, unit_name)
    VALUES ($1, $2, 10, $3)
  `, [gi3Id, itemLipton.id, itemLipton.unitName]);

  // GI 4: Pengeluaran ke Randayan
  const gi4Res = await pool.query(`
    INSERT INTO goods_issues (
      gi_number, warehouse_id, requester_name, outlet_name, issue_date, status, notes, created_by
    ) VALUES (
      'GI-202611-0004', 1, 'Hendra Logistik', 'Randayan', CURRENT_TIMESTAMP - INTERVAL '30 minutes', 'Disetujui', 'Suplai logistik persediaan operasional Randayan', $1
    ) RETURNING id
  `, [warehouseUserId]);
  const gi4Id = gi4Res.rows[0].id;

  await pool.query(`
    INSERT INTO goods_issue_items (goods_issue_id, item_id, quantity, unit_name)
    VALUES ($1, $2, 5, $3)
  `, [gi4Id, itemSabun.id, itemSabun.unitName]);

  console.log('6. Sample transactions created successfully for 4 official outlets.');

  // 7. Verification Summary
  const statsRes = await pool.query(`
    SELECT 
      COUNT(DISTINCT i.id) as total_items,
      SUM(inv.current_stock) as total_physical,
      SUM(inv.current_stock * i.unit_price) as total_valuation,
      COUNT(CASE WHEN inv.current_stock <= i.critical_stock THEN 1 END) as critical_count,
      COUNT(CASE WHEN inv.current_stock <= i.minimum_stock AND inv.current_stock > i.critical_stock THEN 1 END) as low_count
    FROM inventory inv
    JOIN items i ON inv.item_id = i.id
  `);

  const whSummaryRes = await pool.query(`
    SELECT 
      w.warehouse_code,
      w.warehouse_name,
      COUNT(inv.id) as item_count,
      SUM(inv.current_stock) as total_units,
      SUM(inv.current_stock * i.unit_price) as total_value
    FROM warehouses w
    LEFT JOIN inventory inv ON w.id = inv.warehouse_id
    LEFT JOIN items i ON inv.item_id = i.id
    GROUP BY w.id, w.warehouse_code, w.warehouse_name
    ORDER BY w.id ASC
  `);

  console.log('\n================ SEEDING SUMMARY ================');
  console.log('Total Master Items        :', statsRes.rows[0].total_items);
  console.log('Total Physical Units      :', Number(statsRes.rows[0].total_physical).toLocaleString('id-ID'));
  console.log('Total Persediaan Valuation:', 'Rp ' + Number(statsRes.rows[0].total_valuation).toLocaleString('id-ID'));
  console.log('Critical Stock (Habis/Kritis):', statsRes.rows[0].critical_count);
  console.log('Low Stock (Menipis)       :', statsRes.rows[0].low_count);
  console.log('--------------------------------------------------');
  console.log('Warehouses Breakdown:');
  whSummaryRes.rows.forEach(w => {
    console.log(`- ${w.warehouse_code} (${w.warehouse_name}): ${Number(w.total_units).toLocaleString('id-ID')} units | Rp ${Number(w.total_value).toLocaleString('id-ID')}`);
  });
  console.log('==================================================');

  await pool.end();
  console.log('SUCCESS: All actual stock and prices seeded!');
}

seed().catch(err => {
  console.error('Fatal seeding error:', err);
  process.exit(1);
});
