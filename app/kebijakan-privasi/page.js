// Lokasi file: app/kebijakan-privasi/page.js
// Halaman Kebijakan Privasi: data apa yang dikumpulkan saat memesan,
// untuk apa dipakai, penyimpanan di browser (troli), layanan pihak lain,
// dan cara menghubungi toko. Nomor WhatsApp & email diambil dari Toko & Kontak.

import Link from "next/link";
import { getSupabase } from "../../lib/supabase";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Kebijakan Privasi | Sinar Kasih",
  description:
    "Cara Toko Listrik Sinar Kasih mengumpulkan, menggunakan, dan menjaga data pelanggan.",
};

const TANGGAL_DIPERBARUI = "3 Oktober 2026";
const WHATSAPP_CADANGAN = "6281285750033";

function nomorWa(teks) {
  const angka = String(teks || "").replace(/\D/g, "");
  if (!angka) return WHATSAPP_CADANGAN;
  return angka.startsWith("0") ? "62" + angka.slice(1) : angka;
}

export default async function KebijakanPrivasiPage() {
  let kontak = null;
  const supabase = getSupabase();
  if (supabase) {
    const { data } = await supabase
      .from("kontak_toko")
      .select("whatsapp, email")
      .limit(1)
      .maybeSingle();
    kontak = data;
  }

  const wa = nomorWa(kontak?.whatsapp);
  const email = kontak?.email || "";

  return (
    <section className="section halaman-atas">
      <div className="wrap wrap-baca">
        <nav className="jejak" aria-label="Posisi halaman">
          <Link href="/">Beranda</Link>
          <span>›</span>
          <Link href="/info">Informasi &amp; Layanan</Link>
          <span>›</span>
          <strong>Kebijakan Privasi</strong>
        </nav>

        <div className="kepala-halaman">
          <h1>Kebijakan Privasi</h1>
          <p>
            Halaman ini menjelaskan data apa saja yang kami terima saat Anda
            berbelanja di website Toko Listrik Sinar Kasih, untuk apa data itu
            dipakai, dan bagaimana kami menjaganya.
          </p>
          <span className="kpTanggal">Terakhir diperbarui: {TANGGAL_DIPERBARUI}</span>
        </div>

        <article className="kpIsi">
          <section>
            <h2>Data yang kami terima</h2>
            <p>
              Anda dapat melihat katalog tanpa mendaftar dan tanpa mengisi data
              apa pun. Data baru kami terima ketika Anda mengirim pesanan, yaitu:
            </p>
            <ul>
              <li>nama Anda,</li>
              <li>nomor WhatsApp,</li>
              <li>cabang toko yang Anda pilih,</li>
              <li>catatan pesanan (jika diisi), dan</li>
              <li>daftar produk serta jumlah yang dipesan.</li>
            </ul>
            <p>
              Mohon tidak menuliskan data yang tidak diperlukan, seperti nomor
              KTP atau data rekening, di kolom catatan.
            </p>
          </section>

          <section>
            <h2>Untuk apa data dipakai</h2>
            <p>Data pesanan hanya kami pakai untuk:</p>
            <ul>
              <li>memproses dan menyiapkan pesanan Anda,</li>
              <li>menghubungi Anda untuk konfirmasi ketersediaan, harga, atau pengambilan barang,</li>
              <li>melayani pertanyaan, klaim garansi, atau keluhan terkait pesanan, dan</li>
              <li>pencatatan penjualan toko.</li>
            </ul>
            <p>
              Kami tidak menjual data Anda dan tidak memberikannya kepada pihak
              lain untuk keperluan iklan.
            </p>
          </section>

          <section>
            <h2>Siapa yang dapat melihat data</h2>
            <p>
              Data pesanan hanya dapat dibuka oleh pihak Sinar Kasih yang
              berwenang melalui panel admin yang dilindungi login. Karyawan yang
              tidak mengurus pesanan tidak diberi akses ke data tersebut.
            </p>
          </section>

          <section>
            <h2>Troli dan penyimpanan di perangkat Anda</h2>
            <p>
              Isi Troli disimpan di browser perangkat Anda sendiri, bukan di
              server kami, supaya produk yang sudah Anda pilih tidak hilang
              ketika halaman dibuka ulang. Isi Troli dikosongkan setelah pesanan
              dikirim. Anda juga dapat menghapusnya kapan saja dari halaman
              Troli atau dengan membersihkan data browser.
            </p>
            <p>
              Website ini tidak memakai cookies untuk iklan atau untuk melacak
              kegiatan Anda di website lain.
            </p>
          </section>

          <section>
            <h2>Statistik kunjungan</h2>
            <p>
              Untuk mengetahui produk apa yang paling banyak dicari, kami
              mencatat secara anonim halaman yang dibuka, klik tombol WhatsApp,
              dan dari mana pengunjung datang (misalnya dari Google atau
              Instagram). Untuk membedakan pengunjung, browser Anda diberi kode
              acak yang disimpan di perangkat Anda sendiri.
            </p>
            <p>
              Catatan ini tidak berisi nama, nomor telepon, alamat, atau alamat
              IP Anda, hanya dilihat oleh pengelola toko, dan tidak dibagikan
              kepada pihak lain. Anda dapat menghapus kode acak tersebut dengan
              membersihkan data browser.
            </p>
          </section>

          <section>
            <h2>Layanan pihak lain yang kami gunakan</h2>
            <ul>
              <li>
                <strong>Penyedia server dan database</strong> untuk menjalankan
                website dan menyimpan data pesanan. Koneksi ke website ini
                dilindungi enkripsi (HTTPS).
              </li>
              <li>
                <strong>WhatsApp</strong>, karena ringkasan pesanan dikirim
                melalui aplikasi WhatsApp Anda ke nomor toko. Pesan WhatsApp
                mengikuti kebijakan privasi WhatsApp.
              </li>
              <li>
                <strong>Google Formulir</strong> untuk klaim garansi, survei
                kepuasan, dan keluhan. Data yang Anda isi di formulir tersebut
                dikelola melalui layanan Google.
              </li>
              <li>
                <strong>YouTube</strong> untuk video promosi. Video ditampilkan
                dalam mode privasi YouTube; setelah video diputar, YouTube dapat
                menerapkan kebijakannya sendiri.
              </li>
            </ul>
          </section>

          <section>
            <h2>Berapa lama data disimpan</h2>
            <p>
              Data pesanan kami simpan selama masih diperlukan untuk keperluan
              pesanan, layanan garansi, dan pencatatan toko.
            </p>
          </section>

          <section>
            <h2>Hak Anda</h2>
            <p>
              Anda dapat meminta kami menunjukkan, membetulkan, atau menghapus
              data pesanan Anda. Hubungi kami melalui kontak di bawah dengan
              menyebutkan nama dan nomor WhatsApp yang Anda gunakan saat memesan.
            </p>
          </section>

          <section>
            <h2>Perubahan kebijakan</h2>
            <p>
              Kebijakan ini dapat kami perbarui, misalnya jika ada fitur baru di
              website. Tanggal perubahan terakhir selalu tercantum di bagian atas
              halaman ini.
            </p>
          </section>

          <section className="kpKontak">
            <h2>Hubungi kami</h2>
            <p>Ada pertanyaan tentang data Anda? Silakan hubungi kami.</p>
            <div className="kpTombol">
              <a
                href={`https://wa.me/${wa}`}
                target="_blank"
                rel="noopener noreferrer"
                className="kpWa"
              >
                Chat WhatsApp
              </a>
              {email && (
                <a href={`mailto:${email}`} className="kpEmail">
                  Kirim email
                </a>
              )}
            </div>
          </section>
        </article>
      </div>

      <style>{`
        .wrap-baca { max-width: 880px; }
        .kpTanggal {
          display: inline-block;
          margin-top: 14px;
          font-size: 13.5px;
          color: #9a8571;
        }
        .kpIsi {
          padding: 8px 32px 28px;
          background: #fff;
          border: 1px solid #eadfce;
          border-radius: 18px;
        }
        .kpIsi section {
          padding: 24px 0;
          border-bottom: 1px solid #f0e7db;
        }
        .kpIsi section:last-child {
          border-bottom: 0;
          padding-bottom: 4px;
        }
        .kpIsi h2 {
          margin: 0 0 10px;
          font-size: 19px;
          color: #4f3829;
        }
        .kpIsi p,
        .kpIsi li {
          font-size: 15.5px;
          line-height: 1.75;
          color: #554840;
        }
        .kpIsi p {
          margin: 0 0 10px;
        }
        .kpIsi ul {
          margin: 0 0 10px;
          padding-left: 22px;
        }
        .kpIsi li + li {
          margin-top: 4px;
        }
        .kpIsi strong {
          color: #3f2f24;
        }
        .kpTombol {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 6px;
        }
        .kpWa,
        .kpEmail {
          display: inline-flex;
          align-items: center;
          min-height: 44px;
          padding: 0 18px;
          border-radius: 12px;
          font-size: 14.5px;
          font-weight: 700;
          text-decoration: none;
        }
        .kpWa {
          background: #1f9d55;
          color: #fff;
        }
        .kpWa:hover {
          background: #188146;
        }
        .kpEmail {
          border: 1px solid #d6c1a8;
          background: #fff;
          color: #5c3f2c;
        }
        .kpEmail:hover {
          background: #fcf9f5;
        }
        .kpWa:focus-visible,
        .kpEmail:focus-visible {
          outline: 3px solid #c58a2b;
          outline-offset: 2px;
        }
        @media (max-width: 640px) {
          .kpIsi {
            padding: 4px 18px 20px;
            border-radius: 14px;
          }
          .kpTombol a {
            flex: 1 1 100%;
            justify-content: center;
          }
        }
      `}</style>
    </section>
  );
}
