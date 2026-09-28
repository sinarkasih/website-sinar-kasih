"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSupabase } from "../../../../../lib/supabase";

export default function EditKategoriPage() {
  const params = useParams();
  const router = useRouter();

  const kategoriId = params.id;

  const [kategori, setKategori] = useState([]);
  const [dataKategori, setDataKategori] =
    useState(null);

  const [nama, setNama] = useState("");
  const [slug, setSlug] = useState("");
  const [parentId, setParentId] = useState("");
  const [deskripsi, setDeskripsi] =
    useState("");
  const [urutan, setUrutan] = useState(0);

  const [gambarUrl, setGambarUrl] =
    useState("");
  const [gambarFile, setGambarFile] =
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
    if (kategoriId) {
      loadData();
    }
  }, [kategoriId]);

  async function loadData() {
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

    const [
      kategoriResult,
      currentResult,
    ] = await Promise.all([
      supabase
        .from("kategori")
        .select(
          "id, nama, aktif"
        )
        .eq("aktif", true)
        .order("nama"),

      supabase
        .from("kategori")
        .select(`
          id,
          nama,
          slug,
          deskripsi,
          parent_id,
          urutan,
          aktif,
          gambar_url
        `)
        .eq("id", kategoriId)
        .maybeSingle(),
    ]);

    if (kategoriResult.error) {
      setError(
        "Gagal mengambil kategori: " +
          kategoriResult.error.message
      );
      setLoading(false);
      return;
    }

    if (currentResult.error) {
      setError(
        "Gagal mengambil data kategori: " +
          currentResult.error.message
      );
      setLoading(false);
      return;
    }

    if (!currentResult.data) {
      setError(
        "Kategori tidak ditemukan."
      );
      setLoading(false);
      return;
    }

    const data =
      currentResult.data;

    setKategori(
      kategoriResult.data || []
    );

    setDataKategori(data);

    setNama(data.nama || "");
    setSlug(data.slug || "");

    setParentId(
      data.parent_id
        ? String(data.parent_id)
        : ""
    );

    setDeskripsi(
      data.deskripsi || ""
    );

    setUrutan(
      data.urutan ?? 0
    );

    setGambarUrl(
      data.gambar_url || ""
    );

    setPreview(
      data.gambar_url || ""
    );

    setLoading(false);
  }

  function handleImageChange(e) {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError(
        "File harus berupa gambar."
      );
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
    file
  ) {
    const extension =
      file.name.split(".").pop() ||
      "jpg";

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
        .getPublicUrl(
          filePath
        );

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
        "Nama kategori wajib diisi."
      );
      setSaving(false);
      return;
    }

    if (
      parentId &&
      Number(parentId) ===
        Number(kategoriId)
    ) {
      setError(
        "Kategori tidak boleh menjadi induknya sendiri."
      );
      setSaving(false);
      return;
    }

    try {
      const oldImageUrl =
        gambarUrl;

      const { error: updateError } =
        await supabase
          .from("kategori")
          .update({
            nama: nama.trim(),
            slug: slug.trim(),
            deskripsi:
              deskripsi.trim() ||
              null,
            parent_id: parentId
              ? Number(parentId)
              : null,
            urutan:
              Number(urutan) || 0,
          })
          .eq("id", kategoriId);

      if (updateError) {
        throw updateError;
      }

      if (gambarFile) {
        setUploading(true);

        const newUrl =
          await uploadGambar(
            supabase,
            gambarFile
          );

        const {
          error: imageError,
        } = await supabase
          .from("kategori")
          .update({
            gambar_url: newUrl,
          })
          .eq("id", kategoriId);

        if (imageError) {
          throw imageError;
        }

        if (
          oldImageUrl &&
          oldImageUrl !== newUrl
        ) {
          await hapusFileStorage(
            supabase,
            oldImageUrl
          );
        }

        setUploading(false);
      }

      setMessage(
        "Perubahan kategori berhasil disimpan. Mengembalikan ke daftar kategori..."
      );

      setSaving(false);

      setTimeout(() => {
        router.push(
          "/admin/kategori"
        );
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

  async function hapusGambar() {
    if (!gambarUrl) return;

    const yakin =
      window.confirm(
        "Hapus gambar kategori ini?"
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
        gambarUrl
      );

      const { error: updateError } =
        await supabase
          .from("kategori")
          .update({
            gambar_url: null,
          })
          .eq("id", kategoriId);

      if (updateError) {
        throw updateError;
      }

      setGambarUrl("");
      setPreview("");
      setGambarFile(null);

      setMessage(
        "Gambar kategori berhasil dihapus."
      );
    } catch (deleteError) {
      setError(
        "Gagal menghapus gambar: " +
          deleteError.message
      );
    }
  }

  if (loading) {
    return (
      <main className="admin-content">
        <div className="admin-card">
          Memuat data kategori...
        </div>
      </main>
    );
  }

  if (!dataKategori) {
    return (
      <main className="admin-content">
        <div className="admin-message admin-message-error">
          Kategori tidak ditemukan.
        </div>
      </main>
    );
  }

  return (
    <main className="admin-content">

      <div className="admin-page-header">
        <div>
          <h1>Edit Kategori</h1>

          <p>
            Ubah informasi kategori{" "}
            <strong>
              {dataKategori.nama}
            </strong>
            .
          </p>
        </div>

        <button
          type="button"
          className="admin-secondary-button"
          onClick={() =>
            router.push(
              "/admin/kategori"
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

          <div className="admin-form-grid">

            <div className="admin-form-group">
              <label>
                Nama Kategori *
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

          <div className="admin-form-grid">

            <div className="admin-form-group">

              <label>
                Kategori Induk
              </label>

              <select
                value={parentId}
                onChange={(e) =>
                  setParentId(
                    e.target.value
                  )
                }
              >
                <option value="">
                  Tidak ada — Kategori Utama
                </option>

                {kategori
                  .filter(
                    (item) =>
                      Number(item.id) !==
                      Number(kategoriId)
                  )
                  .map((item) => (
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
                  setUrutan(
                    e.target.value
                  )
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
                setDeskripsi(
                  e.target.value
                )
              }
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
              onChange={
                handleImageChange
              }
            />

            <small>
              JPG, PNG atau WEBP.
              Maksimal 5 MB.
            </small>

            {gambarUrl && (
              <div
                style={{
                  marginTop: "10px",
                }}
              >
                <button
                  type="button"
                  className="admin-secondary-button"
                  onClick={
                    hapusGambar
                  }
                >
                  Hapus Gambar
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
              ? "Mengupload gambar..."
              : saving
              ? "Menyimpan..."
              : "Simpan Perubahan"}
          </button>

        </form>

      </div>

    </main>
  );
}
