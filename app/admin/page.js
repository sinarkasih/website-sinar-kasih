"use client";

// Lokasi file: app/admin/page.js
// Dashboard: ringkasan angka asli dari database + 5 pesanan terbaru.

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSupabase } from "../../lib/supabase";

function labelStatus(status) {
  if (!status) return "-";
  return String(status)
    .split("_")
    .map((k) => k.charAt(0).toUpperCase() + k.slice(1))
    .join(" ");
}

function kelasStatus(status) {
  if (["baru", "diproses", "selesai", "dibatalkan"].includes(status)) {
    return status;
  }
  return "lainnya";
}

function formatRupiah(angka) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(angka) || 0);
}

function formatTanggal(teks) {
  if (!teks) return "-";
  return new Date(teks).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DashboardPage() {
  const [angka, setAngka] = useState(null);
  const [terbaru, setTerbaru] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function muat() {
      const supabase = getSupabase();
      if (!supabase) {
        setError("Koneksi database belum tersedia.");
        return;
      }

      const hitung = (tabel, atur) => {
        let q = supabase
          .from(tabel)
          .select("id", { count: "exact", head: true });
        if (atur) q = atur(q);
        return q;
      };

      const [produk, kategori, brand, pesanan, pesananBaru, pelanggan, daftar] =
        await Promise.all([
          hitung("produk", (q) => q.is("deleted_at", null)),
          hitung("kategori"),
          hitung("brand"),
          hitung("pesanan", (q) => q.is("deleted_at", null)),
          hitung("pesanan", (q) =>
            q.is("deleted_at", null).eq("status", "baru")
          ),
          hitung("pelanggan"),
          supabase
            .from("pesanan")
            .select(
              "id, nomor_pesanan, created_at, status, total, pelanggan:pelanggan_id ( nama )"
            )
            .is("deleted_at", null)
            .order("created_at", { ascending: false })
            .limit(5),
        ]);

      const gagal = [produk, kategori, brand, pesanan, pesananBaru, pelanggan, daftar].find(
        (h) => h.error
      );
      if (gagal) {
        console.error("Gagal memuat dashboard:", gagal.error);
        setError("Sebagian data gagal dimuat. Coba muat ulang halaman.");
      }

      setAngka({
        produk: produk.count ?? 0,
        kategori: kategori.count ?? 0,
        brand: brand.count ?? 0,
        pesanan: pesanan.count ?? 0,
        pesananBaru: pesananBaru.count ?? 0,
        pelanggan: pelanggan.count ?? 0,
      });
      setTerbaru(daftar.data || []);
    }

    muat();
  }, []);

  const kartu = [
    { label: "Pesanan baru", nilai: angka?.pesananBaru, href: "/admin/pesanan", sorot: true },
    { label: "Total pesanan", nilai: angka?.pesanan, href: "/admin/pesanan" },
    { label: "Pelanggan", nilai: angka?.pelanggan, href: "/admin/pelanggan" },
    { label: "Produk", nilai: angka?.produk, href: "/admin/produk" },
    { label: "Kategori", nilai: angka?.kategori, href: "/admin/kategori" },
    { label: "Brand", nilai: angka?.brand, href: "/admin/brand" },
  ];

  return (
    <div className="db">
      <div className="admin-page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Ringkasan aktivitas Toko Listrik Sinar Kasih.</p>
        </div>

        <div className="db-aksi">
          <Link href="/admin/pesanan" className="admin-secondary-button">
            Lihat pesanan
          </Link>
          <Link href="/admin/produk/tambah" className="admin-primary-button">
            + Tambah produk
          </Link>
        </div>
      </div>

      {error && <div className="db-error">{error}</div>}

      <div className="db-kartu-grid">
        {kartu.map((k) => (
          <Link
            key={k.label}
            href={k.href}
            className={`db-kartu ${k.sorot ? "sorot" : ""}`}
          >
            <span>{k.label}</span>
            <strong>{angka ? k.nilai : "–"}</strong>
          </Link>
        ))}
      </div>

      <div className="db-panel">
        <div className="db-panel-head">
          <h2>Pesanan terbaru</h2>
          <Link href="/admin/pesanan" className="db-tautan">
            Lihat semua
          </Link>
        </div>

        {angka && terbaru.length === 0 ? (
          <p className="db-kosong">Belum ada pesanan masuk.</p>
        ) : (
          <div className="db-tabel-wrap">
            <table>
              <thead>
                <tr>
                  <th>No. Pesanan</th>
                  <th>Pelanggan</th>
                  <th>Tanggal</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {terbaru.map((p) => (
                  <tr key={p.id}>
                    <td className="db-nomor">{p.nomor_pesanan || `#${p.id}`}</td>
                    <td>{p.pelanggan?.nama || "-"}</td>
                    <td>{formatTanggal(p.created_at)}</td>
                    <td className="db-total">{formatRupiah(p.total)}</td>
                    <td>
                      <span className={`db-status ${kelasStatus(p.status)}`}>
                        {labelStatus(p.status)}
                      </span>
                    </td>
                    <td className="db-kanan">
                      <Link href={`/admin/pesanan/${p.id}`} className="detail-link">
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

      <style>{`
        .db-aksi {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .db-error {
          margin-bottom: 20px;
          padding: 12px 16px;
          border-radius: 12px;
          background: #fbebe7;
          border: 1px solid #efc7bc;
          color: #8a3b2b;
          font-size: 14px;
        }

        .db-kartu-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
          margin-bottom: 24px;
        }

        .db-kartu {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 18px 20px;
          background: #ffffff;
          border: 1px solid #eadfce;
          border-radius: 14px;
          color: #3f2f24;
          text-decoration: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }

        .db-kartu:hover {
          border-color: #d6c1a8;
          box-shadow: 0 4px 14px rgba(59, 42, 32, 0.06);
        }

        .db-kartu span {
          font-size: 13.5px;
          color: #7d6957;
          font-weight: 500;
        }

        .db-kartu strong {
          font-size: 28px;
          line-height: 1.15;
          font-weight: 700;
        }

        .db-kartu.sorot {
          background: #6f4c36;
          border-color: #6f4c36;
          color: #ffffff;
        }

        .db-kartu.sorot span {
          color: #ead7c3;
        }

        .db-panel {
          background: #ffffff;
          border: 1px solid #eadfce;
          border-radius: 14px;
          overflow: hidden;
        }

        .db-panel-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 18px 20px;
          border-bottom: 1px solid #f0e7db;
        }

        .db-panel-head h2 {
          margin: 0 !important;
        }

        .db-tautan {
          font-size: 14px;
          font-weight: 600;
          color: #6f4c36;
          text-decoration: none;
        }

        .db-tautan:hover {
          text-decoration: underline;
        }

        .db-kosong {
          margin: 0;
          padding: 28px 20px;
          color: #7d6957;
          font-size: 14.5px;
        }

        .db-tabel-wrap {
          overflow-x: auto;
        }

        .db-panel table th,
        .db-panel table td {
          padding: 12px 20px;
          border-bottom: 1px solid #f0e7db;
        }

        .db-panel table tbody tr:last-child td {
          border-bottom: none;
        }

        .db-nomor {
          font-weight: 600;
          white-space: nowrap;
        }

        .db-total {
          font-weight: 600;
          white-space: nowrap;
        }

        .db-kanan {
          text-align: right;
        }

        .db-status {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
          white-space: nowrap;
        }

        .db-status.baru { background: #fff3d9; color: #8a641d; }
        .db-status.diproses { background: #eaf2ff; color: #315d91; }
        .db-status.selesai { background: #eaf7ed; color: #347045; }
        .db-status.dibatalkan { background: #fbecec; color: #943f3f; }
        .db-status.lainnya { background: #fdf0e1; color: #9a5b16; }

        @media (max-width: 900px) {
          .db-kartu-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
      `}</style>
    </div>
  );
}
