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

  let number = String(value).trim();

  if (!number) return "";

  number = number.replace(/\D/g, "");

  if (number.startsWith("0")) {
    number = `62${number.slice(1)}`;
  }

  if (!number.startsWith("62")) {
    number = `62${number}`;
  }

  return number;
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

  const whatsappNumber = normalizeWhatsApp(kontak.whatsapp);

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

  const emailUrl = kontak.email
    ? `mailto:${kontak.email.trim()}`
    : "";

  return (
    <section className="section">
      <div className="wrap">
        <h1>Lainnya</h1>

        <div className="list">
          <Link href="/toko">
            Toko Kami →
          </Link>

          {whatsappUrl ? (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Hubungi Kami via WhatsApp →
            </a>
          ) : (
            <span>
              WhatsApp belum tersedia
            </span>
          )}

          {instagramUrl ? (
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram →
            </a>
          ) : (
            <span>
              Instagram belum tersedia
            </span>
          )}

          {tiktokUrl ? (
            <a
              href={tiktokUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              TikTok →
            </a>
          ) : (
            <span>
              TikTok belum tersedia
            </span>
          )}

          {emailUrl ? (
            <a href={emailUrl}>
              Email →
            </a>
          ) : null}

          <Link href="/tentang-sinar-kasih">
            Tentang Sinar Kasih →
          </Link>

          <Link href="/cara-pesan">
            Cara Pesan →
          </Link>
        </div>
      </div>
    </section>
  );
}
