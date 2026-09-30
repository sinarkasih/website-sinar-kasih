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

    const keyword = search
      .trim()
      .toLowerCase();

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
      <div className="pageInner">

        {/* HEADER HALAMAN */}
        <div className="topbar">
          <div>
            <div className="eyebrow">
              ADMINISTRASI TOKO
            </div>

            <h1>Toko &amp; Kontak</h1>

            <p>
              Kelola cabang toko dan informasi kontak
              utama Sinar Kasih.
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

        {/* RINGKASAN CABANG */}
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

        {/* SEARCH DAN FILTER */}
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

        {/* ERROR */}
        {error && (
          <div
            className="error"
            role="alert"
            aria-live="assertive"
          >
            {error}
          </div>
        )}

        {/* DATA CABANG */}
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
      </div>

      <style jsx>{`
        .page {
          width: 100%;
          min-height: 100vh;
          box-sizing: border-box;
          background: #f5f0e8;
          color: #3f2f24;

          /*
           * Header Admin berada di bagian atas.
           * Konten halaman diberi jarak agar tidak masuk
           * ke area header saat halaman pertama dibuka
           * maupun ketika di-scroll.
           */
          padding-top: 92px;
          padding-left: 28px;
          padding-right: 28px;
          padding-bottom: 50px;
        }

        .pageInner {
          width: 100%;
          max-width: 1500px;
          margin: 0 auto;
          box-sizing: border-box;
        }

        .topbar {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 24px;
          margin-bottom: 24px;
        }

        .eyebrow {
          margin-bottom: 6px;
          color: #9a806a;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.08em;
        }

        h1 {
          margin: 0 0 7px;
          color: #3f2f24;
          font-size: 30px;
          line-height: 1.2;
        }

        .topbar p {
          margin: 0;
          color: #76685d;
          font-size: 15px;
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
          font-family: inherit;
          font-size: 14px;
          font-weight: 700;
          white-space: nowrap;
          box-sizing: border-box;
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
        }

        .hoursButton {
          background: #ffffff;
          color: #4b3326;
          border: 1px solid #cfc1b1;
        }

        .hoursButton:hover {
          background: #f3eadf;
          border-color: #bba995;
        }

        .addButton {
          background: #4b3326;
          color: #ffffff;
          border: 1px solid #4b3326;
        }

        .addButton:hover {
          background: #39251b;
          border-color: #39251b;
        }

        .summary {
          display: grid;
          grid-template-columns: repeat(
            3,
            minmax(0, 1fr)
          );
          gap: 18px;
          margin-bottom: 22px;
        }

        .summaryCard {
          background: #ffffff;
          border: 1px solid #dfd2c3;
          border-radius: 13px;
          padding: 20px;
          box-sizing: border-box;
        }

        .summaryCard span {
          display: block;
          margin-bottom: 8px;
          color: #76685d;
          font-size: 15px;
        }

        .summaryCard strong {
          display: block;
          color: #2f241d;
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
          width: 100%;
          max-width: 735px;
        }

        .searchWrap input {
          width: 100%;
          height: 56px;
          box-sizing: border-box;
          padding: 0 45px 0 17px;
          border: 1px solid #cfc1b1;
          border-radius: 10px;
          background: #ffffff;
          color: #3f2f24;
          font-family: inherit;
          font-size: 16px;
          outline: none;
        }

        .searchWrap input:focus {
          border-color: #8a5a3c;
          box-shadow:
            0 0 0 3px
            rgba(138, 90, 60, 0.08);
        }

        .clearSearch {
          position: absolute;
          top: 50%;
          right: 10px;
          width: 30px;
          height: 30px;
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
          gap: 8px;
        }

        .filter {
          min-height: 46px;
          padding: 0 17px;
          border: 1px solid #cfc1b1;
          border-radius: 9px;
          background: #ffffff;
          color: #4b3326;
          font-family: inherit;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
        }

        .filter:hover {
          background: #f5eee6;
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
          font-weight: 600;
        }

        .card {
          width: 100%;
          background: #ffffff;
          border: 1px solid #dfd2c3;
          border-radius: 14px;
          overflow: hidden;
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
          padding: 16px 14px;
          border-bottom: 1px solid #eee5dc;
          text-align: left;
          vertical-align: middle;
        }

        th {
          background: #faf6f0;
          color: #5f5045;
          font-size: 13px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        td {
          color: #3f2f24;
          font-size: 15px;
        }

        tbody tr:last-child td {
          border-bottom: none;
        }

        tbody tr:hover {
          background: #fdfaf7;
        }

        td strong {
          color: #2f241d;
          font-weight: 800;
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
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 6px 11px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 800;
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
          min-height: 38px;
          padding: 0 12px;
          border-radius: 8px;
          font-family: inherit;
          font-size: 13px;
          font-weight: 800;
          text-decoration: none;
          white-space: nowrap;
          box-sizing: border-box;
          cursor: pointer;
        }

        .editButton {
          background: #f3eadf;
          color: #4b3326;
          border: 1px solid transparent;
        }

        .editButton:hover {
          background: #eadcca;
        }

        .deleteButton {
          background: #f7dddd;
          color: #9b2929;
          border: 1px solid transparent;
        }

        .deleteButton:hover {
          background: #f1cece;
        }

        .deleteButton:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .empty {
          padding: 50px 30px;
          text-align: center;
          color: #76685d;
        }

        @media (max-width: 1100px) {
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

          .filters {
            justify-content: flex-start;
            flex-wrap: wrap;
          }
        }

        @media (max-width: 800px) {
          .page {
            padding-top: 88px;
            padding-left: 18px;
            padding-right: 18px;
          }

          .summary {
            grid-template-columns: 1fr;
          }

          .topActions {
            align-items: stretch;
            flex-direction: column;
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

        @media (max-width: 600px) {
          .page {
            padding-left: 14px;
            padding-right: 14px;
          }

          h1 {
            font-size: 26px;
          }

          .filters {
            display: grid;
            grid-template-columns: 1fr 1fr;
          }

          .filter {
            width: 100%;
          }
        }
      `}</style>
    </main>
  );
}
