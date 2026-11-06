# 🍎 Chrome Physics: Simulasi Hukum II Newton & Jatuh Bebas

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-green.svg)

> **Simulasi Fisika Dasar Interaktif Berbasis Web (Chrome Game)**  
> Proyek ini memodelkan fenomena **Apel Jatuh** untuk menguji dan memvisualisasikan **Hukum II Newton** secara *real-time* langsung dari peramban (browser).

---

## 👨‍💻 Nama lmba yan di ikuti

* **Nama Kelompok:** [Nama Kelompok Kamu, contoh: Kelompok 4 - Alpha Physics]
* **Anggota Tim:**
  - **Rafa Arinanda** — *Nim kamu*
  - **[Nama Anggota 2]** — *Nim kamu*
  - **[Nama Anggota 3]** — *Nim kamu*
    **[Nama Anggota 3]** — *Nim kamu*
    **[Nama Anggota 3]** — *Nim kamu*

---

## 📽️ Demo & Video Output

Saksikan demo pengujian simulasi fisik dan fitur-fitur interaktifnya melalui cuplikan video YouTube di bawah ini:

[![Demo Simulasi Apel Jatuh](c:\Users\LENOVO\OneDrive\Pictures\Screenshot\Screenshot 2026-11-06 234741.png)](https://youtu.be/DYCMQ7qsZqM?si=cqA5PRMYwnYb0-pR)

> 💡 **Catatan:** Klik gambar di atas untuk memutar video di YouTube, atau tonton langsung melalui pemutar tersemat (*embedded player*) di bawah ini.

<div align="center">
  <iframe width="100%" height="450" src="https://youtu.be/DYCMQ7qsZqM?si=cqA5PRMYwnYb0-pR" title="Demo Simulasi Fisika Apel Jatuh" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

---

## 🧮 Model Fisika: Hukum II Newton & Gerak Jatuh Bebas

Simulasi ini memodelkan fenomena jatuhnya apel akibat pengaruh gaya gravitasi bumi berdasarkan **Hukum II Newton**.

### 1. Persamaan Utama
Hukum II Newton menyatakan bahwa percepatan sebuah benda berbanding lurus dengan gaya total yang bekerja padanya dan berbanding terbalik dengan massanya:

$$\vec{F}_{\text{total}} = m \cdot \vec{a}$$

Pada kasus apel jatuh bebas tanpa hambatan udara signifikan, gaya tunggal yang bekerja adalah gaya berat ($W$):

$$F_g = m \cdot g$$

Sehingga percepatan apel ($a$) sama dengan percepatan gravitasi ($g$):

$$a = g$$

### 2. Integrasi Numerik Gerak (Canvas Frame Updating)
Setiap *frame* ($\Delta t$), posisi ($y$) dan kecepatan ($v$) apel diperbarui menggunakan kalkulasi berikut:

$$v_{t + \Delta t} = v_t + g \cdot \Delta t$$

$$y_{t + \Delta t} = y_t + v_{t + \Delta t} \cdot \Delta t$$

---

## 🎛️ Detail Kontrol & Fitur Interaktif

Aplikasi ini dilengkapi dengan antarmuka yang memungkinkan pengguna melakukan eksperimen variabel fisika secara langsung:

| Fitur / Pengaturan | Deskripsi & Fungsi Interaktif |
| :--- | :--- |
| 🌙 **Mode Terang / Gelap** | Switch toggle untuk mengubah tema UI (Light/Dark Mode) demi kenyamanan visual. |
| 🍏 **Kustomisasi Objek** | Mengubah parameter apel (massa $m$, ukuran jari-jari $r$, dan warna/skin apel). |
| 🌌 **Variabel Gravitasi ($g$)** | Slider untuk mengubah gravitasi (misal: Bumi = $9.8\text{ m/s}^2$, Bulan = $1.6\text{ m/s}^2$, Jupiter = $24.79\text{ m/s}^2$). |
| ⏯️ **Simulasi Control** | Tombol **Play**, **Pause**, dan **Reset** untuk mengulang posisi awal apel. |
| 📊 **Real-Time Readout** | Menampilkan grafik/teks kecepatan instan ($v$), ketinggian ($h$), dan waktu jatuh ($t$). |

---

## 🚀 Cara Menjalankan Proyek (Quick Start)

Karena proyek ini menggunakan teknologi murni **HTML5, CSS3, dan Vanilla JavaScript**, kamu tidak memerlukan instalasi *server* atau dependensi Node.js.

### Menjalankan di Local Browser
1. **Kloning Repository Ini:**
   ```bash
   git clone [https://github.com/username-kamu/nama-repo-kamu.git](https://github.com/username-kamu/nama-repo-kamu.git)