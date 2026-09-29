"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";

function normalizeSocialUrl(value, platform) {
  const text = (value || "").trim();

  if (!text) return "";

  if (/^https?:\/\//i.test(text)) {
    return text;
  }

  const username = text
    .replace(/^@/, "")
    .replace(/^\/+/, "")
    .trim();

  if (!username) return "";

  if (platform === "instagram") {
    return `https://instagram.com/${username}`;
  }

  if (platform === "tiktok") {
    return `https://www.tiktok.com/@${username}`;
  }

  return text;
}

export default function KontakTokoPage() {
  const router = useRouter();

  const [data, setData] = useState({
    id: null,
    whatsapp: "",
    instagram: "",
    tiktok: "",
    email: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadKontak();
  }, []);

  async function loadKontak() {
    setLoading(true);
    setError("");
    setMessage("");

    const supabase = getSupabase();

    if (!supabase) {
      setError("Koneksi Supabase belum tersedia.");
      setLoading(false);
      return;
    }

    const { data: kontak, error: kontakError } = await supabase
      .from("kontak_toko")
      .select("id, whatsapp, instagram, tiktok, email")
      .order("id", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (kontakError) {
      console.error(kontakError);
      setError(`Gagal mengambil data kontak: ${kontakError.message}`);
      setLoading(false);
      return;
    }

    if (!kontak) {
      setError("Data kontak toko belum tersedia di database.");
      setLoading(false);
      return;
    }

    setData({
      id: kontak.id,
      whatsapp: kontak.whatsapp || "",
      instagram: normalizeSocialUrl(
        kontak.instagram || "",
        "instagram"
      ),
      tiktok: normalizeSocialUrl(
        kontak.tiktok || "",
        "tiktok"
      ),
      email: kontak.email || "",
    });

    setLoading(false);
  }

  function handleChange(e) {
    const { name, value } = e.target;

    setData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSave(e) {
    e.preventDefault();

    if (!data.id) {
      setError("Data kontak toko tidak ditemukan.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    const supabase = getSupabase();

    if (!supabase) {
      setError("Koneksi Supabase belum tersedia.");
      setSaving(false);
      return;
    }

    const instagramUrl = normalizeSocialUrl(
      data.instagram,
      "instagram"
    );

    const tiktokUrl = normalizeSocialUrl(
      data.tiktok,
      "tiktok"
    );

    const { error: updateError } = await supabase
      .from("kontak_toko")
      .update({
        whatsapp: data.whatsapp.trim() || null,
        instagram: instagramUrl || null,
        tiktok: tiktokUrl || null,
        email: data.email.trim() || null,
      })
      .eq("id", data.id);

    if (updateError) {
      console.error(updateError);
      setError(
        `Gagal menyimpan perubahan: ${updateError.message}`
      );
      setSaving(false);
      return;
    }

    setData((current) => ({
      ...current,
      instagram: instagramUrl,
      tiktok: tiktokUrl,
    }));

    setMessage("Informasi toko & kontak berhasil disimpan.");

    /*
     * Setelah berhasil disimpan,
     * otomatis kembali ke halaman Toko & Kontak.
     */
    setTimeout(() => {
      router.push("/admin/toko");
    }, 700);
  }

  const backButtonStyle = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "42px",
    padding: "0 16px",
    borderRadius: "8px",
    background: "#ffffff",
    border: "1px solid #d7c8b8",
    color: "#4b3326",
    textDecoration: "none",
    fontWeight: 700,
    whiteSpace: "nowrap",
    cursor: "pointer",
    boxSizing: "border-box",
  };

  const socialLinkStyle = {
    display: "inline-block",
    marginTop: "8px",
    color: "#765239",
    fontSize: "13px",
    fontWeight: 700,
    textDecoration: "underline",
    wordBreak: "break-all",
  };

  if (loading) {
    return (
      <div className="admin">
        <div className="adminhead">
          SINAR KASIH — ADMIN PANEL
        </div>

        <div className="adminlayout">
          <aside className="side">
            <Link href="/admin">Dashboard</Link>
            <Link href="/admin/produk">Produk</Link>
            <Link href="/admin/pesanan">Pesanan</Link>
            <Link href="/admin/pesanan/trash">
              Trash Pesanan
            </Link>
            <Link href="/admin/tampilan">
              Tampilan Website
            </Link>
            <Link href="/admin/toko">
              Toko & Kontak
            </Link>
            <Link href="/admin/pelanggan">
              Pelanggan
            </Link>
            <Link href="/admin/statistik">
              Statistik
            </Link>
            <Link href="/admin/pengaturan">
              Pengaturan
            </Link>
          </aside>

          <main className="dash">
            <div className="page">
              <div className="loading">
                Memuat informasi toko...
              </div>
            </div>
          </main>
        </div>

        <style jsx>{`
          .admin {
            min-height: 100vh;
            background: #f5f0e8;
            color: #3f2f24;
          }

          .adminhead {
            padding: 18px 28px;
            background: #4b3326;
            color: #fff;
            font-size: 20px;
            font-weight: 700;
          }

          .adminlayout {
            display: flex;
            min-height: calc(100vh - 64px);
          }

          .side {
            width: 240px;
            flex-shrink: 0;
            background: #fffaf3;
            border-right: 1px solid #dfd2c3;
            padding: 20px 14px;
          }

          .side a {
            display: block;
            padding: 12px 14px;
            margin-bottom: 5px;
            border-radius: 8px;
            color: #4b3326;
            text-decoration: none;
            font-weight: 600;
          }

          .side a:hover {
            background: #eadcca;
          }

          .dash {
            flex: 1;
            min-width: 0;
            padding: 28px;
          }

          .page {
            width: 100%;
          }

          .loading {
            background: #fff;
            border: 1px solid #dfd2c3;
            border-radius: 12px;
            padding: 30px;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="admin">
      <div className="adminhead">
        SINAR KASIH — ADMIN PANEL
      </div>

      <div className="adminlayout">
        <aside className="side">
          <Link href="/admin">Dashboard</Link>
          <Link href="/admin/produk">Produk</Link>
          <Link href="/admin/pesanan">Pesanan</Link>
          <Link href="/admin/pesanan/trash">
            Trash Pesanan
          </Link>
          <Link href="/admin/tampilan">
            Tampilan Website
          </Link>
          <Link href="/admin/toko">
            Toko & Kontak
          </Link>
          <Link href="/admin/pelanggan">
            Pelanggan
          </Link>
          <Link href="/admin/statistik">
            Statistik
          </Link>
          <Link href="/admin/pengaturan">
            Pengaturan
          </Link>
        </aside>

        <main className="dash">
          <div className="page">

            <div className="topbar">
              <div>
                <h1>Informasi Toko & Kontak</h1>

                <p>
                  Kelola kontak utama yang digunakan oleh
                  website Sinar Kasih.
                </p>
              </div>

              {/* TOMBOL KEMBALI */}
              <Link
                href="/admin/toko"
                style={backButtonStyle}
              >
                ← Kembali ke Toko & Kontak
              </Link>
            </div>

            {message && (
              <div className="success">
                {message}
              </div>
            )}

            {error && (
              <div className="error">
                {error}
              </div>
            )}

            <form
              onSubmit={handleSave}
              className="card"
            >
              <div className="cardTitle">
                Kontak Utama Toko
              </div>

              <div className="grid">

                {/* WHATSAPP */}
                <div className="field">
                  <label htmlFor="whatsapp">
                    WhatsApp
                  </label>

                  <input
                    id="whatsapp"
                    name="whatsapp"
                    type="text"
                    value={data.whatsapp}
                    onChange={handleChange}
                    placeholder="Contoh: 081285750033"
                  />

                  <small>
                    Nomor WhatsApp utama yang digunakan
                    pelanggan saat checkout.
                  </small>
                </div>

                {/* EMAIL */}
                <div className="field">
                  <label htmlFor="email">
                    Email
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={data.email}
                    onChange={handleChange}
                    placeholder="Contoh: toko@email.com"
                  />
                </div>

                {/* INSTAGRAM */}
                <div className="field">
                  <label htmlFor="instagram">
                    Instagram
                  </label>

                  <input
                    id="instagram"
                    name="instagram"
                    type="url"
                    value={data.instagram}
                    onChange={handleChange}
                    placeholder="https://instagram.com/sinarkasih"
                  />

                  {data.instagram && (
                    <a
                      href={normalizeSocialUrl(
                        data.instagram,
                        "instagram"
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={socialLinkStyle}
                    >
                      🔗 Buka Instagram
                    </a>
                  )}

                  <small>
                    Masukkan URL Instagram, misalnya:
                    https://instagram.com/sinarkasih
                  </small>
                </div>

                {/* TIKTOK */}
                <div className="field">
                  <label htmlFor="tiktok">
                    TikTok
                  </label>

                  <input
                    id="tiktok"
                    name="tiktok"
                    type="url"
                    value={data.tiktok}
                    onChange={handleChange}
                    placeholder="https://tiktok.com/@sinarkasih"
                  />

                  {data.tiktok && (
                    <a
                      href={normalizeSocialUrl(
                        data.tiktok,
                        "tiktok"
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={socialLinkStyle}
                    >
                      🔗 Buka TikTok
                    </a>
                  )}

                  <small>
                    Masukkan URL TikTok, misalnya:
                    https://tiktok.com/@sinarkasih
                  </small>
                </div>

              </div>

              <div className="actions">

                {/* BATAL SEKARANG BERUPA TOMBOL */}
                <Link
                  href="/admin/toko"
                  className="cancelButton"
                >
                  Batal
                </Link>

                <button
                  type="submit"
                  disabled={saving}
                >
                  {saving
                    ? "Menyimpan..."
                    : "Simpan Perubahan"}
                </button>

              </div>
            </form>
          </div>
        </main>
      </div>

      <style jsx>{`
        .admin {
          min-height: 100vh;
          background: #f5f0e8;
          color: #3f2f24;
        }

        .adminhead {
          padding: 18px 28px;
          background: #4b3326;
          color: #fff;
          font-size: 20px;
          font-weight: 700;
        }

        .adminlayout {
          display: flex;
          min-height: calc(100vh - 64px);
        }

        .side {
          width: 240px;
          flex-shrink: 0;
          background: #fffaf3;
          border-right: 1px solid #dfd2c3;
          padding: 20px 14px;
        }

        .side a {
          display: block;
          padding: 12px 14px;
          margin-bottom: 5px;
          border-radius: 8px;
          color: #4b3326;
          text-decoration: none;
          font-weight: 600;
        }

        .side a:hover {
          background: #eadcca;
        }

        .dash {
          flex: 1;
          min-width: 0;
          padding: 28px;
        }

        .page {
          width: 100%;
        }

        .topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 24px;
        }

        h1 {
          margin: 0 0 7px;
          font-size: 28px;
        }

        .topbar p {
          margin: 0;
          color: #76685d;
        }

        .success {
          margin-bottom: 18px;
          padding: 14px 16px;
          background: #e9f6eb;
          border: 1px solid #b9dfbe;
          color: #256b30;
          border-radius: 9px;
          font-weight: 600;
        }

        .error {
          margin-bottom: 18px;
          padding: 14px 16px;
          background: #fff0f0;
          border: 1px solid #e4bcbc;
          color: #9b2929;
          border-radius: 9px;
          font-weight: 600;
        }

        .card {
          width: 100%;
          background: #fff;
          border: 1px solid #dfd2c3;
          border-radius: 12px;
          padding: 28px;
          box-sizing: border-box;
        }

        .cardTitle {
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 24px;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(
            2,
            minmax(0, 1fr)
          );
          gap: 22px 24px;
        }

        .field {
          display: flex;
          flex-direction: column;
        }

        label {
          font-weight: 700;
          margin-bottom: 8px;
        }

        input {
          width: 100%;
          box-sizing: border-box;
          padding: 13px 14px;
          border: 1px solid #cfc1b1;
          border-radius: 8px;
          background: #fff;
          color: #3f2f24;
          font-size: 15px;
          outline: none;
        }

        input:focus {
          border-color: #9b7656;
          box-shadow:
            0 0 0 3px
            rgba(155, 118, 86, 0.12);
        }

        small {
          margin-top: 7px;
          color: #81756c;
          line-height: 1.4;
        }

        .actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 30px;
          padding-top: 22px;
          border-top: 1px solid #eee5dc;
        }

        .cancelButton,
        button {
          min-width: 150px;
          min-height: 42px;
          padding: 0 18px;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          text-align: center;
          text-decoration: none;
          box-sizing: border-box;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .cancelButton {
          background: #fff;
          border: 1px solid #cfc1b1;
          color: #4b3326;
        }

        .cancelButton:hover {
          background: #f3eadf;
        }

        button {
          border: none;
          background: #4b3326;
          color: #fff;
        }

        button:hover:not(:disabled) {
          background: #39251b;
        }

        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 800px) {
          .adminlayout {
            display: block;
          }

          .side {
            width: auto;
            border-right: none;
            border-bottom: 1px solid #dfd2c3;
          }

          .dash {
            padding: 20px;
          }

          .topbar {
            align-items: flex-start;
            flex-direction: column;
          }

          .topbar > a {
            width: 100%;
            box-sizing: border-box;
          }

          .grid {
            grid-template-columns: 1fr;
          }

          .actions {
            flex-direction: column;
          }

          .cancelButton,
          button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
