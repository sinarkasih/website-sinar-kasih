import Link from "next/link";
import { getSupabase } from "@/lib/supabase";

function normalizeSocialUrl(value, platform) {
  if (!value) return "";

  const text = String(value).trim();

  if (!text) return "";

  if (/^https?:\/\//i.test(text)) {
    return text;
  }

  if (platform === "instagram") {
    return `https://instagram.com/${text.replace(/^@/, "")}`;
  }

  if (platform === "tiktok") {
    return `https://tiktok.com/@${text.replace(/^@/, "")}`;
  }

  return text;
}

function normalizeWhatsApp(value) {
  if (!value) return "";

  let number = String(value).replace(/\D/g, "");

  if (number.startsWith("0")) {
    number = `62${number.slice(1)}`;
  }

  if (!number.startsWith("62")) {
    number = `62${number}`;
  }

  return number;
}

function StoreIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 10v10h16V10" />
      <path d="M3 10 5 4h14l2 6" />
      <path d="M3 10c.8 1 1.7 1.5 3 1.5S8.2 11 9 10c.8 1 1.7 1.5 3 1.5s2.2-.5 3-1.5c.8 1 1.7 1.5 3 1.5s2.2-.5 3-1.5" />
      <path d="M9 20v-5h6v5" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        stroke="none"
        d="M20.5 3.5A11.8 11.8 0 0 0 12.1 0C5.5 0 .2 5.3.2 11.9c0 2.1.5 4.1 1.6 5.9L0 24l6.4-1.7a11.9 11.9 0 0 0 5.7 1.5h.1c6.5 0 11.8-5.3 11.8-11.9 0-3.2-1.2-6.2-3.5-8.4Zm-8.4 18.1h-.1a9.8 9.8 0 0 1-5-1.4l-.4-.2-3.8 1 1-3.7-.2-.4a9.8 9.8 0 1 1 8.5 4.7Zm5.4-7.4c-.3-.2-1.7-.9-2-.9-.3-.1-.5-.2-.7.1-.2.3-.8.9-.9 1.1-.2.2-.3.2-.6.1-.3-.2-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.5-.5c.2-.2.2-.3.3-.5.1-.2.1-.4 0-.5-.1-.2-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.3 5.2 4.6.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.2-.3-.2-.6-.4Z"
      />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle
        cx="12"
        cy="12"
        r="4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
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
      <path
        fill="currentColor"
        stroke="none"
        d="M16.7 3c.2 1.8 1.2 3.2 3.1 4v3.1c-1.4 0-2.8-.4-4-1.2v6.3a5.8 5.8 0 1 1-5-5.7v3.2a2.7 2.7 0 1 0 1.9 2.5V3h4Z"
      />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M12 10.5v6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle
        cx="12"
        cy="7.2"
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
      <path
        d="M3 4h2l2.1 10.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 1.9-1.4L20 8H6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="10"
        cy="20"
        r="1.3"
        fill="currentColor"
      />
      <circle
        cx="17"
        cy="20"
        r="1.3"
        fill="currentColor"
      />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M5 12h13M13 6l6 6-6 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MenuCard({
  href,
  icon,
  title,
  description,
  external = false,
  disabled = false,
  iconClass = "",
}) {
  const content = (
    <>
      <div className={`menuIcon ${iconClass}`}>
        {icon}
      </div>

      <div className="menuText">
        <strong>{title}</strong>
        <span>{description}</span>
      </div>

      <div className="menuArrow">
        <ArrowIcon />
      </div>
    </>
  );

  if (disabled) {
    return (
      <div className="menuCard disabled">
        {content}
      </div>
    );
  }

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="menuCard"
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className="menuCard">
      {content}
    </Link>
  );
}

