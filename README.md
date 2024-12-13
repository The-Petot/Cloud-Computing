# Auth Service

Selamat datang di proyek **Auth Service**! 🎉 Proyek ini adalah layanan autentikasi yang dibangun dengan teknologi modern untuk memastikan keamanan dan skalabilitas. Proyek ini menggunakan:

- 🌐 **Elysia.js** sebagai framework web.
- 🟦 **TypeScript** untuk pengembangan yang aman dan terstruktur.
- ⚡ **Bun** sebagai runtime JavaScript yang super cepat.
- 🗄️ **Drizzle ORM** untuk pengelolaan database yang efisien.

---

## 🚀 Fitur

- 🔐 Manajemen autentikasi dengan JWT.
- 📄 CRUD pengguna dengan validasi lengkap.
- ⚡ Performa tinggi menggunakan **Bun**.
- 📦 Struktur proyek yang modular dan mudah dipahami.
- 🛠️ Integrasi mulus dengan **Drizzle ORM** untuk akses database.

---

## 🛠️ Instalasi

### 1. Clone Repository
```bash
$ git clone <URL-REPOSITORY>
$ cd auth-service
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

## 🌟 Tips

- Pastikan **Bun** telah terinstal di mesin Anda. Jika belum, instal dengan:
  ```bash
  $ curl -fsSL https://bun.sh/install | bash
  ```

- Sesuaikan konfigurasi database di file `src/database/db.ts` sesuai kebutuhan Anda.
- Gunakan perintah `bun test` untuk menjalankan pengujian.

---
