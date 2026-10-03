// Lokasi file: app/tentang/page.js
// Tentang Kami: judul seragam, daftar buka-tutup bernomor (komponen bersama),
// ikon garis pengganti emoji, dan kotak ajakan di bagian bawah.

import Link from "next/link";
import DaftarLipat from "../DaftarLipat";
import IkonSitus from "../IkonSitus";
import AjakanBawah from "../AjakanBawah";

export const metadata = {
  title: "Tentang Kami | Sinar Kasih",
  description:
    "Mengenal Toko Listrik Sinar Kasih Ambon, nilai yang kami jaga, dan kebutuhan listrik serta penerangan yang kami sediakan.",
};

const PRODUK = [
  { ikon: "lampu", judul: "Lampu & Penerangan", teks: "Berbagai kebutuhan lampu dan produk penerangan." },
  { ikon: "colokan", judul: "Stop Kontak & Saklar", teks: "Perlengkapan untuk kebutuhan kelistrikan sehari-hari." },
  { ikon: "petir", judul: "Perlengkapan Listrik", teks: "Berbagai perlengkapan pendukung kebutuhan listrik." },
  { ikon: "kabel", judul: "Kabel & Instalasi", teks: "Kebutuhan kabel dan perlengkapan instalasi listrik." },
  { ikon: "rumah", judul: "Kebutuhan Rumah", teks: "Produk pendukung kebutuhan listrik dan penerangan rumah." },
  { ikon: "toko", judul: "Kebutuhan Usaha", teks: "Berbagai kebutuhan listrik dan penerangan untuk usaha." },
];

const ALASAN = [
  { judul: "Mengutamakan Kualitas", teks: "Kami berusaha menjaga kualitas produk sebagai bagian dari kepercayaan pelanggan." },
  { judul: "Pilihan Produk yang Beragam", teks: "Menyediakan berbagai kebutuhan listrik dan penerangan untuk kebutuhan yang berbeda." },
  { judul: "Menjaga Kepercayaan Pelanggan", teks: "Memberikan informasi produk yang jelas dan berusaha memberikan pelayanan yang baik kepada pelanggan." },
];

const BAGIAN = [
  {
    id: "tentang",
    judul: "Tentang Kami",
    ringkas: "Mengenal Sinar Kasih dan tujuan hadirnya website sebagai katalog serta pusat informasi.",
    isi: (
      <div>
        <p>
          <strong>Sinar Kasih</strong> merupakan toko yang menyediakan berbagai kebutuhan listrik, penerangan,
          serta perlengkapan pendukung untuk kebutuhan rumah maupun usaha.
        </p>
        <p>
          Website Sinar Kasih hadir sebagai katalog dan pusat informasi untuk membantu pelanggan mengenal lebih
          dekat produk serta layanan yang tersedia.
        </p>
        <p>
          Kami juga ingin memperkenalkan Sinar Kasih kepada lebih banyak masyarakat di Ambon, sehingga pelanggan
          dapat memperoleh informasi mengenai produk, toko, layanan, dan berbagai informasi lainnya dengan lebih mudah.
        </p>
      </div>
    ),
  },
  {
    id: "kualitas",
    judul: "Kualitas yang Tetap Kami Jaga",
    ringkas: "Kualitas produk merupakan bagian penting dari kepercayaan pelanggan Sinar Kasih.",
    isi: (
      <div>
        <p>
          Bagi Sinar Kasih, <strong>kualitas produk merupakan bagian penting dari kepercayaan pelanggan.</strong>
        </p>
        <p>
          Kami memahami bahwa kondisi saat ini membuat harga menjadi salah satu pertimbangan penting dalam memenuhi
          kebutuhan pelanggan. Namun, kami tetap berusaha menjaga kualitas produk yang kami sediakan.
        </p>
        <p>
          Kami percaya bahwa kebutuhan listrik bukan hanya tentang mendapatkan harga yang murah, tetapi juga tentang
          mendapatkan produk yang memiliki kualitas dan nilai yang baik bagi pelanggan.
        </p>
      </div>
    ),
  },
  {
    id: "produk",
    judul: "Apa yang Kami Sediakan",
    ringkas: "Beragam kebutuhan listrik dan penerangan untuk rumah, usaha, maupun kebutuhan lainnya.",
    isi: (
      <div>
        <div className="dl-grid">
          {PRODUK.map((p) => (
            <div key={p.judul} className="dl-kartu">
              <span className="dl-ikon"><IkonSitus nama={p.ikon} /></span>
              <div>
                <strong>{p.judul}</strong>
                <p>{p.teks}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="tk-lihat">
          <Link href="/kategori">Lihat semua kategori produk →</Link>
        </p>
      </div>
    ),
  },
  {
    id: "komitmen",
    judul: "Komitmen Kami terhadap Kualitas",
    ringkas: "Menjaga kualitas produk, memahami kebutuhan pelanggan, dan membangun kepercayaan.",
    isi: (
      <div>
        <p>
          Sinar Kasih berkomitmen untuk terus memperhatikan kualitas produk yang disediakan agar dapat memberikan
          nilai yang baik bagi pelanggan.
        </p>
        <p>
          Kami juga berusaha memahami kebutuhan pelanggan dan memberikan informasi produk yang jelas sehingga pelanggan
          dapat menentukan pilihan sesuai kebutuhan.
        </p>
        <p>Bagi kami, kepercayaan pelanggan merupakan hal yang penting untuk dijaga dalam jangka panjang.</p>
      </div>
    ),
  },
  {
    id: "kenapa",
    judul: "Kenapa Sinar Kasih",
    ringkas: "Tiga hal yang menjadi bagian dari nilai Sinar Kasih dalam melayani pelanggan.",
    isi: (
      <ol className="dl-langkah">
        {ALASAN.map((a) => (
          <li key={a.judul}>
            <strong>{a.judul}</strong>
            <p>{a.teks}</p>
          </li>
        ))}
      </ol>
    ),
  },
];

export default function TentangPage() {
  return (
    <section className="section halaman-atas">
      <div className="wrap wrap-baca">
        <nav className="jejak" aria-label="Posisi halaman">
          <Link href="/">Beranda</Link>
          <span>›</span>
          <Link href="/info">Informasi &amp; Layanan</Link>
          <span>›</span>
          <strong>Tentang Kami</strong>
        </nav>

        <div className="kepala-halaman">
          <h1>Tentang Sinar Kasih</h1>
          <p>
            Mengenal lebih dekat Sinar Kasih, nilai yang kami jaga, serta berbagai kebutuhan listrik dan penerangan
            yang kami sediakan.
          </p>
        </div>

        <DaftarLipat items={BAGIAN} awalTerbuka="tentang" />

        <AjakanBawah
          judul="Solusi Kebutuhan Listrik & Penerangan"
          teks="Temukan berbagai produk dan informasi yang Anda butuhkan melalui website Sinar Kasih."
          tombolUtama={{ href: "/kategori", label: "Lihat Produk" }}
          tombolKedua={{ href: "/toko", label: "Lokasi Toko" }}
        />
      </div>

      <style>{`
        .wrap-baca { max-width: 880px; }
        .tk-lihat { margin: 14px 0 0 !important; }
        .tk-lihat a { color: #6f4c36; font-weight: 700; text-decoration: none; }
        .tk-lihat a:hover { text-decoration: underline; }
      `}</style>
    </section>
  );
}
