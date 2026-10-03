// Lokasi file: app/info/page.js  (dulu: app/lainnya/page.js)
import { getSupabase } from "@/lib/supabase";
import PemutarLagu from "./PemutarLagu";

export const dynamic = "force-dynamic";

function normalizeUrl(value, type) {
  if (!value) return "#";

  let url = value.trim();

  if (type === "instagram") {
    if (url.startsWith("@")) {
      url = url.substring(1);
    }

    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = `https://instagram.com/${url}`;
    }
  }

  if (type === "tiktok") {
    if (url.startsWith("@")) {
      url = url.substring(1);
    }

    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = `https://tiktok.com/@${url}`;
    }
  }

  return url;
}

function StoreIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 10h18" />
      <path d="M5 10v10h14V10" />
      <path d="M4 10l1.5-6h13L20 10" />
      <path d="M8 20v-6h8v6" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 11.5a8.5 8.5 0 0 1-12.7 7.4L4 20l1.1-3.2A8.5 8.5 0 1 1 20 11.5Z" />
      <path d="M8.5 8.5c.3-.7.6-.7.9-.7h.6c.2 0 .4.1.5.4l.8 1.8c.1.2.1.4-.1.6l-.6.7c-.1.1-.2.3-.1.5.4.8 1 1.4 1.7 1.9.7.5 1.3.8 1.6.9.2.1.4 0 .5-.1l.7-.8c.2-.2.4-.2.6-.1l1.7.8c.2.1.3.3.3.5v.6c0 .3-.1.6-.4.8-.4.3-1 .5-1.6.4-1.1-.2-2.3-.8-3.5-1.8-1.1-.9-2.1-2.1-2.8-3.2-.7-1.1-1-2.1-.8-3.2.1-.5.3-1 .5-1.3Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle
        cx="17.5"
        cy="6.5"
        r="1"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M15 4v10.2a4.2 4.2 0 1 1-3.8-4.2" />
      <path d="M15 4c.3 2 1.4 3.3 3.5 3.6" />
      <path d="M15 4c.8 1.4 1.8 2.2 3.5 2.6" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 10v6" />
      <circle
        cx="12"
        cy="7"
        r="1"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 1.9-1.4L21 8H6" />
      <circle cx="10" cy="20" r="1" />
      <circle cx="18" cy="20" r="1" />
    </svg>
  );
}

function JobIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5.5A1.5 1.5 0 0 1 9.5 4h5A1.5 1.5 0 0 1 16 5.5V7" />
      <path d="M3 12h18" />
      <path d="M10 12v2h4v-2" />
    </svg>
  );
}

function FormIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M9 3v2h6V3" />
      <path d="M9 10h6M9 14h6M9 18h3" />
    </svg>
  );
}

function MusicIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 18V5l11-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="17" cy="16" r="3" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

