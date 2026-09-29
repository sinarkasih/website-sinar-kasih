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
    email: "",
    telepon: "",
    tipe: "guest",
    alamat: "",
    aktif: true,
  });

  useEffect(() => {
    async function loadPelanggan() {
      if (!params?.id) return;

      const supabase = getSupabase();

      if (!supabase) {
        setError("Konfigurasi Supabase belum tersedia.");
        setLoading(false);
        return;
      }

      const { data, error: loadError } = await supabase
        .from("pelanggan")
        .select(
          "id, nama, email, telepon, tipe, alamat, aktif"
        )
        .eq("id", params.id)
        .maybeSingle();

      if (loadError) {
        setError(loadError.message);
        setLoading(false);
        return;
      }

      if (!data) {
        setError("Pelanggan tidak ditemukan.");
        setLoading(false);
        return;
      }

      setForm({
        nama: data.nama || "",
        email: data.email || "",
        telepon: data.telepon || "",
        tipe: data.tipe || "guest",
        alamat: data.alamat || "",
        aktif: data.aktif !== false,
      });

      setLoading(false);
    }

    loadPelanggan();
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
      setError("Nama pelanggan wajib diisi.");
      return;
    }

    if (!form.telepon.trim()) {
      setError("Nomor WhatsApp / telepon wajib diisi.");
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
      .from("pelanggan")
      .update({
        nama: form.nama.trim(),
        email: form.email.trim() || null,
        telepon: form.telepon.trim(),
        tipe: form.tipe,
        alamat: form.alamat.trim() || null,
        aktif: form.aktif,
      })
      .eq("id", params.id);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    setSuccess("Data pelanggan berhasil disimpan.");

    setTimeout(() => {
      router.push(`/admin/pelanggan/${params.id}`);
    }, 500);
  }

  async function ubahStatus() {
    const statusBaru = !form.aktif;

    const yakin = window.confirm(
      statusBaru
        ? "Aktifkan pelanggan ini kembali?"
        : "Nonaktifkan pelanggan ini?"
    );

    if (!yakin) return;

    setError("");
    setSuccess("");
    setSaving(true);

    const supabase = getSupabase();

    if (!supabase) {
      setError("Konfigurasi Supabase belum tersedia.");
      setSaving(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("pelanggan")
      .update({
        aktif: statusBaru,
      })
      .eq("id", params.id);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    setForm((current) => ({
      ...current,
      aktif: statusBaru,
    }));

    setSaving(false);

    setSuccess(
      statusBaru
        ? "Pelanggan berhasil diaktifkan."
        : "Pelanggan berhasil dinonaktifkan."
    );

    setTimeout(() => {
      router.push(`/admin/pelanggan/${params.id}`);
    }, 700);
  }

  if (loading) {
    return (
      <section className="dash page">
        <h1>Edit Pelanggan</h1>
        <p>Memuat data pelanggan...</p>
      </section>
    );
  }

  return (
    <section className="dash page">
      <div className="page-head">
        <div>
          <h1>Edit Pelanggan</h1>
          <p>Ubah informasi pelanggan.</p>
        </div>

        <button
          type="button"
          className="btn secondary"
          onClick={() => router.push(`/admin/pelanggan/${params.id}`)}
        >
          ← Kembali
        </button>
      </div>

      {error && <div className="message error">{error}</div>}

      {success && (
        <div className="message success">{success}</div>
      )}

      <form onSubmit={simpan} className="form-card">
        <div className="form-grid">
          <div className="field">
            <label>Nama Pelanggan *</label>
            <input
              name="nama"
              value={form.nama}
              onChange={handleChange}
              placeholder="Nama pelanggan"
            />
          </div>

          <div className="field">
            <label>Nomor WhatsApp / Telepon *</label>
            <input
              name="telepon"
              value={form.telepon}
              onChange={handleChange}
              placeholder="08xxxxxxxxxx"
            />
            <small>
              Nomor ini digunakan sebagai identitas pelanggan Guest.
            </small>
          </div>

          <div className="field">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="email@contoh.com"
            />
          </div>

          <div className="field">
            <label>Tipe Pelanggan</label>
            <select
              name="tipe"
              value={form.tipe}
              onChange={handleChange}
            >
              <option value="guest">Guest</option>
              <option value="terdaftar">Terdaftar</option>
            </select>
          </div>

          <div className="field full">
            <label>Alamat</label>
            <textarea
              name="alamat"
              value={form.alamat}
              onChange={handleChange}
              rows="4"
              placeholder="Alamat pelanggan"
            />
          </div>

          <div className="field full">
            <label className="check-row">
              <input
                type="checkbox"
                name="aktif"
                checked={form.aktif}
                onChange={handleChange}
              />
              <span>Pelanggan Aktif</span>
            </label>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className={
              form.aktif
                ? "btn danger"
                : "btn activate"
            }
            onClick={ubahStatus}
            disabled={saving}
          >
            {form.aktif
              ? "Nonaktifkan Pelanggan"
              : "Aktifkan Pelanggan"}
          </button>

          <div className="right-actions">
            <button
              type="button"
              className="btn secondary"
              onClick={() =>
                router.push(`/admin/pelanggan/${params.id}`)
              }
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
        .field select,
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
        .field select:focus,
        .field textarea:focus {
          outline: none;
          border-color: #8a654a;
          box-shadow: 0 0 0 2px rgba(138, 101, 74, 0.1);
        }

        .check-row {
          display: flex !important;
          flex-direction: row !important;
          align-items: center;
          gap: 10px;
          cursor: pointer;
        }

        .check-row input {
          width: 18px;
          height: 18px;
        }

        .form-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          margin-top: 28px;
          padding-top: 20px;
          border-top: 1px solid #eee7df;
        }

        .right-actions {
          display: flex;
          gap: 10px;
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

        .btn.danger {
          background: #fff;
          color: #a13a31;
          border-color: #e3b8b3;
        }

        .btn.activate {
          background: #e6f5ea;
          color: #277442;
          border-color: #b9dfc2;
        }

        .message {
          padding: 14px 16px;
          border-radius: 9px;
          margin-bottom: 18px;
        }

        .message.error {
          background: #fde9e7;
          color: #9b332a;
          border: 1px solid #efc8c3;
        }

        .message.success {
          background: #e6f5ea;
          color: #277442;
          border: 1px solid #b9dfc2;
        }

        @media (max-width: 700px) {
          .form-grid {
            grid-template-columns: 1fr;
          }

          .field.full {
            grid-column: auto;
          }

          .page-head {
            flex-direction: column;
          }

          .form-actions {
            flex-direction: column;
            align-items: stretch;
          }

          .right-actions {
            justify-content: flex-end;
          }
        }
      `}</style>
    </section>
  );
}