export default async function Page() {
  let kontak = {
    whatsapp: "",
    instagram: "",
    tiktok: "",
    email: "",
  };

  const supabase = getSupabase();

  if (supabase) {
    const { data } = await supabase
      .from("kontak_toko")
      .select("whatsapp, instagram, tiktok, email")
      .order("id", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (data) {
      kontak = {
        whatsapp: data.whatsapp || "",
        instagram: data.instagram || "",
        tiktok: data.tiktok || "",
        email: data.email || "",
      };
    }
  }

  const whatsappNumber = normalizeWhatsApp(
    kontak.whatsapp
  );

  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}`
    : "";

  const instagramUrl = normalizeSocialUrl(
    kontak.instagram,
    "instagram"
  );

  const tiktokUrl = normalizeSocialUrl(
    kontak.tiktok,
    "tiktok"
  );

  return (
    <>
      <section className="section">
        <div className="wrap lainnyaWrap">
          <div className="lainnyaHeader">
            <span className="eyebrow">
              SINAR KASIH
            </span>

            <h1>Lainnya</h1>

            <p>
              Temukan informasi, lokasi toko, dan
              layanan Toko Listrik Sinar Kasih.
            </p>
          </div>

          <div className="menuGrid">
            <MenuCard
              href="/toko"
              icon={<StoreIcon />}
              title="Toko Kami"
              description="Lihat lokasi dan informasi cabang toko"
              iconClass="storeIcon"
            />

            {whatsappUrl ? (
              <MenuCard
                href={whatsappUrl}
                external
                icon={<WhatsAppIcon />}
                title="WhatsApp"
                description="Hubungi kami untuk bertanya atau pesan"
                iconClass="whatsappIcon"
              />
            ) : (
              <MenuCard
                disabled
                icon={<WhatsAppIcon />}
                title="WhatsApp"
                description="Kontak WhatsApp belum tersedia"
                iconClass="whatsappIcon"
              />
            )}

            {instagramUrl ? (
              <MenuCard
                href={instagramUrl}
                external
                icon={<InstagramIcon />}
                title="Instagram"
                description="Ikuti informasi dan produk terbaru kami"
                iconClass="instagramIcon"
              />
            ) : (
              <MenuCard
                disabled
                icon={<InstagramIcon />}
                title="Instagram"
                description="Instagram belum tersedia"
                iconClass="instagramIcon"
              />
            )}

            {tiktokUrl ? (
              <MenuCard
                href={tiktokUrl}
                external
                icon={<TikTokIcon />}
                title="TikTok"
                description="Lihat video dan konten terbaru kami"
                iconClass="tiktokIcon"
              />
            ) : (
              <MenuCard
                disabled
                icon={<TikTokIcon />}
                title="TikTok"
                description="TikTok belum tersedia"
                iconClass="tiktokIcon"
              />
            )}

            <MenuCard
              href="/tentang-sinar-kasih"
              icon={<InfoIcon />}
              title="Tentang Sinar Kasih"
              description="Kenali Toko Listrik Sinar Kasih lebih dekat"
              iconClass="infoIcon"
            />

            <MenuCard
              href="/cara-pesan"
              icon={<CartIcon />}
              title="Cara Pesan"
              description="Panduan mudah untuk melakukan pemesanan"
              iconClass="cartIcon"
            />
          </div>
        </div>
      </section>

      <style>{`
        .lainnyaWrap {
          max-width: 1050px;
          margin: 0 auto;
        }

        .lainnyaHeader {
          text-align: center;
          margin-bottom: 34px;
        }

        .eyebrow {
          display: inline-block;
          margin-bottom: 8px;
          color: #9a806a;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.14em;
        }

        .lainnyaHeader h1 {
          margin: 0 0 8px;
          color: #3f2f24;
          font-size: 42px;
          line-height: 1.1;
        }

        .lainnyaHeader p {
          max-width: 560px;
          margin: 0 auto;
          color: #76685d;
          font-size: 15px;
          line-height: 1.6;
        }

        .menuGrid {
          display: grid;
          grid-template-columns: repeat(
            2,
            minmax(0, 1fr)
          );
          gap: 16px;
        }

        .menuCard {
          min-height: 108px;
          display: flex;
          align-items: center;
          gap: 17px;
          padding: 18px 20px;
          box-sizing: border-box;

          border: 1px solid #e3d8cc;
          border-radius: 16px;
          background: #ffffff;

          color: #3f2f24;
          text-decoration: none;

          box-shadow:
            0 5px 18px rgba(75, 51, 38, 0.055);

          transition:
            transform 0.18s ease,
            box-shadow 0.18s ease,
            border-color 0.18s ease;
        }

        .menuCard:hover {
          transform: translateY(-3px);
          border-color: #cdbba8;
          box-shadow:
            0 10px 26px rgba(75, 51, 38, 0.11);
        }

        .menuCard.disabled {
          opacity: 0.58;
          cursor: default;
        }

        .menuIcon {
          width: 54px;
          height: 54px;
          flex: 0 0 54px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 15px;
        }

        .menuIcon svg {
          width: 27px;
          height: 27px;
        }

        .storeIcon {
          background: #f2e7da;
          color: #79563b;
        }

        .whatsappIcon {
          background: #e8f5eb;
          color: #3b8c4c;
        }

        .instagramIcon {
          background: #f5e7ef;
          color: #bd4777;
        }

        .tiktokIcon {
          background: #ece9ee;
          color: #18151a;
        }

        .infoIcon {
          background: #e8eef7;
          color: #4d6f9e;
        }

        .cartIcon {
          background: #f5eee1;
          color: #8a6439;
        }

        .menuText {
          min-width: 0;
          flex: 1;
        }

        .menuText strong {
          display: block;
          margin-bottom: 5px;
          color: #3f2f24;
          font-size: 16px;
          line-height: 1.2;
        }

        .menuText span {
          display: block;
          color: #817368;
          font-size: 13px;
          line-height: 1.45;
        }

        .menuArrow {
          width: 32px;
          height: 32px;
          flex: 0 0 32px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 50%;
          background: #f7f1eb;
          color: #77563c;
        }

        .menuArrow svg {
          width: 17px;
          height: 17px;
        }

        @media (max-width: 720px) {
          .lainnyaHeader h1 {
            font-size: 34px;
          }

          .menuGrid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .menuCard {
            min-height: 96px;
            padding: 15px;
            gap: 13px;
          }

          .menuIcon {
            width: 48px;
            height: 48px;
            flex-basis: 48px;
            border-radius: 13px;
          }

          .menuIcon svg {
            width: 24px;
            height: 24px;
          }

          .menuText strong {
            font-size: 15px;
          }

          .menuText span {
            font-size: 12px;
          }

          .menuArrow {
            width: 29px;
            height: 29px;
            flex-basis: 29px;
          }
        }
      `}</style>
    </>
  );
}
