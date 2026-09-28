"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "../../../lib/supabase";

export default function AdminKategoriPage() {
  const router = useRouter();

  const [kategori, setKategori] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");

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
        .order("urutan", { ascending: true })
        .order("nama", { ascending: true });

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

  function namaParent(parentId) {
    const parent = kategori.find(
      (item) =>
        Number(item.id) === Number(parentId)
    );

    return parent
      ? parent.nama
      : "-";
  }

  async function toggleAktif(item) {
    const supabase = getSupabase();

    if (!supabase) {
      setError("Koneksi database belum tersedia.");
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
        .eq("id", item.id);

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

  return (
    <main className="admin-content">

      <div className="admin-page-header">
        <div>
          <h1>Semua Kategori</h1>

          <p>
            Kelola semua kategori dan
            subkategori produk.
          </p>
        </div>

        <button
          type="button"
          className="admin-primary-button"
          onClick={() =>
            router.push(
              "/admin/kategori/tambah"
            )
          }
        >
          + Tambah Kategori
        </button>
      </div>

      {error && (
        <div
          className="admin-message admin-message-error"
          style={{ marginBottom: "18px" }}
        >
          {error}
        </div>
      )}

      {message && (
        <div
          className="admin-message admin-message-success"
          style={{ marginBottom: "18px" }}
        >
          {message}
        </div>
      )}

      <div className="admin-card">

        <div className="admin-page-header">
          <div>
            <h2>Daftar Kategori</h2>

            <p>
              {kategori.length} kategori tersimpan.
            </p>
          </div>
        </div>

        <div
          className="admin-product-toolbar"
          style={{ marginTop: "16px" }}
        >
          <input
            type="text"
            placeholder="Cari kategori..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </div>

        {loading ? (
          <div style={{ padding: "20px 0" }}>
            Memuat kategori...
          </div>
        ) : filteredKategori.length === 0 ? (
          <div
            className="admin-message"
            style={{ marginTop: "20px" }}
          >
            Belum ada kategori yang sesuai.
          </div>
        ) : (
          <div
            className="admin-product-table-wrapper"
            style={{ marginTop: "20px" }}
          >
            <table className="admin-product-table">

              <thead>
                <tr>
                  <th>Gambar</th>
                  <th>Nama</th>
                  <th>Slug</th>
                  <th>Kategori Induk</th>
                  <th>Urutan</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>

              <tbody>
                {filteredKategori.map(
                  (item) => (
                    <tr key={item.id}>

                      <td>
                        {item.gambar_url ? (
                          <img
                            src={item.gambar_url}
                            alt={item.nama}
                            style={{
                              width: "70px",
                              height: "55px",
                              objectFit: "contain",
                              borderRadius: "8px",
                              background:
                                "#f5f0e8",
                            }}
                          />
                        ) : (
                          <span>-</span>
                        )}
                      </td>

                      <td>
                        <strong>
                          {item.nama}
                        </strong>
                      </td>

                      <td>
                        {item.slug || "-"}
                      </td>

                      <td>
                        {item.parent_id
                          ? namaParent(
                              item.parent_id
                            )
                          : "Kategori Utama"}
                      </td>

                      <td>
                        {item.urutan ?? 0}
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
                              router.push(
                                `/admin/kategori/${item.id}/edit`
                              )
                            }
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              toggleAktif(item)
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