export default async function InfoPage() {
  const supabase = getSupabase();

  const { data: kontak } = await supabase
    .from("kontak_toko")
    .select("instagram, tiktok, email")
    .limit(1)
    .maybeSingle();

  const [{ data: formulir }, { data: lagu }] = await Promise.all([
    supabase
      .from("formulir_tautan")
      .select("id, judul, deskripsi, url")
      .eq("aktif", true)
      .order("urutan", { ascending: true })
      .order("id", { ascending: true }),
    supabase
      .from("lagu_tema")
      .select("id, judul, keterangan, audio_url, audio_path")
      .eq("aktif", true)
      .order("urutan", { ascending: true })
      .order("id", { ascending: true }),
  ]);

  const daftarFormulir = formulir || [];
  const daftarLagu = lagu || [];

  const whatsappUrl = "https://wa.me/6281285750033";

  const instagramUrl = normalizeUrl(
    kontak?.instagram,
    "instagram"
  );

  const tiktokUrl = normalizeUrl(
    kontak?.tiktok,
    "tiktok"
  );

  const menuItems = [
    {
      href: "/loker",
      title: "Info Loker",
      description:
        "Lihat lowongan kerja yang sedang tersedia dan ikuti proses seleksi resmi Toko Listrik Sinar Kasih.",
      icon: <JobIcon />,
      iconClass: "jobIcon",
      featured: true,
      external: false,
    },
    {
      href: "/toko",
      title: "Toko Kami",
      description:
        "Lihat lokasi, alamat, nomor telepon, Google Maps, dan Google Review toko kami.",
      icon: <StoreIcon />,
      iconClass: "storeIcon",
      featured: false,
      external: false,
    },
    {
      href: whatsappUrl,
      title: "WhatsApp",
      description:
        "Hubungi kami langsung melalui WhatsApp untuk bertanya tentang produk dan pesanan.",
      icon: <WhatsAppIcon />,
      iconClass: "whatsappIcon",
      featured: false,
      external: true,
    },
    {
      href: instagramUrl,
      title: "Instagram",
      description:
        "Ikuti Instagram Sinar Kasih untuk melihat produk, promo, dan informasi terbaru.",
      icon: <InstagramIcon />,
      iconClass: "instagramIcon",
      featured: false,
      external: true,
    },
    {
      href: tiktokUrl,
      title: "TikTok",
      description:
        "Lihat video produk dan informasi terbaru Toko Listrik Sinar Kasih.",
      icon: <TikTokIcon />,
      iconClass: "tiktokIcon",
      featured: false,
      external: true,
    },
    {
      href: "/tentang",
      title: "Tentang Sinar Kasih",
      description:
        "Kenali Toko Listrik Sinar Kasih dan berbagai kebutuhan listrik yang kami sediakan.",
      icon: <InfoIcon />,
      iconClass: "infoIcon",
      featured: false,
      external: false,
    },
    {
      href: "/cara-pesan",
      title: "Cara Pesan",
      description:
        "Pelajari cara memilih produk dan melakukan pemesanan dengan mudah.",
      icon: <CartIcon />,
      iconClass: "cartIcon",
      featured: false,
      external: false,
    },
  ];

  return (
    <>
      <main className="lainnyaPage">
        <div className="lainnyaContainer">

          <header className="lainnyaHeader">
            <h1>Informasi &amp; Layanan</h1>

            <p>
              Temukan informasi toko, layanan, media sosial,
              lowongan kerja, dan cara berbelanja di Toko
              Listrik Sinar Kasih.
            </p>
          </header>

          <section className="menuGrid">

            {menuItems.map((item) => (
              <a
                key={item.title}
                href={item.href}
                className={`menuCard ${
                  item.featured ? "featuredCard" : ""
                }`}
                target={
                  item.external ? "_blank" : undefined
                }
                rel={
                  item.external
                    ? "noopener noreferrer"
                    : undefined
                }
              >
                <div className={`menuIcon ${item.iconClass}`}>
                  {item.icon}
                </div>

                <div className="menuContent">
                  <div className="menuTitleRow">
                    <h2>{item.title}</h2>

                    {item.featured && (
                      <span className="featuredBadge">
                        INFO LOKER
                      </span>
                    )}
                  </div>

                  <p>{item.description}</p>
                </div>

                {item.featured ? (
                  <span className="featuredCta">
                    Lihat Lowongan
                    <ArrowIcon />
                  </span>
                ) : (
                  <div className="menuArrow">
                    <ArrowIcon />
                  </div>
                )}
              </a>
            ))}

          </section>

          {(daftarFormulir.length > 0 || daftarLagu.length > 0) && (
            <section
              className={`infoDua ${
                daftarFormulir.length > 0 && daftarLagu.length > 0
                  ? ""
                  : "infoSatu"
              }`}
            >
              {daftarFormulir.length > 0 && (
                <div className="infoPanel">
                  <div className="infoPanelKepala">
                    <div className="menuIcon formIcon">
                      <FormIcon />
                    </div>
                    <div>
                      <h2>Formulir Pelanggan</h2>
                      <p>Klaim garansi, penilaian, dan masukan Anda.</p>
                    </div>
                  </div>

                  <div className="formDaftar">
                    {daftarFormulir.map((f) => (
                      <a
                        key={f.id}
                        href={f.url}
                        className="formBaris"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <div>
                          <strong>{f.judul}</strong>
                          {f.deskripsi && <span>{f.deskripsi}</span>}
                        </div>
                        <span className="formIsi">
                          Isi
                          <ArrowIcon />
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {daftarLagu.length > 0 && (
                <div className="infoPanel">
                  <div className="infoPanelKepala">
                    <div className="menuIcon musicIcon">
                      <MusicIcon />
                    </div>
                    <div>
                      <h2>Lagu Sinar Kasih</h2>
                      <p>Putar atau unduh untuk didengarkan di HP Anda.</p>
                    </div>
                  </div>

                  <PemutarLagu lagu={daftarLagu} />
                </div>
              )}
            </section>
          )}

        </div>
      </main>

      <style>{`
        .lainnyaPage {
          min-height: calc(100vh - 64px);
          padding: 46px 20px 70px;
          background: #fffaf3;
        }

        .lainnyaContainer {
          width: 100%;
          max-width: 1080px;
          margin: 0 auto;
        }

        .lainnyaHeader {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          margin-bottom: 34px;
        }

        .lainnyaHeader h1 {
          width: 100%;
          margin: 0 0 10px;
          font-size: 34px;
          line-height: 1.2;
          font-weight: 700;
          color: #4b2418;
          text-align: center !important;
        }

        .lainnyaHeader p {
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
          font-size: 15px;
          line-height: 1.7;
          color: #725f57;
          text-align: center;
        }

        .menuGrid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
        }

        .menuCard {
          position: relative;
          display: flex;
          align-items: center;
          gap: 18px;
          min-height: 150px;
          padding: 24px 25px;
          border: 1px solid #eadfd5;
          border-radius: 18px;
          background: #ffffff;
          text-decoration: none;
          box-shadow: 0 8px 24px rgba(75, 36, 24, 0.06);
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease,
            border-color 0.2s ease;
        }

        .menuCard:hover {
          transform: translateY(-4px);
          border-color: #d7c4b7;
          box-shadow: 0 14px 32px rgba(75, 36, 24, 0.11);
        }

        .featuredCard {
          grid-column: 1 / -1;
          min-height: 170px;
          border: 2px solid #d9c4b2;
          background: linear-gradient(
            135deg,
            #ffffff 0%,
            #fff8ef 100%
          );
          box-shadow: 0 10px 28px rgba(75, 36, 24, 0.09);
        }

        .featuredCard:hover {
          border-color: #c9ad98;
          box-shadow: 0 16px 34px rgba(75, 36, 24, 0.13);
        }

        .menuIcon {
          width: 62px;
          height: 62px;
          min-width: 62px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 17px;
        }

        .featuredCard .menuIcon {
          width: 70px;
          height: 70px;
          min-width: 70px;
          border-radius: 19px;
        }

        .menuIcon svg {
          width: 31px;
          height: 31px;
          fill: none;
          stroke: currentColor;
          stroke-width: 1.8;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .featuredCard .menuIcon svg {
          width: 35px;
          height: 35px;
        }

        .storeIcon {
          background: #fff0d9;
          color: #d47a00;
        }

        .whatsappIcon {
          background: #dcf8e7;
          color: #20a95b;
        }

        .instagramIcon {
          background: #fbe2ef;
          color: #d13d7a;
        }

        .tiktokIcon {
          background: #e3edf9;
          color: #1769aa;
        }

        .infoIcon {
          background: #eee5ff;
          color: #7650c9;
        }

        .cartIcon {
          background: #ffe6df;
          color: #d85b3d;
        }

        .jobIcon {
          background: #e5f0ff;
          color: #3575c5;
        }

        .menuContent {
          flex: 1;
          min-width: 0;
          padding-right: 20px;
        }

        .menuTitleRow {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 9px;
          margin-bottom: 7px;
        }

        .menuContent h2 {
          margin: 0;
          font-size: 18px;
          line-height: 1.3;
          font-weight: 700;
          color: #4b2418;
        }

        .featuredCard .menuContent h2 {
          font-size: 21px;
        }

        .featuredBadge {
          display: inline-flex;
          align-items: center;
          padding: 5px 9px;
          border-radius: 999px;
          background: #dcf8e7;
          color: #16834b;
          font-size: 10px;
          line-height: 1;
          font-weight: 800;
          letter-spacing: 0.3px;
        }

        .menuContent p {
          margin: 0;
          font-size: 13.5px;
          line-height: 1.65;
          color: #76645c;
        }

        .featuredCard .menuContent p {
          max-width: 650px;
          font-size: 14px;
        }

        .menuArrow {
          position: absolute;
          right: 20px;
          top: 50%;
          transform: translateY(-50%);
          color: #9a7969;
          transition: transform 0.2s ease;
        }

        .menuArrow svg {
          width: 20px;
          height: 20px;
          fill: none;
          stroke: currentColor;
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .menuCard:hover .menuArrow {
          transform: translate(4px, -50%);
        }

        @media (max-width: 760px) {
          .lainnyaPage {
            padding: 34px 16px 55px;
          }

          .lainnyaHeader {
            margin-bottom: 26px;
          }

          .lainnyaHeader h1 {
            font-size: 28px;
          }

          .lainnyaHeader p {
            font-size: 14px;
            line-height: 1.65;
          }

          .menuGrid {
            grid-template-columns: 1fr;
            gap: 14px;
          }

          .featuredCard {
            grid-column: auto;
            min-height: 145px;
          }

          .menuCard {
            min-height: 132px;
            padding: 20px;
            gap: 15px;
          }

          .featuredCard .menuIcon {
            width: 58px;
            height: 58px;
            min-width: 58px;
          }

          .featuredCard .menuIcon svg {
            width: 29px;
            height: 29px;
          }

          .menuIcon {
            width: 54px;
            height: 54px;
            min-width: 54px;
            border-radius: 15px;
          }

          .menuIcon svg {
            width: 27px;
            height: 27px;
          }

          .menuContent {
            padding-right: 18px;
          }

          .menuContent h2 {
            font-size: 17px;
          }

          .featuredCard .menuContent h2 {
            font-size: 18px;
          }

          .menuContent p {
            font-size: 13px;
          }

          .featuredCard .menuContent p {
            font-size: 13px;
          }

          .menuArrow {
            right: 15px;
          }
        }

        @media (max-width: 420px) {
          .lainnyaHeader h1 {
            font-size: 25px;
          }

          .menuCard {
            padding: 18px;
          }

          .menuIcon {
            width: 50px;
            height: 50px;
            min-width: 50px;
          }

          .featuredCard .menuIcon {
            width: 52px;
            height: 52px;
            min-width: 52px;
          }

          .menuContent h2,
          .featuredCard .menuContent h2 {
            font-size: 16px;
          }

          .menuContent p,
          .featuredCard .menuContent p {
            font-size: 12.5px;
          }

          .featuredBadge {
            font-size: 9px;
            padding: 4px 7px;
          }
        }
      
        /* Kartu Info Loker: ditonjolkan di tengah */
        .featuredCard {
          flex-direction: column;
          align-items: center !important;
          justify-content: center;
          text-align: center;
          gap: 14px;
          padding: 34px 28px !important;
          background:
            radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.08), transparent 60%),
            linear-gradient(135deg, #ffffff 0%, #fff6ea 100%) !important;
        }

        .featuredCard .menuContent {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .featuredCard .menuTitleRow {
          justify-content: center;
        }

        .featuredCard .menuContent h2 {
          font-size: 26px !important;
        }

        .featuredCard .menuContent p {
          max-width: 560px;
        }

        .featuredCta {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 11px 20px;
          border-radius: 999px;
          background: #6f4c36;
          color: #ffffff;
          font-size: 15px;
          font-weight: 700;
        }

        .featuredCta svg {
          width: 18px;
          height: 18px;
          fill: none;
          stroke: currentColor;
          stroke-width: 2;
        }

        .featuredCard:hover .featuredCta {
          background: #5c3e2c;
        }

        /* Formulir & Lagu: dua kolom berdampingan */
        .infoDua {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
          margin-top: 18px;
          align-items: start;
        }

        .infoDua.infoSatu {
          grid-template-columns: minmax(0, 640px);
          justify-content: center;
        }

        .infoPanel {
          padding: 24px;
          background: #ffffff;
          border: 1px solid #eadfce;
          border-radius: 20px;
        }

        .infoPanelKepala {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 16px;
        }

        .infoPanelKepala .menuIcon {
          width: 52px;
          height: 52px;
          min-width: 52px;
          border-radius: 15px;
        }

        .infoPanelKepala .menuIcon svg {
          width: 26px;
          height: 26px;
        }

        .infoPanelKepala h2 {
          margin: 0 0 2px;
          font-size: 20px;
          color: #3f2f24;
        }

        .infoPanelKepala p {
          margin: 0;
          font-size: 14px;
          color: #7d6957;
        }

        .formIcon {
          background: #efe9fb !important;
          color: #6b4fbb !important;
        }

        .musicIcon {
          background: #fdecef !important;
          color: #c0405e !important;
        }

        .formDaftar {
          display: grid;
          gap: 10px;
        }

        .formBaris {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          padding: 14px 16px;
          border: 1px solid #efe5d9;
          border-radius: 14px;
          background: #fcf9f5;
          color: #3f2f24;
          text-decoration: none;
          transition: border-color 0.15s ease, background 0.15s ease;
        }

        .formBaris:hover {
          border-color: #d9c4b2;
          background: #fff;
        }

        .formBaris strong {
          display: block;
          font-size: 15px;
        }

        .formBaris span:not(.formIsi) {
          display: block;
          margin-top: 2px;
          font-size: 13px;
          color: #7d6957;
        }

        .formIsi {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          flex-shrink: 0;
          padding: 7px 12px;
          border-radius: 999px;
          background: #efe9fb;
          color: #6b4fbb;
          font-size: 13px;
          font-weight: 700;
        }

        .formIsi svg {
          width: 15px;
          height: 15px;
          fill: none;
          stroke: currentColor;
          stroke-width: 2;
        }

        /* Daftar putar lagu */
        .pl-daftar {
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          gap: 10px;
        }

        .pl-baris {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          border: 1px solid #efe5d9;
          border-radius: 14px;
          background: #fcf9f5;
        }

        .pl-baris.aktif {
          border-color: #e7b9c4;
          background: #fff7f9;
        }

        .pl-putar {
          width: 40px;
          height: 40px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          border: none;
          border-radius: 50%;
          background: #c0405e;
          color: #fff;
          cursor: pointer;
        }

        .pl-putar svg {
          fill: currentColor;
        }

        .pl-putar:hover {
          background: #a8344f;
        }

        .pl-info {
          flex: 1;
          min-width: 0;
        }

        .pl-judul {
          display: block;
          font-size: 15px;
          font-weight: 700;
          color: #3f2f24;
        }

        .pl-no {
          color: #b9a690;
          font-weight: 600;
        }

        .pl-ket {
          display: block;
          margin-top: 1px;
          font-size: 12.5px;
          color: #7d6957;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .pl-progres {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 8px;
          font-size: 12px;
          color: #7d6957;
        }

        .pl-progres input {
          flex: 1;
          accent-color: #c0405e;
        }

        .pl-unduh {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          flex-shrink: 0;
          padding: 7px 12px;
          border: 1px solid #e0cfbb;
          border-radius: 999px;
          background: #fff;
          color: #6f4c36;
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
        }

        .pl-unduh:hover {
          background: #f3e8da;
        }

        .pl-semua {
          display: block;
          width: 100%;
          margin-top: 12px;
          padding: 10px;
          border: 1px dashed #d9c4b2;
          border-radius: 12px;
          background: none;
          color: #6f4c36;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
        }

        @media (max-width: 860px) {
          .infoDua {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .pl-unduh span {
            display: none;
          }

          .featuredCard .menuContent h2 {
            font-size: 22px !important;
          }
        }
`}</style>
    </>
  );
}
