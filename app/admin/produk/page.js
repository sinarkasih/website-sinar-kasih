"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "../../../lib/supabase";

export default function AdminProdukPage() {
  const router = useRouter();

  const [produk, setProduk] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    loadProduk();
  }, []);

  async function loadProduk() {
    setLoading(true);
    setError("");

    const supabase = getSupabase();

    if (!supabase) {
      setError("Koneksi database belum tersedia.");
      setLoading(false);
      return;
    }

    const { data, error: produkError } =
      await supabase
        .from("produk")
        .select(`
          id,
          nama,
          sku,
          slug,
          satuan,
          stok,
          aktif,
          deleted_at,
          created_at,
          kategori:kategori_id (
            id,
            nama
          ),
          brand:brand_id (
            id,
            nama
          )
        `)
        .is("deleted_at", null)
        .order("id", { ascending: false });

    if (produkError) {
      console.error(
        "Gagal mengambil produk:",
        produkError
      );

      setError(produkError.message);
      setLoading(false);
      return;
    }

    setProduk(data || []);
    setLoading(false);
  }

  async function pindahkanKeTrash(item) {
    const konfirmasi = window.confirm(
      `Pindahkan produk "${item.nama}" ke Trash?\n\n` +
      `Produk akan disembunyikan dari daftar produk aktif dan tidak tampil di katalog pelanggan.`
    );

    if (!konfirmasi) {
      return;
    }

    const supabase = getSupabase();

    if (!supabase) {
      setError("Koneksi database belum tersedia.");
      return;
    }

    setProcessingId(item.id);
    setError("");

    const { error: updateError } =
      await supabase
        .from("produk")
        .update({
          deleted_at: new Date().toISOString(),
          aktif: false,
        })
        .eq("id", item.id)
        .is("deleted_at", null);

    if (updateError) {
      console.error(
        "Gagal memindahkan produk ke Trash:",
        updateError
      );

      setError(
        `Gagal memindahkan "${item.nama}" ke Trash: ${updateError.message}`
      );

      setProcessingId(null);
      return;
    }

    setProduk((current) =>
      current.filter(
        (produkItem) =>
          produkItem.id !== item.id
      )
    );

    setProcessingId(null);
  }

  const produkFiltered = produk.filter(
    (item) => {
      const keyword =
        search.toLowerCase().trim();

      if (!keyword) return true;

      return (
        item.nama
          ?.toLowerCase()
          .includes(keyword) ||
        item.sku
          ?.toLowerCase()
          .includes(keyword) ||
        item.brand?.nama
          ?.toLowerCase()
          .includes(keyword) ||
        item.kategori?.nama
          ?.toLowerCase()
          .includes(keyword)
      );
    }
  );

  function hapusPencarian() {
    setSearch("");
  }

  return (
    <main className="admin-content">

      <div className="admin-page-header">

        <div>
          <h1>Produk</h1>

          <p>
            Kelola seluruh produk
            Toko Listrik Sinar Kasih.
          </p>
        </div>

        <button
          type="button"
          className="admin-primary-button"
          onClick={() =>
            router.push(
              "/admin/produk/tambah"
            )
          }
        >
          + Tambah Produk
        </button>

      </div>

      <div className="admin-product-toolbar">

        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: "440px",
          }}
        >

          <input
            type="text"
            placeholder="Cari nama produk, SKU, brand..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            style={{
              width: "100%",
              boxSizing: "border-box",
              paddingRight: "44px",
            }}
          />

          {search.trim() !== "" && (
            <button
              type="button"
              onClick={hapusPencarian}
              aria-label="Hapus pencarian"
              title="Hapus pencarian"
              style={{
                position: "absolute",
                right: "8px",
                top: "50%",
                transform:
                  "translateY(-50%)",
                width: "28px",
                height: "28px",
                padding: "0",
                margin: "0",
                border: "none",
                borderRadius: "50%",
                background: "#e8dfd3",
                color: "#4a372d",
                fontSize: "20px",
                lineHeight: "28px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 10,
              }}
            >
              ×
            </button>
          )}

        </div>

        <div className="admin-product-count">
          {produkFiltered.length} produk
        </div>

      </div>

      {error && (
        <div className="admin-message admin-message-error">
          {error}
        </div>
      )}

      {loading ? (
        <div className="admin-card admin-loading">
          Memuat produk...
        </div>
      ) : produkFiltered.length === 0 ? (
        <div className="admin-card admin-empty">

          <h2>
            {search.trim()
              ? "Produk tidak ditemukan"
              : "Belum ada produk"}
          </h2>

          <p>
            {search.trim()
              ? "Coba gunakan kata pencarian yang berbeda."
              : (
                <>
                  Tambahkan produk pertama
                  melalui tombol
                  <strong> Tambah Produk</strong>.
                </>
              )}
          </p>

          {!search.trim() && (
            <button
              type="button"
              className="admin-primary-button"
              onClick={() =>
                router.push(
                  "/admin/produk/tambah"
                )
              }
            >
              + Tambah Produk
            </button>
          )}

        </div>
      ) : (
        <div className="admin-product-table-card">

          <div className="admin-product-table-wrapper">

            <table className="admin-product-table">

              <thead>
                <tr>
                  <th>Produk</th>
                  <th>SKU</th>
                  <th>Kategori</th>
                  <th>Brand</th>
                  <th>Stok</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>

              <tbody>

                {produkFiltered.map(
                  (item) => (
                    <tr key={item.id}>

                      <td>
                        <div className="admin-product-name">
                          {item.nama}
                        </div>

                        <div className="admin-product-slug">
                          /{item.slug}
                        </div>
                      </td>

                      <td>
                        {item.sku || "-"}
                      </td>

                      <td>
                        {item.kategori?.nama ||
                          "-"}
                      </td>

                      <td>
                        {item.brand?.nama ||
                          "-"}
                      </td>

                      <td>
                        {item.stok ?? 0}{" "}
                        {item.satuan || ""}
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

                        <div
                          className="admin-product-actions"
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "8px",
                          }}
                        >

                          <button
                            type="button"
                            onClick={() =>
                              router.push(
                                `/admin/produk/${item.id}/edit`
                              )
                            }
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              router.push(
                                `/admin/produk/${item.id}/harga`
                              )
                            }
                          >
                            Harga
                          </button>

                          {item.aktif && (
                            <button
                              type="button"
                              disabled={
                                processingId ===
                                item.id
                              }
                              onClick={() =>
                                pindahkanKeTrash(
                                  item
                                )
                              }
                              style={{
                                color: "#8b3a3a",
                              }}
                            >
                              {processingId ===
                              item.id
                                ? "Memindahkan..."
                                : "Pindahkan ke Trash"}
                            </button>
                          )}

                        </div>

                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>

        </div>
      )}

    </main>
  );
}
