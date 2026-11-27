# Panduan Lengkap Hosting Online (24 Jam Nonstop Tanpa Laptop Hidup)
## Sistem Manajemen Persediaan & Pengadaan Barang - Dangau Hotels & Resorts

Aplikasi ini dirancang sebagai sistem fullstack (Frontend React + Backend Node.js Express + Database PostgreSQL) yang sudah terintegrasi rapi. Seluruh aplikasi dan datanya dapat di-hosting secara **GRATIS** dan online 24 jam menggunakan layanan cloud modern:
- **Database Cloud**: [Neon Tech](https://neon.tech) (PostgreSQL Cloud Gratis di Region Singapore).
- **Server Aplikasi**: [Render](https://render.com) (Server Fullstack Gratis dengan domain HTTPS otomatis).

---

## Langkah 1: Upload Kode ke Akun GitHub Anda

1. Buka [GitHub](https://github.com/) dan buat repository baru (contoh nama: `invtrack-dangau`), pilih **Public** atau **Private**.
2. Di laptop Anda, buka terminal / PowerShell di folder proyek ini dan jalankan perintah berikut (ganti `<username-anda>` dan `<nama-repo>` sesuai akun GitHub Anda):

```bash
git remote set-url origin https://github.com/<username-anda>/<nama-repo>.git
git push -u origin main
```

*(Jika diminta login oleh GitHub, silakan selesaikan otentikasi browser atau gunakan Personal Access Token).*

---

## Langkah 2: Buat Database Online Gratis di Neon.tech (2 Menit)

1. Buka situs [https://neon.tech](https://neon.tech) dan klik **Sign Up** (bisa langsung login dengan akun GitHub atau Google).
2. Buat project baru:
   - **Project Name**: `invtrack-dangau-db`
   - **Region**: Pilih **Singapore (`ap-southeast-1`)** agar koneksi dari Indonesia sangat cepat dan minim jeda.
   - Klik **Create Project**.
3. Import seluruh data database yang sudah diekspor:
   - Di dashboard Neon, klik menu **SQL Editor** di sisi kiri.
   - Buka file [server/database/invtrack_dangau_full_dump.sql](file:///d:/Bahan%20Kuliah/S7/NEW/Tugas%20KP%20(USING)/server/database/invtrack_dangau_full_dump.sql) di text editor / VS Code.
   - **Copy seluruh isinya** (Ctrl + A, Ctrl + C), lalu **Paste** ke kolom SQL Editor Neon.
   - Klik tombol **Run** (atau Ctrl + Enter).
   - Tunggu beberapa detik sampai muncul notifikasi sukses (*Query completed*). Seluruh tabel, role, user, barang, dan transaksi kini sudah tersimpan di cloud!
4. Salin URL Koneksi Database:
   - Kembali ke halaman **Dashboard** di Neon.
   - Pada bagian **Connection Details**, pilih **Connection string** (pastikan mode *Pooled connection* atau *Direct connection*).
   - Copy teks koneksinya yang berformat seperti:
     ```text
     postgresql://alex_owner:abc123xyz@ep-cool-snowflake-123456.ap-southeast-1.neon.tech/neondb?sslmode=require
     ```
   - Simpan teks URL ini untuk dimasukkan ke Render di Langkah 3.

---

## Langkah 3: Deploy Aplikasi di Render.com (Gratis)

1. Buka situs [https://render.com](https://render.com) dan login menggunakan akun GitHub Anda.
2. Di dashboard Render, klik tombol **New +** di pojok kanan atas, lalu pilih **Web Service**.
3. Pilih opsi **Build and deploy from a Git repository**, lalu klik **Next**.
4. Cari dan pilih repository `invtrack-dangau` yang sudah Anda upload di Langkah 1 (klik **Connect**).
5. Isi formulir konfigurasi berikut:
   - **Name**: `invtrack-dangau` *(nama ini akan jadi subdomain Anda, misal: `invtrack-dangau.onrender.com`)*
   - **Region**: **Singapore (Southeast Asia)**
   - **Branch**: `main`
   - **Root Directory**: *(biarkan kosong)*
   - **Runtime**: `Node`
   - **Build Command**: 
     ```bash
     npm run build
     ```
   - **Start Command**: 
     ```bash
     npm start
     ```
   - **Instance Type**: Pilih **Free** ($0 / month).
6. Gulir ke bawah ke bagian **Environment Variables** (Variabel Lingkungan), lalu klik **Add Environment Variable** untuk menambahkan 3 kunci ini:

| Key | Value | Keterangan |
| :--- | :--- | :--- |
| `DATABASE_URL` | *(Paste URL koneksi dari Neon di Langkah 2)* | Menghubungkan ke PostgreSQL Cloud |
| `JWT_SECRET` | `invtrack_dangau_secret_key_2026_kp` | Kunci keamanan autentikasi login |
| `NODE_ENV` | `production` | Mengaktifkan optimasi mode produksi |

7. Klik tombol **Deploy Web Service** di bagian paling bawah.

---

## Langkah 4: Selesai & Aplikasi Siap Dipakai di HP / Laptop Mana Pun!

1. Render akan otomatis menjalankan proses instalasi, mem-build frontend Vite, dan menjalankan server. Proses ini biasanya membutuhkan waktu sekitar 2–3 menit.
2. Setelah status berubah menjadi **Live** dengan centang hijau, Render akan memberikan link URL permanen Anda di bagian atas, contoh:
   ```text
   https://invtrack-dangau.onrender.com
   ```
3. **Bisa Langsung Dibuka di HP Siapa Saja**:
   - Buka link tersebut di browser ponsel (Chrome, Safari, dsb.) atau laptop mana pun tanpa perlu laptop ini menyala!
   - Semua akun pengguna yang ada di database lokal Anda (Admin Gudang, Accounting, Purchasing, Manager, dan Master) dapat langsung login dengan kredensial yang sama.
   - Tampilan sudah responsif dengan menu drawer di HP dan tabel yang dapat digeser.

---

> [!TIP]
> **Catatan Layanan Gratis Render**:
> Pada paket Free, jika web tidak dibuka selama 15 menit, server akan masuk mode *sleep* untuk menghemat daya. Saat dibuka kembali pertama kali, dibutuhkan jeda sekitar 30 detik untuk *wake up*, setelah itu akan langsung berjalan cepat dan normal kembali. Jika ingin aktif 100% instan tanpa jeda, Anda bisa menggunakan platform seperti **Railway.app** atau menyewa VPS murah Indonesia (seperti IDCloudHost / DomaiNesia mulai dari Rp 30.000 - Rp 50.000 / bulan).
