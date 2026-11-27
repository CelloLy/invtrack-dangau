# Panduan Hosting Online (100% GRATIS & TANPA KARTU KREDIT)
## Sistem Manajemen Persediaan & Pengadaan Barang - Dangau Hotels & Resorts

Bagi mahasiswa atau pengembang yang **tidak memiliki kartu kredit**, Anda tetap bisa meng-online-kan aplikasi ini 24 jam nonstop secara **100% GRATIS** menggunakan kombinasi:
1. **Database PostgreSQL Cloud**: [Supabase](https://supabase.com) (TIDAK MINTA KARTU KREDIT SAMA SEKALI, cukup login GitHub).
2. **Server Aplikasi Web**: [Vercel](https://vercel.com) (TIDAK BUTUH KARTU KREDIT, hanya verifikasi nomor HP via SMS).

---

## Langkah 1: Push Kode ke GitHub Anda

1. Buka [GitHub](https://github.com/) dan buat repository baru bernama `invtrack-dangau`.
2. Di PowerShell / Terminal proyek Anda, jalankan:
   ```bash
   git remote set-url origin https://github.com/<username-anda>/<nama-repo>.git
   git push -u origin main
   ```

---

## Langkah 2: Buat Database Online di Supabase (Tanpa Kartu Kredit)

1. Buka [https://supabase.com](https://supabase.com) dan klik **Start your project**.
2. Login langsung menggunakan akun **GitHub** Anda.
3. Klik tombol **New Project**:
   - **Name**: `invtrack-dangau-db`
   - **Database Password**: Buat password yang aman dan mudah diingat (misal: `DangauKubuRaya2026!`) *(CATAT PASSWORD INI)*.
   - **Region**: Pilih **Singapore (`Southeast Asia`)** agar koneksi dari Indonesia sangat cepat.
   - **Pricing Plan**: Pilih **Free Tier** ($0 - Tidak diminta nomor kartu apa pun).
   - Klik **Create new project** dan tunggu sekitar 1-2 menit hingga status database aktif.
4. **Import Seluruh Data Persediaan**:
   - Di dashboard Supabase, klik ikon **SQL Editor** (ikon dokumen query di menu samping kiri).
   - Klik tombol **New query**.
   - Buka file dump SQL yang sudah saya sediakan di proyek Anda: [server/database/invtrack_dangau_full_dump.sql](file:///d:/Bahan%20Kuliah/S7/NEW/Tugas%20KP%20(USING)/server/database/invtrack_dangau_full_dump.sql).
   - Copy semua isinya (`Ctrl + A`, lalu `Ctrl + C`).
   - Paste ke dalam SQL Editor Supabase, lalu klik tombol **Run** (atau tekan `Ctrl + Enter`).
   - Tunggu hingga muncul tulisan *Success. No rows returned*. Seluruh data barang, akun, role, dan transaksi kini sudah aktif di cloud!
5. **Salin Connection String (URL Database)**:
   - Klik tombol **Connect** di bagian atas dashboard Supabase (atau ke menu **Project Settings** -> **Database**).
   - Pada bagian **Connection string**, pilih tab **URI**.
   - Pilih mode **Transaction** (port 6543) atau **Session** (port 5432).
   - Contoh teks yang disalin:
     ```text
     postgresql://postgres.[project-ref]:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
     ```
   - **Ganti `[YOUR-PASSWORD]`** dengan password database yang Anda buat pada langkah 3 tadi.

---

## Langkah 3: Deploy Aplikasi di Vercel (Tanpa Kartu Kredit)

1. Buka [https://vercel.com](https://vercel.com) dan klik **Sign Up** -> Pilih **Continue with GitHub**.
   *(Jika diminta verifikasi nomor telepon, cukup masukkan nomor HP aktif untuk menerima kode verifikasi SMS/WA gratis).*
2. Di dashboard Vercel, klik tombol **Add New...** -> Pilih **Project**.
3. Cari repository `invtrack-dangau` yang tadi Anda push ke GitHub, lalu klik **Import**.
4. Di bagian **Environment Variables**, tambahkan 3 variabel ini:
   - `DATABASE_URL` = *(Paste teks connection string dari Supabase tadi)*
   - `JWT_SECRET` = `invtrack_dangau_secret_key_2026_kp`
   - `NODE_ENV` = `production`
5. Klik tombol **Deploy**!
   - Vercel akan otomatis menjalankan build frontend Vite dan backend serverless API.
   - Tunggu sekitar 1-2 menit hingga muncul kembang api ucapan selamat dari Vercel!

---

## Langkah 4: Selesai! Web Anda Sudah Online 24 Jam

Vercel akan memberikan link website publik berdomain HTTPS resmi, contohnya:
```text
https://invtrack-dangau.vercel.app
```
- Anda bisa membuka link ini dari **smartphone / HP Anda**, laptop dosen penguji, atau rekan kerja kapan pun.
- Laptop Anda bisa langsung dimatikan, dan aplikasi tetap online 24 jam nonstop!
