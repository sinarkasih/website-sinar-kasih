"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

function buatSlug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function TambahLabelPage() {
  const router = useRouter();
  const supabase = getSupabase();

  const [form, setForm] = useState({
    nama: "",
    slug: "",
    deskripsi: "",
    warna: "#8B5E3C",
    aktif: true,
    urutan: 0,
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  function handleNamaChange(value) {
    setForm((current) => ({
      ...current,
      nama: value,
      slug: buatSlug(value),
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.nama.trim()) {
      setMessage("Nama label wajib diisi.");
      return;
    }

    setSaving(true);
    setMessage("");

    const { error } = await supabase
      .from("label_produk")
      .insert({
        nama: form.nama.trim(),
        slug:
          form.slug.trim() ||
          buatSlug(form.nama),
        deskripsi:
          form.deskripsi.trim() || null,
        warna: form.warna || null,
        aktif: form.aktif,
        urutan: Number(form.urutan) || 0,
      });

    if (error) {
      setMessage(
        "Gagal menyimpan label: " +
          error.message
      );
      setSaving(false);
      return;
    }

    router.push("/admin/produk/label");
  }

  return (
    <main className="admin-content">

      <div className="admin-page-header">
        <div>
          <h1>Tambah Label Produk</h1>
          <p>
            Buat label baru untuk digunakan
            pada produk.
          </p>
        </div>

        <button
          type="button"
          className="admin-secondary-button"
          onClick={() =>
            router.push("/admin/produk/label")
          }
        >
          ← Kembali
        </button>
      </div>

      <div className="admin-card">

        <form
          onSubmit={handleSubmit}
          className="admin-form"
        >

          {message && (
            <div className="admin-message">
              {message}
            </div>
          )}

          <div className="admin-form-group">
            <label>
              Nama Label *
            </label>

            <input
              type="text"
              value={form.nama}
              onChange={(e) =>
                handleNamaChange(
                  e.target.value
                )
              }
              placeholder="Contoh: Promo"
              required
            />
          </div>

          <div className="admin-form-group">
            <label>
              Slug
            </label>

            <input
              type="text"
              value={form.slug}
              onChange={(e) =>
                setForm({
                  ...form,
                  slug: e.target.value,
                })
              }
              placeholder="promo"
            />
          </div>

          <div className="admin-form-group">
            <label>
              Deskripsi
            </label>

            <textarea
              rows="4"
              value={form.deskripsi}
              onChange={(e) =>
                setForm({
                  ...form,
                  deskripsi:
                    e.target.value,
                })
              }
              placeholder="Keterangan label..."
            />
          </div>

          <div className="admin-form-grid">

            <div className="admin-form-group">
              <label>
                Warna Label
              </label>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <input
                  type="color"
                  value={form.warna}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      warna:
                        e.target.value,
                    })
                  }
                  style={{
                    width: "55px",
                    height: "42px",
                    padding: "2px",
                  }}
                />

                <input
                  type="text"
                  value={form.warna}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      warna:
                        e.target.value,
                    })
                  }
                  placeholder="#8B5E3C"
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label>
                Urutan
              </label>

              <input
                type="number"
                min="0"
                value={form.urutan}
                onChange={(e) =>
                  setForm({
                    ...form,
                    urutan:
                      e.target.value,
                  })
                }
              />
            </div>

          </div>

          <label className="admin-form-checkbox">
            <input
              type="checkbox"
              checked={form.aktif}
              onChange={(e) =>
                setForm({
                  ...form,
                  aktif:
                    e.target.checked,
                })
              }
            />

            <span>
              Label aktif
            </span>
          </label>

          {message && (
            <div className="admin-message">
              {message}
            </div>
          )}

          <div
            style={{
              display: "flex",
              gap: "10px",
              marginTop: "20px",
              flexWrap: "wrap",
            }}
          >
            <button
              type="submit"
              className="admin-primary-button"
              disabled={saving}
            >
              {saving
                ? "Menyimpan..."
                : "Simpan Label"}
            </button>

            <button
              type="button"
              className="admin-secondary-button"
              onClick={() =>
                router.push(
                  "/admin/produk/label"
                )
              }
            >
              Batal
            </button>
          </div>

        </form>

      </div>

    </main>
  );
}
