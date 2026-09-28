"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "../../../lib/supabase";

export default function AdminBrandPage() {
  const router = useRouter();

  const [brand, setBrand] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");

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
          aktif,
          logo_url
        `)
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
          <h1>Semua Brand</h1>

          <p>
            Kelola semua brand dan logo
            produk Toko Listrik Sinar Kasih.
          </p>
        </div>

        <button
          type="button"
          className="admin-primary-button"
          onClick={() =>
            router.push(
              "/admin/brand/tambah"
            )
          }
        >
          + Tambah Brand
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
            <h2>Daftar Brand</h2>

            <p>
              {brand.length} brand tersimpan.
            </p>
          </div>
        </div>

        <div
          className="admin-product-toolbar"
          style={{ marginTop: "16px" }}
        >
          <input
            type="text"
            placeholder="Cari brand..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </div>

        {loading ? (
          <div style={{ padding: "20px 0" }}>
            Memuat brand...
          </div>
        ) : filteredBrand.length === 0 ? (
          <div
            className="admin-message"
            style={{ marginTop: "20px" }}
          >
            Belum ada brand yang sesuai.
          </div>
        ) : (
          <div
            className="admin-product-table-wrapper"
            style={{ marginTop: "20px" }}
          >
            <table className="admin-product-table">

              <thead>
                <tr>
                  <th>Logo</th>
                  <th>Nama Brand</th>
                  <th>Slug</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>

              <tbody>
                {filteredBrand.map(
                  (item) => (
                    <tr key={item.id}>

                      <td>
                        {item.logo_url ? (
                          <img
                            src={item.logo_url}
                            alt={item.nama}
                            style={{
                              width: "80px",
                              height: "55px",
                              objectFit: "contain",
                              borderRadius: "8px",
                              background: "#fff",
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
                                `/admin/brand/${item.id}/edit`
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
