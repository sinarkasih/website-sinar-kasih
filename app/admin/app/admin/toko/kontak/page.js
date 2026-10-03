"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

export default function InformasiTokoKontakPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    whatsapp: "",
    email: "",
    instagram: "",
    tiktok: "",
  });

  useEffect(() => {
    loadKontak();
  }, []);

  async function loadKontak() {
    setLoading(true);
    setError("");

    const supabase = getSupabase();

    if (!supabase) {
      setError("Koneksi Supabase belum tersedia.");
      setLoading(false);
      return;
    }

    const { data, error: loadError } = await supabase
      .from("kontak_toko")
      .select("whatsapp, email, instagram, tiktok")
      .limit(1)
      .maybeSingle();

    if (loadError) {
      console.error(loadError);
      setError(
        "Gagal mengambil informasi kontak: " +
          loadError.message
      );
      setLoading(false);
      return;
    }

    setForm({
      whatsapp: data?.whatsapp || "",
      email: data?.email || "",
      instagram: data?.instagram || "",
      tiktok: data?.tiktok || "",
    });

    setLoading(false);
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function normalizeInstagram(value) {
    const text = String(value || "").trim();

    if (!text) return "";

    if (/^https?:\/\//i.test(text)) {
      return text;
    }

    if (text.startsWith("@")) {
      return `https://www.instagram.com/${text.slice(1)}/`;
    }

    return `https://www.instagram.com/${text}/`;
  }

  function normalizeTikTok(value) {
    const text = String(value || "").trim();

    if (!text) return "";

    if (/^https?:\/\//i.test(text)) {
      return text;
    }

    if (text.startsWith("@")) {
      return `https://www.tiktok.com/${text}`;
    }

    return `https://www.tiktok.com/@${text}`;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    const supabase = getSupabase();

    if (!supabase) {
      setError("Koneksi Supabase belum tersedia.");
      setSaving(false);
      return;
    }

    const payload = {
      whatsapp: form.whatsapp.trim() || null,
      email: form.email.trim() || null,
      instagram: normalizeInstagram(form.instagram),
      tiktok: normalizeTikTok(form.tiktok),
    };

    const { data: existing, error: existingError } =
      await supabase
        .from("kontak_toko")
        .select("id")
        .limit(1)
        .maybeSingle();

    if (existingError) {
      console.error(existingError);
      setError(
        "Gagal memeriksa data kontak: " +
          existingError.message
      );
      setSaving(false);
      return;
    }

    let saveError = null;

    if (existing?.id) {
      const result = await supabase
        .from("kontak_toko")
        .update(payload)
        .eq("id", existing.id);

      saveError = result.error;
    } else {
      const result = await supabase
        .from("kontak_toko")
        .insert(payload);

      saveError = result.error;
    }

    if (saveError) {
      console.error(saveError);
      setError(
        "Gagal menyimpan informasi kontak: " +
          saveError.message
      );
      setSaving(false);
      return;
    }

    setSuccess(
      "Informasi Toko & Kontak berhasil disimpan."
    );

    setTimeout(() => {
      router.push("/admin/toko");
    }, 700);
  }

  if (loading) {
    return (
      <main style={styles.page}>
        <div style={styles.loadingBox}>
          Memuat informasi Toko & Kontak...
        </div>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <div className="ko-header" style={styles.header}>
          <div>
            <h1 style={styles.title}>
              Informasi Toko & Kontak
            </h1>

            <p style={styles.subtitle}>
              Kelola kontak utama yang digunakan oleh
              website Sinar Kasih.
            </p>
          </div>

          <Link
            href="/admin/toko"
            style={styles.backButton}
          >
            ← Kembali ke Toko & Kontak
          </Link>
        </div>

        {error && (
          <div
            style={styles.errorBox}
            role="alert"
            aria-live="assertive"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            style={styles.successBox}
            role="status"
            aria-live="polite"
          >
            ✓ {success}
          </div>
        )}

        <section style={styles.card}>
          <div className="ko-cardHeader" style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>
              Kontak Utama Toko
            </h2>

            <p style={styles.cardDescription}>
              Informasi berikut digunakan pelanggan untuk
              menghubungi Toko Listrik Sinar Kasih.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="ko-grid" style={styles.grid}>
              <div style={styles.field}>
                <label
                  htmlFor="whatsapp"
                  style={styles.label}
                >
                  WhatsApp
                </label>

                <input
                  id="whatsapp"
                  name="whatsapp"
                  type="text"
                  value={form.whatsapp}
                  onChange={handleChange}
                  placeholder="Contoh: 081285750033"
                  style={styles.input}
                />

                <small style={styles.help}>
                  Nomor WhatsApp utama yang digunakan
                  pelanggan saat checkout.
                </small>
              </div>

              <div style={styles.field}>
                <label
                  htmlFor="email"
                  style={styles.label}
                >
                  Email
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Contoh: toko@email.com"
                  style={styles.input}
                />

                <small style={styles.help}>
                  Email resmi yang dapat digunakan
                  pelanggan untuk menghubungi toko.
                </small>
              </div>

              <div style={styles.field}>
                <label
                  htmlFor="instagram"
                  style={styles.label}
                >
                  Instagram
                </label>

                <input
                  id="instagram"
                  name="instagram"
                  type="text"
                  value={form.instagram}
                  onChange={handleChange}
                  placeholder="https://instagram.com/sinarkasih"
                  style={styles.input}
                />

                {form.instagram && (
                  <a
                    href={normalizeInstagram(
                      form.instagram
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.socialLink}
                  >
                    🔗 Buka Instagram
                  </a>
                )}

                <small style={styles.help}>
                  Masukkan URL Instagram, misalnya:
                  https://instagram.com/sinarkasih
                </small>
              </div>

              <div style={styles.field}>
                <label
                  htmlFor="tiktok"
                  style={styles.label}
                >
                  TikTok
                </label>

                <input
                  id="tiktok"
                  name="tiktok"
                  type="text"
                  value={form.tiktok}
                  onChange={handleChange}
                  placeholder="https://tiktok.com/@sinarkasih"
                  style={styles.input}
                />

                {form.tiktok && (
                  <a
                    href={normalizeTikTok(form.tiktok)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.socialLink}
                  >
                    🔗 Buka TikTok
                  </a>
                )}

                <small style={styles.help}>
                  Masukkan URL TikTok, misalnya:
                  https://tiktok.com/@sinarkasih
                </small>
              </div>
            </div>

            <div className="ko-divider" style={styles.divider} />

            <div className="ko-actionRow" style={styles.actionRow}>
              <Link
                href="/admin/toko"
                style={styles.cancelButton}
              >
                Batal
              </Link>

              <button
                type="submit"
                disabled={saving}
                style={{
                  ...styles.saveButton,
                  ...(saving
                    ? styles.saveButtonDisabled
                    : {}),
                }}
              >
                {saving
                  ? "Menyimpan..."
                  : "Simpan Informasi Kontak"}
              </button>
            </div>
          </form>
        </section>
      </div>
      <style>{`
        /* Tampilan HP untuk Kontak */
        @media (max-width: 760px) {
          .ko-header { flex-direction: column !important; gap: 12px !important; }
          .ko-cardHeader { padding: 20px 18px 14px !important; }
          .ko-grid { grid-template-columns: 1fr !important; gap: 18px !important; padding: 4px 18px 20px !important; }
          .ko-divider { margin: 0 18px !important; }
          .ko-actionRow { flex-wrap: wrap; padding: 18px !important; }
          .ko-actionRow > * { flex: 1 1 auto; }
        }
      `}</style>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f6efe6",
    padding: "28px",
    boxSizing: "border-box",
  },

  container: {
    width: "100%",
    maxWidth: "1180px",
    margin: "0 auto",
  },

  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "24px",
    marginBottom: "24px",
  },

  title: {
    margin: 0,
    color: "#3f2f24",
    fontSize: "32px",
    lineHeight: 1.2,
    fontWeight: 700,
  },

  subtitle: {
    margin: "8px 0 0",
    color: "#7d6957",
    fontSize: "16px",
    lineHeight: 1.5,
  },

  backButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "48px",
    padding: "0 20px",
    border: "1px solid #e0cfbb",
    borderRadius: "10px",
    background: "#ffffff",
    color: "#4b3326",
    textDecoration: "none",
    fontSize: "16px",
    fontWeight: 600,
    whiteSpace: "nowrap",
    boxSizing: "border-box",
  },

  loadingBox: {
    maxWidth: "700px",
    margin: "60px auto",
    padding: "30px",
    borderRadius: "14px",
    background: "#ffffff",
    border: "1px solid #eadfce",
    color: "#6d5a50",
    textAlign: "center",
    fontSize: "16px",
  },

  errorBox: {
    marginBottom: "18px",
    padding: "14px 16px",
    borderRadius: "10px",
    border: "1px solid #e8b7b7",
    background: "#fff1f1",
    color: "#a33b3b",
    fontSize: "15px",
    lineHeight: 1.5,
  },

  successBox: {
    marginBottom: "18px",
    padding: "14px 16px",
    borderRadius: "10px",
    border: "1px solid #b8d9c2",
    background: "#effaf2",
    color: "#28633a",
    fontSize: "15px",
    lineHeight: 1.5,
  },

  card: {
    background: "#ffffff",
    border: "1px solid #eadfce",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 5px 18px rgba(76, 50, 35, 0.05)",
  },

  cardHeader: {
    padding: "30px 34px 22px",
  },

  cardTitle: {
    margin: 0,
    color: "#3f2f24",
    fontSize: "25px",
    lineHeight: 1.3,
    fontWeight: 700,
  },

  cardDescription: {
    margin: "7px 0 0",
    color: "#7d6957",
    fontSize: "15px",
    lineHeight: 1.5,
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "24px 28px",
    padding: "4px 34px 30px",
  },

  field: {
    minWidth: 0,
  },

  label: {
    display: "block",
    marginBottom: "9px",
    color: "#3f2f24",
    fontSize: "16px",
    lineHeight: 1.3,
    fontWeight: 700,
  },

  input: {
    width: "100%",
    height: "56px",
    padding: "0 16px",
    boxSizing: "border-box",
    border: "1px solid #e0cfbb",
    borderRadius: "10px",
    background: "#ffffff",
    color: "#3f2f24",
    fontSize: "16px",
    outline: "none",
  },

  help: {
    display: "block",
    marginTop: "8px",
    color: "#9a8571",
    fontSize: "14px",
    lineHeight: 1.5,
  },

  socialLink: {
    display: "inline-block",
    marginTop: "9px",
    color: "#6f4c36",
    fontSize: "14px",
    fontWeight: 600,
    textDecoration: "none",
  },

  divider: {
    height: "1px",
    margin: "0 34px",
    background: "#f0e7db",
  },

  actionRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: "12px",
    padding: "22px 34px 28px",
  },

  cancelButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "46px",
    padding: "0 20px",
    border: "1px solid #e0cfbb",
    borderRadius: "9px",
    background: "#ffffff",
    color: "#4b3326",
    textDecoration: "none",
    fontSize: "15px",
    fontWeight: 600,
    boxSizing: "border-box",
  },

  saveButton: {
    minHeight: "46px",
    padding: "0 22px",
    border: "1px solid #6f4c36",
    borderRadius: "9px",
    background: "#6f4c36",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
  },

  saveButtonDisabled: {
    opacity: 0.65,
    cursor: "not-allowed",
  },
};
