"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "../../../../lib/supabase";

export default function TrashProdukPage() {
  const router = useRouter();
  const supabase = getSupabase();

  const [produk, setProduk] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [message, setMessage] = useState("");

  async function loadProduk() {
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase
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
        brand(nama),
        kategori(nama)
      `)
      .not("deleted_at", "is", null)
      .order("deleted_at", {
        ascending: false,
      });

    if (error) {
      setMessage(
        "Gagal mengambil produk Trash: " +
          error.message
      );
      setProduk([]);
    } else {
      setProduk(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadProduk();
  }, []);

  const filteredProduk = useMemo(() => {
    const keyword = search
      .trim()
      .toLowerCase();

    if (!keyword) {
      return produk;
    }

    return produk.filter((item) => {
      const text = `
        ${item.nama || ""}
        ${item.sku || ""}
        ${item.slug || ""}
        ${item.brand?.nama || ""}
        ${item.kategori?.nama || ""}
      `.toLowerCase();

      return text.includes(keyword);
    });
  }, [produk, search]);

  async function restoreProduk(item) {
    const yakin = window.confirm(
      `Restore produk "${item.nama}"?`
    );

    if (!yakin) return;

    setSavingId(item.id);
    setMessage("");

    const { error } = await supabase
      .from("produk")
      .update({
        deleted_at: null,
      })
      .eq("id", item.id)
      .not("deleted_at", "is", null);

    if (error) {
      setMessage(
        "Gagal melakukan restore: " +
          error.message
      );
      setSavingId(null);
      return;
    }

    await loadProduk();
    setSavingId(null);
  }

  function formatTanggal(value) {
    if (!value) return "-";

    const tanggal = new Date(value);

    return tanggal.toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  return (
    <main className="admin-content">

      <style jsx>{`
        .trash-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 24px;
        }

        .trash-header h1 {
          margin: 0 0 6px;
        }

        .trash-header p {
          margin: 0;
        }

        .trash-info {
          margin-bottom: 20px;
          padding: 14px 16px;
          border-radius: 10px;
          background: #f7f3ed;
          color: #66584e;
          font-size: 14px;
          line-height: 1.5;
        }

        .trash-toolbar {
          margin-bottom: 20px;
        }

        .trash-search {
          position: relative;
          max-width: 520px;
        }

        .trash-search input {
          width: 100%;
          height: 44px;
          box-sizing: border-box;
          padding: 0 42px 0 14px;
          border: 1px solid #d7d0c7;
          border-radius: 8px;
          background: #fff;
          font-size: 14px;
          outline: none;
        }

        .trash-search input:focus {
          border-color: #9a7657;
        }

        .trash-clear {
          position: absolute;
          right: 9px;
          top: 50%;
          transform: translateY(-50%);
          width: 28px;
          height: 28px;
          padding: 0;
          border: none;
          background: transparent;
          color: #777;
          font-size: 20px;
          line-height: 28px;
          cursor: pointer;
        }

        .trash-table-wrapper {
          width: 100%;
          overflow-x: auto;
          border: 1px solid #e2ddd6;
          border-radius: 10px;
        }

        .trash-table {
          width: 100%;
          min-width: 950px;
          border-collapse: collapse;
          table-layout: fixed;
        }

        .trash-table th {
          padding: 13px 14px;
          background: #f7f3ed;
          border-bottom: 1px solid #ddd6ce;
          text-align: left;
          font-size: 13px;
          font-weight: 700;
          white-space: nowrap;
        }

        .trash-table td {
          padding: 14px;
          border-bottom: 1px solid #eee9e3;
          vertical-align: middle;
          font-size: 14px;
          line-height: 1.45;
          word-break: break-word;
        }

        .trash-table tbody tr:last-child td {
          border-bottom: none;
        }

        .trash-table tbody tr:hover {
          background: #fcfaf7;
        }

        .col-product {
          width: 23%;
        }

        .col-sku {
          width: 14%;
        }

        .col-category {
          width: 14%;
        }

        .col-brand {
          width: 13%;
        }

        .col-deleted {
          width: 17%;
        }

        .col-status {
          width: 8%;
        }

        .col-action {
          width: 11%;
        }

        .product-name {
          font-weight: 700;
          color: #3f2b20;
        }

        .sku-text {
          color: #555;
          font-size: 13px;
        }

        .muted-text {
          color: #888;
        }

        .trash-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 28px;
          padding: 4px 9px;
          border-radius: 999px;
          background: #f3eeee;
          color: #777;
          font-size: 12px;
          font-weight: 600;
        }

        .restore-button {
          width: 100%;
          min-height: 38px;
          padding: 8px 10px;
          white-space: nowrap;
        }

        .trash-empty {
          padding: 30px 10px;
          text-align: center;
          color: #777;
        }

        @media (max-width: 800px) {
          .trash-header {
            flex-direction: column;
          }

          .trash-search {
            max-width: none;
          }
        }
      `}</style>

      {/* HEADER */}

      <div className="trash-header">

        <div>
          <h1>Trash Produk</h1>

          <p>
            Produk yang dihapus sementara dan
            masih dapat dipulihkan.
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

      {/* CONTENT */}

      <div className="admin-card">

        <div className="admin-section-header">

          <div>
            <h2>Produk di Trash</h2>

            <p>
              {filteredProduk.length} produk
              ditampilkan.
            </p>
          </div>

        </div>

        <div className="trash-info">
          Produk di sini belum dihapus permanen.
          Gunakan <strong>Restore</strong> untuk
          mengembalikannya ke daftar produk.
        </div>

        {message && (
          <div className="admin-message">
            {message}
          </div>
        )}

        {/* SEARCH */}

        <div className="trash-toolbar">

          <div className="trash-search">

            <input
              type="search"
              placeholder="Cari produk di Trash..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              autoComplete="off"
            />

            {search && (
              <button
                type="button"
                className="trash-clear"
                onClick={() => setSearch("")}
                aria-label="Hapus pencarian"
              >
                ×
              </button>
            )}

          </div>

        </div>

        {/* TABLE */}

        {loading ? (
          <div className="trash-empty">
            Memuat Trash Produk...
          </div>
        ) : filteredProduk.length === 0 ? (
          <div className="trash-empty">
            Trash Produk masih kosong.
          </div>
        ) : (
          <div className="trash-table-wrapper">

            <table className="trash-table">

              <thead>
                <tr>

                  <th className="col-product">
                    Produk
                  </th>

                  <th className="col-sku">
                    SKU
                  </th>

                  <th className="col-category">
                    Kategori
                  </th>

                  <th className="col-brand">
                    Brand
                  </th>

                  <th className="col-deleted">
                    Masuk Trash
                  </th>

                  <th className="col-status">
                    Status
                  </th>

                  <th className="col-action">
                    Aksi
                  </th>

                </tr>
              </thead>

              <tbody>

                {filteredProduk.map((item) => (

                  <tr key={item.id}>

                    <td>
                      <div className="product-name">
                        {item.nama}
                      </div>
                    </td>

                    <td>
                      <span className="sku-text">
                        {item.sku || "-"}
                      </span>
                    </td>

                    <td>
                      {item.kategori?.nama || (
                        <span className="muted-text">
                          -
                        </span>
                      )}
                    </td>

                    <td>
                      {item.brand?.nama || (
                        <span className="muted-text">
                          -
                        </span>
                      )}
                    </td>

                    <td>
                      {formatTanggal(
                        item.deleted_at
                      )}
                    </td>

                    <td>
                      <span className="trash-badge">
                        Trash
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="admin-secondary-button restore-button"
                        onClick={() =>
                          restoreProduk(item)
                        }
                        disabled={
                          savingId === item.id
                        }
                      >
                        {savingId === item.id
                          ? "Memulihkan..."
                          : "Restore"}
                      </button>
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>
        )}

      </div>

    </main>
  );
}
