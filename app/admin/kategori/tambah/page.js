"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "../../../../lib/supabase";

function buatSlug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function TambahKategoriPage() {
  const router = useRouter();

  const [kategori, setKategori] = useState([]);

  const [nama, setNama] = useState("");
  const [slug, setSlug] = useState("");
  const [parentId, setParentId] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [urutan, setUrutan] = useState(0);

  const [gambarFile, setGambarFile] = useState(null);
  const [preview, setPreview] = useState("");

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadKategori();
  }, []);

  async function loadKategori() {
    const supabase = getSupabase();

    if (!supabase) return;

    const { data } =
      await supabase
        .from("kategori")
        .select("id, nama")
        .eq("aktif", true)
        .order("nama");

    setKategori(data || []);
  }

  function handleNamaChange(value) {
    setNama(value);
    setSlug(buatSlug(value));
  }

  function handleImageChange(e) {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(
        "Ukuran gambar maksimal 5 MB."
      );
      return;
    }

    setError("");
    setGambarFile(file);

    const objectUrl =
      URL.createObjectURL(file);

    setPreview(objectUrl);
  }

  async function uploadGambar(
    supabase,
    kategoriId,
    file
  ) {
    const extension =
      file.name.split(".").pop() || "jpg";

    const fileName =
      `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 10)}.${extension}`;

    const filePath =
      `kategori/${kategoriId}/${fileName}`;

    const { error: uploadError } =
      await supabase.storage
        .from("produk")
        .upload(
          filePath,
          file,
          {
            cacheControl: "3600",
            upsert: false,
          }
        );

    if (uploadError) {
      throw uploadError;
    }

    const { data } =
      supabase.storage
        .from("produk")
        .getPublicUrl(filePath);

    return data.publicUrl;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    const supabase = getSupabase();

    if (!supabase) {
      setError(
        "Koneksi database belum tersedia."
      );
      setSaving(false);
      return;
    }

    if (!nama.trim()) {
      setError(
        "Nama kategori wajib diisi."
      );
      setSaving(false);
      return;
    }

    try {
      const finalSlug =
        slug.trim() || buatSlug(nama);

      const { data, error: insertError } =
        await supabase
          .from("kategori")
          .insert({
            nama: nama.trim(),
            slug: finalSlug,
            deskripsi:
              deskripsi.trim() || null,
            parent_id: parentId
              ? Number(parentId)
              : null,
            urutan:
              Number(urutan) || 0,
            aktif: true,
          })
          .select()
          .single();

      if (insertError) {
        throw insertError;
      }

      if (gambarFile) {
        setUploading(true);

        const newUrl =
          await uploadGambar(
            supabase,
            data.id,
            gambarFile
          );

        const { error: imageError } =
          await supabase
            .from("kategori")
            .update({
              gambar_url: newUrl,
            })
            .eq("id", data.id);

        if (imageError) {
          throw imageError;
        }

        setUploading(false);
      }

      setMessage(
        "Kategori berhasil ditambahkan. Mengembalikan ke daftar kategori..."
      );

      setSaving(false);

      setTimeout(() => {
        router.push("/admin/kategori");
      }, 700);

    } catch (submitError) {
      setUploading(false);
      setSaving(false);

      setError(
        "Gagal menambahkan kategori: " +
          submitError.message
      );
    }
  }

  return (
    <main className="admin-content">

      <div className="admin-page-header">
        <div>
          <h1>Tambah Kategori</h1>

          <p>
            Tambahkan kategori atau
            subkategori produk baru.
          </p>
        </div>

        <button
          type="button"
          className="admin-secondary-button"
          onClick={() =>
            router.push("/admin/kategori")
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

          <div className="admin-form-grid">

            <div className="admin-form-group">
              <label>
                Nama Kategori *
              </label>

              <input
                value={nama}
                onChange={(e) =>
                  handleNamaChange(
                    e.target.value
                  )
                }
                placeholder="Contoh: Lampu"
                required
              />
            </div>

            <div className="admin-form-group">
              <label>
                Slug
              </label>

              <input
                value={slug}
                onChange={(e) =>
                  setSlug(e.target.value)
                }
                placeholder="lampu"
              />
            </div>

          </div>

          <div className="admin-form-grid">

            <div className="admin-form-group">
              <label>
                Kategori Induk
              </label>

              <select
                value={parentId}
                onChange={(e) =>
                  setParentId(e.target.value)
                }
              >
                <option value="">
                  Tidak ada — Kategori Utama
                </option>

                {kategori.map((item) => (
                  <option
                    key={item.id}
                    value={item.id}
                  >
                    {item.nama}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-form-group">
              <label>
                Urutan
              </label>

              <input
                type="number"
                min="0"
                value={urutan}
                onChange={(e) =>
                  setUrutan(e.target.value)
                }
              />
            </div>

          </div>

          <div className="admin-form-group">

            <label>
              Deskripsi
            </label>

            <textarea
              rows="5"
              value={deskripsi}
              onChange={(e) =>
                setDeskripsi(e.target.value)
              }
              placeholder="Deskripsi kategori..."
            />

          </div>

          <div className="admin-form-group">

            <label>
              Gambar Kategori
            </label>

            {preview && (
              <div
                style={{
                  width: "180px",
                  height: "140px",
                  borderRadius: "12px",
                  overflow: "hidden",
                  background: "#f5f0e8",
                  border:
                    "1px solid #ddd2c3",
                  marginBottom: "12px",
                }}
              >
                <img
                  src={preview}
                  alt="Preview kategori"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />

            <small>
              JPG, PNG atau WEBP.
              Maksimal 5 MB.
            </small>

          </div>

          {error && (
            <div className="admin-message admin-message-error">
              {error}
            </div>
          )}

          {message && (
            <div className="admin-message admin-message-success">
              {message}
            </div>
          )}

          <button
            type="submit"
            className="admin-primary-button"
            disabled={
              saving || uploading
            }
          >
            {uploading
              ? "Mengupload gambar..."
              : saving
              ? "Menyimpan..."
              : "Simpan Kategori"}
          </button>

        </form>

      </div>

    </main>
  );
}
