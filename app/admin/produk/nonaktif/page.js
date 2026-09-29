"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "../../../../lib/supabase";

export default function ProdukNonaktifPage() {
  const router = useRouter();
  const supabase = getSupabase();

  const [produk, setProduk] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
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
        satuan,
        stok,
        aktif,
        brand(nama),
        kategori(nama)
      `)
      .eq("aktif", false)
      .order("nama", { ascending: true });

    if (error) {
      setMessage(
        "Gagal mengambil produk nonaktif: " +
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
        ${item.brand?.nama || ""}
        ${item.kategori?.nama || ""}
      `.toLowerCase();

      return text.includes(keyword);
    });
  }, [produk, search]);

  async function aktifkanProduk(item) {
    const yakin = window.confirm(
      `Aktifkan kembali produk "${item.nama}"?`
    );

    if (!yakin) return;

    setMessage("");

    const { error } = await supabase
      .from("produk")
      .update({
        aktif: true,
      })
      .eq("id", item.id)
      .eq("aktif", false);

    if (error) {
      setMessage(
        "Gagal mengaktifkan produk: " +
          error.message
      );
      return;
    }

    loadProduk();
  }

  return (
    <main className="admin-content">

      <style jsx>{`
        .nonaktif-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 24px;
        }

        .nonaktif-header h1 {
          margin: 0 0 6px;
        }

        .nonaktif-header p {
          margin: 0;
        }

        .nonaktif-toolbar {
          margin-bottom: 20px;
        }

        .nonaktif-search {
          position: relative;
          max-width: 520px;
        }

        .nonaktif-search input {
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

        .nonaktif-search input:focus {
          border-color: #9a7657;
        }

        .nonaktif-clear {
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

        .nonaktif-table-wrapper {
          width: 100%;
          overflow-x: auto;
          border: 1px solid #e2ddd6;
          border-radius: 10px;
        }

        .nonaktif-table {
          width: 100%;
          min-width: 850px;
          border-collapse: collapse;
          table-layout: fixed;
        }

        .nonaktif-table th {
          padding: 13px 14px;
          background: #f7f3ed;
          border-bottom: 1px solid #ddd6ce;
          text-align: left;
          font-size: 13px;
          font-weight: 700;
          white-space: nowrap;
        }

        .nonaktif-table td {
          padding: 14px;
          border-bottom: 1px solid #eee9e3;
          vertical-align: middle;
          font-size: 14px;
          line-height: 1.45;
          word-break: break-word;
        }

        .nonaktif-table tbody tr:last-child td {
          border-bottom: none;
        }

        .nonaktif-table tbody tr:hover {
          background: #fcfaf7;
        }

        .col-product {
          width: 24%;
        }

        .col-sku {
          width: 15%;
        }

        .col-category {
          width: 15%;
        }

        .col-brand {
          width: 14%;
        }

        .col-stock {
          width: 10%;
        }

        .col-status {
          width: 10%;
        }

        .col-action {
          width: 12%;
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

        .status-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 76px;
          min-height: 28px;
          padding: 4px 9px;
          box-sizing: border-box;
          border-radius: 999px;
          background: #f3eeee;
          color: #777;
          font-size: 12px;
          font-weight: 600;
        }

        .nonaktif-action {
          width: 100%;
          min-height: 38px;
          padding: 8px 10px;
          white-space: nowrap;
        }

        .nonaktif-empty {
          padding: 30px 10px;
          text-align: center;
          color: #777;
        }

        .nonaktif-info {
          margin-bottom: 20px;
          padding: 14px 16px;
          border-radius: 10px;
          background: #f7f3ed;
          color: #66584e;
          font-size: 14px;
        }

        @media (max-width: 800px) {
          .nonaktif-header {
            flex-direction: column;
          }

          .nonaktif-search {
            max-width: none;
          }
        }
      `}</style>

      {/* HEADER */}

      <div className="nonaktif-header">

        <div>
          <h1>Produk Nonaktif</h1>

          <p>
            Kelola produk yang sementara tidak
            ditampilkan kepada pelanggan.
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
            <h2>Daftar Produk Nonaktif</h2>

            <p>
              {filteredProduk.length} produk
              nonaktif ditampilkan.
            </p>
          </div>

        </div>

        <div className="nonaktif-info">
          Produk di halaman ini tidak dihapus.
          Produk hanya berstatus nonaktif sehingga
          dapat diaktifkan kembali kapan saja.
        </div>

        {message && (
          <div className="admin-message">
            {message}
          </div>
        )}

        {/* SEARCH */}

        <div className="nonaktif-toolbar">

          <div className="nonaktif-search">

            <input
              type="search"
              placeholder="Cari produk nonaktif..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              autoComplete="off"
            />

            {search && (
              <button
                type="button"
                className="nonaktif-clear"
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
          <div className="nonaktif-empty">
            Memuat produk nonaktif...
          </div>
        ) : filteredProduk.length === 0 ? (
          <div className="nonaktif-empty">
            Tidak ada produk nonaktif.
          </div>
        ) : (
          <div className="nonaktif-table-wrapper">

            <table className="nonaktif-table">

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

                  <th className="col-stock">
                    Stok
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
                      {item.stok ?? 0}{" "}
                      {item.satuan || ""}
                    </td>

                    <td>
                      <span className="status-badge">
                        Nonaktif
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="admin-secondary-button nonaktif-action"
                        onClick={() =>
                          aktifkanProduk(item)
                        }
                      >
                        Aktifkan
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
