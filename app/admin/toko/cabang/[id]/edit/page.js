"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

export default function Page() {
  const params = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    nama: "",
    alamat: "",
    telepon: "",
    google_maps_url: "",
    foto: "",
    aktif: true,
    urutan: 1,
  });

  useEffect(() => {
    async function loadCabang() {
      if (!params?.id) return;

      const supabase = getSupabase();

      if (!supabase) {
        setError("Konfigurasi Supabase belum tersedia.");
        setLoading(false);
        return;
      }

      const { data, error: loadError } = await supabase
        .from("cabang_toko")
        .select(
          "id, nama, alamat, telepon, google_maps_url, foto, aktif, urutan"
        )
        .eq("id", params.id)
        .maybeSingle();

      if (loadError) {
        setError(loadError.message);
        setLoading(false);
        return;
      }

      if (!data) {
        setError("Cabang tidak ditemukan.");
        setLoading(false);
        return;
      }

      setForm({
        nama: data.nama || "",
        alamat: data.alamat || "",
        telepon: data.telepon || "",
        google_maps_url: data.google_maps_url || "",
        foto: data.foto || "",
        aktif: data.aktif !== false,
        urutan: data.urutan ?? 1,
      });

      setLoading(false);
    }

    loadCabang();
  }, [params?.id]);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function simpan(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.nama.trim()) {
      setError("Nama cabang wajib diisi.");
      return;
    }

    if (!form.alamat.trim()) {
      setError("Alamat cabang wajib diisi.");
      return;
    }

    setSaving(true);

    const supabase = getSupabase();

    if (!supabase) {
      setError("Konfigurasi Supabase belum tersedia.");
      setSaving(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("cabang_toko")
      .update({
        nama: form.nama.trim(),
        alamat: form.alamat.trim(),
        telepon: form.telepon.trim() || null,
        google_maps_url: form.google_maps_url.trim() || null,
        foto: form.foto.trim() || null,
        aktif: form.aktif,
        urutan: Number(form.urutan) || 1,
      })
      .eq("id", params.id);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    setSuccess("Data cabang berhasil disimpan.");

    setTimeout(() => {
      router.push("/admin/toko");
    }, 600);
  }

  if (loading) {
    return (
      <section className="dash page">
        <h1>Edit Cabang</h1>
        <p>Memuat data cabang...</p>
      </section>
    );
  }

  return (
    <section className="dash page">
      <div className="page-head">
        <div>
          <h1>Edit Cabang</h1>
          <p>Ubah informasi cabang toko.</p>
        </div>

        <button
          type="button"
          className="btn secondary"
          onClick={() => router.push("/admin/toko")}
        >
          ← Kembali
        </button>
      </div>

      {error && <div className="error-box">{error}</div>}

      {success && (
        <div className="success-box">{success}</div>
      )}

      <form onSubmit={simpan} className="form-card">
        <div className="form-grid">
          <div className="field">
            <label>Nama Cabang *</label>

            <input
              name="nama"
              value={form.nama}
              onChange={handleChange}
              placeholder="Nama cabang"
            />
          </div>

          <div className="field">
            <label>Nomor Telepon</label>

            <input
              name="telepon"
              value={form.telepon}
              onChange={handleChange}
              placeholder="08xxxxxxxxxx"
            />
          </div>

          <div className="field full">
            <label>Alamat *</label>

            <textarea
              name="alamat"
              value={form.alamat}
              onChange={handleChange}
              rows="4"
              placeholder="Alamat lengkap cabang"
            />
          </div>

          <div className="field full">
            <label>Google Maps</label>

            <input
              name="google_maps_url"
              value={form.google_maps_url}
              onChange={handleChange}
              placeholder="https://maps.google.com/..."
            />

            <small>
              Masukkan link Google Maps cabang.
            </small>
          </div>

          <div className="field full">
            <label>URL Foto Cabang</label>

            <input
              name="foto"
              value={form.foto}
              onChange={handleChange}
              placeholder="https://..."
            />

            <small>
              Untuk sementara menggunakan URL foto.
            </small>
          </div>

          <div className="field">
            <label>Urutan Tampilan</label>

            <input
              type="number"
              name="urutan"
              min="1"
              value={form.urutan}
              onChange={handleChange}
            />
          </div>

          <div className="field">
            <label>Status</label>

            <label className="check-row">
              <input
                type="checkbox"
                name="aktif"
                checked={form.aktif}
                onChange={handleChange}
              />

              <span>Cabang Aktif</span>
            </label>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn secondary"
            onClick={() => router.push("/admin/toko")}
            disabled={saving}
          >
            Batal
          </button>

          <button
            type="submit"
            className="btn primary"
            disabled={saving}
          >
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </form>

      <style jsx>{`
        .page {
          width: 100%;
          max-width: none;
          box-sizing: border-box;
        }

        .page-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 24px;
        }

        .page-head h1 {
          margin: 0 0 6px;
          font-size: 34px;
          color: #3d2b20;
        }

        .page-head p {
          margin: 0;
          color: #766d65;
        }

        .form-card {
          width: 100%;
          background: #fff;
          border: 1px solid #e2d9cf;
          border-radius: 14px;
          padding: 26px;
          box-sizing: border-box;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 20px;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .field.full {
          grid-column: 1 / -1;
        }

        .field label {
          font-weight: 700;
          color: #3d2b20;
        }

        .field small {
          color: #766d65;
          font-size: 12px;
        }

        .field input,
        .field textarea {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid #d8ccc0;
          border-radius: 9px;
          padding: 12px 13px;
          font-size: 14px;
          background: #fff;
          color: #3d2b20;
          font-family: inherit;
        }

        .field textarea {
          resize: vertical;
        }

        .field input:focus,
        .field textarea:focus {
          outline: none;
          border-color: #8a654a;
        }

        .check-row {
          display: flex !important;
          flex-direction: row !important;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          font-weight: 400 !important;
          padding-top: 8px;
        }

        .check-row input {
          width: 18px;
          height: 18px;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 28px;
          padding-top: 20px;
          border-top: 1px solid #eee7df;
        }

        .btn {
          border-radius: 9px;
          padding: 11px 16px;
          font-weight: 700;
          cursor: pointer;
          font-size: 14px;
          border: 1px solid transparent;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn.primary {
          background: #765238;
          color: #fff;
        }

        .btn.secondary {
          background: #fff;
          color: #6f4f39;
          border-color: #d9cbbd;
        }

        .error-box,
        .success-box {
          padding: 14px 16px;
          border-radius: 9px;
          margin-bottom: 18px;
        }

        .error-box {
          background: #fde9e7;
          color: #9b332a;
          border: 1px solid #efc8c3;
        }

        .success-box {
          background: #e6f5ea;
          color: #277442;
          border: 1px solid #b9dfc2;
        }

        @media (max-width: 700px) {
          .page-head {
            flex-direction: column;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .field.full {
            grid-column: auto;
          }

          .form-actions {
            justify-content: stretch;
          }

          .form-actions .btn {
            flex: 1;
          }
        }
      `}</style>
    </section>
  );
}
