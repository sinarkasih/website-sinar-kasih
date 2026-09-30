"use client";

import Link from "next/link";
import { useState } from "react";

export default function CaraPesanPage() {
  const [openSection, setOpenSection] = useState(null);

  function toggleSection(section) {
    setOpenSection((current) =>
      current === section ? null : section
    );
  }

  const sections = [
    {
      id: "mulai",
      number: "01",
      title: "Mulai Berbelanja",
      summary:
        "Pilih produk berdasarkan kategori atau merk/brand yang Anda cari.",
      content: (
        <div className="accordionContent">
          <p>
            Untuk mulai berbelanja, Anda dapat membuka{" "}
            <strong>Kategori Produk</strong> dan memilih kategori
            yang sesuai dengan kebutuhan Anda.
          </p>

          <p>
            Selain berdasarkan kategori, pelanggan juga dapat memilih
            produk berdasarkan <strong>merk atau brand</strong> yang
            tersedia di katalog Sinar Kasih.
          </p>

          <p>
            Cara ini memudahkan pelanggan yang sudah mengetahui merk
            produk yang ingin dicari, tanpa harus melihat seluruh
            kategori terlebih dahulu.
          </p>

          <p>
            Anda juga dapat menggunakan fitur pencarian apabila sudah
            mengetahui nama atau jenis produk yang ingin dicari.
          </p>

          <div className="choiceGrid">
            <div className="choiceCard">
              <div className="choiceIcon">▦</div>

              <div>
                <strong>Berdasarkan Kategori</strong>

                <p>
                  Pilih jenis kebutuhan seperti lampu, stop kontak,
                  saklar, kabel, fitting, dan berbagai perlengkapan
                  listrik lainnya.
                </p>
              </div>
            </div>

            <div className="choiceCard">
              <div className="choiceIcon">★</div>

              <div>
                <strong>Berdasarkan Merk / Brand</strong>

                <p>
                  Pilih produk berdasarkan merk atau brand yang ingin
                  Anda cari dan lihat produk yang tersedia dari merk
                  tersebut.
                </p>
              </div>
            </div>
          </div>

          <div className="infoBox">
            <strong>Tips:</strong>

            <span>
              Jika sudah mengetahui merk yang diinginkan, Anda dapat
              langsung memilih berdasarkan merk/brand. Jika belum,
              Anda dapat mulai dari kategori produk.
            </span>
          </div>
        </div>
      ),
    },

    {
      id: "pilih",
      number: "02",
      title: "Pilih Produk",
      summary:
        "Pilih produk yang ingin Anda lihat dari daftar kategori, merk/brand, atau hasil pencarian.",
      content: (
        <div className="accordionContent">
          <p>
            Setelah memilih berdasarkan{" "}
            <strong>kategori atau merk/brand</strong>, Anda akan
            melihat daftar produk yang tersedia.
          </p>

          <p>
            Pilih produk yang ingin Anda ketahui lebih lanjut dengan
            menekan kartu atau nama produk.
          </p>

          <p>
            Anda akan diarahkan ke halaman{" "}
            <strong>Detail Produk</strong>.
          </p>

          <div className="stepList">
            <div className="miniStep">
              <span>1</span>

              <div>
                <strong>Pilih kategori atau merk</strong>

                <p>
                  Tentukan apakah ingin mencari berdasarkan jenis
                  produk atau merk/brand yang diinginkan.
                </p>
              </div>
            </div>

            <div className="miniStep">
              <span>2</span>

              <div>
                <strong>Pilih produk</strong>

                <p>
                  Pilih produk yang ingin Anda lihat.
                </p>
              </div>
            </div>

            <div className="miniStep">
              <span>3</span>

              <div>
                <strong>Buka detail</strong>

                <p>
                  Periksa informasi produk sebelum memasukkannya ke
                  dalam troli.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },

    {
      id: "detail",
      number: "03",
      title: "Periksa Detail Produk",
      summary:
        "Periksa nama, harga, gambar, deskripsi, variasi, dan informasi produk sebelum membeli.",
      content: (
        <div className="accordionContent">
          <p>
            Pada halaman detail produk, periksa informasi produk dengan
            teliti sebelum memasukkannya ke dalam troli.
          </p>

          <p>
            Informasi yang dapat diperiksa antara lain:
          </p>

          <div className="detailGrid">
            <div className="detailItem">
              <span className="detailIcon">📷</span>

              <div>
                <strong>Gambar Produk</strong>

                <p>
                  Lihat tampilan produk dan kemasan yang tersedia.
                </p>
              </div>
            </div>

            <div className="detailItem">
              <span className="detailIcon">🏷️</span>

              <div>
                <strong>Nama & Harga</strong>

                <p>
                  Periksa nama produk dan harga yang ditampilkan.
                </p>
              </div>
            </div>

            <div className="detailItem">
              <span className="detailIcon">📝</span>

              <div>
                <strong>Deskripsi</strong>

                <p>
                  Baca informasi mengenai fungsi dan penggunaan produk.
                </p>
              </div>
            </div>

            <div className="detailItem">
              <span className="detailIcon">🎨</span>

              <div>
                <strong>Variasi Produk</strong>

                <p>
                  Jika tersedia, pilih variasi yang sesuai dengan
                  kebutuhan Anda.
                </p>
              </div>
            </div>
          </div>

          <div className="infoBox">
            <strong>Penting:</strong>

            <span>
              Pastikan produk dan variasi yang dipilih sudah sesuai
              sebelum menambahkannya ke Troli Belanja.
            </span>
          </div>
        </div>
      ),
    },

    {
      id: "troli",
      number: "04",
      title: "Tambahkan ke Troli",
      summary:
        "Tentukan jumlah produk yang dibutuhkan lalu masukkan ke Troli Belanja.",
      content: (
        <div className="accordionContent">
          <p>
            Jika produk sudah sesuai, tentukan jumlah yang ingin
            dipesan.
          </p>

          <p>
            Kemudian tekan tombol{" "}
            <strong>Tambah ke Troli</strong>.
          </p>

          <p>
            Produk akan masuk ke halaman{" "}
            <strong>Troli Belanja</strong>.
          </p>

          <p>
            Anda dapat menambahkan beberapa produk berbeda sebelum
            melanjutkan ke tahap pemesanan.
          </p>

          <div className="flowBox">
            <div className="flowItem">
              <span>−</span>
              <strong>Kurangi jumlah</strong>
            </div>

            <div className="flowItem">
              <span>1</span>
              <strong>Jumlah produk</strong>
            </div>

            <div className="flowItem">
              <span>+</span>
              <strong>Tambah jumlah</strong>
            </div>
          </div>

          <div className="infoBox">
            <strong>Tips:</strong>

            <span>
              Sebelum checkout, periksa kembali semua produk dan jumlah
              barang yang ada di Troli Belanja.
            </span>
          </div>
        </div>
      ),
    },

    {
      id: "cek-troli",
      number: "05",
      title: "Periksa Troli Belanja",
      summary:
        "Periksa kembali produk, jumlah, harga, dan total pesanan sebelum checkout.",
      content: (
        <div className="accordionContent">
          <p>
            Setelah selesai memilih produk, buka{" "}
            <strong>Troli Belanja</strong>.
          </p>

          <p>
            Di halaman ini Anda dapat melihat seluruh produk yang akan
            dipesan beserta jumlah dan subtotalnya.
          </p>

          <div className="checkList">
            <div>
              <span>✓</span>
              <p>Pastikan nama produk sudah benar.</p>
            </div>

            <div>
              <span>✓</span>
              <p>Pastikan jumlah produk sudah sesuai.</p>
            </div>

            <div>
              <span>✓</span>
              <p>Periksa harga dan subtotal setiap produk.</p>
            </div>

            <div>
              <span>✓</span>
              <p>Periksa total keseluruhan pesanan.</p>
            </div>

            <div>
              <span>✓</span>
              <p>Hapus produk jika ternyata tidak jadi dipesan.</p>
            </div>
          </div>
        </div>
      ),
    },

    {
      id: "cabang",
      number: "06",
      title: "Pilih Cabang Sinar Kasih",
      summary:
        "Pilih cabang toko yang menjadi pilihan Anda untuk pesanan.",
      content: (
        <div className="accordionContent">
          <p>
            Setelah memeriksa isi Troli, pilih{" "}
            <strong>cabang Sinar Kasih</strong> yang menjadi pilihan
            Anda.
          </p>

          <p>
            Pilihan cabang membantu kami mengetahui toko yang Anda
            pilih untuk pesanan tersebut.
          </p>

          <div className="branchInfo">
            <div className="branchIcon">
              🏪
            </div>

            <div>
              <strong>Pilih Cabang</strong>

              <p>
                Pilih salah satu cabang yang tersedia pada halaman
                Troli Belanja.
              </p>
            </div>
          </div>

          <div className="infoBox">
            <strong>Perhatikan:</strong>

            <span>
              Pastikan cabang yang dipilih sudah sesuai sebelum
              melanjutkan pemesanan melalui WhatsApp.
            </span>
          </div>
        </div>
      ),
    },

    {
      id: "catatan",
      number: "07",
      title: "Tambahkan Catatan Jika Diperlukan",
      summary:
        "Berikan informasi tambahan mengenai pesanan Anda jika diperlukan.",
      content: (
        <div className="accordionContent">
          <p>
            Pada Troli Belanja terdapat bagian{" "}
            <strong>Catatan</strong> yang dapat digunakan untuk
            memberikan informasi tambahan mengenai pesanan.
          </p>

          <p>
            Catatan ini bersifat <strong>opsional</strong>.
          </p>

          <p>
            Anda dapat menggunakannya apabila ada informasi tertentu
            yang ingin disampaikan kepada Sinar Kasih.
          </p>

          <div className="exampleBox">
            <span className="exampleLabel">
              CONTOH CATATAN
            </span>

            <p>
              “Mohon dicek ketersediaan barang terlebih dahulu.”
            </p>
          </div>
        </div>
      ),
    },

    {
      id: "whatsapp",
      number: "08",
      title: "Pesan Melalui WhatsApp",
      summary:
        "Kirim detail pesanan melalui WhatsApp untuk melanjutkan proses pemesanan.",
      content: (
        <div className="accordionContent">
          <p>
            Jika semua informasi sudah benar, tekan tombol{" "}
            <strong>Pesan via WhatsApp</strong>.
          </p>

          <p>
            Sistem akan menyiapkan pesan berisi detail pesanan Anda.
          </p>

          <p>
            Informasi yang dapat ikut disampaikan antara lain:
          </p>

          <div className="messagePreview">
            <div className="messageHeader">
              <span className="whatsappDot">
                ●
              </span>

              <strong>
                Pesan Pesanan Sinar Kasih
              </strong>
            </div>

            <div className="messageBody">
              <p>
                Halo, saya ingin memesan produk berikut:
              </p>

              <p>
                1. Nama Produk
                <br />
                &nbsp;&nbsp;Jumlah × Harga
              </p>

              <p>
                2. Nama Produk
                <br />
                &nbsp;&nbsp;Jumlah × Harga
              </p>

              <p>
                <strong>Total Pesanan</strong>
              </p>

              <p>
                Cabang: Cabang pilihan pelanggan
              </p>
            </div>
          </div>

          <div className="infoBox">
            <strong>Sebelum mengirim:</strong>

            <span>
              Periksa kembali detail pesanan yang tampil di WhatsApp
              sebelum mengirim pesan kepada Sinar Kasih.
            </span>
          </div>
        </div>
      ),
    },

    {
      id: "konfirmasi",
      number: "09",
      title: "Konfirmasi Pesanan",
      summary:
        "Setelah pesan WhatsApp dikirim, tunggu konfirmasi dari Sinar Kasih.",
      content: (
        <div className="accordionContent">
          <p>
            Setelah Anda mengirim detail pesanan melalui WhatsApp,
            komunikasi pemesanan dilanjutkan bersama Sinar Kasih.
          </p>

          <p>
            Tim Sinar Kasih dapat melakukan pengecekan terhadap detail
            pesanan dan ketersediaan produk.
          </p>

          <p>
            Karena itu,{" "}
            <strong>
              pesanan dianggap perlu dikonfirmasi terlebih dahulu
            </strong>{" "}
            sebelum proses selanjutnya dilakukan.
          </p>

          <div className="noticeBox">
            <span className="noticeIcon">
              ℹ️
            </span>

            <div>
              <strong>Periksa WhatsApp Anda</strong>

              <p>
                Pastikan nomor WhatsApp yang digunakan dapat menerima
                balasan dari Sinar Kasih.
              </p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <>
      <main className="caraPesanPage">
        <section className="hero">
          <div className="heroInner">
            <div className="heroLabel">
              CARA PESAN
            </div>

            <h1>
              Cara Berbelanja
              <br />
              di Sinar Kasih
            </h1>

            <p>
              Ikuti panduan berikut untuk menemukan produk, memilih
              kebutuhan, memasukkannya ke Troli, dan melanjutkan
              pemesanan melalui WhatsApp.
            </p>
          </div>
        </section>

        <section className="informationSection">
          <div className="sectionHeader">
            <span className="sectionEyebrow">
              PANDUAN PEMESANAN
            </span>

            <h2>
              Bagaimana Cara Berbelanja?
            </h2>

            <p>
              Pilih langkah di bawah untuk melihat penjelasan lengkap.
            </p>
          </div>

          <div className="accordionList">
            {sections.map((section) => {
              const isOpen = openSection === section.id;

              return (
                <div
                  className={`accordionItem ${
                    isOpen ? "isOpen" : ""
                  }`}
                  key={section.id}
                >
                  <button
                    type="button"
                    className="accordionButton"
                    onClick={() => toggleSection(section.id)}
                    aria-expanded={isOpen}
                    aria-controls={`content-${section.id}`}
                  >
                    <div className="accordionTitleArea">
                      <span className="accordionNumber">
                        {section.number}
                      </span>

                      <div className="accordionText">
                        <h3>{section.title}</h3>

                        {!isOpen && (
                          <p className="accordionSummary">
                            {section.summary}
                          </p>
                        )}
                      </div>
                    </div>

                    <span className="accordionIcon">
                      {isOpen ? "⌃" : "⌄"}
                    </span>
                  </button>

                  {isOpen && (
                    <div
                      id={`content-${section.id}`}
                      className="accordionPanel"
                    >
                      {section.content}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className="quickSection">
          <div className="quickCard">
            <span className="quickEyebrow">
              SIAP BERBELANJA?
            </span>

            <h2>
              Temukan Produk yang Anda Butuhkan
            </h2>

            <p>
              Jelajahi berbagai kategori dan merk produk listrik dan
              penerangan yang tersedia di Sinar Kasih.
            </p>

            <div className="quickActions">
              <Link
                href="/kategori"
                className="primaryButton"
              >
                Lihat Produk
              </Link>

              <Link
                href="/toko"
                className="secondaryButton"
              >
                Lihat Toko
              </Link>
            </div>
          </div>
        </section>
      </main>

      <style>{`
        .caraPesanPage {
          min-height: 100vh;
          background: #f8f6f2;
          color: #30251f;
        }

        .hero {
          padding: 78px 20px 70px;
          background:
            radial-gradient(
              circle at top right,
              rgba(173, 126, 77, 0.12),
              transparent 34%
            ),
            linear-gradient(
              180deg,
              #fffdf9 0%,
              #f8f6f2 100%
            );
        }

        .heroInner {
          width: 100%;
          max-width: 900px;
          margin: 0 auto;
          text-align: center;
        }

        .heroLabel,
        .sectionEyebrow,
        .quickEyebrow {
          display: inline-block;
          margin-bottom: 18px;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 2px;
          color: #9a6b3f;
        }

        .hero h1 {
          width: 100%;
          margin: 0 auto;
          padding: 0;
          text-align: center;
          font-size: clamp(40px, 6vw, 68px);
          line-height: 1.08;
          letter-spacing: -2px;
          color: #5c3f2c;
        }

        .hero p {
          max-width: 720px;
          margin: 26px auto 0;
          font-size: 17px;
          line-height: 1.8;
          color: #6f6259;
        }

        .informationSection {
          width: min(980px, calc(100% - 40px));
          margin: 0 auto;
          padding: 20px 0 80px;
        }

        .sectionHeader {
          text-align: center;
          margin-bottom: 32px;
        }

        .sectionHeader h2 {
          margin: 0;
          font-size: clamp(28px, 4vw, 40px);
          line-height: 1.2;
          color: #4f3829;
        }

        .sectionHeader p {
          margin: 12px auto 0;
          color: #786b62;
          line-height: 1.7;
        }

        .accordionList {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .accordionItem {
          overflow: hidden;
          border: 1px solid #e8ded3;
          border-radius: 18px;
          background: rgba(255, 253, 249, 0.96);
          box-shadow: 0 8px 28px rgba(73, 49, 32, 0.055);
          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease;
        }

        .accordionItem.isOpen {
          border-color: #d7b997;
          box-shadow: 0 12px 34px rgba(73, 49, 32, 0.09);
        }

        .accordionButton {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 23px 24px;
          border: 0;
          background: transparent;
          color: inherit;
          text-align: left;
          cursor: pointer;
        }

        .accordionButton:hover {
          background: rgba(246, 238, 228, 0.5);
        }

        .accordionTitleArea {
          min-width: 0;
          display: flex;
          align-items: flex-start;
          gap: 17px;
        }

        .accordionNumber {
          flex: 0 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: #f1e5d8;
          color: #8b6039;
          font-size: 13px;
          font-weight: 800;
        }

        .accordionText {
          min-width: 0;
        }

        .accordionTitleArea h3 {
          margin: 2px 0 0;
          font-size: 19px;
          line-height: 1.4;
          color: #513b2d;
        }

        .accordionSummary {
          margin: 6px 0 0;
          max-width: 720px;
          font-size: 14px;
          line-height: 1.65;
          color: #7a6c62;
        }

        .accordionIcon {
          flex: 0 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: #f2e8dd;
          color: #765137;
          font-size: 20px;
          font-weight: 700;
          line-height: 1;
        }

        .accordionPanel {
          padding: 0 24px 27px 83px;
        }

        .accordionContent {
          max-width: 790px;
          color: #655950;
        }

        .accordionContent > p {
          margin: 0 0 15px;
          font-size: 15px;
          line-height: 1.85;
        }

        .accordionContent > p:last-child {
          margin-bottom: 0;
        }

        .infoBox {
          display: flex;
          gap: 10px;
          margin-top: 22px;
          padding: 15px 17px;
          border: 1px solid #eadbc9;
          border-radius: 13px;
          background: #fff8ef;
          color: #6c5949;
          line-height: 1.65;
          font-size: 14px;
        }

        .infoBox strong {
          flex: 0 0 auto;
          color: #805936;
        }

        .choiceGrid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
          margin-top: 22px;
        }

        .choiceCard {
          display: flex;
          align-items: flex-start;
          gap: 13px;
          padding: 17px;
          border: 1px solid #ece2d8;
          border-radius: 14px;
          background: #fffaf5;
        }

        .choiceIcon {
          flex: 0 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 11px;
          background: #f0e3d4;
          color: #805936;
          font-size: 20px;
          font-weight: 800;
        }

        .choiceCard strong {
          display: block;
          margin-bottom: 5px;
          color: #503a2d;
          font-size: 14px;
        }

        .choiceCard p {
          margin: 0;
          color: #786b62;
          font-size: 13px;
          line-height: 1.65;
        }

        .stepList {
          display: grid;
          gap: 11px;
          margin-top: 22px;
        }

        .miniStep {
          display: flex;
          align-items: flex-start;
          gap: 13px;
          padding: 15px;
          border: 1px solid #ece2d8;
          border-radius: 14px;
          background: #fffaf5;
        }

        .miniStep > span {
          flex: 0 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: #eadbc9;
          color: #795335;
          font-size: 13px;
          font-weight: 800;
        }

        .miniStep strong {
          display: block;
          margin-bottom: 4px;
          color: #503a2d;
          font-size: 14px;
        }

        .miniStep p {
          margin: 0;
          color: #786b62;
          font-size: 13px;
          line-height: 1.6;
        }

        .detailGrid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
          margin-top: 20px;
        }

        .detailItem {
          display: flex;
          align-items: flex-start;
          gap: 13px;
          padding: 16px;
          border: 1px solid #ece2d8;
          border-radius: 14px;
          background: #fffaf5;
        }

        .detailIcon {
          flex: 0 0 auto;
          font-size: 22px;
          line-height: 1.2;
        }

        .detailItem strong {
          display: block;
          margin-bottom: 4px;
          color: #503a2d;
          font-size: 14px;
        }

        .detailItem p {
          margin: 0;
          color: #786b62;
          font-size: 13px;
          line-height: 1.6;
        }

        .flowBox {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 22px;
        }

        .flowItem {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 11px 14px;
          border: 1px solid #e9ddd1;
          border-radius: 12px;
          background: #fffaf5;
        }

        .flowItem span {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 8px;
          background: #f0e3d4;
          color: #704d32;
          font-weight: 800;
        }

        .flowItem strong {
          color: #5b4435;
          font-size: 13px;
        }

        .checkList {
          display: grid;
          gap: 10px;
          margin-top: 20px;
        }

        .checkList > div {
          display: flex;
          align-items: flex-start;
          gap: 11px;
          padding: 12px 14px;
          border-radius: 12px;
          background: #fffaf5;
          border: 1px solid #ece2d8;
        }

        .checkList span {
          flex: 0 0 auto;
          color: #6c8a58;
          font-weight: 900;
        }

        .checkList p {
          margin: 0;
          color: #675a51;
          font-size: 14px;
          line-height: 1.6;
        }

        .branchInfo {
          display: flex;
          align-items: flex-start;
          gap: 15px;
          margin-top: 20px;
          padding: 18px;
          border-radius: 15px;
          background: #fffaf5;
          border: 1px solid #ece2d8;
        }

        .branchIcon {
          flex: 0 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 45px;
          height: 45px;
          border-radius: 12px;
          background: #f0e3d4;
          font-size: 22px;
        }

        .branchInfo strong {
          display: block;
          margin-bottom: 5px;
          color: #503a2d;
          font-size: 15px;
        }

        .branchInfo p {
          margin: 0;
          color: #786b62;
          font-size: 13px;
          line-height: 1.65;
        }

        .exampleBox {
          margin-top: 20px;
          padding: 18px;
          border-left: 4px solid #b18458;
          border-radius: 0 13px 13px 0;
          background: #fff8ef;
        }

        .exampleLabel {
          display: block;
          margin-bottom: 8px;
          color: #9a6b3f;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.5px;
        }

        .exampleBox p {
          margin: 0;
          color: #66564b;
          font-size: 14px;
          line-height: 1.7;
        }

        .messagePreview {
          overflow: hidden;
          margin-top: 20px;
          border: 1px solid #d9e4d8;
          border-radius: 16px;
          background: #f3faf1;
        }

        .messageHeader {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 13px 16px;
          background: #557a4e;
          color: #fff;
          font-size: 14px;
        }

        .whatsappDot {
          color: #cde8c8;
          font-size: 11px;
        }

        .messageBody {
          padding: 18px;
          color: #4e5c4b;
        }

        .messageBody p {
          margin: 0 0 13px;
          font-size: 14px;
          line-height: 1.7;
        }

        .messageBody p:last-child {
          margin-bottom: 0;
        }

        .noticeBox {
          display: flex;
          align-items: flex-start;
          gap: 13px;
          margin-top: 20px;
          padding: 17px;
          border-radius: 14px;
          background: #f5f0e9;
          border: 1px solid #e6dacc;
        }

        .noticeIcon {
          flex: 0 0 auto;
          font-size: 20px;
        }

        .noticeBox strong {
          display: block;
          margin-bottom: 4px;
          color: #503a2d;
          font-size: 14px;
        }

        .noticeBox p {
          margin: 0;
          color: #786b62;
          font-size: 13px;
          line-height: 1.6;
        }

        .quickSection {
          width: min(980px, calc(100% - 40px));
          margin: 0 auto;
          padding: 0 0 80px;
        }

        .quickCard {
          padding: 48px 32px;
          border-radius: 24px;
          text-align: center;
          background:
            radial-gradient(
              circle at top right,
              rgba(255, 255, 255, 0.12),
              transparent 35%
            ),
            linear-gradient(
              135deg,
              #6c4b35 0%,
              #4d3628 100%
            );
          color: #fff;
          box-shadow: 0 16px 45px rgba(58, 39, 27, 0.16);
        }

        .quickEyebrow {
          margin-bottom: 12px;
          color: #e9cda9;
        }

        .quickCard h2 {
          max-width: 650px;
          margin: 0 auto;
          font-size: clamp(28px, 4vw, 42px);
          line-height: 1.2;
        }

        .quickCard p {
          max-width: 620px;
          margin: 15px auto 0;
          color: rgba(255, 255, 255, 0.78);
          line-height: 1.75;
        }

        .quickActions {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 27px;
        }

        .primaryButton,
        .secondaryButton {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 46px;
          padding: 0 22px;
          border-radius: 12px;
          text-decoration: none;
          font-size: 14px;
          font-weight: 800;
          transition:
            transform 0.2s ease,
            opacity 0.2s ease;
        }

        .primaryButton {
          background: #fff;
          color: #5c402c;
        }

        .secondaryButton {
          border: 1px solid rgba(255, 255, 255, 0.35);
          color: #fff;
          background: rgba(255, 255, 255, 0.08);
        }

        .primaryButton:hover,
        .secondaryButton:hover {
          transform: translateY(-2px);
          opacity: 0.92;
        }

        @media (max-width: 700px) {
          .hero {
            padding: 58px 18px 52px;
          }

          .hero h1 {
            font-size: 40px;
            letter-spacing: -1.5px;
          }

          .hero p {
            font-size: 15px;
          }

          .informationSection,
          .quickSection {
            width: min(100% - 28px, 980px);
          }

          .accordionButton {
            padding: 18px;
          }

          .accordionTitleArea {
            gap: 12px;
          }

          .accordionNumber {
            width: 36px;
            height: 36px;
            border-radius: 10px;
            font-size: 11px;
          }

          .accordionTitleArea h3 {
            font-size: 16px;
          }

          .accordionSummary {
            font-size: 13px;
          }

          .accordionPanel {
            padding: 0 18px 22px 66px;
          }

          .choiceGrid,
          .detailGrid {
            grid-template-columns: 1fr;
          }

          .quickCard {
            padding: 38px 20px;
            border-radius: 20px;
          }

          .quickActions {
            flex-direction: column;
          }

          .primaryButton,
          .secondaryButton {
            width: 100%;
          }
        }

        @media (max-width: 480px) {
          .hero h1 {
            font-size: 36px;
          }

          .accordionTitleArea {
            align-items: center;
          }

          .accordionSummary {
            display: none;
          }

          .accordionPanel {
            padding-left: 18px;
          }

          .accordionContent > p {
            font-size: 14px;
          }

          .flowBox {
            flex-direction: column;
          }

          .flowItem {
            width: 100%;
          }
        }
      `}</style>
    </>
  );
}
