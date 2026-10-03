"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "../../../../lib/supabase";
import { kompresGambar } from "@/lib/kompresGambar";

function buatSlug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function TambahBrandPage() {
  const router = useRouter();

  const [nama, setNama] = useState("");
  const [slug, setSlug] = useState("");

  const [logoFile, setLogoFile] =
    useState(null);
  const [preview, setPreview] =
    useState("");

  const [saving, setSaving] =
    useState(false);
  const [uploading, setUploading] =
    useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] =
    useState("");

  function handleNamaChange(value) {
    setNama(value);
    setSlug(buatSlug(value));
  }

  function handleLogoChange(e) {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar.");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setError(
        "Ukuran logo maksimal 15 MB."
      );
      return;
    }

    setError("");
    setLogoFile(file);

    const objectUrl =
      URL.createObjectURL(file);

    setPreview(objectUrl);
  }

  async function uploadLogo(
    supabase,
    brandId,
    file
  ) {
    // Gambar dikecilkan otomatis sebelum di-upload
    file = await kompresGambar(file, { maks: 800 });

    const extension =
      file.name.split(".").pop() ||
      "png";

    const fileName =
      `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 10)}.${extension}`;

    const filePath =
      `brand/${brandId}/${fileName}`;

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
        "Nama brand wajib diisi."
      );
      setSaving(false);
      return;
    }

    try {
      const finalSlug =
        slug.trim() || buatSlug(nama);

      const {
        data,
        error: insertError,
      } = await supabase
        .from("brand")
        .insert({
          nama: nama.trim(),
          slug: finalSlug,
          aktif: true,
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      if (logoFile) {
        setUploading(true);

        const newUrl =
          await uploadLogo(
            supabase,
            data.id,
            logoFile
          );

        const {
          error: logoError,
        } = await supabase
          .from("brand")
          .update({
            logo_url: newUrl,
          })
          .eq("id", data.id);

        if (logoError) {
          throw logoError;
        }

        setUploading(false);
      }

      setMessage(
        "Brand berhasil ditambahkan. Mengembalikan ke daftar brand..."
      );

      setSaving(false);

      setTimeout(() => {
        router.push("/admin/brand");
      }, 700);

    } catch (submitError) {
      setUploading(false);
      setSaving(false);

      setError(
        "Gagal menambahkan brand: " +
          submitError.message
      );
    }
  }

  return (
    <main className="admin-content">

      <div className="admin-page-header">
        <div>
          <h1>Tambah Brand</h1>

          <p>
            Tambahkan brand produk baru.
          </p>
        </div>

        <button
          type="button"
          className="admin-secondary-button"
          onClick={() =>
            router.push("/admin/brand")
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
                Nama Brand *
              </label>

              <input
                value={nama}
                onChange={(e) =>
                  handleNamaChange(
                    e.target.value
                  )
                }
                placeholder="Contoh: Philips"
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
                placeholder="philips"
              />
            </div>

          </div>

          <div className="admin-form-group">

            <label>
              Logo Brand
            </label>

            {preview && (
              <div
                style={{
                  width: "180px",
                  height: "120px",
                  borderRadius: "12px",
                  overflow: "hidden",
                  background: "#fff",
                  border:
                    "1px solid #ddd2c3",
                  marginBottom: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src={preview}
                  alt="Preview logo"
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
              onChange={handleLogoChange}
            />

            <small>
              JPG, PNG atau WEBP.
              Maksimal 15 MB.
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
              ? "Mengupload logo..."
              : saving
              ? "Menyimpan..."
              : "Simpan Brand"}
          </button>

        </form>

      </div>

    </main>
  );
}
