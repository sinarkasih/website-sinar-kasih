"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";

export default function TokoPage() {
  const [cabang, setCabang] = useState([]);
  const [filter, setFilter] = useState("semua");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    loadCabang();
  }, []);

  async function loadCabang() {
    setLoading(true);
    setError("");

    const supabase = getSupabase();

    if (!supabase) {
      setError("Koneksi Supabase belum tersedia.");
      setLoading(false);
      return;
    }

    const { data, error: fetchError } = await supabase
      .from("cabang_toko")
      .select(
        "id, created_at, nama, alamat, telepon, google_maps_url, google_review_url, foto, aktif, urutan"
      )
      .order("urutan", { ascending: true })
      .order("id", { ascending: true });

    if (fetchError) {
      console.error(fetchError);
      setError(
        `Gagal mengambil data cabang: ${fetchError.message}`
      );
      setLoading(false);
      return;
    }

    setCabang(data || []);
    setLoading(false);
  }

  async function hapusCabang(item) {
    const yakinPertama = window.confirm(
      `Hapus cabang "${item.nama}"?\n\nCabang akan diperiksa terlebih dahulu sebelum dihapus permanen.`
    );

    if (!yakinPertama) return;

    const yakinKedua = window.confirm(
      `PERINGATAN\n\nCabang "${item.nama}" akan dihapus secara permanen jika tidak memiliki riwayat pesanan.\n\nLanjutkan?`
    );

    if (!yakinKedua) return;

    setProcessingId(item.id);
    setError("");

    const supabase = getSupabase();

    if (!supabase) {
      setError("Koneksi Supabase belum tersedia.");
      setProcessingId(null);
      return;
    }

    const { error: deleteError } = await supabase.rpc(
      "hapus_cabang_permanen",
      {
        p_cabang_id: item.id,
      }
    );

    if (deleteError) {
      console.error(deleteError);
      setError(deleteError.message);
      setProcessingId(null);
      return;
    }

    setCabang((current) =>
      current.filter(
        (cabangItem) => cabangItem.id !== item.id
      )
    );

    setProcessingId(null);
  }

  const totalCabang = cabang.length;
  const aktif = cabang.filter((item) => item.aktif).length;
  const nonaktif = cabang.filter((item) => !item.aktif).length;

  const filteredCabang = cabang.filter((item) => {
    const matchesFilter =
      filter === "semua" ||
      (filter === "aktif" && item.aktif) ||
      (filter === "nonaktif" && !item.aktif);

    const keyword = search.trim().toLowerCase();

    const matchesSearch =
      !keyword ||
      (item.nama || "").toLowerCase().includes(keyword) ||
      (item.alamat || "").toLowerCase().includes(keyword) ||
      (item.telepon || "").toLowerCase().includes(keyword);

    return matchesFilter && matchesSearch;
  });

  return (
    <main className="tokoAdminPage">
      <div className="page">

        <div className="topbar">
          <div>
            <h1>Toko &amp; Kontak</h1>

            <p>
              Kelola cabang toko dan informasi kontak utama
              Sinar Kasih.
            </p>
          </div>

          <div className="topActions">
            <Link
              href="/admin/toko/kontak"
              className="contactButton"
            >
              Informasi Toko &amp; Kontak
            </Link>

            <Link
              href="/admin/toko/jam-operasional"
              className="hoursButton"
            >
              🕐 Jam Operasional
            </Link>

            <Link
              href="/admin/toko/cabang/tambah"
              className="addButton"
            >
              + Tambah Cabang
            </Link>
          </div>
        </div>

        <div className="summary">
          <div className="summaryCard">
            <span>Total Cabang</span>
            <strong>{totalCabang}</strong>
          </div>

          <div className="summaryCard">
            <span>Aktif</span>
            <strong>{aktif}</strong>
          </div>

          <div className="summaryCard">
            <span>Nonaktif</span>
            <strong>{nonaktif}</strong>
          </div>
        </div>

        <div className="toolbar">
          <div className="searchWrap">
            <input
              type="search"
              placeholder="Cari nama, alamat, atau telepon..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />

            {search && (
              <button
                type="button"
                className="clearSearch"
                onClick={() => setSearch("")}
                aria-label="Hapus pencarian"
              >
                ×
              </button>
            )}
          </div>

          <div className="filters">
            {[
              ["semua", "Semua"],
              ["aktif", "Aktif"],
              ["nonaktif", "Nonaktif"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={
                  filter === value
                    ? "filter active"
                    : "filter"
                }
                onClick={() => setFilter(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="error" role="alert">
            {error}
          </div>
        )}

        <div className="card">
          {loading ? (
            <div className="empty">
              Memuat data cabang...
            </div>
          ) : filteredCabang.length === 0 ? (
            <div className="empty">
              {search || filter !== "semua"
                ? "Tidak ada cabang yang sesuai dengan pencarian/filter."
                : "Belum ada data cabang."}
            </div>
          ) : (
            <div className="tableWrap">
              <table>
                <thead>
                  <tr>
                    <th>Urutan</th>
                    <th>Nama Cabang</th>
                    <th>Alamat</th>
                    <th>Telepon</th>
                    <th>Google Maps</th>
                    <th>Google Review</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredCabang.map((item) => (
                    <tr key={item.id}>
                      <td>{item.urutan ?? "-"}</td>

                      <td>
                        <strong>
                          {item.nama || "-"}
                        </strong>
                      </td>

                      <td>
                        {item.alamat || "-"}
                      </td>

                      <td>
                        {item.telepon || "-"}
                      </td>

                      <td>
                        {item.google_maps_url ? (
                          <a
                            href={item.google_maps_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="linkButton"
                          >
                            📍 Buka Lokasi
                          </a>
                        ) : (
                          <span className="muted">
                            Belum ada
                          </span>
                        )}
                      </td>

                      <td>
                        {item.google_review_url ? (
                          <a
                            href={item.google_review_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="linkButton"
                          >
                            ⭐ Beri Ulasan
                          </a>
                        ) : (
                          <span className="muted">
                            Belum ada
                          </span>
                        )}
                      </td>

                      <td>
                        <span
                          className={
                            item.aktif
                              ? "status activeStatus"
                              : "status inactiveStatus"
                          }
                        >
                          {item.aktif
                            ? "Aktif"
                            : "Nonaktif"}
                        </span>
                      </td>

                      <td>
                        <div className="actions">
                          <Link
                            href={`/admin/toko/cabang/${item.id}/edit`}
                            className="editButton"
                          >
                            Edit
                          </Link>

                          <button
                            type="button"
                            className="deleteButton"
                            onClick={() =>
                              hapusCabang(item)
                            }
                            disabled={
                              processingId === item.id
                            }
                          >
                            {processingId === item.id
                              ? "Menghapus..."
                              : "Hapus"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .tokoAdminPage {
          width: 100%;
          min-height: 100%;
          padding-top: 82px;
          box-sizing: border-box;
          background: #f5f0e8;
          color: #3f2f24;
        }

        .page {
          width: 100%;
          box-sizing: border-box;
          padding: 0 28px 40px;
        }

        .topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 24px;
        }

        .topbar h1 {
          margin: 0 0 7px;
          color: #3f2f24;
          font-size: 30px;
          line-height: 1.2;
        }

        .topbar p {
          margin: 0;
          color: #76685d;
        }

        .topActions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 10px;
          flex-wrap: wrap;
        }

        .contactButton,
        .hoursButton,
        .addButton {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 44px;
          padding: 0 18px;
          border-radius: 9px;
          text-decoration: none;
          font-size: 14px;
          font-weight: 700;
          white-space: nowrap;
          box-sizing: border-box;
        }

        .contactButton,
        .hoursButton {
          background: #fff;
          color: #4b3326;
          border: 1px solid #cfc1b1;
        }

        .contactButton:hover,
        .hoursButton:hover {
          background: #f3eadf;
        }

        .addButton {
          background: #4b3326;
          color: #fff;
          border: 1px solid #4b3326;
        }

        .addButton:hover {
          background: #39251b;
        }

        .summary {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
          margin-bottom: 22px;
        }

        .summaryCard {
          background: #fff;
          border: 1px solid #dfd2c3;
          border-radius: 12px;
          padding: 20px;
        }

        .summaryCard span {
          display: block;
          color: #76685d;
          margin-bottom: 8px;
          font-size: 14px;
        }

        .summaryCard strong {
          font-size: 28px;
          color: #3f2f24;
        }

        .toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          margin-bottom: 18px;
        }

        .searchWrap {
          position: relative;
          flex: 1;
          max-width: 600px;
        }

        .searchWrap input {
          width: 100%;
          box-sizing: border-box;
          padding: 13px 42px 13px 14px;
          border: 1px solid #cfc1b1;
          border-radius: 9px;
          background: #fff;
          color: #3f2f24;
          font-size: 15px;
        }

        .clearSearch {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          width: 28px;
          height: 28px;
          border: none;
          background: transparent;
          color: #76685d;
          font-size: 23px;
          cursor: pointer;
        }

        .filters {
          display: flex;
          gap: 8px;
        }

        .filter {
          padding: 10px 15px;
          border: 1px solid #cfc1b1;
          background: #fff;
          color: #4b3326;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 700;
        }

        .filter.active {
          background: #4b3326;
          color: #fff;
          border-color: #4b3326;
        }

        .error {
          margin-bottom: 18px;
          padding: 14px 16px;
          border-radius: 9px;
          background: #fff0f0;
          border: 1px solid #e4bcbc;
          color: #9b2929;
          font-weight: 600;
        }

        .card {
          width: 100%;
          background: #fff;
          border: 1px solid #dfd2c3;
          border-radius: 12px;
          overflow: hidden;
        }

        .tableWrap {
          width: 100%;
          overflow-x: auto;
        }

        table {
          width: 100%;
          min-width: 1050px;
          border-collapse: collapse;
        }

        th,
        td {
          padding: 15px 14px;
          border-bottom: 1px solid #eee5dc;
          text-align: left;
          vertical-align: middle;
        }

        th {
          background: #faf6f0;
          color: #5f5045;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        tbody tr:last-child td {
          border-bottom: none;
        }

        .linkButton {
          color: #755337;
          text-decoration: none;
          font-weight: 700;
          white-space: nowrap;
        }

        .linkButton:hover {
          text-decoration: underline;
        }

        .muted {
          color: #9a8e83;
        }

        .status {
          display: inline-block;
          padding: 6px 10px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 700;
          white-space: nowrap;
        }

        .activeStatus {
          background: #e8f5e9;
          color: #2f6d35;
        }

        .inactiveStatus {
          background: #f2eeee;
          color: #796d68;
        }

        .actions {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .editButton,
        .deleteButton {
          padding: 8px 12px;
          border-radius: 7px;
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
          cursor: pointer;
          white-space: nowrap;
        }

        .editButton {
          background: #f3eadf;
          color: #4b3326;
        }

        .deleteButton {
          border: none;
          background: #f7dddd;
          color: #9b2929;
        }

        .deleteButton:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .empty {
          padding: 45px;
          text-align: center;
          color: #76685d;
        }

        @media (max-width: 1000px) {
          .tokoAdminPage {
            padding-top: 78px;
          }

          .topbar {
            align-items: flex-start;
            flex-direction: column;
          }

          .topActions {
            width: 100%;
            justify-content: flex-start;
          }

          .toolbar {
            align-items: stretch;
            flex-direction: column;
          }

          .searchWrap {
            max-width: none;
          }
        }

        @media (max-width: 800px) {
          .page {
            padding: 0 16px 30px;
          }

          .summary {
            grid-template-columns: 1fr;
          }

          .topActions {
            flex-direction: column;
            align-items: stretch;
          }

          .contactButton,
          .hoursButton,
          .addButton {
            width: 100%;
          }

          .filters {
            width: 100%;
          }

          .filter {
            flex: 1;
          }
        }
      `}</style>
    </main>
  );
}
