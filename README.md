# Docs Service

Selamat datang di proyek **Docs Service**! 🎉 Proyek ini adalah layanan dokumentasi API. Teknologi yang digunakan:

- 🌐 **Elysia.js** sebagai framework web.
- 🟦 **TypeScript** untuk pengembangan yang aman dan terstruktur.
- ⚡ **Bun** sebagai runtime JavaScript yang super cepat.
- 📖 **Swagger** untuk mendokumentasikan API secara interaktif.

---

## 🚀 Fitur

- 📄 Dokumentasi API berbasis Swagger yang interaktif.
- 🔥 Performa tinggi dengan runtime **Bun**.
- 🛠️ Struktur proyek modular dan mudah diperluas.
- 🔐 Mendukung endpoint aman dengan validasi dan middleware.

---

## 🛠️ Instalasi

### 1. Clone Repository
```bash
$ git clone <URL-REPOSITORY>
$ cd docs-service
```

### 2. Instal Dependensi
Gunakan **Bun** untuk menginstal semua dependensi:
```bash
$ bun install
```

---

## 🧪 Menjalankan Layanan

### 1. Mode Pengembangan
Untuk menjalankan layanan dalam mode pengembangan, gunakan perintah berikut:
```bash
$ bun run dev
```

### 2. Mode Produksi
Bangun dan jalankan layanan dalam mode produksi:
```bash
$ bun build
$ bun start
```

---

## 📖 Dokumentasi API

Layanan ini menyediakan dokumentasi API berbasis Swagger. Untuk mengaksesnya:

1. Jalankan layanan menggunakan salah satu perintah di atas.
2. Buka browser dan navigasikan ke endpoint `/docs` (contoh: `http://localhost:8080/docs`).

Anda akan melihat antarmuka Swagger yang interaktif untuk mengeksplorasi API.

---

## 🌟 Tips

- Pastikan **Bun** telah terinstal di mesin Anda. Jika belum, instal dengan:
  ```bash
  $ curl -fsSL https://bun.sh/install | bash
  ```

- Sesuaikan konfigurasi Swagger di file `src/docs.ts` sesuai kebutuhan Anda.
- Gunakan perintah `bun test` untuk menjalankan pengujian.

---
