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

export default function AdminKategoriPage() {
  const [kategori, setKategori] = useState([]);

  const [nama, setNama] = useState("");
  const [slug, setSlug] = useState("");
  const [parentId, setParentId] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [urutan, setUrutan] = useState(1);

  const [gambarUrl, setGambarUrl] = useState("");
  const [gambarFile, setGambarFile] = useState(null);
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
    loadKategori();
  }, []);

  async function loadKategori() {
    setLoading(true);
    setError("");

    const supabase = getSupabase();

    if (!supabase) {
      setError("Koneksi database belum tersedia.");
      setLoading(false);
      return;
    }

    const { data, error: kategoriError } =
      await supabase
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
        .order("urutan", {
          ascending: true,
        })
        .order("nama", {
          ascending: true,
        });

    if (kategoriError) {
      setError(
        "Gagal mengambil kategori: " +
          kategoriError.message
      );
      setLoading(false);
      return;
    }

    setKategori(data || []);
    setLoading(false);
  }

  function resetForm() {
    setEditingId(null);
    setNama("");
    setSlug("");
    setParentId("");
    setDeskripsi("");
    setUrutan(1);
    setGambarUrl("");
    setGambarFile(null);
    setPreview("");
    setShowForm(false);
    setError("");
  }

  function bukaTambah() {
    const nomorBerikutnya =
      kategori.length > 0
        ? Math.max(
            ...kategori.map(
              (item) =>
                Number(item.urutan) || 0
            )
          ) + 1
        : 1;

    setEditingId(null);
    setNama("");
    setSlug("");
    setParentId("");
    setDeskripsi("");
    setUrutan(nomorBerikutnya);
    setGambarUrl("");
    setGambarFile(null);
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

    setParentId(
      item.parent_id
        ? String(item.parent_id)
        : ""
    );

    setDeskripsi(
      item.deskripsi || ""
    );

    setUrutan(
      item.urutan ?? 1
    );

    setGambarUrl(
      item.gambar_url || ""
    );

    setGambarFile(null);

    setPreview(
      item.gambar_url || ""
    );

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
      setError(
        "Nama kategori wajib diisi."
      );
      setSaving(false);
      return;
    }

    const finalSlug =
      slug.trim() || buatSlug(nama);

    if (
      parentId &&
      Number(parentId) ===
        Number(editingId)
    ) {
      setError(
        "Kategori tidak boleh menjadi induknya sendiri."
      );
      setSaving(false);
      return;
    }

    try {
      let kategoriId = editingId;

      const oldImageUrl =
        gambarUrl;

      if (editingId) {
        const { error: updateError } =
          await supabase
            .from("kategori")
            .update({
              nama: nama.trim(),
              slug: finalSlug,
              deskripsi:
                deskripsi.trim() ||
                null,
              parent_id: parentId
                ? Number(parentId)
                : null,
              urutan:
                Number(urutan) || 0,
            })
            .eq(
              "id",
              editingId
            );

        if (updateError) {
          throw updateError;
        }
      } else {
        const { data, error: insertError } =
          await supabase
            .from("kategori")
            .insert({
              nama: nama.trim(),
              slug: finalSlug,
              deskripsi:
                deskripsi.trim() ||
                null,
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

        kategoriId = data.id;
      }

      if (gambarFile) {
        setUploading(true);

        const newUrl =
          await uploadGambar(
            supabase,
            kategoriId,
            gambarFile
          );

        const { error: imageError } =
          await supabase
            .from("kategori")
            .update({
              gambar_url: newUrl,
            })
            .eq(
              "id",
              kategoriId
            );

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
        editingId
          ? "Kategori berhasil diperbarui."
          : "Kategori berhasil ditambahkan."
      );

      setEditingId(null);
      setNama("");
      setSlug("");
      setParentId("");
      setDeskripsi("");
      setUrutan(1);
      setGambarUrl("");
      setGambarFile(null);
      setPreview("");
      setShowForm(false);

      await loadKategori();
    } catch (submitError) {
      setUploading(false);

      setError(
        "Gagal menyimpan kategori: " +
          submitError.message
      );
    }

    setSaving(false);
  }

  async function hapusGambar(item) {
    if (!item.gambar_url) return;

    const yakin = window.confirm(
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

    try {
      await hapusFileStorage(
        supabase,
        item.gambar_url
      );

      const { error } =
        await supabase
          .from("kategori")
          .update({
            gambar_url: null,
          })
          .eq(
            "id",
            item.id
          );

      if (error) {
        throw error;
      }

      if (
        editingId === item.id
      ) {
        setGambarUrl("");
        setPreview("");
      }

      setMessage(
        "Gambar kategori berhasil dihapus."
      );

      await loadKategori();
    } catch (deleteError) {
      setError(
        "Gagal menghapus gambar: " +
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
        .from("kategori")
        .update({
          aktif: !item.aktif,
        })
        .eq(
          "id",
          item.id
        );

    if (updateError) {
      setError(
        "Gagal mengubah status kategori: " +
          updateError.message
      );
      return;
    }

    setMessage(
      `Kategori "${item.nama}" sekarang ${
        !item.aktif
          ? "aktif"
          : "nonaktif"
      }.`
    );

    await loadKategori();
  }

  const filteredKategori =
    kategori.filter((item) => {
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

  function namaParent(
    parentIdValue
  ) {
    const parent =
      kategori.find(
        (item) =>
          Number(item.id) ===
          Number(parentIdValue)
      );

    return parent
      ? parent.nama
      : "-";
  }

  return (
    <main className="admin-content">

      {/* HEADER HALAMAN */}

      <div className="admin-page-header">
        <div>
          <h1>Kategori</h1>

          <p>
            Kelola semua kategori dan
            subkategori produk.
          </p>
        </div>
      </div>

      {/* PESAN BERHASIL */}

      {message && (
        <div
          className="admin-message admin-message-success"
          style={{
            marginBottom: "20px",
          }}
        >
          {message}
        </div>
      )}

      {/* ERROR DI LUAR FORM */}

      {error && !showForm && (
        <div
          className="admin-message admin-message-error"
          style={{
            marginBottom: "20px",
          }}
        >
          {error}
        </div>
      )}

      {/* CARD DAFTAR KATEGORI + TOMBOL TAMBAH */}

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
              justifyContent:
                "space-between",
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
                Daftar Kategori
              </h2>

              <p
                style={{
                  margin:
                    "6px 0 0",
                }}
              >
                {kategori.length} kategori
                tersimpan.
              </p>
            </div>

            <button
              type="button"
              className="admin-primary-button"
              onClick={bukaTambah}
            >
              + Tambah Kategori
            </button>
          </div>
        </div>
      )}

      {/* FORM TAMBAH / EDIT */}

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
                  ? "Edit Kategori"
                  : "Tambah Kategori"}
              </h2>

              <p>
                {editingId
                  ? "Perbarui informasi kategori."
                  : "Tambahkan kategori baru ke toko."}
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

            {/* NAMA + SLUG */}

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
                    setSlug(
                      e.target.value
                    )
                  }
                  placeholder="lampu"
                />
              </div>

            </div>

            {/* KATEGORI INDUK + URUTAN */}

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
                        item.id !==
                        editingId
                    )
                    .map(
                      (item) => (
                        <option
                          key={
                            item.id
                          }
                          value={
                            item.id
                          }
                        >
                          {item.nama}
                        </option>
                      )
                    )}
                </select>
              </div>

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

            </div>

            {/* DESKRIPSI */}

            <div className="admin-form-group">

              <label>
                Deskripsi
              </label>

              <textarea
                rows="4"
                value={deskripsi}
                onChange={(e) =>
                  setDeskripsi(
                    e.target.value
                  )
                }
                placeholder="Deskripsi kategori..."
              />

            </div>

            {/* GAMBAR */}

            <div className="admin-form-group">

              <label>
                Gambar Kategori
              </label>

              {preview && (
                <div
                  style={{
                    width: "180px",
                    height: "140px",
                    borderRadius:
                      "12px",
                    overflow: "hidden",
                    background:
                      "#f5f0e8",
                    border:
                      "1px solid #ddd2c3",
                    marginBottom:
                      "12px",
                    display: "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                  }}
                >
                  <img
                    src={preview}
                    alt={
                      nama ||
                      "Preview kategori"
                    }
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit:
                        "contain",
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

              {editingId &&
                gambarUrl && (
                  <div
                    style={{
                      marginTop:
                        "10px",
                    }}
                  >
                    <button
                      type="button"
                      className="admin-secondary-button"
                      onClick={() =>
                        hapusGambar(
                          {
                            id: editingId,
                            gambar_url:
                              gambarUrl,
                          }
                        )
                      }
                    >
                      Hapus Gambar
                    </button>
                  </div>
                )}

            </div>

            {/* ERROR FORM */}

            {error && (
              <div className="admin-message admin-message-error">
                {error}
              </div>
            )}

            {/* TOMBOL */}

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
                  saving ||
                  uploading
                }
              >
                {uploading
                  ? "Mengupload gambar..."
                  : saving
                  ? "Menyimpan..."
                  : editingId
                  ? "Simpan Perubahan"
                  : "Simpan Kategori"}
              </button>

              <button
                type="button"
                className="admin-secondary-button"
                onClick={
                  resetForm
                }
              >
                Batal
              </button>

            </div>

          </form>
        </div>
      )}

      {/* DAFTAR SEMUA KATEGORI */}

      <div className="admin-card">

        <div className="admin-page-header">
          <div>
            <h2>
              Semua Kategori
            </h2>

            <p>
              Kategori diurutkan
              berdasarkan Urutan Tampil.
            </p>
          </div>
        </div>

        {/* SEARCH */}

        <div
          className="admin-product-toolbar"
          style={{
            marginTop: "16px",
          }}
        >
          <input
            type="text"
            placeholder="Cari kategori..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
          />
        </div>

        {/* DATA */}

        {loading ? (
          <div
            style={{
              padding:
                "20px 0",
            }}
          >
            Memuat kategori...
          </div>
        ) : filteredKategori.length ===
          0 ? (
          <div
            className="admin-message"
            style={{
              marginTop:
                "20px",
            }}
          >
            Belum ada kategori
            yang sesuai.
          </div>
        ) : (
          <div
            className="admin-product-table-wrapper"
            style={{
              marginTop:
                "20px",
            }}
          >

            <table className="admin-product-table">

              <thead>
                <tr>
                  <th>
                    Urutan
                  </th>

                  <th>
                    Gambar
                  </th>

                  <th>
                    Nama
                  </th>

                  <th>
                    Slug
                  </th>

                  <th>
                    Kategori Induk
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

                {filteredKategori.map(
                  (item) => (
                    <tr
                      key={
                        item.id
                      }
                    >

                      <td>
                        <strong>
                          {item.urutan ??
                            0}
                        </strong>
                      </td>

                      <td>
                        {item.gambar_url ? (
                          <img
                            src={
                              item.gambar_url
                            }
                            alt={
                              item.nama
                            }
                            style={{
                              width:
                                "70px",
                              height:
                                "55px",
                              objectFit:
                                "contain",
                              borderRadius:
                                "8px",
                              background:
                                "#f5f0e8",
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
                        {item.parent_id
                          ? namaParent(
                              item.parent_id
                            )
                          : "Kategori Utama"}
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
