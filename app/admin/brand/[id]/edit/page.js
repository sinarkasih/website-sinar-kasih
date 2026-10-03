"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSupabase } from "../../../../../lib/supabase";
import { kompresGambar } from "@/lib/kompresGambar";

export default function EditBrandPage() {
  const params = useParams();
  const router = useRouter();

  const brandId = params.id;

  const [brand, setBrand] =
    useState(null);

  const [nama, setNama] = useState("");
  const [slug, setSlug] = useState("");

  const [logoUrl, setLogoUrl] =
    useState("");
  const [logoFile, setLogoFile] =
    useState(null);
  const [preview, setPreview] =
    useState("");

  const [loading, setLoading] =
    useState(true);
  const [saving, setSaving] =
    useState(false);
  const [uploading, setUploading] =
    useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] =
    useState("");

  useEffect(() => {
    if (brandId) {
      loadBrand();
    }
  }, [brandId]);

  async function loadBrand() {
    setLoading(true);
    setError("");

    const supabase = getSupabase();

    if (!supabase) {
      setError(
        "Koneksi database belum tersedia."
      );
      setLoading(false);
      return;
    }

    const { data, error: brandError } =
      await supabase
        .from("brand")
        .select(`
          id,
          nama,
          slug,
          aktif,
          logo_url
        `)
        .eq("id", brandId)
        .maybeSingle();

    if (brandError) {
      setError(
        "Gagal mengambil data brand: " +
          brandError.message
      );
      setLoading(false);
      return;
    }

    if (!data) {
      setError("Brand tidak ditemukan.");
      setLoading(false);
      return;
    }

    setBrand(data);
    setNama(data.nama || "");
    setSlug(data.slug || "");
    setLogoUrl(data.logo_url || "");
    setPreview(data.logo_url || "");

    setLoading(false);
  }

  function handleLogoChange(e) {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError(
        "File harus berupa gambar."
      );
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

  async function hapusFileStorage(
    supabase,
    url
  ) {
    if (!url) return;

    const marker =
      "/storage/v1/object/public/produk/";

    const index =
      url.indexOf(marker);

    if (index === -1) return;

    const filePath =
      decodeURIComponent(
        url.substring(
          index + marker.length
        )
      );

    await supabase.storage
      .from("produk")
      .remove([filePath]);
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
      const oldLogoUrl = logoUrl;

      const { error: updateError } =
        await supabase
          .from("brand")
          .update({
            nama: nama.trim(),
            slug: slug.trim(),
          })
          .eq("id", brandId);

      if (updateError) {
        throw updateError;
      }

      if (logoFile) {
        setUploading(true);

        const newUrl =
          await uploadLogo(
            supabase,
            logoFile
          );

        const {
          error: logoError,
        } = await supabase
          .from("brand")
          .update({
            logo_url: newUrl,
          })
          .eq("id", brandId);

        if (logoError) {
          throw logoError;
        }

        if (
          oldLogoUrl &&
          oldLogoUrl !== newUrl
        ) {
          await hapusFileStorage(
            supabase,
            oldLogoUrl
          );
        }

        setUploading(false);
      }

      setMessage(
        "Perubahan brand berhasil disimpan. Mengembalikan ke daftar brand..."
      );

      setSaving(false);

      setTimeout(() => {
        router.push("/admin/brand");
      }, 700);

    } catch (submitError) {
      setUploading(false);
      setSaving(false);

      setError(
        "Gagal menyimpan perubahan: " +
          submitError.message
      );
    }
  }

  async function hapusLogo() {
    if (!logoUrl) return;

    const yakin =
      window.confirm(
        "Hapus logo brand ini?"
      );

    if (!yakin) return;

    const supabase = getSupabase();

    if (!supabase) {
      setError(
        "Koneksi database belum tersedia."
      );
      return;
    }

    setError("");
    setMessage("");

    try {
      await hapusFileStorage(
        supabase,
        logoUrl
      );

      const { error: updateError } =
        await supabase
          .from("brand")
          .update({
            logo_url: null,
          })
          .eq("id", brandId);

      if (updateError) {
        throw updateError;
      }

      setLogoUrl("");
      setPreview("");
      setLogoFile(null);

      setMessage(
        "Logo brand berhasil dihapus."
      );
    } catch (deleteError) {
      setError(
        "Gagal menghapus logo: " +
          deleteError.message
      );
    }
  }

  if (loading) {
    return (
      <main className="admin-content">
        <div className="admin-card">
          Memuat data brand...
        </div>
      </main>
    );
  }

  if (!brand) {
    return (
      <main className="admin-content">
        <div className="admin-message admin-message-error">
          Brand tidak ditemukan.
        </div>
      </main>
    );
  }

  return (
    <main className="admin-content">

      <div className="admin-page-header">
        <div>
          <h1>Edit Brand</h1>

          <p>
            Ubah informasi brand{" "}
            <strong>{brand.nama}</strong>.
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
                  setNama(e.target.value)
                }
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

            {logoUrl && (
              <div
                style={{
                  marginTop: "10px",
                }}
              >
                <button
                  type="button"
                  className="admin-secondary-button"
                  onClick={hapusLogo}
                >
                  Hapus Logo
                </button>
              </div>
            )}

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
              : "Simpan Perubahan"}
          </button>

        </form>

      </div>

    </main>
  );
}
