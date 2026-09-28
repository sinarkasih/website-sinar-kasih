"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

function buatSlug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function EditLabelPage() {
  const router = useRouter();
  const params = useParams();
  const supabase = getSupabase();

  const [form, setForm] = useState({
    nama: "",
    slug: "",
    deskripsi: "",
    warna: "#8B5E3C",
    aktif: true,
    urutan: 0,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (params.id) {
      loadLabel();
    }
  }, [params.id]);

  async function loadLabel() {
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase
      .from("label_produk")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error) {
      setMessage(
        "Gagal mengambil label: " +
          error.message
      );
      setLoading(false);
      return;
    }

    setForm({
      nama: data.nama || "",
      slug: data.slug || "",
      deskripsi: data.deskripsi || "",
      warna: data.warna || "#8B5E3C",
      aktif: data.aktif ?? true,
      urutan: data.urutan ?? 0,
    });

    setLoading(false);
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
      .update({
        nama: form.nama.trim(),
        slug:
          form.slug.trim() ||
          buatSlug(form.nama),
        deskripsi:
          form.deskripsi.trim() || null,
        warna: form.warna || null,
        aktif: form.aktif,
        urutan:
          Number(form.urutan) || 0,
      })
      .eq("id", params.id);

    if (error) {
      setMessage(
        "Gagal memperbarui label: " +
          error.message
      );
      setSaving(false);
      return;
    }

    router.push("/admin/produk/label");
  }

  if (loading) {
    return (
      <main className="admin-content">
        <div className="admin-card">
          Memuat data label...
        </div>
      </main>
    );
  }

  return (
    <main className="admin-content">

      <div className="admin-page-header">

        <div>
          <h1>Edit Label Produk</h1>

          <p>
            Perbarui informasi label produk.
          </p>
        </div>

        <button
          type="button"
          className="admin-secondary-button"
          onClick={() =>
            router.push(
              "/admin/produk/label"
            )
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
                setForm({
                  ...form,
                  nama: e.target.value,
                })
              }
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
                : "Simpan Perubahan"}
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
