"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";

export default function Page() {
  const [pelanggan, setPelanggan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("semua");

  async function loadPelanggan() {
    setLoading(true);
    setError("");

    const supabase = getSupabase();

    if (!supabase) {
      setError("Konfigurasi Supabase belum tersedia.");
      setLoading(false);
      return;
    }

    const { data, error: loadError } = await supabase
      .from("pelanggan")
      .select(
        "id, created_at, nama, email, telepon, tipe, alamat, aktif"
      )
      .order("created_at", { ascending: false });

    if (loadError) {
      setError(loadError.message);
      setLoading(false);
      return;
    }

    setPelanggan(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadPelanggan();
  }, []);

  const filteredPelanggan = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return pelanggan.filter((item) => {
      const sesuaiFilter =
        filter === "semua" ||
        (filter === "aktif" && item.aktif === true) ||
        (filter === "nonaktif" && item.aktif === false);

      if (!sesuaiFilter) return false;

      if (!keyword) return true;

      return [
        item.nama,
        item.email,
        item.telepon,
        item.alamat,
        item.tipe,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(keyword)
        );
    });
  }, [pelanggan, search, filter]);

  const total = pelanggan.length;
  const aktif = pelanggan.filter((item) => item.aktif === true).length;
  const nonaktif = pelanggan.filter(
    (item) => item.aktif === false
  ).length;

  const guest = pelanggan.filter(
    (item) => item.tipe === "guest"
  ).length;

  const terdaftar = pelanggan.filter(
    (item) =>
      item.tipe === "terdaftar" ||
      item.tipe === "registered"
  ).length;

  function clearSearch() {
    setSearch("");
  }

  return (
    <section className="dash pelanggan-page">
      <div className="page-head">
        <div>
          <h1>Pelanggan</h1>
          <p>
            Kelola data pelanggan dan pelanggan guest dari website.
          </p>
        </div>
      </div>

      {error && <div className="error-box">{error}</div>}

      <div className="summary-grid">
        <div className="summary-card">
          <span>Total Pelanggan</span>
          <strong>{total}</strong>
        </div>

        <div className="summary-card">
          <span>Pelanggan Aktif</span>
          <strong>{aktif}</strong>
        </div>

        <div className="summary-card">
          <span>Pelanggan Nonaktif</span>
          <strong>{nonaktif}</strong>
        </div>

        <div className="summary-card">
          <span>Pelanggan Guest</span>
          <strong>{guest}</strong>
        </div>

        <div className="summary-card">
          <span>Pelanggan Terdaftar</span>
          <strong>{terdaftar}</strong>
        </div>
      </div>

      <div className="content-card">
        <div className="toolbar">
          <div className="search-box">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari nama, WhatsApp, email..."
            />

            {search && (
              <button
                type="button"
                className="clear-search"
                onClick={clearSearch}
                aria-label="Hapus pencarian"
              >
                ×
              </button>
            )}
          </div>

          <div className="filters">
            <button
              type="button"
              className={
                filter === "semua"
                  ? "filter-btn active"
                  : "filter-btn"
              }
              onClick={() => setFilter("semua")}
            >
              Semua
            </button>

            <button
              type="button"
              className={
                filter === "aktif"
                  ? "filter-btn active"
                  : "filter-btn"
              }
              onClick={() => setFilter("aktif")}
            >
              Aktif
            </button>

            <button
              type="button"
              className={
                filter === "nonaktif"
                  ? "filter-btn active"
                  : "filter-btn"
              }
              onClick={() => setFilter("nonaktif")}
            >
              Nonaktif
            </button>
          </div>
        </div>

        {loading ? (
          <div className="empty-state">
            Memuat data pelanggan...
          </div>
        ) : filteredPelanggan.length === 0 ? (
          <div className="empty-state">
            Tidak ada pelanggan yang sesuai.
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>Kontak</th>
                  <th>Tipe</th>
                  <th>Alamat</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>

              <tbody>
                {filteredPelanggan.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="customer-name">
                        <strong>{item.nama || "-"}</strong>
                        <small>ID: {item.id}</small>
                      </div>
                    </td>

                    <td>
                      <div className="contact">
                        <span>{item.telepon || "-"}</span>

                        {item.email && (
                          <small>{item.email}</small>
                        )}
                      </div>
                    </td>

                    <td>
                      <span className="type-badge">
                        {item.tipe === "guest"
                          ? "Guest"
                          : item.tipe === "terdaftar" ||
                            item.tipe === "registered"
                          ? "Terdaftar"
                          : item.tipe || "-"}
                      </span>
                    </td>

                    <td>{item.alamat || "-"}</td>

                    <td>
                      <span
                        className={
                          item.aktif
                            ? "status aktif"
                            : "status nonaktif"
                        }
                      >
                        {item.aktif ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>

                    <td>
                      <Link
                        href={`/admin/pelanggan/${item.id}`}
                        className="detail-link"
                      >
                        Detail
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filteredPelanggan.length > 0 && (
          <div className="table-footer">
            Menampilkan {filteredPelanggan.length} dari {total} pelanggan
          </div>
        )}
      </div>

      <style jsx>{`
        .pelanggan-page {
          width: 100%;
          max-width: none;
          box-sizing: border-box;
        }

        .page-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 22px;
        }

        .page-head h1 {
          margin: 0 0 6px;
          font-size: 36px;
          line-height: 1.15;
          color: #3d2b20;
        }

        .page-head p {
          margin: 0;
          color: #766d65;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 14px;
          margin-bottom: 20px;
        }

        .summary-card {
          background: #fff;
          border: 1px solid #e2d9cf;
          border-radius: 12px;
          padding: 18px;
          min-height: 92px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .summary-card span {
          color: #766d65;
          font-size: 13px;
          margin-bottom: 8px;
        }

        .summary-card strong {
          color: #3d2b20;
          font-size: 27px;
        }

        .content-card {
          width: 100%;
          background: #fff;
          border: 1px solid #e2d9cf;
          border-radius: 14px;
          padding: 22px;
          box-sizing: border-box;
        }

        .toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 18px;
          margin-bottom: 20px;
        }

        .search-box {
          position: relative;
          width: min(440px, 100%);
        }

        .search-box input {
          width: 100%;
          box-sizing: border-box;
          padding: 12px 42px 12px 14px;
          border: 1px solid #d8ccc0;
          border-radius: 9px;
          font-size: 14px;
          color: #3d2b20;
          background: #fff;
        }

        .search-box input:focus {
          outline: none;
          border-color: #8a654a;
        }

        .clear-search {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          width: 28px;
          height: 28px;
          border: 0;
          background: transparent;
          color: #766d65;
          font-size: 22px;
          line-height: 1;
          cursor: pointer;
          border-radius: 50%;
        }

        .clear-search:hover {
          background: #f3eee9;
        }

        .filters {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .filter-btn {
          border: 1px solid #d9cbbd;
          background: #fff;
          color: #6f6258;
          border-radius: 9px;
          padding: 10px 15px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
        }

        .filter-btn.active {
          background: #765238;
          color: #fff;
          border-color: #765238;
        }

        .table-wrap {
          width: 100%;
          overflow-x: auto;
          border: 1px solid #e5ddd4;
          border-radius: 10px;
        }

        table {
          width: 100%;
          min-width: 950px;
          border-collapse: collapse;
        }

        th {
          text-align: left;
          background: #f7f3ee;
          color: #4a4039;
          font-size: 13px;
          padding: 14px;
          border-bottom: 1px solid #ded5cc;
          white-space: nowrap;
        }

        td {
          padding: 15px 14px;
          border-bottom: 1px solid #eee7df;
          color: #514941;
          font-size: 14px;
        }

        tbody tr:last-child td {
          border-bottom: 0;
        }

        tbody tr:hover {
          background: #fcfaf8;
        }

        .customer-name,
        .contact {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .customer-name strong {
          color: #3d2b20;
        }

        .customer-name small,
        .contact small {
          color: #8a8179;
          font-size: 12px;
        }

        .type-badge {
          display: inline-block;
          padding: 5px 9px;
          border-radius: 999px;
          background: #f4ede5;
          color: #6f4f39;
          font-size: 12px;
          font-weight: 700;
          white-space: nowrap;
        }

        .status {
          display: inline-block;
          padding: 5px 9px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
          white-space: nowrap;
        }

        .status.aktif {
          background: #e6f5ea;
          color: #277442;
        }

        .status.nonaktif {
          background: #fde9e7;
          color: #a13a31;
        }

        .detail-link {
          color: #6f4f39;
          font-weight: 700;
          text-decoration: none;
        }

        .detail-link:hover {
          text-decoration: underline;
        }

        .empty-state {
          padding: 50px 20px;
          text-align: center;
          color: #766d65;
          background: #faf8f5;
          border: 1px dashed #d9cfc5;
          border-radius: 10px;
        }

        .table-footer {
          padding-top: 14px;
          color: #766d65;
          font-size: 13px;
        }

        .error-box {
          padding: 14px 16px;
          border-radius: 9px;
          background: #fde9e7;
          color: #9b332a;
          border: 1px solid #efc8c3;
          margin-bottom: 18px;
        }

        @media (max-width: 1100px) {
          .summary-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .toolbar {
            align-items: flex-start;
            flex-direction: column;
          }

          .search-box {
            width: 100%;
            max-width: 500px;
          }
        }

        @media (max-width: 700px) {
          .summary-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .page-head h1 {
            font-size: 30px;
          }

          .content-card {
            padding: 16px;
          }
        }

        @media (max-width: 480px) {
          .summary-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}
