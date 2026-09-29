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

      <div className="admin-page-header">

        <div>
          <h1>Promo / Baru / Terlaris</h1>

          <p>
            Kelola label khusus yang digunakan
            untuk menampilkan produk tertentu
            di website.
          </p>
        </div>

        <button
          className="admin-secondary-button"
          onClick={() =>
            router.push("/admin/produk")
          }
        >
          ← Kembali
        </button>

      </div>

      <div className="admin-card">

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

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(220px, 1fr) minmax(180px, 240px)",
            gap: "12px",
            marginBottom: "20px",
          }}
        >

          <div
            style={{
              position: "relative",
            }}
          >

            <input
              type="search"
              placeholder="Cari produk..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              style={{
                width: "100%",
                paddingRight: "42px",
              }}
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Hapus pencarian"
                style={{
                  position: "absolute",
                  right: "8px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  fontSize: "20px",
                  color: "#777",
                  lineHeight: "1",
                }}
              >
                ×
              </button>
            )}

          </div>

          <select
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

        {loading ? (
          <p>Memuat produk...</p>
        ) : filteredProduk.length === 0 ? (
          <p>
            Belum ada produk yang sesuai
            dengan pencarian atau filter.
          </p>
        ) : (
          <div
            style={{
              overflowX: "auto",
            }}
          >

            <table className="admin-table">

              <thead>
                <tr>
                  <th>Produk</th>
                  <th>SKU</th>
                  <th>Kategori</th>
                  <th>Brand</th>
                  <th>Label</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>

              <tbody>

                {filteredProduk.map((item) => {

                  const itemLabels =
                    getProductLabels(item);

                  return (
                    <tr key={item.id}>

                      <td>
                        <strong>
                          {item.nama}
                        </strong>
                      </td>

                      <td>
                        {item.sku || "-"}
                      </td>

                      <td>
                        {item.kategori?.nama || "-"}
                      </td>

                      <td>
                        {item.brand?.nama || "-"}
                      </td>

                      <td>

                        {itemLabels.length === 0 ? (
                          <span
                            style={{
                              color: "#888",
                            }}
                          >
                            Belum ada label
                          </span>
                        ) : (
                          <div
                            style={{
                              display: "flex",
                              gap: "6px",
                              flexWrap: "wrap",
                            }}
                          >
                            {itemLabels.map(
                              (label) => (
                                <span
                                  key={label.id}
                                  style={{
                                    display:
                                      "inline-flex",
                                    alignItems:
                                      "center",
                                    padding:
                                      "5px 9px",
                                    borderRadius:
                                      "999px",
                                    background:
                                      label.warna ||
                                      "#eee",
                                    color: "#333",
                                    fontSize:
                                      "12px",
                                    fontWeight:
                                      "600",
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
                        {item.aktif
                          ? "Aktif"
                          : "Nonaktif"}
                      </td>

                      <td>

                        <button
                          className="admin-secondary-button"
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
