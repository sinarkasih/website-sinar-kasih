"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "../../../lib/supabase";

function buatSlug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function AdminBrandPage() {
  const [brand, setBrand] = useState([]);

  const [nama, setNama] = useState("");
  const [slug, setSlug] = useState("");
  const [urutan, setUrutan] = useState(1);

  const [logoUrl, setLogoUrl] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [preview, setPreview] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [search, setSearch] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadBrand();
  }, []);

  async function loadBrand() {
    setLoading(true);
    setError("");

    const supabase = getSupabase();

    if (!supabase) {
      setError("Koneksi database belum tersedia.");
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
          urutan,
          aktif,
          logo_url
        `)
        .order("urutan", {
          ascending: true,
        })
        .order("nama", {
          ascending: true,
        });

    if (brandError) {
      setError(
        "Gagal mengambil brand: " +
          brandError.message
      );
      setLoading(false);
      return;
    }

    setBrand(data || []);
    setLoading(false);
  }

  function resetForm() {
    setEditingId(null);
    setNama("");
    setSlug("");
    setUrutan(1);
    setLogoUrl("");
    setLogoFile(null);
    setPreview("");
    setShowForm(false);
    setError("");
  }

  function bukaTambah() {
    setEditingId(null);
    setNama("");
    setSlug("");
    setUrutan(
      brand.length > 0
        ? Math.max(
            ...brand.map(
              (item) =>
                Number(item.urutan) || 0
            )
          ) + 1
        : 1
    );
    setLogoUrl("");
    setLogoFile(null);
    setPreview("");
    setError("");
    setMessage("");
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function mulaiEdit(item) {
    setEditingId(item.id);

    setNama(item.nama || "");
    setSlug(item.slug || "");
    setUrutan(item.urutan ?? 1);

    setLogoUrl(item.logo_url || "");
    setLogoFile(null);
    setPreview(item.logo_url || "");

    setError("");
    setMessage("");
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function handleNamaChange(value) {
    setNama(value);

    if (!editingId) {
      setSlug(buatSlug(value));
    }
  }

  function handleLogoChange(e) {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran logo maksimal 5 MB.");
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
    const extension =
      file.name.split(".").pop() || "png";

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

    const index = url.indexOf(marker);

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
      setError("Nama brand wajib diisi.");
      setSaving(false);
      return;
    }

    const finalSlug =
      slug.trim() || buatSlug(nama);

    try {
      let brandId = editingId;

      const oldLogoUrl = logoUrl;

      if (editingId) {
        const { error: updateError } =
          await supabase
            .from("brand")
            .update({
              nama: nama.trim(),
              slug: finalSlug,
              urutan:
                Number(urutan) || 0,
            })
            .eq("id", editingId);

        if (updateError) {
          throw updateError;
        }
      } else {
        const { data, error: insertError } =
          await supabase
            .from("brand")
            .insert({
              nama: nama.trim(),
              slug: finalSlug,
              urutan:
                Number(urutan) || 0,
              aktif: true,
            })
            .select()
            .single();

        if (insertError) {
          throw insertError;
        }

        brandId = data.id;
      }

      if (logoFile) {
        setUploading(true);

        const newUrl =
          await uploadLogo(
            supabase,
            brandId,
            logoFile
          );

        const { error: logoError } =
          await supabase
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
        editingId
          ? "Brand berhasil diperbarui."
          : "Brand berhasil ditambahkan."
      );

      setEditingId(null);
      setNama("");
      setSlug("");
      setUrutan(1);
      setLogoUrl("");
      setLogoFile(null);
      setPreview("");
      setShowForm(false);

      await loadBrand();
    } catch (submitError) {
      setUploading(false);

      setError(
        "Gagal menyimpan brand: " +
          submitError.message
      );
    }

    setSaving(false);
  }

  async function hapusLogo(item) {
    if (!item.logo_url) return;

    const yakin = window.confirm(
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

    try {
      await hapusFileStorage(
        supabase,
        item.logo_url
      );

      const { error } =
        await supabase
          .from("brand")
          .update({
            logo_url: null,
          })
          .eq("id", item.id);

      if (error) {
        throw error;
      }

      if (editingId === item.id) {
        setLogoUrl("");
        setPreview("");
      }

      setMessage(
        "Logo brand berhasil dihapus."
      );

      await loadBrand();
    } catch (deleteError) {
      setError(
        "Gagal menghapus logo: " +
          deleteError.message
      );
    }
  }

  async function toggleAktif(item) {
    const supabase = getSupabase();

    if (!supabase) {
      setError(
        "Koneksi database belum tersedia."
      );
      return;
    }

    setError("");
    setMessage("");

    const { error: updateError } =
      await supabase
        .from("brand")
        .update({
          aktif: !item.aktif,
        })
        .eq("id", item.id);

    if (updateError) {
      setError(
        "Gagal mengubah status brand: " +
          updateError.message
      );
      return;
    }

    setMessage(
      `Brand "${item.nama}" sekarang ${
        !item.aktif
          ? "aktif"
          : "nonaktif"
      }.`
    );

    await loadBrand();
  }

  const filteredBrand =
    brand.filter((item) => {
      const keyword =
        search.toLowerCase().trim();

      if (!keyword) return true;

      return (
        item.nama
          ?.toLowerCase()
          .includes(keyword) ||
        item.slug
          ?.toLowerCase()
          .includes(keyword)
      );
    });

  return (
    <main className="admin-content">

      <div className="admin-page-header">
        <div>
          <h1>Brand</h1>

          <p>
            Kelola brand, logo, dan urutan
            brand Toko Listrik Sinar Kasih.
          </p>
        </div>
      </div>

      {message && (
        <div
          className="admin-message admin-message-success"
          style={{ marginBottom: "20px" }}
        >
          {message}
        </div>
      )}

      {error && !showForm && (
        <div
          className="admin-message admin-message-error"
          style={{ marginBottom: "20px" }}
        >
          {error}
        </div>
      )}

      {!showForm && (
        <div
          className="admin-card"
          style={{
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "14px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                }}
              >
                Daftar Brand
              </h2>

              <p
                style={{
                  margin:
                    "6px 0 0",
                }}
              >
                {brand.length} brand
                tersimpan.
              </p>
            </div>

            <button
              type="button"
              className="admin-primary-button"
              onClick={bukaTambah}
            >
              + Tambah Brand
            </button>
          </div>
        </div>
      )}

      {showForm && (
        <div
          className="admin-card"
          style={{
            marginBottom: "24px",
          }}
        >
          <div
            className="admin-page-header"
          >
            <div>
              <h2>
                {editingId
                  ? "Edit Brand"
                  : "Tambah Brand"}
              </h2>

              <p>
                Isi informasi brand dan
                tentukan urutan tampilnya.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="admin-form"
            style={{
              marginTop: "18px",
            }}
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
                    setSlug(
                      e.target.value
                    )
                  }
                  placeholder="philips"
                />
              </div>

            </div>

            <div className="admin-form-grid">

              <div className="admin-form-group">
                <label>
                  Urutan Tampil
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

                <small>
                  Angka lebih kecil akan
                  tampil lebih dahulu.
                </small>
              </div>

              <div className="admin-form-group">
                <label>
                  Logo Brand
                </label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={
                    handleLogoChange
                  }
                />

                <small>
                  JPG, PNG atau WEBP.
                  Maksimal 5 MB.
                </small>
              </div>

            </div>

            {preview && (
              <div className="admin-form-group">
                <label>
                  Preview Logo
                </label>

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
                    justifyContent:
                      "center",
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

                {editingId &&
                  logoUrl && (
                    <button
                      type="button"
                      className="admin-secondary-button"
                      onClick={() =>
                        hapusLogo({
                          id: editingId,
                          logo_url:
                            logoUrl,
                        })
                      }
                    >
                      Hapus Logo
                    </button>
                  )}
              </div>
            )}

            {error && (
              <div className="admin-message admin-message-error">
                {error}
              </div>
            )}

            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
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
                  : editingId
                  ? "Simpan Perubahan"
                  : "Simpan Brand"}
              </button>

              <button
                type="button"
                className="admin-secondary-button"
                onClick={resetForm}
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-card">

        <div className="admin-page-header">
          <div>
            <h2>
              Semua Brand
            </h2>

            <p>
              Brand diurutkan berdasarkan
              Urutan Tampil.
            </p>
          </div>
        </div>

        <div
          className="admin-product-toolbar"
          style={{
            marginTop: "16px",
          }}
        >
          <input
            type="text"
            placeholder="Cari brand..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
          />
        </div>

        {loading ? (
          <div
            style={{
              padding: "20px 0",
            }}
          >
            Memuat brand...
          </div>
        ) : filteredBrand.length === 0 ? (
          <div
            className="admin-message"
            style={{
              marginTop: "20px",
            }}
          >
            Belum ada brand yang sesuai.
          </div>
        ) : (
          <div
            className="admin-product-table-wrapper"
            style={{
              marginTop: "20px",
            }}
          >
            <table className="admin-product-table">

              <thead>
                <tr>
                  <th>
                    Urutan
                  </th>

                  <th>
                    Logo
                  </th>

                  <th>
                    Nama Brand
                  </th>

                  <th>
                    Slug
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Aksi
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredBrand.map(
                  (item) => (
                    <tr
                      key={item.id}
                    >
                      <td>
                        <strong>
                          {item.urutan ??
                            0}
                        </strong>
                      </td>

                      <td>
                        {item.logo_url ? (
                          <img
                            src={
                              item.logo_url
                            }
                            alt={
                              item.nama
                            }
                            style={{
                              width:
                                "80px",
                              height:
                                "55px",
                              objectFit:
                                "contain",
                              borderRadius:
                                "8px",
                              background:
                                "#fff",
                            }}
                          />
                        ) : (
                          <span>
                            -
                          </span>
                        )}
                      </td>

                      <td>
                        <strong>
                          {item.nama}
                        </strong>
                      </td>

                      <td>
                        {item.slug ||
                          "-"}
                      </td>

                      <td>
                        {item.aktif ? (
                          <span className="admin-status active">
                            Aktif
                          </span>
                        ) : (
                          <span className="admin-status inactive">
                            Nonaktif
                          </span>
                        )}
                      </td>

                      <td>
                        <div className="admin-product-actions">

                          <button
                            type="button"
                            onClick={() =>
                              mulaiEdit(
                                item
                              )
                            }
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              toggleAktif(
                                item
                              )
                            }
                          >
                            {item.aktif
                              ? "Nonaktifkan"
                              : "Aktifkan"}
                          </button>

                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>

            </table>
          </div>
        )}
      </div>

    </main>
  );
}
