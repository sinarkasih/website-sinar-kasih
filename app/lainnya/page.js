import { getSupabase } from "@/lib/supabase";

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

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

export default async function LainnyaPage() {
  const supabase = getSupabase();

  const { data: kontak } = await supabase
    .from("kontak_toko")
    .select("instagram, tiktok, email")
    .limit(1)
    .maybeSingle();

  // Nomor WhatsApp resmi Toko Listrik Sinar Kasih
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
      href: "/toko",
      title: "Toko Kami",
      description:
        "Lihat lokasi, alamat, nomor telepon, Google Maps, dan Google Review toko kami.",
      icon: <StoreIcon />,
      iconClass: "storeIcon",
      external: false,
    },
    {
      href: whatsappUrl,
      title: "WhatsApp",
      description:
        "Hubungi kami langsung melalui WhatsApp untuk bertanya tentang produk dan pesanan.",
      icon: <WhatsAppIcon />,
      iconClass: "whatsappIcon",
      external: true,
    },
    {
      href: instagramUrl,
      title: "Instagram",
      description:
        "Ikuti Instagram Sinar Kasih untuk melihat produk, promo, dan informasi terbaru.",
      icon: <InstagramIcon />,
      iconClass: "instagramIcon",
      external: true,
    },
    {
      href: tiktokUrl,
      title: "TikTok",
      description:
        "Lihat video produk dan informasi terbaru Toko Listrik Sinar Kasih.",
      icon: <TikTokIcon />,
      iconClass: "tiktokIcon",
      external: true,
    },
    {
      href: "/tentang",
      title: "Tentang Sinar Kasih",
      description:
        "Kenali Toko Listrik Sinar Kasih dan berbagai kebutuhan listrik yang kami sediakan.",
      icon: <InfoIcon />,
      iconClass: "infoIcon",
      external: false,
    },
    {
      href: "/cara-pesan",
      title: "Cara Pesan",
      description:
        "Pelajari cara memilih produk dan melakukan pemesanan dengan mudah.",
      icon: <CartIcon />,
      iconClass: "cartIcon",
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
              Temukan informasi toko, layanan, media sosial, dan cara
              berbelanja di Toko Listrik Sinar Kasih.
            </p>
          </header>

          <section className="menuGrid">
            {menuItems.map((item) => (
              <a
                key={item.title}
                href={item.href}
                className="menuCard"
                target={item.external ? "_blank" : undefined}
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
                  <h2>{item.title}</h2>
                  <p>{item.description}</p>
                </div>

                <div className="menuArrow">
                  <ArrowIcon />
                </div>
              </a>
            ))}
          </section>

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
          max-width: 560px;
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

        .menuIcon {
          width: 62px;
          height: 62px;
          min-width: 62px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 17px;
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

        .menuContent {
          flex: 1;
          min-width: 0;
          padding-right: 20px;
        }

        .menuContent h2 {
          margin: 0 0 7px;
          font-size: 18px;
          line-height: 1.3;
          font-weight: 700;
          color: #4b2418;
        }

        .menuContent p {
          margin: 0;
          font-size: 13.5px;
          line-height: 1.65;
          color: #76645c;
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

          .menuCard {
            min-height: 132px;
            padding: 20px;
            gap: 15px;
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

          .menuContent p {
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

          .menuContent h2 {
            font-size: 16px;
          }

          .menuContent p {
            font-size: 12.5px;
          }
        }
      `}</style>
    </>
  );
}
