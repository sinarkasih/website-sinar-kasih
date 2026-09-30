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

  const aktif = cabang.filter(
    (item) => item.aktif
  ).length;

  const nonaktif = cabang.filter(
    (item) => !item.aktif
  ).length;

  const filteredCabang = cabang.filter((item) => {
    const matchesFilter =
      filter === "semua" ||
      (filter === "aktif" && item.aktif) ||
      (filter === "nonaktif" && !item.aktif);

    const keyword = search.trim().toLowerCase();

    const matchesSearch =
      !keyword ||
      (item.nama || "")
        .toLowerCase()
        .includes(keyword) ||
      (item.alamat || "")
        .toLowerCase()
        .includes(keyword) ||
      (item.telepon || "")
        .toLowerCase()
        .includes(keyword);

    return matchesFilter && matchesSearch;
  });

  return (
    <main className="page">
      <div className="topbar">
        <div>
          <h1>Toko & Kontak</h1>

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
            Informasi Toko & Kontak
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
            onChange={(e) =>
              setSearch(e.target.value)
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
          <button
            type="button"
            className={
              filter === "semua"
                ? "filter active"
                : "filter"
            }
            onClick={() => setFilter("semua")}
          >
            Semua
          </button>

          <button
            type="button"
            className={
              filter === "aktif"
                ? "filter active"
                : "filter"
            }
            onClick={() => setFilter("aktif")}
          >
            Aktif
          </button>

          <button
            type="button"
            className={
              filter === "nonaktif"
                ? "filter active"
                : "filter"
            }
            onClick={() =>
              setFilter("nonaktif")
            }
          >
            Nonaktif
          </button>
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
                    <td>
                      {item.urutan ?? "-"}
                    </td>

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
                          href={
                            item.google_maps_url
                          }
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
                          href={
                            item.google_review_url
                          }
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
                            processingId ===
                            item.id
                          }
                        >
                          {processingId ===
                          item.id
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

      <style jsx>{`
        .page {
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
        }

        .topbar {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
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
          font-size: 15px;
          line-height: 1.5;
        }

        .topActions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 10px;
          flex-wrap: wrap;
        }

        .contactButton,
        .addButton {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 44px;
          padding: 0 18px;
          border-radius: 8px;
          text-decoration: none;
          font-size: 14px;
          font-weight: 700;
          box-sizing: border-box;
          white-space: nowrap;
          transition:
            background 0.15s ease,
            border-color 0.15s ease,
            transform 0.15s ease;
        }

        .contactButton {
          background: #ffffff;
          color: #4b3326;
          border: 1px solid #cfc1b1;
        }

        .contactButton:hover {
          background: #f3eadf;
          border-color: #bba995;
          transform: translateY(-1px);
        }

        .addButton {
          background: #4b3326;
          color: #ffffff;
          border: 1px solid #4b3326;
        }

        .addButton:hover {
          background: #39251b;
          border-color: #39251b;
          transform: translateY(-1px);
        }

        .summary {
          display: grid;
          grid-template-columns:
            repeat(3, minmax(0, 1fr));
          gap: 18px;
          margin-bottom: 22px;
        }

        .summaryCard {
          background: #ffffff;
          border: 1px solid #dfd2c3;
          border-radius: 12px;
          padding: 20px;
          box-sizing: border-box;
        }

        .summaryCard span {
          display: block;
          margin-bottom: 8px;
          color: #76685d;
          font-size: 14px;
        }

        .summaryCard strong {
          display: block;
          color: #3f2f24;
          font-size: 28px;
          line-height: 1;
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
          height: 46px;
          box-sizing: border-box;
          padding: 0 42px 0 14px;
          border: 1px solid #cfc1b1;
          border-radius: 8px;
          background: #ffffff;
          color: #3f2f24;
          font-family: inherit;
          font-size: 14px;
          outline: none;
        }

        .searchWrap input:focus {
          border-color: #8a6045;
          box-shadow:
            0 0 0 3px
            rgba(138, 96, 69, 0.1);
        }

        .clearSearch {
          position: absolute;
          top: 50%;
          right: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
          padding: 0;
          border: none;
          background: transparent;
          color: #76685d;
          font-size: 23px;
          line-height: 1;
          cursor: pointer;
          transform: translateY(-50%);
        }

        .filters {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .filter {
          min-height: 42px;
          padding: 0 15px;
          border: 1px solid #cfc1b1;
          border-radius: 8px;
          background: #ffffff;
          color: #4b3326;
          font-family: inherit;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }

        .filter:hover {
          background: #f5ede4;
        }

        .filter.active {
          background: #4b3326;
          color: #ffffff;
          border-color: #4b3326;
        }

        .error {
          margin-bottom: 18px;
          padding: 14px 16px;
          border: 1px solid #e4bcbc;
          border-radius: 9px;
          background: #fff0f0;
          color: #9b2929;
          font-size: 14px;
          font-weight: 600;
        }

        .card {
          width: 100%;
          overflow: hidden;
          background: #ffffff;
          border: 1px solid #dfd2c3;
          border-radius: 12px;
          box-sizing: border-box;
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
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.03em;
          text-transform: uppercase;
          white-space: nowrap;
        }

        td {
          color: #4d4037;
          font-size: 14px;
        }

        tbody tr:hover {
          background: #fdfbf8;
        }

        tbody tr:last-child td {
          border-bottom: none;
        }

        td strong {
          color: #3f2f24;
        }

        .linkButton {
          color: #755337;
          text-decoration: none;
          font-size: 13px;
          font-weight: 700;
          white-space: nowrap;
        }

        .linkButton:hover {
          text-decoration: underline;
        }

        .muted {
          color: #9a8e83;
          font-size: 13px;
        }

        .status {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 28px;
          padding: 0 10px;
          border-radius: 999px;
          font-size: 12px;
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
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 34px;
          padding: 0 12px;
          border-radius: 7px;
          box-sizing: border-box;
          font-family: inherit;
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
          white-space: nowrap;
          cursor: pointer;
        }

        .editButton {
          background: #f3eadf;
          color: #4b3326;
        }

        .editButton:hover {
          background: #eadcca;
        }

        .deleteButton {
          border: none;
          background: #f7dddd;
          color: #9b2929;
        }

        .deleteButton:hover {
          background: #f0caca;
        }

        .deleteButton:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .empty {
          padding: 45px 20px;
          color: #76685d;
          text-align: center;
          font-size: 14px;
        }

        @media (max-width: 1000px) {
          .topbar {
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

        @media (max-width: 700px) {
          .summary {
            grid-template-columns: 1fr;
          }

          .topActions {
            align-items: stretch;
            flex-direction: column;
          }

          .contactButton,
          .addButton {
            width: 100%;
          }

          .filters {
            flex-wrap: wrap;
          }
        }

        @media (max-width: 500px) {
          .topbar h1 {
            font-size: 26px;
          }

          .summaryCard {
            padding: 16px;
          }

          .summaryCard strong {
            font-size: 25px;
          }

          .filters {
            display: grid;
            grid-template-columns:
              repeat(3, minmax(0, 1fr));
          }

          .filter {
            width: 100%;
            padding: 0 8px;
          }
        }
      `}</style>
    </main>
  );
}
