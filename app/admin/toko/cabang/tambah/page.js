"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { kompresGambar } from "@/lib/kompresGambar";

export default function Page() {
  const router = useRouter();

  const [form, setForm] = useState({
    nama: "",
    alamat: "",
    telepon: "",
    google_maps_url: "",
    google_review_url: "",
    foto: "",
    aktif: true,
    urutan: 1,
  });

  const [fotoFile, setFotoFile] = useState(null);
  const [fotoPreview, setFotoPreview] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleFotoChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("File yang dipilih harus berupa gambar.");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setError("Ukuran foto maksimal 15 MB.");
      return;
    }

    setError("");
    setFotoFile(file);

    const previewUrl = URL.createObjectURL(file);
    setFotoPreview(previewUrl);
  }

  async function simpan(event) {
    event.preventDefault();

    setError("");

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

    let fotoUrl = null;

    try {
      const { data: cabang, error: insertError } = await supabase
        .from("cabang_toko")
        .insert({
          nama: form.nama.trim(),
          alamat: form.alamat.trim(),
          telepon: form.telepon.trim() || null,
          google_maps_url: form.google_maps_url.trim() || null,
          google_review_url: form.google_review_url.trim() || null,
          foto: null,
          aktif: form.aktif,
          urutan: Number(form.urutan) || 1,
        })
        .select("id")
        .single();

      if (insertError) {
        throw insertError;
      }

      if (fotoFile) {
        // Foto dikecilkan otomatis sebelum di-upload
        const fotoKecil = await kompresGambar(fotoFile);
        const extension =
          fotoKecil.name.split(".").pop()?.toLowerCase() || "jpg";

        const filePath = `cabang/${cabang.id}/utama-${Date.now()}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from("cabang-toko")
          .upload(filePath, fotoKecil, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          await supabase
            .from("cabang_toko")
            .delete()
            .eq("id", cabang.id);

          throw uploadError;
        }

        const {
          data: { publicUrl },
        } = supabase.storage
          .from("cabang-toko")
          .getPublicUrl(filePath);

        const { error: updateError } = await supabase
          .from("cabang_toko")
          .update({
            foto: publicUrl,
          })
          .eq("id", cabang.id);

        if (updateError) {
          throw updateError;
        }
      }

      router.push("/admin/toko");
    } catch (err) {
      console.error(err);
      setError(err.message || "Gagal menyimpan cabang.");
      setSaving(false);
    }
  }

  return (
    <section className="dash page">
      <div className="page-head">
        <div>
          <h1>Tambah Cabang</h1>
          <p>Tambahkan cabang toko baru.</p>
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

      <form onSubmit={simpan} className="form-card">
        <div className="form-grid">
          <div className="field">
            <label>Nama Cabang *</label>

            <input
              name="nama"
              value={form.nama}
              onChange={handleChange}
              placeholder="Contoh: Sinar Kasih Kota"
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
              Link lokasi cabang di Google Maps.
            </small>
          </div>

          <div className="field full">
            <label>Google Review</label>

            <input
              name="google_review_url"
              value={form.google_review_url}
              onChange={handleChange}
              placeholder="https://g.page/r/..."
            />

            <small>
              Link langsung untuk pelanggan memberikan ulasan Google.
            </small>
          </div>

          <div className="field full">
            <label>Foto Cabang</label>

            <input
              type="file"
              accept="image/*"
              onChange={handleFotoChange}
            />

            <small>
              Pilih foto cabang. Maksimal 15 MB.
            </small>

            {fotoPreview && (
              <div className="preview">
                <img src={fotoPreview} alt="Preview foto cabang" />
              </div>
            )}
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
            {saving ? "Menyimpan..." : "Simpan Cabang"}
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

        .preview {
          margin-top: 10px;
          width: 280px;
          height: 180px;
          border: 1px solid #ddd0c3;
          border-radius: 10px;
          overflow: hidden;
          background: #f5f0e8;
        }

        .preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
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

        .error-box {
          padding: 14px 16px;
          border-radius: 9px;
          background: #fde9e7;
          color: #9b332a;
          border: 1px solid #efc8c3;
          margin-bottom: 18px;
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
