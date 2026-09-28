"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "../../../../lib/supabase";

export default function AdminVariasiPage() {
  const router = useRouter();

  const [variasi, setVariasi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadVariasi();
  }, []);

  async function loadVariasi() {
    setLoading(true);
    setError("");

    const supabase = getSupabase();

    if (!supabase) {
      setError("Koneksi database belum tersedia.");
      setLoading(false);
      return;
    }

    const {
      data,
      error: variasiError,
    } = await supabase
      .from("variasi_produk")
      .select(`
        id,
        produk_id,
        nama,
        nilai,
        sku,
        stok,
        aktif,
        urutan,
        created_at,
        produk:produk_id (
          id,
          nama
        )
      `)
      .order("produk_id", {
        ascending: true,
      })
      .order("urutan", {
        ascending: true,
      })
      .order("id", {
        ascending: true,
      });

    if (variasiError) {
      setError(
        "Gagal mengambil variasi: " +
          variasiError.message
      );
      setLoading(false);
      return;
    }

    setVariasi(data || []);
    setLoading(false);
  }

  async function toggleAktif(item) {
    const supabase = getSupabase();

    if (!supabase) {
      setError("Koneksi database belum tersedia.");
      return;
    }

    setError("");
    setMessage("");

    const {
      error: updateError,
    } = await supabase
      .from("variasi_produk")
      .update({
        aktif: !item.aktif,
      })
      .eq("id", item.id);

    if (updateError) {
      setError(
        "Gagal mengubah status variasi: " +
          updateError.message
      );
      return;
    }

    setMessage(
      `Variasi "${item.nama} ${
        item.nilai || ""
      }" sekarang ${
        !item.aktif
          ? "aktif"
          : "nonaktif"
      }.`
    );

    await loadVariasi();
  }

  const filteredVariasi = variasi.filter(
    (item) => {
      const keyword =
        search.toLowerCase().trim();

      if (!keyword) return true;

      const namaProduk =
        item.produk?.nama || "";

      return (
        namaProduk
          .toLowerCase()
          .includes(keyword) ||
        item.nama
          ?.toLowerCase()
          .includes(keyword) ||
        item.nilai
          ?.toLowerCase()
          .includes(keyword) ||
        item.sku
          ?.toLowerCase()
          .includes(keyword)
      );
    }
  );

  return (
    <main className="admin-content">

      <div className="admin-page-header">

        <div>
          <h1>Semua Variasi Produk</h1>

          <p>
            Kelola variasi dari semua produk
            Toko Listrik Sinar Kasih.
          </p>
        </div>

        <button
          type="button"
          className="admin-primary-button"
          onClick={() =>
            router.push(
              "/admin/produk/variasi/tambah"
            )
          }
        >
          + Tambah Variasi
        </button>

      </div>

      {error && (
        <div
          className="admin-message admin-message-error"
          style={{
            marginBottom: "18px",
          }}
        >
          {error}
        </div>
      )}

      {message && (
        <div
          className="admin-message admin-message-success"
          style={{
            marginBottom: "18px",
          }}
        >
          {message}
        </div>
      )}

      <div className="admin-card">

        <div className="admin-page-header">

          <div>
            <h2>Daftar Variasi</h2>

            <p>
              {variasi.length} variasi
              tersimpan.
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
            placeholder="Cari produk, variasi, nilai atau SKU..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </div>

        {loading ? (
          <div
            style={{
              padding: "20px 0",
            }}
          >
            Memuat variasi...
          </div>
        ) : filteredVariasi.length === 0 ? (
          <div
            className="admin-message"
            style={{
              marginTop: "20px",
            }}
          >
            Belum ada variasi yang sesuai.
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
                  <th>Produk</th>
                  <th>Nama Variasi</th>
                  <th>Nilai</th>
                  <th>SKU</th>
                  <th>Stok</th>
                  <th>Urutan</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>

              <tbody>

                {filteredVariasi.map(
                  (item) => (
                    <tr key={item.id}>

                      <td>
                        <strong>
                          {item.produk?.nama ||
                            "-"}
                        </strong>
                      </td>

                      <td>
                        {item.nama || "-"}
                      </td>

                      <td>
                        <strong>
                          {item.nilai || "-"}
                        </strong>
                      </td>

                      <td>
                        {item.sku || "-"}
                      </td>

                      <td>
                        {item.stok ?? 0}
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
                                `/admin/produk/variasi/${item.id}/edit`
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
