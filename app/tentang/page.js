import Link from "next/link";

export default function TentangPage() {
  return (
    <main className="tentangPage">
      <section className="hero">
        <div className="heroInner">
          <div className="heroBadge">TENTANG SINAR KASIH</div>

          <h1>
            Mengenal Lebih Dekat
            <br />
            <span>Sinar Kasih</span>
          </h1>

          <p>
            Toko Listrik Sinar Kasih hadir untuk menyediakan
            berbagai kebutuhan listrik, penerangan, dan
            perlengkapan pendukung bagi masyarakat Ambon.
          </p>
        </div>
      </section>

      <section className="content">
        <div className="introCard">
          <div className="sectionLabel">TENTANG KAMI</div>

          <h2>Toko Listrik Sinar Kasih</h2>

          <p>
            Sinar Kasih adalah toko yang menyediakan berbagai
            kebutuhan listrik dan penerangan untuk membantu
            pelanggan menemukan produk yang sesuai dengan
            kebutuhan mereka.
          </p>

          <p>
            Melalui toko fisik dan katalog online, Sinar Kasih
            berupaya memberikan informasi produk yang mudah
            ditemukan serta membantu pelanggan mendapatkan
            kebutuhan listrik untuk rumah, toko, kantor, maupun
            berbagai keperluan usaha.
          </p>
        </div>

        <div className="sectionHeading">
          <div className="sectionLabel">PRODUK & KEBUTUHAN</div>

          <h2>Apa yang Kami Sediakan</h2>

          <p>
            Berbagai kebutuhan listrik dan penerangan tersedia
            untuk mendukung kebutuhan sehari-hari.
          </p>
        </div>

        <div className="productGrid">
          <div className="productCard">
            <div className="icon">💡</div>
            <h3>Lampu & Penerangan</h3>
            <p>
              Berbagai jenis lampu untuk kebutuhan rumah,
              toko, kantor, dan ruang lainnya.
            </p>
          </div>

          <div className="productCard">
            <div className="icon">🔌</div>
            <h3>Stop Kontak & Saklar</h3>
            <p>
              Perlengkapan untuk kebutuhan listrik dan
              instalasi sehari-hari.
            </p>
          </div>

          <div className="productCard">
            <div className="icon">🔧</div>
            <h3>Perlengkapan Listrik</h3>
            <p>
              Berbagai perlengkapan dan komponen pendukung
              kebutuhan listrik.
            </p>
          </div>

          <div className="productCard">
            <div className="icon">⚡</div>
            <h3>Kabel & Instalasi</h3>
            <p>
              Produk yang mendukung kebutuhan instalasi dan
              kelistrikan.
            </p>
          </div>

          <div className="productCard">
            <div className="icon">🏠</div>
            <h3>Kebutuhan Rumah</h3>
            <p>
              Produk listrik dan penerangan untuk berbagai
              kebutuhan rumah tangga.
            </p>
          </div>

          <div className="productCard">
            <div className="icon">🏪</div>
            <h3>Kebutuhan Usaha</h3>
            <p>
              Perlengkapan listrik dan penerangan untuk toko,
              kantor, dan berbagai usaha.
            </p>
          </div>
        </div>

        <section className="commitment">
          <div className="commitmentText">
            <div className="sectionLabel">
              KOMITMEN SINAR KASIH
            </div>

            <h2>
              Memberikan Kemudahan untuk Kebutuhan Listrik
            </h2>

            <p>
              Kami berkomitmen untuk terus menyediakan berbagai
              pilihan produk listrik dan penerangan yang dapat
              membantu pelanggan menemukan kebutuhan mereka.
            </p>

            <p>
              Kami juga berusaha memberikan informasi produk
              yang jelas sehingga pelanggan dapat mengetahui
              pilihan yang tersedia sebelum melakukan pembelian.
            </p>
          </div>

          <div className="commitmentPoints">
            <div className="point">
              <span>✓</span>

              <div>
                <strong>Produk Beragam</strong>

                <p>
                  Berbagai kebutuhan listrik dan penerangan
                  dalam satu tempat.
                </p>
              </div>
            </div>

            <div className="point">
              <span>✓</span>

              <div>
                <strong>Informasi Produk Jelas</strong>

                <p>
                  Membantu pelanggan mengenali produk yang
                  tersedia.
                </p>
              </div>
            </div>

            <div className="point">
              <span>✓</span>

              <div>
                <strong>Melayani Berbagai Kebutuhan</strong>

                <p>
                  Untuk rumah, toko, kantor, maupun kebutuhan
                  usaha.
                </p>
              </div>
            </div>

            <div className="point">
              <span>✓</span>

              <div>
                <strong>Hadir Secara Online</strong>

                <p>
                  Informasi produk dan layanan dapat diakses
                  melalui website Sinar Kasih.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="whySection">
          <div className="sectionHeading centered">
            <div className="sectionLabel">
              KENAPA SINAR KASIH
            </div>

            <h2>
              Lebih Mudah Menemukan Kebutuhan Listrik
            </h2>

            <p>
              Sinar Kasih terus berusaha memberikan pengalaman
              yang sederhana dan mudah bagi pelanggan.
            </p>
          </div>

          <div className="whyGrid">
            <div className="whyCard">
              <span className="whyNumber">01</span>

              <h3>Pilihan Produk</h3>

              <p>
                Beragam produk listrik dan penerangan untuk
                berbagai kebutuhan.
              </p>
            </div>

            <div className="whyCard">
              <span className="whyNumber">02</span>

              <h3>Mudah Dicari</h3>

              <p>
                Katalog online membantu pelanggan melihat
                berbagai produk dengan lebih mudah.
              </p>
            </div>

            <div className="whyCard">
              <span className="whyNumber">03</span>

              <h3>Untuk Berbagai Kebutuhan</h3>

              <p>
                Produk dapat digunakan untuk kebutuhan rumah,
                toko, kantor, dan usaha.
              </p>
            </div>
          </div>
        </section>

        <section className="closing">
          <div className="closingBadge">SINAR KASIH</div>

          <h2>
            Solusi Kebutuhan Listrik
            <br />
            & Penerangan
          </h2>

          <p>
            Terima kasih telah mengenal Sinar Kasih.
            Temukan berbagai produk dan informasi layanan
            kami melalui website.
          </p>

          <div className="closingActions">
            <Link
              href="/kategori"
              className="primaryButton"
            >
              Lihat Produk
            </Link>

            <Link
              href="/lainnya"
              className="secondaryButton"
            >
              Informasi & Layanan
            </Link>
          </div>
        </section>
      </section>

      <style>{`
        .tentangPage {
          min-height: 100vh;
          background: #f7f2eb;
          color: #3f2f24;
        }

        .hero {
          background: #f7f2eb;
          border-bottom: 1px solid #e3d8cc;
        }

        .heroInner {
          width: min(1120px, calc(100% - 40px));
          margin: 0 auto;
          padding: 90px 0 82px;
          text-align: center;
        }

        .heroBadge,
        .sectionLabel {
          color: #92765f;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.14em;
        }

        .heroBadge {
          margin-bottom: 18px;
        }

        /*
         * =====================================================
         * JUDUL HERO
         * =====================================================
         *
         * Tetap 2 baris seperti desain sebelumnya.
         * Hanya posisi blok judul yang dibuat benar-benar
         * berada di tengah secara horizontal.
         */
        .hero h1 {
          width: 100%;
          margin: 0 auto;
          padding: 0;
          text-align: center;

          color: #3f2f24;
          font-size: clamp(38px, 5vw, 62px);
          line-height: 1.08;
          letter-spacing: -0.03em;
        }

        .hero h1 span {
          color: #765138;
        }

        .hero p {
          width: min(720px, 100%);
          margin: 24px auto 0;
          color: #76685d;
          font-size: 17px;
          line-height: 1.8;
          text-align: center;
        }

        .content {
          width: min(1120px, calc(100% - 40px));
          margin: 0 auto;
          padding: 70px 0 90px;
        }

        .introCard {
          padding: 42px;
          background: #fff;
          border: 1px solid #e1d5c8;
          border-radius: 18px;
          box-shadow:
            0 10px 30px rgba(70, 48, 35, 0.05);
        }

        .introCard h2,
        .sectionHeading h2,
        .commitment h2,
        .closing h2 {
          margin: 10px 0 16px;
          color: #3f2f24;
          font-size: 32px;
          line-height: 1.2;
        }

        .introCard p,
        .sectionHeading p,
        .commitmentText p,
        .closing p {
          color: #76685d;
          font-size: 15px;
          line-height: 1.8;
        }

        .introCard p:last-child {
          margin-bottom: 0;
        }

        .sectionHeading {
          margin: 82px 0 28px;
        }

        .sectionHeading p {
          max-width: 650px;
          margin: 0;
        }

        .productGrid {
          display: grid;
          grid-template-columns:
            repeat(3, minmax(0, 1fr));
          gap: 18px;
        }

        .productCard {
          padding: 26px;
          background: #fff;
          border: 1px solid #e1d5c8;
          border-radius: 15px;
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }

        .productCard:hover {
          transform: translateY(-3px);
          box-shadow:
            0 10px 25px rgba(70, 48, 35, 0.08);
        }

        .icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 18px;
          border-radius: 12px;
          background: #f2e8dd;
          font-size: 23px;
        }

        .productCard h3 {
          margin: 0 0 8px;
          color: #4b3326;
          font-size: 17px;
        }

        .productCard p {
          margin: 0;
          color: #7c6e63;
          font-size: 13px;
          line-height: 1.7;
        }

        .commitment {
          display: grid;
          grid-template-columns:
            minmax(0, 1fr)
            minmax(0, 1fr);
          gap: 50px;
          align-items: center;
          margin-top: 82px;
          padding: 48px;
          background: #eee3d7;
          border-radius: 20px;
        }

        .commitment h2 {
          font-size: 30px;
        }

        .commitmentPoints {
          display: grid;
          gap: 18px;
        }

        .point {
          display: flex;
          gap: 14px;
          align-items: flex-start;
        }

        .point > span {
          width: 28px;
          height: 28px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #765138;
          color: #fff;
          font-size: 13px;
          font-weight: 800;
        }

        .point strong {
          display: block;
          margin-bottom: 4px;
          color: #4b3326;
          font-size: 14px;
        }

        .point p {
          margin: 0;
          color: #7c6e63;
          font-size: 13px;
          line-height: 1.6;
        }

        .whySection {
          margin-top: 90px;
        }

        .centered {
          text-align: center;
        }

        .centered p {
          margin-left: auto;
          margin-right: auto;
        }

        .whyGrid {
          display: grid;
          grid-template-columns:
            repeat(3, minmax(0, 1fr));
          gap: 18px;
          margin-top: 32px;
        }

        .whyCard {
          position: relative;
          padding: 30px;
          background: #fff;
          border: 1px solid #e1d5c8;
          border-radius: 15px;
        }

        .whyNumber {
          display: block;
          margin-bottom: 20px;
          color: #b39a85;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.08em;
        }

        .whyCard h3 {
          margin: 0 0 9px;
          color: #4b3326;
          font-size: 17px;
        }

        .whyCard p {
          margin: 0;
          color: #7c6e63;
          font-size: 13px;
          line-height: 1.7;
        }

        .closing {
          margin-top: 90px;
          padding: 58px 30px;
          border-radius: 20px;
          background: #5f402e;
          color: #fff;
          text-align: center;
        }

        .closingBadge {
          margin-bottom: 14px;
          color: #e9d6c4;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.16em;
        }

        .closing h2 {
          color: #fff;
          font-size: 34px;
        }

        .closing p {
          width: min(620px, 100%);
          margin: 0 auto;
          color: #eadfd6;
        }

        .closingActions {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-top: 28px;
          flex-wrap: wrap;
        }

        .primaryButton,
        .secondaryButton {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 44px;
          padding: 0 18px;
          border-radius: 8px;
          text-decoration: none;
          font-size: 14px;
          font-weight: 700;
        }

        .primaryButton {
          background: #fff;
          color: #4b3326;
        }

        .secondaryButton {
          border: 1px solid rgba(255,255,255,0.45);
          color: #fff;
        }

        .secondaryButton:hover {
          background: rgba(255,255,255,0.08);
        }

        @media (max-width: 850px) {
          .productGrid,
          .whyGrid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }

          .commitment {
            grid-template-columns: 1fr;
            gap: 30px;
          }
        }

        @media (max-width: 600px) {
          .heroInner {
            width: min(100% - 28px, 1120px);
            padding: 60px 0;
          }

          .content {
            width: min(100% - 28px, 1120px);
            padding: 45px 0 60px;
          }

          .hero p {
            font-size: 15px;
          }

          .introCard,
          .commitment {
            padding: 26px;
          }

          .introCard h2,
          .sectionHeading h2,
          .commitment h2 {
            font-size: 26px;
          }

          .productGrid,
          .whyGrid {
            grid-template-columns: 1fr;
          }

          .sectionHeading,
          .whySection,
          .closing {
            margin-top: 60px;
          }

          .closing {
            padding: 45px 22px;
          }

          .closing h2 {
            font-size: 28px;
          }
        }
      `}</style>
    </main>
  );
}
