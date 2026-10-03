// Lokasi file: app/cara-pesan/page.js
// Cara Pesan: judul seragam, langkah buka-tutup bernomor (komponen bersama),
// isi langkah disesuaikan dengan alur Detail Produk & Checkout yang baru
// (cabang, catatan, dan data diisi di halaman Checkout).

import Link from "next/link";
import DaftarLipat from "../DaftarLipat";
import IkonSitus from "../IkonSitus";
import AjakanBawah from "../AjakanBawah";

export const metadata = {
  title: "Cara Pesan | Sinar Kasih",
  description:
    "Panduan berbelanja di website Toko Listrik Sinar Kasih: pilih produk, masukkan ke troli, checkout, lalu kirim pesanan lewat WhatsApp.",
};

const LANGKAH = [
  {
    id: "mulai",
    judul: "Mulai Berbelanja",
    ringkas: "Cari produk lewat kategori, brand, atau kolom pencarian.",
    isi: (
      <div>
        <p>
          Untuk mulai berbelanja, buka <strong>Kategori Produk</strong> lalu pilih kategori yang sesuai dengan
          kebutuhan Anda. Jika sudah tahu merk yang dicari, Anda juga bisa memilih berdasarkan{" "}
          <strong>brand</strong>.
        </p>
        <p>Jika sudah mengetahui nama atau jenis produknya, gunakan kolom pencarian.</p>
        <div className="dl-grid tiga">
          <Link href="/kategori" className="dl-kartu cp-tautan">
            <span className="dl-ikon"><IkonSitus nama="kategori" /></span>
            <div>
              <strong>Kategori</strong>
              <p>Lampu, stop kontak, saklar, kabel, dan lainnya.</p>
            </div>
          </Link>
          <Link href="/kategori?tab=brand" className="dl-kartu cp-tautan">
            <span className="dl-ikon"><IkonSitus nama="bintang" /></span>
            <div>
              <strong>Brand</strong>
              <p>Pilih berdasarkan merk yang Anda percaya.</p>
            </div>
          </Link>
          <Link href="/cari" className="dl-kartu cp-tautan">
            <span className="dl-ikon"><IkonSitus nama="label" /></span>
            <div>
              <strong>Cari Produk</strong>
              <p>Ketik nama atau kode produk.</p>
            </div>
          </Link>
        </div>
      </div>
    ),
  },
  {
    id: "pilih",
    judul: "Pilih Produk",
    ringkas: "Buka produk yang ingin Anda ketahui lebih lanjut.",
    isi: (
      <div>
        <p>
          Setelah memilih kategori atau brand, Anda akan melihat daftar produk yang tersedia. Tekan kartu produk
          untuk membuka halaman <strong>Detail Produk</strong>.
        </p>
        <p>
          Kategori yang masih punya beberapa jenis akan menampilkan pilihan jenisnya dulu. Anda juga bisa menekan
          tombol <strong>Lihat semua produk</strong> untuk melihat semuanya sekaligus.
        </p>
      </div>
    ),
  },
  {
    id: "detail",
    judul: "Periksa Detail Produk",
    ringkas: "Lihat foto, harga, deskripsi, dan informasi produk sebelum memesan.",
    isi: (
      <div>
        <p>Di halaman Detail Produk, periksa informasi berikut sebelum memasukkan produk ke troli:</p>
        <div className="dl-grid">
          <div className="dl-kartu">
            <span className="dl-ikon"><IkonSitus nama="foto" /></span>
            <div>
              <strong>Foto Produk</strong>
              <p>Geser atau tekan foto kecil untuk melihat foto lainnya.</p>
            </div>
          </div>
          <div className="dl-kartu">
            <span className="dl-ikon"><IkonSitus nama="label" /></span>
            <div>
              <strong>Nama & Harga</strong>
              <p>Periksa nama produk, harga, dan satuannya.</p>
            </div>
          </div>
          <div className="dl-kartu">
            <span className="dl-ikon"><IkonSitus nama="catatan" /></span>
            <div>
              <strong>Deskripsi</strong>
              <p>Baca informasi mengenai fungsi dan penggunaan produk.</p>
            </div>
          </div>
          <div className="dl-kartu">
            <span className="dl-ikon"><IkonSitus nama="wa" /></span>
            <div>
              <strong>Masih ragu?</strong>
              <p>Tekan Tanya Produk Ini via WhatsApp untuk bertanya langsung ke toko.</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "troli",
    judul: "Tambahkan ke Troli",
    ringkas: "Atur jumlah, lalu tekan Tambah ke Troli.",
    isi: (
      <div>
        <p>
          Atur jumlah yang dibutuhkan dengan tombol <strong>−</strong> dan <strong>+</strong>, lalu tekan{" "}
          <strong>Tambah ke Troli</strong>.
        </p>
        <p>
          Anda tetap berada di halaman produk dan akan muncul pesan bahwa produk sudah masuk troli. Silakan lanjut
          memilih produk lain, lalu buka Troli jika sudah selesai.
        </p>
      </div>
    ),
  },
  {
    id: "cek-troli",
    judul: "Periksa Troli",
    ringkas: "Periksa kembali produk dan jumlahnya sebelum checkout.",
    isi: (
      <div>
        <p>Buka <strong>Troli</strong> untuk melihat semua produk yang akan dipesan, lalu pastikan:</p>
        <ul className="dl-cek">
          <li>Nama produk sudah benar.</li>
          <li>Jumlah produk sudah sesuai.</li>
          <li>Produk yang tidak jadi dipesan sudah dihapus.</li>
        </ul>
        <p className="cp-jarak">Jika sudah sesuai, tekan <strong>Lanjut Checkout</strong>.</p>
      </div>
    ),
  },
  {
    id: "data",
    judul: "Isi Data di Checkout",
    ringkas: "Isi nama dan nomor WhatsApp yang aktif.",
    isi: (
      <div>
        <p>
          Di halaman <strong>Checkout</strong>, isi nama dan <strong>nomor WhatsApp yang aktif</strong>. Toko akan
          menghubungi Anda lewat nomor ini untuk mengonfirmasi pesanan.
        </p>
        <div className="dl-kotak">
          <strong>Penting</strong>
          <span>Pastikan nomor WhatsApp benar dan bisa menerima pesan, supaya konfirmasi dari toko tidak terlewat.</span>
        </div>
      </div>
    ),
  },
  {
    id: "cabang",
    judul: "Pilih Cabang Sinar Kasih",
    ringkas: "Pilih cabang tempat Anda ingin mengambil atau memesan barang.",
    isi: (
      <div>
        <p>
          Masih di halaman Checkout, pilih <strong>cabang Sinar Kasih</strong> dengan menekan kartu cabang yang
          diinginkan. Setiap kartu menampilkan nama dan alamat cabangnya.
        </p>
        <p>
          Pilihan cabang membantu kami menyiapkan pesanan di toko yang tepat. Lihat alamat dan jam buka setiap
          cabang di halaman <Link href="/toko">Toko Kami</Link>.
        </p>
      </div>
    ),
  },
  {
    id: "catatan",
    judul: "Tambahkan Catatan Jika Diperlukan",
    ringkas: "Sampaikan informasi tambahan tentang pesanan (boleh dikosongkan).",
    isi: (
      <div>
        <p>
          Kolom <strong>Catatan</strong> di Checkout bersifat <strong>opsional</strong>. Gunakan jika ada informasi
          yang ingin disampaikan kepada toko.
        </p>
        <div className="dl-kotak">
          <strong>Contoh catatan</strong>
          <span>"Mohon dicek ketersediaan barang terlebih dahulu. Barang akan diambil sore hari."</span>
        </div>
        <p className="cp-jarak">Mohon tidak menulis data pribadi seperti nomor KTP atau nomor rekening di catatan.</p>
      </div>
    ),
  },
  {
    id: "whatsapp",
    judul: "Kirim Pesanan via WhatsApp",
    ringkas: "Tekan tombol kirim, lalu kirim pesan yang muncul di WhatsApp.",
    isi: (
      <div>
        <p>
          Jika semua data sudah benar, tekan tombol hijau <strong>Kirim Pesanan via WhatsApp</strong>. WhatsApp akan
          terbuka dengan pesan pesanan yang sudah tersusun otomatis, kira-kira seperti ini:
        </p>
        <div className="cp-wa">
          <div className="cp-wa-kepala">
            <span className="cp-wa-ikon"><IkonSitus nama="wa" ukuran={16} /></span>
            <strong>Toko Listrik Sinar Kasih</strong>
          </div>
          <div className="cp-wa-gelembung">
            <p>Halo Toko Listrik Sinar Kasih,</p>
            <p>Saya ingin memesan (No. Pesanan ...):</p>
            <p>1. Nama Produk<br />&nbsp;&nbsp;&nbsp;Jumlah: 2<br />&nbsp;&nbsp;&nbsp;Harga: Rp ...</p>
            <p>Nama: ...<br />WhatsApp: ...<br />Cabang: ...</p>
            <p>Mohon konfirmasi ketersediaan dan harga final.</p>
          </div>
        </div>
        <div className="dl-kotak">
          <strong>Jangan lupa</strong>
          <span>
            Tekan tombol <strong>kirim</strong> di WhatsApp. Pesanan baru diproses setelah pesan tersebut terkirim
            ke toko.
          </span>
        </div>
      </div>
    ),
  },
  {
    id: "konfirmasi",
    judul: "Tunggu Konfirmasi dari Toko",
    ringkas: "Toko akan membalas untuk mengonfirmasi stok, harga final, dan pengambilan.",
    isi: (
      <div>
        <p>
          Setelah pesan terkirim, tim Sinar Kasih akan memeriksa pesanan dan ketersediaan produk, lalu membalas
          lewat WhatsApp untuk mengonfirmasi <strong>stok, harga final, dan waktu pengambilan</strong>.
        </p>
        <p>Pesanan dianggap sah setelah dikonfirmasi oleh toko.</p>
      </div>
    ),
  },
];

export default function CaraPesanPage() {
  return (
    <section className="section halaman-atas">
      <div className="wrap wrap-baca">
        <nav className="jejak" aria-label="Posisi halaman">
          <Link href="/">Beranda</Link>
          <span>›</span>
          <Link href="/info">Informasi &amp; Layanan</Link>
          <span>›</span>
          <strong>Cara Pesan</strong>
        </nav>

        <div className="kepala-halaman">
          <h1>Cara Berbelanja di Sinar Kasih</h1>
          <p>
            Ikuti langkah berikut untuk menemukan produk, memasukkannya ke troli, dan mengirim pesanan lewat
            WhatsApp. Tekan setiap langkah untuk melihat penjelasannya.
          </p>
        </div>

        <ol className="cp-ringkas" aria-label="Ringkasan langkah">
          <li><IkonSitus nama="kategori" ukuran={18} /> Pilih produk</li>
          <li><IkonSitus nama="troli" ukuran={18} /> Masukkan ke troli</li>
          <li><IkonSitus nama="catatan" ukuran={18} /> Isi data di Checkout</li>
          <li><IkonSitus nama="wa" ukuran={18} /> Kirim via WhatsApp</li>
        </ol>

        <DaftarLipat items={LANGKAH} />

        <AjakanBawah
          judul="Siap berbelanja?"
          teks="Jelajahi berbagai kategori dan merk produk listrik dan penerangan yang tersedia di Sinar Kasih."
          tombolUtama={{ href: "/kategori", label: "Lihat Produk" }}
          tombolKedua={{ href: "/toko", label: "Lihat Toko" }}
        />
      </div>

      <style>{`
        .wrap-baca { max-width: 880px; }
        .cp-ringkas { list-style: none; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; margin: 0 0 22px; padding: 0; counter-reset: cp; }
        .cp-ringkas li { display: flex; align-items: center; gap: 8px; padding: 12px 14px; border-radius: 12px; background: #fcf6ee; border: 1px solid #f0e2cf; color: #4b3326; font-size: 14px; font-weight: 700; }
        .cp-ringkas svg { flex-shrink: 0; color: #6f4c36; }
        .cp-tautan { color: inherit; text-decoration: none; transition: border-color .15s ease, background .15s ease; }
        .cp-tautan:hover { border-color: #d6c1a8; background: #fff; }
        .cp-jarak { margin-top: 12px !important; }

        .cp-wa { margin-top: 14px; max-width: 420px; border-radius: 14px; overflow: hidden; border: 1px solid #e3ddd2; background: #efeae2; }
        .cp-wa-kepala { display: flex; align-items: center; gap: 8px; padding: 10px 14px; background: #f0f2f5; border-bottom: 1px solid #e3ddd2; font-size: 14px; color: #3f2f24; }
        .cp-wa-ikon { width: 26px; height: 26px; display: grid; place-items: center; border-radius: 50%; background: #25d366; color: #fff; }
        .cp-wa-gelembung { margin: 12px 14px 14px auto; max-width: 88%; padding: 10px 12px; border-radius: 10px 0 10px 10px; background: #d9fdd3; font-size: 13.5px; line-height: 1.5; color: #1f2c24; }
        .cp-wa-gelembung p { margin: 0 0 8px; }
        .cp-wa-gelembung p:last-child { margin: 0; }

        @media (max-width: 760px) {
          .cp-ringkas { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
      `}</style>
    </section>
  );
}
