"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getSupabase } from "../../../lib/supabase";

export default function PelangganPage() {
  const [pelanggan, setPelanggan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterTipe, setFilterTipe] = useState("semua");

  useEffect(() => {
    loadPelanggan();
  }, []);

  async function loadPelanggan() {
    setLoading(true);
    setError("");

    const supabase = getSupabase();

    if (!supabase) {
      setError("Koneksi database belum tersedia.");
      setLoading(false);
      return;
    }

    const { data, error: queryError } =
      await supabase
        .from("pelanggan")
        .select(`
          id,
          created_at,
          nama,
          email,
          telepon,
          tipe,
          alamat,
          aktif
        `)
        .order("created_at", {
          ascending: false,
        });

    if (queryError) {
      console.error(
        "Gagal mengambil pelanggan:",
        queryError
      );

      setError(queryError.message);
      setPelanggan([]);
      setLoading(false);
      return;
    }

    setPelanggan(data || []);
    setLoading(false);
  }

  const filteredPelanggan = useMemo(() => {
    const keyword = search
      .trim()
      .toLowerCase();

    return pelanggan.filter((item) => {
      const cocokTipe =
        filterTipe === "semua" ||
        item.tipe === filterTipe;

      if (!cocokTipe) {
        return false;
      }

      if (!keyword) {
        return true;
      }

      const text = `
        ${item.nama || ""}
        ${item.email || ""}
        ${item.telepon || ""}
        ${item.alamat || ""}
        ${item.tipe || ""}
      `.toLowerCase();

      return text.includes(keyword);
    });
  }, [pelanggan, search, filterTipe]);

  function hapusPencarian() {
    setSearch("");
  }

  function labelTipe(tipe) {
    if (tipe === "registered") {
      return "Terdaftar";
    }

    if (tipe === "guest") {
      return "Guest";
    }

    return tipe || "-";
  }

  function classTipe(tipe) {
    if (tipe === "registered") {
      return "registered";
    }

    if (tipe === "guest") {
      return "guest";
    }

    return "lainnya";
  }

  return (
    <main className="admin-content">
      <style jsx>{`
        .customer-page {
          width: 100%;
        }

        .customer-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 22px;
        }

        .customer-header h1 {
          margin: 0 0 6px;
          color: #3f2b20;
        }

        .customer-header p {
          margin: 0;
          color: #75685e;
        }

        .customer-summary {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
          margin-bottom: 20px;
        }

        .summary-card {
          padding: 18px;
          background: #fff;
          border: 1px solid #e2ddd6;
          border-radius: 10px;
        }

        .summary-label {
          color: #80736a;
          font-size: 13px;
        }

        .summary-value {
          margin-top: 6px;
          color: #3f2b20;
          font-size: 24px;
          font-weight: 800;
        }

        .customer-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .customer-search {
          position: relative;
          width: 100%;
          max-width: 440px;
        }

        .customer-search input {
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

        .customer-search input:focus {
          border-color: #9a7657;
        }

        .customer-clear {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          width: 28px;
          height: 28px;
          padding: 0;
          border: none;
          border-radius: 50%;
          background: #e8dfd3;
          color: #4a372d;
          font-size: 20px;
          line-height: 28px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .customer-filter {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .filter-button {
          min-height: 40px;
          padding: 8px 14px;
          border: 1px solid #d7d0c7;
          border-radius: 8px;
          background: #fff;
          color: #5f5046;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
        }

        .filter-button:hover {
          background: #f7f3ed;
        }

        .filter-button.active {
          background: #76563f;
          border-color: #76563f;
          color: #fff;
        }

        .customer-table-wrapper {
          width: 100%;
          overflow-x: auto;
          border: 1px solid #e2ddd6;
          border-radius: 10px;
        }

        .customer-table {
          width: 100%;
          min-width: 950px;
          border-collapse: collapse;
          table-layout: fixed;
        }

        .customer-table th {
          padding: 13px 14px;
          background: #f7f3ed;
          border-bottom: 1px solid #ddd6ce;
          text-align: left;
          font-size: 13px;
          font-weight: 700;
          white-space: nowrap;
        }

        .customer-table td {
          padding: 14px;
          border-bottom: 1px solid #eee9e3;
          vertical-align: middle;
          font-size: 14px;
          line-height: 1.45;
          word-break: break-word;
        }

        .customer-table tbody tr:last-child td {
          border-bottom: none;
        }

        .customer-table tbody tr:hover {
          background: #fcfaf7;
        }

        .col-name {
          width: 19%;
        }

        .col-contact {
          width: 19%;
        }

        .col-type {
          width: 12%;
        }

        .col-address {
          width: 23%;
        }

        .col-status {
          width: 12%;
        }

        .col-action {
          width: 15%;
        }

        .customer-name {
          color: #3f2b20;
          font-weight: 700;
        }

        .customer-subtext {
          margin-top: 3px;
          color: #80736a;
          font-size: 12px;
        }

        .type-badge,
        .status-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 28px;
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
        }

        .type-badge.registered {
          background: #eaf2ff;
          color: #315d91;
        }

        .type-badge.guest {
          background: #f4ede3;
          color: #76563f;
        }

        .type-badge.lainnya {
          background: #f0ece8;
          color: #66584e;
        }

        .status-badge.active {
          background: #eaf7ed;
          color: #347045;
        }

        .status-badge.inactive {
          background: #fbecec;
          color: #943f3f;
        }

        .detail-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 36px;
          padding: 7px 12px;
          border: 1px solid #76563f;
          border-radius: 7px;
          background: #fff;
          color: #76563f;
          text-decoration: none;
          font-size: 13px;
          font-weight: 600;
        }

        .detail-button:hover {
          background: #f7f3ed;
        }

        .customer-empty {
          padding: 55px 20px;
          text-align: center;
          color: #777;
        }

        .customer-empty strong {
          display: block;
          margin-bottom: 7px;
          color: #4a372d;
          font-size: 16px;
        }

        @media (max-width: 800px) {
          .customer-summary {
            grid-template-columns: 1fr;
          }

          .customer-header {
            flex-direction: column;
          }

          .customer-search {
            max-width: none;
          }
        }
      `}</style>

      <div className="customer-page">
        <div className="customer-header">
          <div>
            <h1>Pelanggan</h1>
            <p>
              Kelola data pelanggan dan pelanggan
              guest dari website.
            </p>
          </div>
        </div>

        <div className="customer-summary">
          <div className="summary-card">
            <div className="summary-label">
              Total Pelanggan
            </div>

            <div className="summary-value">
              {pelanggan.length}
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-label">
              Pelanggan Terdaftar
            </div>

            <div className="summary-value">
              {
                pelanggan.filter(
                  (item) =>
                    item.tipe === "registered"
                ).length
              }
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-label">
              Pelanggan Guest
            </div>

            <div className="summary-value">
              {
                pelanggan.filter(
                  (item) =>
                    item.tipe === "guest"
                ).length
              }
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="customer-toolbar">
            <div className="customer-search">
              <input
                type="search"
                placeholder="Cari nama, WhatsApp, email..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                autoComplete="off"
              />

              {search.trim() !== "" && (
                <button
                  type="button"
                  className="customer-clear"
                  onClick={hapusPencarian}
                  aria-label="Hapus pencarian"
                  title="Hapus pencarian"
                >
                  ×
                </button>
              )}
            </div>

            <div className="customer-filter">
              <button
                type="button"
                className={`filter-button ${
                  filterTipe === "semua"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setFilterTipe("semua")
                }
              >
                Semua
              </button>

              <button
                type="button"
                className={`filter-button ${
                  filterTipe === "registered"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setFilterTipe("registered")
                }
              >
                Terdaftar
              </button>

              <button
                type="button"
                className={`filter-button ${
                  filterTipe === "guest"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setFilterTipe("guest")
                }
              >
                Guest
              </button>
            </div>
          </div>

          {error && (
            <div className="admin-message admin-message-error">
              {error}
            </div>
          )}

          {loading ? (
            <div className="customer-empty">
              Memuat data pelanggan...
            </div>
          ) : filteredPelanggan.length === 0 ? (
            <div className="customer-empty">
              <strong>
                Tidak ada pelanggan
              </strong>
              Belum ada data pelanggan yang
              sesuai dengan pencarian atau filter.
            </div>
          ) : (
            <div className="customer-table-wrapper">
              <table className="customer-table">
                <thead>
                  <tr>
                    <th className="col-name">
                      Nama
                    </th>

                    <th className="col-contact">
                      Kontak
                    </th>

                    <th className="col-type">
                      Tipe
                    </th>

                    <th className="col-address">
                      Alamat
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
                  {filteredPelanggan.map(
                    (item) => (
                      <tr key={item.id}>
                        <td>
                          <div className="customer-name">
                            {item.nama ||
                              "Tanpa Nama"}
                          </div>

                          <div className="customer-subtext">
                            ID: {item.id}
                          </div>
                        </td>

                        <td>
                          <div>
                            {item.telepon ||
                              "-"}
                          </div>

                          {item.email && (
                            <div className="customer-subtext">
                              {item.email}
                            </div>
                          )}
                        </td>

                        <td>
                          <span
                            className={`type-badge ${classTipe(
                              item.tipe
                            )}`}
                          >
                            {labelTipe(
                              item.tipe
                            )}
                          </span>
                        </td>

                        <td>
                          {item.alamat || "-"}
                        </td>

                        <td>
                          <span
                            className={`status-badge ${
                              item.aktif
                                ? "active"
                                : "inactive"
                            }`}
                          >
                            {item.aktif
                              ? "Aktif"
                              : "Nonaktif"}
                          </span>
                        </td>

                        <td>
                          <Link
                            href={`/admin/pelanggan/${item.id}`}
                            className="detail-button"
                          >
                            Detail
                          </Link>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
