"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";

export default function Page() {
  const [cabang, setCabang] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("semua");
  const [processingId, setProcessingId] = useState(null);

  async function loadCabang() {
    setLoading(true);
    setError("");

    const supabase = getSupabase();

    if (!supabase) {
      setError("Konfigurasi Supabase belum tersedia.");
      setLoading(false);
      return;
    }

    const { data, error: loadError } = await supabase
      .from("cabang_toko")
      .select(
        "id, created_at, nama, alamat, telepon, google_maps_url, foto, aktif, urutan"
      )
      .order("urutan", { ascending: true })
      .order("id", { ascending: true });

    if (loadError) {
      setError(loadError.message);
      setLoading(false);
      return;
    }

    setCabang(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadCabang();
  }, []);

  async function hapusCabang(item) {
    const yakinPertama = window.confirm(
      `Hapus cabang "${item.nama}" secara permanen?\n\nData cabang yang belum memiliki pesanan dapat dihapus.`
    );

    if (!yakinPertama) return;

    const yakinKedua = window.confirm(
      `PERINGATAN TERAKHIR\n\nCabang "${item.nama}" akan dihapus permanen.\n\nLanjutkan?`
    );

    if (!yakinKedua) return;

    setProcessingId(item.id);
    setError("");

    const supabase = getSupabase();

    if (!supabase) {
      setError("Konfigurasi Supabase belum tersedia.");
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
      setError(deleteError.message);
      setProcessingId(null);
      return;
    }

    setCabang((current) =>
      current.filter((cabangItem) => cabangItem.id !== item.id)
    );

    setProcessingId(null);
  }

  const filteredCabang = cabang.filter((item) => {
    if (filter === "aktif") return item.aktif === true;
    if (filter === "nonaktif") return item.aktif === false;
    return true;
  });

  const total = cabang.length;

  const aktif = cabang.filter(
    (item) => item.aktif === true
  ).length;

  const nonaktif = cabang.filter(
    (item) => item.aktif === false
  ).length;

  return (
    <section className="dash toko-page">
      <div className="page-head">
        <div>
          <h1>Cabang Toko</h1>
          <p>
            Kelola cabang toko, alamat, telepon, Google Maps,
            foto, dan status cabang.
          </p>
        </div>

        <Link
          href="/admin/toko/cabang/tambah"
          className="btn primary"
        >
          + Tambah Cabang
        </Link>
      </div>

      {error && <div className="error-box">{error}</div>}

      <div className="summary-grid">
        <div className="summary-card">
          <span>Total Cabang</span>
          <strong>{total}</strong>
        </div>

        <div className="summary-card">
          <span>Cabang Aktif</span>
          <strong>{aktif}</strong>
        </div>

        <div className="summary-card">
          <span>Cabang Nonaktif</span>
          <strong>{nonaktif}</strong>
        </div>
      </div>

      <div className="content-card">
        <div className="toolbar">
          <div>
            <h2>Daftar Cabang</h2>
            <p>Cabang aktif dapat dipilih saat checkout.</p>
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
            Memuat data cabang...
          </div>
        ) : filteredCabang.length === 0 ? (
          <div className="empty-state">
            Belum ada cabang yang sesuai.
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Urutan</th>
                  <th>Nama Cabang</th>
                  <th>Alamat</th>
                  <th>Telepon</th>
                  <th>Google Maps</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>

              <tbody>
                {filteredCabang.map((item) => (
                  <tr key={item.id}>
                    <td>{item.urutan ?? 0}</td>

                    <td>
                      <strong>{item.nama || "-"}</strong>
                    </td>

                    <td>{item.alamat || "-"}</td>

                    <td>{item.telepon || "-"}</td>

                    <td>
                      {item.google_maps_url ? (
                        <a
                          href={item.google_maps_url}
                          target="_blank"
                          rel="noreferrer"
                          className="maps-link"
                        >
                          Buka Maps
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>

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
                      <div className="actions">
                        <Link
                          href={`/admin/toko/cabang/${item.id}/edit`}
                          className="detail-link"
                        >
                          Edit
                        </Link>

                        <button
                          type="button"
                          className="delete-btn"
                          onClick={() => hapusCabang(item)}
                          disabled={processingId === item.id}
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

        {!loading && filteredCabang.length > 0 && (
          <div className="table-footer">
            Menampilkan {filteredCabang.length} dari {total} cabang
          </div>
        )}
      </div>

      <style jsx>{`
        .toko-page {
          width: 100%;
          max-width: none;
          box-sizing: border-box;
        }

        .page-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 22px;
        }

        .page-head h1 {
          margin: 0 0 6px;
          color: #3d2b20;
          font-size: 36px;
          line-height: 1.15;
        }

        .page-head p {
          margin: 0;
          color: #766d65;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 11px 16px;
          border-radius: 9px;
          text-decoration: none;
          font-size: 14px;
          font-weight: 700;
          white-space: nowrap;
        }

        .btn.primary {
          background: #765238;
          color: #fff;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
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

        .toolbar h2 {
          margin: 0 0 5px;
          color: #3d2b20;
          font-size: 20px;
        }

        .toolbar p {
          margin: 0;
          color: #766d65;
          font-size: 13px;
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
          min-width: 1100px;
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

        .actions {
          display: flex;
          align-items: center;
          gap: 12px;
          white-space: nowrap;
        }

        .maps-link,
        .detail-link {
          color: #6f4f39;
          font-weight: 700;
          text-decoration: none;
        }

        .maps-link:hover,
        .detail-link:hover {
          text-decoration: underline;
        }

        .delete-btn {
          border: 0;
          background: transparent;
          color: #a13a31;
          font-weight: 700;
          font-size: 14px;
          padding: 0;
          cursor: pointer;
        }

        .delete-btn:hover {
          text-decoration: underline;
        }

        .delete-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
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

        @media (max-width: 800px) {
          .page-head {
            flex-direction: column;
          }

          .summary-grid {
            grid-template-columns: 1fr;
          }

          .toolbar {
            align-items: flex-start;
            flex-direction: column;
          }
        }
      `}</style>
    </section>
  );
}
