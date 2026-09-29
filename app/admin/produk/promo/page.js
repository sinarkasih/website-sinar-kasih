"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "../../../../lib/supabase";

const FILTER_LABELS = [
  { key: "semua", nama: "Semua" },
  { key: "Baru", nama: "Baru" },
  { key: "Terlaris", nama: "Terlaris" },
  { key: "Promo", nama: "Promo" },
  { key: "Musiman", nama: "Musiman" },
];

export default function PromoProdukPage() {
  const router = useRouter();
  const supabase = getSupabase();

  const [produk, setProduk] = useState([]);
  const [labels, setLabels] = useState([]);

  const [search, setSearch] = useState("");
  const [filterLabel, setFilterLabel] = useState("semua");

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadData() {
    setLoading(true);
    setMessage("");

    const [produkResult, labelResult] = await Promise.all([
      supabase
        .from("produk")
        .select(`
          id,
          nama,
          sku,
          aktif,
          brand(nama),
          kategori(nama),
          produk_label(
            id,
            produk_id,
            label_id,
            label_produk(
              id,
              nama,
              slug,
              aktif
            )
          )
        `)
        .order("nama", { ascending: true }),

      supabase
        .from("label_produk")
        .select("*")
        .eq("aktif", true)
        .order("urutan", { ascending: true })
        .order("nama", { ascending: true }),
    ]);

    if (produkResult.error) {
      setMessage(
        "Gagal mengambil produk: " +
          produkResult.error.message
      );
      setProduk([]);
    } else {
      setProduk(produkResult.data || []);
    }

    if (labelResult.error) {
      setMessage(
        (current) =>
          current ||
          "Gagal mengambil label: " +
            labelResult.error.message
      );
      setLabels([]);
    } else {
      setLabels(labelResult.data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredProduk = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return produk.filter((item) => {
      const text = `
        ${item.nama || ""}
        ${item.sku || ""}
        ${item.brand?.nama || ""}
        ${item.kategori?.nama || ""}
      `.toLowerCase();

      const cocokSearch =
        !keyword || text.includes(keyword);

      const itemLabels =
        (item.produk_label || [])
          .map((relasi) => relasi.label_produk)
          .filter(Boolean);

      const cocokFilter =
        filterLabel === "semua" ||
        itemLabels.some(
          (label) =>
            label.nama?.toLowerCase() ===
            filterLabel.toLowerCase()
        );

      return cocokSearch && cocokFilter;
    });
  }, [produk, search, filterLabel]);

  function getProductLabels(item) {
    return (item.produk_label || [])
      .map((relasi) => relasi.label_produk)
      .filter(Boolean);
  }

  return (
    <main className="admin-content">

      <style jsx>{`
        .promo-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 24px;
        }

        .promo-header h1 {
          margin: 0 0 6px;
        }

        .promo-header p {
          margin: 0;
        }

        .promo-card {
          overflow: hidden;
        }

        .promo-toolbar {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 220px;
          gap: 14px;
          margin-bottom: 22px;
        }

        .promo-search {
          position: relative;
        }

        .promo-search input {
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

        .promo-search input:focus {
          border-color: #9a7657;
        }

        .promo-search-clear {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          width: 28px;
          height: 28px;
          border: none;
          background: transparent;
          color: #777;
          cursor: pointer;
          font-size: 20px;
          line-height: 28px;
          padding: 0;
        }

        .promo-filter {
          width: 100%;
          height: 44px;
          box-sizing: border-box;
          padding: 0 12px;
          border: 1px solid #d7d0c7;
          border-radius: 8px;
          background: #fff;
          font-size: 14px;
          cursor: pointer;
        }

        .promo-table-wrapper {
          width: 100%;
          overflow-x: auto;
          border: 1px solid #e2ddd6;
          border-radius: 10px;
        }

        .promo-table {
          width: 100%;
          min-width: 900px;
          border-collapse: collapse;
          table-layout: fixed;
        }

        .promo-table th {
          padding: 13px 14px;
          background: #f7f3ed;
          border-bottom: 1px solid #ddd6ce;
          text-align: left;
          font-size: 13px;
          font-weight: 700;
          white-space: nowrap;
        }

        .promo-table td {
          padding: 14px;
          border-bottom: 1px solid #eee9e3;
          vertical-align: middle;
          font-size: 14px;
          line-height: 1.45;
          word-break: break-word;
        }

        .promo-table tbody tr:last-child td {
          border-bottom: none;
        }

        .promo-table tbody tr:hover {
          background: #fcfaf7;
        }

        .col-product {
          width: 21%;
        }

        .col-sku {
          width: 13%;
        }

        .col-category {
          width: 14%;
        }

        .col-brand {
          width: 13%;
        }

        .col-label {
          width: 20%;
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

        .label-list {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .label-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 27px;
          padding: 4px 9px;
          border-radius: 999px;
          border: 1px solid rgba(0, 0, 0, 0.08);
          font-size: 12px;
          font-weight: 600;
          line-height: 1;
          white-space: nowrap;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 68px;
          min-height: 28px;
          padding: 4px 9px;
          box-sizing: border-box;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 600;
        }

        .status-active {
          background: #edf7ee;
          color: #35723b;
        }

        .status-inactive {
          background: #f3eeee;
          color: #777;
        }

        .promo-action-button {
          width: 100%;
          min-height: 38px;
          padding: 8px 10px;
          white-space: nowrap;
        }

        .promo-empty {
          padding: 26px 10px;
          text-align: center;
          color: #777;
        }

        @media (max-width: 800px) {
          .promo-header {
            flex-direction: column;
          }

          .promo-toolbar {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* HEADER */}

      <div className="promo-header">

        <div>
          <h1>Promo / Baru / Terlaris</h1>

          <p>
            Kelola label khusus yang digunakan
            untuk menampilkan produk tertentu
            di website.
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

      <div className="admin-card promo-card">

        <div className="admin-section-header">

          <div>
            <h2>Produk</h2>

            <p>
              {filteredProduk.length} produk
              ditampilkan.
            </p>
          </div>

        </div>

        {message && (
          <div className="admin-message">
            {message}
          </div>
        )}

        {/* SEARCH + FILTER */}

        <div className="promo-toolbar">

          <div className="promo-search">

            <input
              type="search"
              placeholder="Cari produk..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              autoComplete="off"
            />

            {search && (
              <button
                type="button"
                className="promo-search-clear"
                onClick={() => setSearch("")}
                aria-label="Hapus pencarian"
              >
                ×
              </button>
            )}

          </div>

          <select
            className="promo-filter"
            value={filterLabel}
            onChange={(e) =>
              setFilterLabel(e.target.value)
            }
          >
            {FILTER_LABELS.map((item) => (
              <option
                key={item.key}
                value={item.key}
              >
                {item.nama}
              </option>
            ))}
          </select>

        </div>

        {/* TABLE */}

        {loading ? (
          <div className="promo-empty">
            Memuat produk...
          </div>
        ) : filteredProduk.length === 0 ? (
          <div className="promo-empty">
            Belum ada produk yang sesuai
            dengan pencarian atau filter.
          </div>
        ) : (
          <div className="promo-table-wrapper">

            <table className="promo-table">

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

                  <th className="col-label">
                    Label
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

                {filteredProduk.map((item) => {

                  const itemLabels =
                    getProductLabels(item);

                  return (
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

                        {itemLabels.length === 0 ? (
                          <span className="muted-text">
                            Belum ada label
                          </span>
                        ) : (
                          <div className="label-list">

                            {itemLabels.map(
                              (label) => (
                                <span
                                  key={label.id}
                                  className="label-badge"
                                  style={{
                                    background:
                                      label.warna ||
                                      "#eee",
                                  }}
                                >
                                  {label.nama}
                                </span>
                              )
                            )}

                          </div>
                        )}

                      </td>

                      <td>

                        <span
                          className={`status-badge ${
                            item.aktif
                              ? "status-active"
                              : "status-inactive"
                          }`}
                        >
                          {item.aktif
                            ? "Aktif"
                            : "Nonaktif"}
                        </span>

                      </td>

                      <td>

                        <button
                          type="button"
                          className="admin-secondary-button promo-action-button"
                          onClick={() =>
                            router.push(
                              `/admin/produk/promo/${item.id}`
                            )
                          }
                        >
                          Kelola Label
                        </button>

                      </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>

          </div>
        )}

      </div>

    </main>
  );
}
