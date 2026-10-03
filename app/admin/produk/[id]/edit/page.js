"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSupabase } from "../../../../../lib/supabase";
import { useAdmin } from "../../../AdminContext";

function buatSlugDariNama(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function EditProdukPage() {
  const adminLogin = useAdmin();
  const bolehUbahSlug = adminLogin?.role === "admin_utama";
  const params = useParams();
  const router = useRouter();

  const productId = params.id;

  const [kategori, setKategori] = useState([]);
  const [brand, setBrand] = useState([]);
  const [labels, setLabels] = useState([]);
  const [produk, setProduk] = useState(null);
  const [foto, setFoto] = useState([]);
  const [selectedLabelIds, setSelectedLabelIds] = useState([]);

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
    tampilkan_di_beranda: false,
    produk_unggulan: false,
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
      labelResult,
      produkLabelResult,
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
          aktif,
          tampilkan_di_beranda,
          produk_unggulan
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
        .from("label_produk")
        .select("id, nama, slug, warna")
        .eq("aktif", true)
        .order("urutan", {
          ascending: true,
        })
        .order("nama", {
          ascending: true,
        }),

      supabase
        .from("produk_label")
        .select("label_id")
        .eq("produk_id", productId),

      supabase
        .from("produk_gambar")
        .select(
          "id, produk_id, url, alt_text, utama"
        )
        .eq("produk_id", productId)
        .order("utama", {
          ascending: false,
        })
        .order("id", {
          ascending: true,
        }),
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

    if (labelResult.error) {
      setError(
        "Gagal mengambil label produk: " +
          labelResult.error.message
      );
      setLoading(false);
      return;
    }

    if (produkLabelResult.error) {
      setError(
        "Gagal mengambil label produk yang dipilih: " +
          produkLabelResult.error.message
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
      tampilkan_di_beranda:
        data.tampilkan_di_beranda ?? false,
      produk_unggulan:
        data.produk_unggulan ?? false,
    });

    setKategori(kategoriResult.data || []);
    setBrand(brandResult.data || []);
    setLabels(labelResult.data || []);
    setFoto(fotoResult.data || []);

    setSelectedLabelIds(
      (produkLabelResult.data || [])
        .map((item) => Number(item.label_id))
        .filter(Boolean)
    );

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

  function toggleLabel(labelId) {
    const id = Number(labelId);

    setSelectedLabelIds((current) => {
      if (current.includes(id)) {
        return current.filter(
          (item) => item !== id
        );
      }

      return [...current, id];
    });
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
      deskripsi:
        form.deskripsi.trim() || null,
      sku:
        form.sku.trim() || null,
      slug:
        form.slug.trim() || null,
      kategori_id: form.kategori_id
        ? Number(form.kategori_id)
        : null,
      brand_id: form.brand_id
        ? Number(form.brand_id)
        : null,
      satuan:
        form.satuan.trim() || "pcs",
      stok: Number(form.stok) || 0,
      aktif: form.aktif,
      tampilkan_di_beranda:
        form.tampilkan_di_beranda,
      produk_unggulan:
        form.produk_unggulan,
    };

    const {
      data,
      error: updateError,
    } = await supabase
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

    // Hapus hubungan label lama
    const {
      error: deleteLabelError,
    } = await supabase
      .from("produk_label")
      .delete()
      .eq("produk_id", productId);

    if (deleteLabelError) {
      setError(
        "Produk berhasil diperbarui, tetapi label lama gagal diperbarui: " +
          deleteLabelError.message
      );
      setSaving(false);
      return;
    }

    // Simpan label yang baru dipilih
    if (selectedLabelIds.length > 0) {
      const labelRows = selectedLabelIds.map(
        (labelId) => ({
          produk_id: Number(productId),
          label_id: Number(labelId),
        })
      );

      const {
        error: insertLabelError,
      } = await supabase
        .from("produk_label")
        .insert(labelRows);

      if (insertLabelError) {
        setError(
          "Produk berhasil diperbarui, tetapi label gagal disimpan: " +
            insertLabelError.message
        );
        setSaving(false);
        return;
      }
    }

    setMessage(
      "Perubahan produk dan label berhasil disimpan."
    );

    setSaving(false);

    setTimeout(() => {
      router.push("/admin/produk");
    }, 500);
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

        const {
          error: uploadError,
        } = await supabase.storage
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
            .update({
              utama: false,
            })
            .eq(
              "produk_id",
              productId
            );
        }

        const {
          data: insertedPhoto,
          error: photoError,
        } = await supabase
          .from("produk_gambar")
          .insert({
            produk_id: Number(productId),
            url: publicData.publicUrl,
            alt_text:
              form.nama || "Foto Produk",
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
          (uploadError?.message ||
            "Terjadi kesalahan.")
      );
    } finally {
      setUploading(false);

      e.target.value = "";
    }
  }

  async function jadikanUtama(photoId) {
    const supabase = getSupabase();

    if (!supabase) {
      setError("Koneksi database belum tersedia.");
      return;
    }

    setError("");
    setMessage("");

    const {
      error: resetError,
    } = await supabase
      .from("produk_gambar")
      .update({
        utama: false,
      })
      .eq("produk_id", productId);

    if (resetError) {
      setError(
        "Gagal mengatur foto utama: " +
          resetError.message
      );
      return;
    }

    const {
      error: updateError,
    } = await supabase
      .from("produk_gambar")
      .update({
        utama: true,
      })
      .eq("id", photoId);

    if (updateError) {
      setError(
        "Gagal menetapkan foto utama: " +
          updateError.message
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

  async function hapusFoto(item) {
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
      const publicUrl = item.url;

      const bucketUrl =
        supabase.storage
          .from("produk")
          .getPublicUrl("")
          .data.publicUrl;

      let storagePath = "";

      if (
        publicUrl &&
        bucketUrl &&
        publicUrl.startsWith(bucketUrl)
      ) {
        storagePath = publicUrl
          .replace(bucketUrl, "")
          .split("?")[0];
      }

      if (storagePath) {
        const {
          error: storageError,
        } = await supabase.storage
          .from("produk")
          .remove([storagePath]);

        if (storageError) {
          console.warn(
            "Gagal menghapus file storage:",
            storageError
          );
        }
      }

      const {
        error: deleteError,
      } = await supabase
        .from("produk_gambar")
        .delete()
        .eq("id", item.id);

      if (deleteError) {
        throw deleteError;
      }

      setFoto((current) =>
        current.filter(
          (fotoItem) =>
            fotoItem.id !== item.id
        )
      );

      setMessage(
        "Foto produk berhasil dihapus."
      );
    } catch (deleteError) {
      console.error(deleteError);

      setError(
        "Gagal menghapus foto: " +
          (deleteError?.message ||
            "Terjadi kesalahan.")
      );
    }
  }

  if (loading) {
    return (
      <main className="admin-content">
        <div className="admin-card">
          <p>Memuat data produk...</p>
        </div>
      </main>
    );
  }

  if (!produk) {
    return (
      <main className="admin-content">
        <div className="admin-card">
          <div className="admin-message admin-message-error">
            {error || "Produk tidak ditemukan."}
          </div>

          <button
            type="button"
            className="admin-secondary-button"
            onClick={() =>
              router.push("/admin/produk")
            }
            style={{
              marginTop: "16px",
            }}
          >
            ← Kembali ke Produk
          </button>
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

      <div>
        <form
          onSubmit={handleSubmit}
          className="admin-form"
        >
          <div className="pf-tata">
            <div className="pf-kiri admin-card">
              <h2 className="pf-judul">Informasi Produk</h2>
          <div className="admin-form-group">
            <label>Nama Produk</label>

            <input
              name="nama"
              value={form.nama}
              onChange={handleChange}
              placeholder="Nama produk"
            />
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
          <div className="admin-form-group">
            <label>Deskripsi</label>

            <textarea
              name="deskripsi"
              value={form.deskripsi}
              onChange={handleChange}
              rows="6"
            />
          </div>
          {/* LABEL PRODUK */}

          <div className="admin-form-group">
            <label>
              Label Produk
            </label>

            <p
              style={{
                marginTop: "-4px",
                marginBottom: "12px",
                color: "#777",
                fontSize: "14px",
              }}
            >
              Pilih satu atau beberapa label
              yang sesuai dengan produk.
            </p>

            {labels.length === 0 ? (
              <div className="admin-message">
                Belum ada label aktif.
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "10px",
                }}
              >
                {labels.map((label) => {
                  const selected =
                    selectedLabelIds.includes(
                      Number(label.id)
                    );

                  return (
                    <label
                      key={label.id}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "10px 14px",
                        borderRadius: "10px",
                        border: selected
                          ? "2px solid #8a6429"
                          : "1px solid #d8cbbd",
                        background: selected
                          ? "#f7eedf"
                          : "#fff",
                        cursor: "pointer",
                        userSelect: "none",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() =>
                          toggleLabel(
                            label.id
                          )
                        }
                      />

                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "7px",
                        }}
                      >
                        {label.warna && (
                          <span
                            style={{
                              width: "12px",
                              height: "12px",
                              borderRadius: "50%",
                              background:
                                label.warna,
                              display:
                                "inline-block",
                              border:
                                "1px solid #ddd",
                            }}
                          />
                        )}

                        <strong>
                          {label.nama}
                        </strong>
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
            </div>

            <div className="pf-kanan">
              <div className="admin-card">
                <h2 className="pf-judul">Status Produk</h2>
          <div className="admin-form-checkbox">
            <input
              type="checkbox"
              id="tampilkan_di_beranda"
              name="tampilkan_di_beranda"
              checked={
                form.tampilkan_di_beranda
              }
              onChange={handleChange}
            />

            <label htmlFor="tampilkan_di_beranda">
              Tampilkan produk ini di Beranda
            </label>
          </div>

          {/* PRODUK UNGGULAN */}

          <div className="admin-form-checkbox">
            <input
              type="checkbox"
              id="produk_unggulan"
              name="produk_unggulan"
              checked={
                form.produk_unggulan
              }
              onChange={handleChange}
            />

            <label htmlFor="produk_unggulan">
              Jadikan Produk Unggulan
            </label>
          </div>

          {/* STATUS AKTIF */}

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
              </div>

              <div className="admin-card">
                <h2 className="pf-judul">Stok &amp; Satuan</h2>
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
              </div>

              <div className="admin-card">
                <h2 className="pf-judul">Kode &amp; Alamat Produk</h2>
          <div className="admin-form-grid">
            <div className="admin-form-group">
              <label>SKU</label>

              <input
                name="sku"
                value={form.sku}
                onChange={handleChange}
                placeholder="SKU produk"
              />
            </div>

            <div className="admin-form-group">
              <label>Slug (alamat halaman produk)</label>

              <input
                name="slug"
                value={form.slug}
                readOnly
                placeholder="slug-produk"
                style={{ background: "#f6f1ea", color: "#7d6957" }}
              />

              {bolehUbahSlug ? (
                <button
                  type="button"
                  className="admin-secondary-button"
                  style={{ marginTop: "8px", minHeight: "36px" }}
                  onClick={() => {
                    const slugBaru = buatSlugDariNama(form.nama);
                    if (!slugBaru || slugBaru === form.slug) {
                      window.alert("Slug sudah sesuai dengan nama produk.");
                      return;
                    }
                    const yakin = window.confirm(
                      "Buat ulang slug dari nama produk?\n\n" +
                        "Slug lama: " + (form.slug || "-") + "\n" +
                        "Slug baru: " + slugBaru + "\n\n" +
                        "PERHATIAN: link lama produk ini yang sudah dibagikan " +
                        "(WhatsApp, media sosial, Google) tidak akan berfungsi lagi. " +
                        "Perubahan baru tersimpan setelah klik Simpan."
                    );
                    if (yakin) {
                      setForm((f) => ({ ...f, slug: slugBaru }));
                    }
                  }}
                >
                  Buat ulang slug dari nama
                </button>
              ) : null}

              <small style={{ display: "block", marginTop: "6px", color: "#9a8571", fontSize: "12.5px" }}>
                Slug tidak ikut berubah saat nama diubah, supaya link produk
                yang sudah dibagikan tetap berfungsi.
                {!bolehUbahSlug && " Hanya Admin Utama yang bisa mengubahnya."}
              </small>
            </div>
          </div>
              </div>
            </div>
          </div>

          <div className="pf-bawah">

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
          </div>
        </form>
      </div>

      {/* FOTO PRODUK */}

      <div
        className="admin-card"
        style={{
          marginTop: "24px",
        }}
      >
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
            <p
              style={{
                marginTop: "12px",
              }}
            >
              Mengupload foto...
            </p>
          )}
        </div>

        {foto.length === 0 ? (
          <div
            className="admin-message"
            style={{
              marginTop: "20px",
            }}
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
                  border: item.utama
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
                        jadikanUtama(
                          item.id
                        )
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
