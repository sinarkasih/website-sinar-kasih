"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";

function formatTanggal(value) {
  if (!value) return "-";

  return new Date(value).toLocaleString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatRupiah(value) {
  const number = Number(value || 0);

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(number);
}

function labelStatus(status) {
  const labels = {
    baru: "Baru",
    diproses: "Diproses",
    selesai: "Selesai",
    dibatalkan: "Dibatalkan",
    menunggu_konfirmasi_harga: "Menunggu Konfirmasi Harga",
  };

  return labels[status] || status || "-";
}

function statusClass(status) {
  if (status === "baru") return "status baru";
  if (status === "diproses") return "status proses";
  if (status === "selesai") return "status selesai";
  if (status === "dibatalkan") return "status batal";

  return "status tunggu";
}

export default function Page() {
  const params = useParams();
  const router = useRouter();

  const [pelanggan, setPelanggan] = useState(null);
  const [pesanan, setPesanan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const pelangganId = params?.id;

  useEffect(() => {
    async function loadData() {
      if (!pelangganId) return;

      setLoading(true);
      setError("");

      const supabase = getSupabase();

      if (!supabase) {
        setError("Konfigurasi Supabase belum tersedia.");
        setLoading(false);
        return;
      }

      const { data: pelangganData, error: pelangganError } =
        await supabase
          .from("pelanggan")
          .select(
            "id, created_at, nama, email, telepon, tipe, alamat, aktif"
          )
          .eq("id", pelangganId)
          .maybeSingle();

      if (pelangganError) {
        setError(pelangganError.message);
        setLoading(false);
        return;
      }

      if (!pelangganData) {
        setError("Data pelanggan tidak ditemukan.");
        setLoading(false);
        return;
      }

      const { data: pesananData, error: pesananError } = await supabase
        .from("pesanan")
        .select(
          `
          id,
          created_at,
          nomor_pesanan,
          status,
          total,
          catatan,
          whatsapp,
          cabang:cabang_toko (
            id,
            nama
          )
        `
        )
        .eq("pelanggan_id", pelangganId)
        .order("created_at", { ascending: false });

      if (pesananError) {
        setError(pesananError.message);
        setLoading(false);
        return;
      }

      setPelanggan(pelangganData);
      setPesanan(pesananData || []);
      setLoading(false);
    }

    loadData();
  }, [pelangganId]);

  const statistik = useMemo(() => {
    const totalPesanan = pesanan.length;

    const totalNilai = pesanan.reduce(
      (total, item) => total + Number(item.total || 0),
      0
    );

    const selesai = pesanan.filter(
      (item) => item.status === "selesai"
    ).length;

    const aktif = pesanan.filter(
      (item) =>
        item.status === "baru" ||
        item.status === "diproses" ||
        item.status === "menunggu_konfirmasi_harga"
    ).length;

    return {
      totalPesanan,
      totalNilai,
      selesai,
      aktif,
    };
  }, [pesanan]);

  if (loading) {
    return (
      <section className="dash customer-detail-page">
        <div className="page-head">
          <div>
            <h1>Detail Pelanggan</h1>
            <p>Memuat data pelanggan...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="dash customer-detail-page">
        <div className="page-head">
          <div>
            <h1>Detail Pelanggan</h1>
            <p>Terjadi masalah saat memuat data.</p>
          </div>
        </div>

        <div className="error-box">{error}</div>

        <div className="actions">
          <button
            type="button"
            className="btn secondary"
            onClick={() => router.push("/admin/pelanggan")}
          >
            Kembali ke Pelanggan
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="dash customer-detail-page">
      <div className="page-head">
        <div>
          <h1>Detail Pelanggan</h1>
          <p>Informasi pelanggan dan riwayat pesanan.</p>
        </div>

        <button
          type="button"
          className="btn secondary"
          onClick={() => router.push("/admin/pelanggan")}
        >
          ← Kembali
        </button>
      </div>

      <div className="customer-grid">
        <div className="info-card">
          <div className="card-title">Informasi Pelanggan</div>

          <div className="info-row">
            <span>Nama</span>
            <strong>{pelanggan.nama || "-"}</strong>
          </div>

          <div className="info-row">
            <span>WhatsApp / Telepon</span>
            <strong>{pelanggan.telepon || "-"}</strong>
          </div>

          <div className="info-row">
            <span>Email</span>
            <strong>{pelanggan.email || "-"}</strong>
          </div>

          <div className="info-row">
            <span>Tipe</span>
            <strong>
              <span className="type-badge">
                {pelanggan.tipe === "guest"
                  ? "Guest"
                  : pelanggan.tipe || "-"}
              </span>
            </strong>
          </div>

          <div className="info-row">
            <span>Status</span>
            <strong>
              <span
                className={
                  pelanggan.aktif
                    ? "status pelanggan-aktif"
                    : "status pelanggan-nonaktif"
                }
              >
                {pelanggan.aktif ? "Aktif" : "Nonaktif"}
              </span>
            </strong>
          </div>

          <div className="info-row">
            <span>Alamat</span>
            <strong>{pelanggan.alamat || "-"}</strong>
          </div>

          <div className="info-row">
            <span>Terdaftar</span>
            <strong>{formatTanggal(pelanggan.created_at)}</strong>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <span>Total Pesanan</span>
            <strong>{statistik.totalPesanan}</strong>
          </div>

          <div className="stat-card">
            <span>Pesanan Aktif</span>
            <strong>{statistik.aktif}</strong>
          </div>

          <div className="stat-card">
            <span>Pesanan Selesai</span>
            <strong>{statistik.selesai}</strong>
          </div>

          <div className="stat-card">
            <span>Total Nilai Pesanan</span>
            <strong>{formatRupiah(statistik.totalNilai)}</strong>
          </div>
        </div>
      </div>

      <div className="section-card">
        <div className="section-head">
          <div>
            <h2>Riwayat Pesanan</h2>
            <p>Semua pesanan yang menggunakan pelanggan ini.</p>
          </div>

          <div className="total-badge">
            {pesanan.length} Pesanan
          </div>
        </div>

        {pesanan.length === 0 ? (
          <div className="empty-state">
            Pelanggan ini belum memiliki pesanan.
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>No. Pesanan</th>
                  <th>Tanggal</th>
                  <th>Cabang</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Aksi</th>
                </tr>
              </thead>

              <tbody>
                {pesanan.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>
                        {item.nomor_pesanan || `Pesanan #${item.id}`}
                      </strong>
                    </td>

                    <td>{formatTanggal(item.created_at)}</td>

                    <td>{item.cabang?.nama || "-"}</td>

                    <td>
                      <span className={statusClass(item.status)}>
                        {labelStatus(item.status)}
                      </span>
                    </td>

                    <td>{formatRupiah(item.total)}</td>

                    <td>
                      <Link
                        href={`/admin/pesanan/${item.id}`}
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
      </div>

      <style jsx>{`
        .customer-detail-page {
          width: 100%;
          max-width: none;
          box-sizing: border-box;
        }

        .page-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 24px;
        }

        .page-head h1 {
          margin: 0 0 6px;
          font-size: 34px;
          line-height: 1.15;
        }

        .page-head p {
          margin: 0;
          color: #766d65;
        }

        .customer-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
          gap: 20px;
          margin-bottom: 24px;
        }

        .info-card,
        .section-card,
        .stat-card {
          background: #fff;
          border: 1px solid #e2d9cf;
          border-radius: 14px;
          box-sizing: border-box;
        }

        .info-card {
          padding: 22px;
        }

        .card-title {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 18px;
          color: #3d2b20;
        }

        .info-row {
          display: grid;
          grid-template-columns: 190px minmax(0, 1fr);
          gap: 20px;
          padding: 13px 0;
          border-bottom: 1px solid #eee7df;
        }

        .info-row:last-child {
          border-bottom: 0;
        }

        .info-row span {
          color: #766d65;
        }

        .info-row strong {
          color: #3d2b20;
          word-break: break-word;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        .stat-card {
          padding: 20px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          min-height: 120px;
        }

        .stat-card span {
          color: #766d65;
          font-size: 14px;
          margin-bottom: 10px;
        }

        .stat-card strong {
          color: #3d2b20;
          font-size: 28px;
        }

        .section-card {
          padding: 22px;
          width: 100%;
        }

        .section-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 18px;
        }

        .section-head h2 {
          margin: 0 0 5px;
          color: #3d2b20;
          font-size: 20px;
        }

        .section-head p {
          margin: 0;
          color: #766d65;
          font-size: 14px;
        }

        .total-badge {
          padding: 9px 13px;
          border-radius: 10px;
          background: #f4ede5;
          color: #6f4f39;
          font-weight: 700;
          white-space: nowrap;
        }

        .table-wrap {
          width: 100%;
          overflow-x: auto;
          border: 1px solid #e5ddd4;
          border-radius: 10px;
        }

        table {
          width: 100%;
          min-width: 850px;
          border-collapse: collapse;
          background: #fff;
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

        .btn {
          border: 0;
          border-radius: 9px;
          padding: 10px 15px;
          font-weight: 700;
          cursor: pointer;
          font-size: 14px;
        }

        .btn.secondary {
          background: #fff;
          color: #6f4f39;
          border: 1px solid #d9cbbd;
        }

        .btn.secondary:hover {
          background: #f8f3ee;
        }

        .detail-link {
          color: #6f4f39;
          font-weight: 700;
          text-decoration: none;
        }

        .detail-link:hover {
          text-decoration: underline;
        }

        .type-badge {
          display: inline-block;
          padding: 5px 9px;
          border-radius: 999px;
          background: #f4ede5;
          color: #6f4f39;
          font-size: 12px;
          font-weight: 700;
        }

        .status {
          display: inline-block;
          padding: 5px 9px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
          white-space: nowrap;
        }

        .status.baru {
          background: #fff4d6;
          color: #8a6500;
        }

        .status.proses {
          background: #e8f0ff;
          color: #315c9b;
        }

        .status.selesai {
          background: #e6f5ea;
          color: #277442;
        }

        .status.batal {
          background: #fde9e7;
          color: #a13a31;
        }

        .status.tunggu {
          background: #f1e9ff;
          color: #6c45a1;
        }

        .pelanggan-aktif {
          background: #e6f5ea;
          color: #277442;
        }

        .pelanggan-nonaktif {
          background: #fde9e7;
          color: #a13a31;
        }

        .empty-state {
          padding: 45px 20px;
          text-align: center;
          color: #766d65;
          background: #faf8f5;
          border: 1px dashed #d9cfc5;
          border-radius: 10px;
        }

        .error-box {
          padding: 16px;
          border-radius: 10px;
          background: #fde9e7;
          color: #9b332a;
          border: 1px solid #efc8c3;
          margin-bottom: 18px;
        }

        .actions {
          display: flex;
          gap: 10px;
        }

        @media (max-width: 900px) {
          .customer-grid {
            grid-template-columns: 1fr;
          }

          .stats-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 640px) {
          .page-head {
            flex-direction: column;
          }

          .page-head h1 {
            font-size: 28px;
          }

          .info-row {
            grid-template-columns: 1fr;
            gap: 5px;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .section-card,
          .info-card {
            padding: 16px;
          }
        }
      `}</style>
    </section>
  );
}
