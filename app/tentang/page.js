"use client";

import Link from "next/link";
import { useState } from "react";

export default function TentangPage() {
  const [openSection, setOpenSection] = useState(null);

  function toggleSection(section) {
    setOpenSection((current) =>
      current === section ? null : section
    );
  }

  const sections = [
    {
      id: "tentang",
      number: "01",
      title: "Tentang Kami",
      summary:
        "Mengenal Sinar Kasih dan tujuan hadirnya website sebagai katalog serta pusat informasi.",
      content: (
        <div className="accordionContent">
          <p>
            <strong>Sinar Kasih</strong> merupakan toko yang menyediakan
            berbagai kebutuhan listrik, penerangan, serta perlengkapan
            pendukung untuk kebutuhan rumah maupun usaha.
          </p>

          <p>
            Website Sinar Kasih hadir sebagai katalog dan pusat informasi
            untuk membantu pelanggan mengenal lebih dekat produk serta
            layanan yang tersedia.
          </p>

          <p>
            Kami juga ingin memperkenalkan Sinar Kasih kepada lebih banyak
            masyarakat di Ambon, sehingga pelanggan dapat memperoleh
            informasi mengenai produk, toko, layanan, dan berbagai
            informasi lainnya dengan lebih mudah.
          </p>
        </div>
      ),
    },

    {
      id: "kualitas",
      number: "02",
      title: "Kualitas yang Tetap Kami Jaga",
      summary:
        "Kualitas produk merupakan bagian penting dari kepercayaan pelanggan Sinar Kasih.",
      content: (
        <div className="accordionContent">
          <p>
            Bagi Sinar Kasih,{" "}
            <strong>
              kualitas produk merupakan bagian penting dari kepercayaan
              pelanggan.
            </strong>
          </p>

          <p>
            Kami memahami bahwa kondisi saat ini membuat harga menjadi
            salah satu pertimbangan penting dalam memenuhi kebutuhan
            pelanggan. Namun, kami tetap berusaha menjaga kualitas produk
            yang kami sediakan.
          </p>

          <p>
            Kami percaya bahwa kebutuhan listrik bukan hanya tentang
            mendapatkan harga yang murah, tetapi juga tentang mendapatkan
            produk yang memiliki kualitas dan nilai yang baik bagi
            pelanggan.
          </p>
        </div>
      ),
    },

    {
      id: "produk",
      number: "03",
      title: "Apa yang Kami Sediakan",
      summary:
        "Beragam kebutuhan listrik dan penerangan untuk rumah, usaha, maupun kebutuhan lainnya.",
      content: (
        <div className="productGrid">
          <div className="productItem">
            <span className="productIcon">💡</span>
            <div>
              <strong>Lampu & Penerangan</strong>
              <p>
                Berbagai kebutuhan lampu dan produk penerangan.
              </p>
            </div>
          </div>

          <div className="productItem">
            <span className="productIcon">🔌</span>
            <div>
              <strong>Stop Kontak & Saklar</strong>
              <p>
                Perlengkapan untuk kebutuhan kelistrikan sehari-hari.
              </p>
            </div>
          </div>

          <div className="productItem">
            <span className="productIcon">⚡</span>
            <div>
              <strong>Perlengkapan Listrik</strong>
              <p>
                Berbagai perlengkapan pendukung kebutuhan listrik.
              </p>
            </div>
          </div>

          <div className="productItem">
            <span className="productIcon">🔧</span>
            <div>
              <strong>Kabel & Instalasi</strong>
              <p>
                Kebutuhan kabel dan perlengkapan instalasi listrik.
              </p>
            </div>
          </div>

          <div className="productItem">
            <span className="productIcon">🏠</span>
            <div>
              <strong>Kebutuhan Rumah</strong>
              <p>
                Produk pendukung kebutuhan listrik dan penerangan rumah.
              </p>
            </div>
          </div>

          <div className="productItem">
            <span className="productIcon">🏪</span>
            <div>
              <strong>Kebutuhan Usaha</strong>
              <p>
                Berbagai kebutuhan listrik dan penerangan untuk usaha.
              </p>
            </div>
          </div>
        </div>
      ),
    },

    {
      id: "komitmen",
      number: "04",
      title: "Komitmen Kami terhadap Kualitas",
      summary:
        "Menjaga kualitas produk, memahami kebutuhan pelanggan, dan membangun kepercayaan.",
      content: (
        <div className="accordionContent">
          <p>
            Sinar Kasih berkomitmen untuk terus memperhatikan kualitas
            produk yang disediakan agar dapat memberikan nilai yang baik
            bagi pelanggan.
          </p>

          <p>
            Kami juga berusaha memahami kebutuhan pelanggan dan memberikan
            informasi produk yang jelas sehingga pelanggan dapat menentukan
            pilihan sesuai kebutuhan.
          </p>

          <p>
            Bagi kami, kepercayaan pelanggan merupakan hal yang penting
            untuk dijaga dalam jangka panjang.
          </p>
        </div>
      ),
    },

    {
      id: "kenapa",
      number: "05",
      title: "Kenapa Sinar Kasih",
      summary:
        "Tiga hal yang menjadi bagian dari nilai Sinar Kasih dalam melayani pelanggan.",
      content: (
        <div className="whyGrid">
          <div className="whyCard">
            <div className="whyNumber">01</div>

            <div>
              <h3>Mengutamakan Kualitas</h3>

              <p>
                Kami berusaha menjaga kualitas produk sebagai bagian dari
                kepercayaan pelanggan.
              </p>
            </div>
          </div>

          <div className="whyCard">
            <div className="whyNumber">02</div>

            <div>
              <h3>Pilihan Produk yang Beragam</h3>

              <p>
                Menyediakan berbagai kebutuhan listrik dan penerangan untuk
                kebutuhan yang berbeda.
              </p>
            </div>
          </div>

          <div className="whyCard">
            <div className="whyNumber">03</div>

            <div>
              <h3>Menjaga Kepercayaan Pelanggan</h3>

              <p>
                Memberikan informasi produk yang jelas dan berusaha
                memberikan pelayanan yang baik kepada pelanggan.
              </p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <>
      <main className="aboutPage">
        <section className="hero">
          <div className="heroInner">
            <div className="heroLabel">TENTANG SINAR KASIH</div>

            <h1>
              Mengenal Lebih Dekat
              <br />
              Sinar Kasih
            </h1>

            <p>
              Mengenal lebih dekat Sinar Kasih, nilai yang kami jaga,
              serta berbagai kebutuhan listrik dan penerangan yang kami
              sediakan.
            </p>
          </div>
        </section>

        <section className="informationSection">
          <div className="sectionHeader">
            <span className="sectionEyebrow">SINAR KASIH</span>

            <h2>Informasi Tentang Kami</h2>

            <p>
              Buka bagian yang ingin Anda ketahui lebih lanjut.
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

                      <div>
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

        <section className="closingSection">
          <div className="closingCard">
            <span className="closingEyebrow">
              SINAR KASIH
            </span>

            <h2>Solusi Kebutuhan Listrik & Penerangan</h2>

            <p>
              Temukan berbagai produk dan informasi yang Anda butuhkan
              melalui website Sinar Kasih.
            </p>

            <div className="closingActions">
              <Link href="/" className="primaryButton">
                Lihat Produk
              </Link>

              <Link
                href="/lainnya"
                className="secondaryButton"
              >
                Informasi & Layanan
              </Link>
            </div>
          </div>
        </section>
      </main>

      <style>{`
        .aboutPage {
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
        .closingEyebrow {
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
          max-width: 690px;
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
            box-shadow 0.2s ease,
            transform 0.2s ease;
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

        .accordionContent p {
          margin: 0 0 15px;
          font-size: 15px;
          line-height: 1.85;
        }

        .accordionContent p:last-child {
          margin-bottom: 0;
        }

        .productGrid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }

        .productItem {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 17px;
          border: 1px solid #ece2d8;
          border-radius: 14px;
          background: #fffaf5;
        }

        .productIcon {
          flex: 0 0 auto;
          font-size: 24px;
          line-height: 1.2;
        }

        .productItem strong {
          display: block;
          margin-bottom: 5px;
          color: #503a2d;
          font-size: 14px;
        }

        .productItem p {
          margin: 0;
          color: #786b62;
          font-size: 13px;
          line-height: 1.6;
        }

        .whyGrid {
          display: grid;
          gap: 12px;
        }

        .whyCard {
          display: flex;
          align-items: flex-start;
          gap: 17px;
          padding: 18px;
          border-radius: 14px;
          background: #fffaf5;
          border: 1px solid #ece2d8;
        }

        .whyNumber {
          flex: 0 0 auto;
          font-size: 14px;
          font-weight: 900;
          color: #a16d3d;
          letter-spacing: 1px;
        }

        .whyCard h3 {
          margin: 0 0 5px;
          color: #503a2d;
          font-size: 15px;
        }

        .whyCard p {
          margin: 0;
          color: #786b62;
          font-size: 13px;
          line-height: 1.65;
        }

        .closingSection {
          width: min(980px, calc(100% - 40px));
          margin: 0 auto;
          padding: 0 0 80px;
        }

        .closingCard {
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

        .closingEyebrow {
          margin-bottom: 12px;
          color: #e9cda9;
        }

        .closingCard h2 {
          max-width: 650px;
          margin: 0 auto;
          font-size: clamp(28px, 4vw, 42px);
          line-height: 1.2;
        }

        .closingCard p {
          max-width: 620px;
          margin: 15px auto 0;
          color: rgba(255, 255, 255, 0.78);
          line-height: 1.75;
        }

        .closingActions {
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
          .closingSection {
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

          .productGrid {
            grid-template-columns: 1fr;
          }

          .closingCard {
            padding: 38px 20px;
            border-radius: 20px;
          }

          .closingActions {
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

          .accordionContent p {
            font-size: 14px;
          }
        }
      `}</style>
    </>
  );
}
