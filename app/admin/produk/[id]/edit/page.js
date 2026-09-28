"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSupabase } from "../../../../../lib/supabase";

export default function EditProdukPage() {
  const params = useParams();
  const router = useRouter();

  const productId = params.id;

  const [kategori, setKategori] = useState([]);
  const [brand, setBrand] = useState([]);
  const [produk, setProduk] = useState(null);
  const [foto, setFoto] = useState([]);

  const [form, setForm] = useState({
    nama: "",
    deskripsi: "",
    sku: "",
    slug: "",
    kategori_id: "",
    brand_id: "",
    satuan: "pcs",
    stok: 0,
    aktif: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (productId) {
      loadData();
    }
  }, [productId]);

  async function loadData() {
    setLoading(true);
    setError("");
    setMessage("");

    const supabase = getSupabase();

    if (!supabase) {
      setError("Koneksi database belum tersedia.");
      setLoading(false);
      return;
    }

    const [
      produkResult,
      kategoriResult,
      brandResult,
      fotoResult,
    ] = await Promise.all([
      supabase
        .from("produk")
        .select(`
          id,
          nama,
          deskripsi,
          sku,
          slug,
          kategori_id,
          brand_id,
          satuan,
          stok,
          aktif
        `)
        .eq("id", productId)
        .maybeSingle(),

      supabase
        .from("kategori")
        .select("id, nama")
        .eq("aktif", true)
        .order("nama"),

      supabase
        .from("brand")
        .select("id, nama")
        .eq("aktif", true)
        .order("nama"),

      supabase
        .from("produk_gambar")
        .select("id, produk_id, url, alt_text, utama")
        .eq("produk_id", productId)
        .order("utama", { ascending: false })
        .order("id", { ascending: true }),
    ]);

    if (produkResult.error) {
      setError(
        "Gagal mengambil data produk: " +
          produkResult.error.message
      );
      setLoading(false);
      return;
    }

    if (!produkResult.data) {
      setError("Produk tidak ditemukan.");
      setLoading(false);
      return;
    }

    if (kategoriResult.error) {
      setError(
        "Gagal mengambil kategori: " +
          kategoriResult.error.message
      );
      setLoading(false);
      return;
    }

    if (brandResult.error) {
      setError(
        "Gagal mengambil brand: " +
          brandResult.error.message
      );
      setLoading(false);
      return;
    }

    if (fotoResult.error) {
      setError(
        "Gagal mengambil foto produk: " +
          fotoResult.error.message
      );
      setLoading(false);
      return;
    }

    const data = produkResult.data;

    setProduk(data);

    setForm({
      nama: data.nama || "",
      deskripsi: data.deskripsi || "",
      sku: data.sku || "",
      slug: data.slug || "",
      kategori_id: data.kategori_id
        ? String(data.kategori_id)
        : "",
      brand_id: data.brand_id
        ? String(data.brand_id)
        : "",
      satuan: data.satuan || "pcs",
      stok: data.stok ?? 0,
      aktif: data.aktif ?? true,
    });

    setKategori(kategoriResult.data || []);
    setBrand(brandResult.data || []);
    setFoto(fotoResult.data || []);

    setLoading(false);
  }

  function handleChange(e) {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setForm((current) => ({
      ...current,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    const supabase = getSupabase();

    if (!supabase) {
      setError("Koneksi database belum tersedia.");
      setSaving(false);
      return;
    }

    if (!form.nama.trim()) {
      setError("Nama produk wajib diisi.");
      setSaving(false);
      return;
    }

    const payload = {
      nama: form.nama.trim(),
      deskripsi: form.deskripsi.trim() || null,
      sku: form.sku.trim() || null,
      slug: form.slug.trim() || null,
      kategori_id: form.kategori_id
        ? Number(form.kategori_id)
        : null,
      brand_id: form.brand_id
        ? Number(form.brand_id)
        : null,
      satuan: form.satuan.trim() || "pcs",
      stok: Number(form.stok) || 0,
      aktif: form.aktif,
    };

    const { data, error: updateError } =
      await supabase
        .from("produk")
        .update(payload)
        .eq("id", productId)
        .select()
        .single();

    if (updateError) {
      setError(
        "Gagal menyimpan perubahan: " +
          updateError.message
      );
      setSaving(false);
      return;
    }

    setProduk(data);

    setMessage(
      "Perubahan produk berhasil disimpan. Mengembalikan ke daftar produk..."
    );

    setSaving(false);

    setTimeout(() => {
      router.push("/admin/produk");
    }, 700);
  }

  async function handleUpload(e) {
    const files = Array.from(
      e.target.files || []
    );

    if (!files.length) return;

    setUploading(true);
    setError("");
    setMessage("");

    const supabase = getSupabase();

    if (!supabase) {
      setError("Koneksi database belum tersedia.");
      setUploading(false);
      return;
    }

    try {
      for (const file of files) {
        if (!file.type.startsWith("image/")) {
          throw new Error(
            `"${file.name}" bukan file gambar.`
          );
        }

        if (file.size > 5 * 1024 * 1024) {
          throw new Error(
            `"${file.name}" terlalu besar. Maksimal 5 MB.`
          );
        }

        const extension =
          file.name.split(".").pop() || "jpg";

        const randomName =
          `${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 10)}.${extension}`;

        const filePath =
          `produk/${productId}/${randomName}`;

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

        const {
          data: publicData,
        } = supabase.storage
          .from("produk")
          .getPublicUrl(filePath);

        const isFirstPhoto =
          foto.length === 0;

        if (isFirstPhoto) {
          await supabase
            .from("produk_gambar")
            .update({ utama: false })
            .eq("produk_id", productId);
        }

        const {
          data: insertedPhoto,
          error: photoError,
        } = await supabase
          .from("produk_gambar")
          .insert({
            produk_id: Number(productId),
            url: publicData.publicUrl,
            alt_text: form.nama || "Foto Produk",
            utama: isFirstPhoto,
          })
          .select()
          .single();

        if (photoError) {
          throw photoError;
        }

        setFoto((current) => [
          ...current,
          insertedPhoto,
        ]);
      }

      setMessage(
        "Foto produk berhasil diupload."
      );
    } catch (uploadError) {
      console.error(uploadError);

      setError(
        "Gagal upload foto: " +
          (uploadError.message ||
            "Terjadi kesalahan.")
      );
    }

    e.target.value = "";
    setUploading(false);
  }

  async function jadikanUtama(photoId) {
    const supabase = getSupabase();

    if (!supabase) {
      setError("Koneksi database belum tersedia.");
      return;
    }

    setError("");
    setMessage("");

    const { error: resetError } =
      await supabase
        .from("produk_gambar")
        .update({ utama: false })
        .eq("produk_id", productId);

    if (resetError) {
      setError(
        "Gagal mengatur foto utama: " +
          resetError.message
      );
      return;
    }

    const { error: mainError } =
      await supabase
        .from("produk_gambar")
        .update({ utama: true })
        .eq("id", photoId)
        .eq("produk_id", productId);

    if (mainError) {
      setError(
        "Gagal memilih foto utama: " +
          mainError.message
      );
      return;
    }

    setFoto((current) =>
      current.map((item) => ({
        ...item,
        utama: item.id === photoId,
      }))
    );

    setMessage(
      "Foto utama berhasil diubah."
    );
  }

  async function hapusFoto(photo) {
    const yakin = window.confirm(
      "Hapus foto produk ini?"
    );

    if (!yakin) return;

    const supabase = getSupabase();

    if (!supabase) {
      setError("Koneksi database belum tersedia.");
      return;
    }

    setError("");
    setMessage("");

    try {
      const marker =
        "/storage/v1/object/public/produk/";

      const markerIndex =
        photo.url.indexOf(marker);

      if (markerIndex !== -1) {
        const filePath =
          decodeURIComponent(
            photo.url.substring(
              markerIndex + marker.length
            )
          );

        await supabase.storage
          .from("produk")
          .remove([filePath]);
      }

      const { error: deleteError } =
        await supabase
          .from("produk_gambar")
          .delete()
          .eq("id", photo.id);

      if (deleteError) {
        throw deleteError;
      }

      const remaining =
        foto.filter(
          (item) => item.id !== photo.id
        );

      setFoto(remaining);

      if (
        photo.utama &&
        remaining.length > 0
      ) {
        await jadikanUtama(
          remaining[0].id
        );
      }

      setMessage(
        "Foto produk berhasil dihapus."
      );
    } catch (deleteError) {
      setError(
        "Gagal menghapus foto: " +
          deleteError.message
      );
    }
  }

  if (loading) {
    return (
      <main className="admin-content">
        <div className="admin-card">
          Memuat data produk...
        </div>
      </main>
    );
  }

  if (!produk) {
    return (
      <main className="admin-content">
        <div className="admin-message admin-message-error">
          Produk tidak ditemukan.
        </div>
      </main>
    );
  }

  return (
    <main className="admin-content">

      <div className="admin-page-header">
        <div>
          <h1>Edit Produk</h1>
          <p>
            Ubah informasi dan foto produk{" "}
            <strong>{produk.nama}</strong>.
          </p>
        </div>

        <button
          type="button"
          className="admin-secondary-button"
          onClick={() =>
            router.push("/admin/produk")
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

          <div className="admin-form-group">
            <label>
              Nama Produk *
            </label>

            <input
              name="nama"
              value={form.nama}
              onChange={handleChange}
              required
            />
          </div>

          <div className="admin-form-grid">

            <div className="admin-form-group">
              <label>SKU</label>

              <input
                name="sku"
                value={form.sku}
                onChange={handleChange}
              />
            </div>

            <div className="admin-form-group">
              <label>Slug</label>

              <input
                name="slug"
                value={form.slug}
                onChange={handleChange}
              />
            </div>

          </div>

          <div className="admin-form-grid">

            <div className="admin-form-group">
              <label>Kategori</label>

              <select
                name="kategori_id"
                value={form.kategori_id}
                onChange={handleChange}
              >
                <option value="">
                  Pilih kategori
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
              <label>Brand</label>

              <select
                name="brand_id"
                value={form.brand_id}
                onChange={handleChange}
              >
                <option value="">
                  Pilih brand
                </option>

                {brand.map((item) => (
                  <option
                    key={item.id}
                    value={item.id}
                  >
                    {item.nama}
                  </option>
                ))}
              </select>
            </div>

          </div>

          <div className="admin-form-grid">

            <div className="admin-form-group">
              <label>Satuan</label>

              <input
                name="satuan"
                value={form.satuan}
                onChange={handleChange}
              />
            </div>

            <div className="admin-form-group">
              <label>Stok</label>

              <input
                type="number"
                min="0"
                name="stok"
                value={form.stok}
                onChange={handleChange}
              />
            </div>

          </div>

          <div className="admin-form-group">
            <label>Deskripsi</label>

            <textarea
              name="deskripsi"
              value={form.deskripsi}
              onChange={handleChange}
              rows="6"
            />
          </div>

          <div className="admin-form-checkbox">
            <input
              type="checkbox"
              id="aktif"
              name="aktif"
              checked={form.aktif}
              onChange={handleChange}
            />

            <label htmlFor="aktif">
              Produk aktif dan dapat
              ditampilkan di website
            </label>
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
            disabled={saving}
          >
            {saving
              ? "Menyimpan..."
              : "Simpan Perubahan"}
          </button>

        </form>
      </div>

      <div className="admin-card" style={{ marginTop: "24px" }}>

        <div className="admin-page-header">
          <div>
            <h2>Foto Produk</h2>
            <p>
              Upload foto produk dan pilih
              salah satunya sebagai foto utama.
            </p>
          </div>
        </div>

        <div
          style={{
            border: "2px dashed #d6c8b4",
            borderRadius: "14px",
            padding: "28px",
            textAlign: "center",
            background: "#faf7f2",
          }}
        >
          <input
            id="foto-produk"
            type="file"
            accept="image/*"
            multiple
            onChange={handleUpload}
            disabled={uploading}
          />

          <p
            style={{
              marginTop: "12px",
              marginBottom: 0,
              color: "#6b6258",
              fontSize: "14px",
            }}
          >
            JPG, JPEG, PNG atau WEBP.
            Maksimal 5 MB per foto.
          </p>

          {uploading && (
            <p style={{ marginTop: "12px" }}>
              Mengupload foto...
            </p>
          )}
        </div>

        {foto.length === 0 ? (
          <div
            className="admin-message"
            style={{ marginTop: "20px" }}
          >
            Belum ada foto produk.
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill, minmax(180px, 1fr))",
              gap: "18px",
              marginTop: "24px",
            }}
          >
            {foto.map((item) => (
              <div
                key={item.id}
                style={{
                  border:
                    item.utama
                      ? "2px solid #a47732"
                      : "1px solid #ddd2c3",
                  borderRadius: "14px",
                  padding: "10px",
                  background: "#fff",
                }}
              >

                <div
                  style={{
                    width: "100%",
                    height: "180px",
                    borderRadius: "10px",
                    overflow: "hidden",
                    background: "#f5f0e8",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <img
                    src={item.url}
                    alt={
                      item.alt_text ||
                      form.nama
                    }
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
                </div>

                {item.utama && (
                  <div
                    style={{
                      marginTop: "10px",
                      fontWeight: 700,
                      color: "#8a6429",
                      fontSize: "14px",
                    }}
                  >
                    ★ Foto Utama
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    marginTop: "10px",
                    flexWrap: "wrap",
                  }}
                >
                  {!item.utama && (
                    <button
                      type="button"
                      className="admin-secondary-button"
                      onClick={() =>
                        jadikanUtama(item.id)
                      }
                    >
                      Jadikan Utama
                    </button>
                  )}

                  <button
                    type="button"
                    className="admin-secondary-button"
                    onClick={() =>
                      hapusFoto(item)
                    }
                  >
                    Hapus
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>

    </main>
  );
}
