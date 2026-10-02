"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "../../../lib/supabase";

import { useUrut, KolomUrut } from "../Urut";
export default function AdminPesananPage() {
  const router = useRouter();

  const [pesanan, setPesanan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("semua");

  useEffect(() => {
    loadPesanan();
  }, []);

  async function loadPesanan() {
    setLoading(true);
    setError("");

    const supabase = getSupabase();

    if (!supabase) {
      setError("Koneksi database belum tersedia.");
      setLoading(false);
      return;
    }

    const { data, error: pesananError } = await supabase
      .from("pesanan")
      .select(`
        id,
        created_at,
        pelanggan_id,
        cabang_id,
        nomor_pesanan,
        status,
        total,
        catatan,
        whatsapp,
        pelanggan:pelanggan_id (
          id,
          nama,
          email,
          telepon,
          tipe
        ),
        cabang:cabang_id (
          id,
          nama
        )
      `)
      .order("created_at", {
        ascending: false,
      });

    if (pesananError) {
      console.error("Gagal mengambil pesanan:", pesananError);

      setError(pesananError.message);
      setPesanan([]);
      setLoading(false);
      return;
    }

    setPesanan(data || []);
    setLoading(false);
  }

  const pesananFiltered = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return pesanan.filter((item) => {
      const cocokStatus =
        statusFilter === "semua" ||
        item.status === statusFilter;

      if (!cocokStatus) {
        return false;
      }

      if (!keyword) {
        return true;
      }

      const text = `
        ${item.nomor_pesanan || ""}
        ${item.pelanggan?.nama || ""}
        ${item.pelanggan?.telepon || ""}
        ${item.pelanggan?.email || ""}
        ${item.whatsapp || ""}
        ${item.cabang?.nama || ""}
      `.toLowerCase();

      return text.includes(keyword);
    });
  }, [pesanan, search, statusFilter]);

  function hapusPencarian() {
    setSearch("");
  }

  function formatTanggal(value) {
    if (!value) return "-";

    return new Date(value).toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  function formatRupiah(value) {
    const angka = Number(value || 0);

    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(angka);
  }

  function labelStatus(status) {
    switch (status) {
      case "baru":
        return "Baru";

      case "diproses":
        return "Diproses";

      case "selesai":
        return "Selesai";

      case "dibatalkan":
        return "Dibatalkan";

      default:
        // Ubah kode seperti "menunggu_konfirmasi"
        // menjadi "Menunggu Konfirmasi"
        if (!status) return "-";
        return String(status)
          .split("_")
          .map(
            (kata) =>
              kata.charAt(0).toUpperCase() +
              kata.slice(1)
          )
          .join(" ");
    }
  }

  function classStatus(status) {
    switch (status) {
      case "baru":
        return "baru";

      case "diproses":
        return "diproses";

      case "selesai":
        return "selesai";

      case "dibatalkan":
        return "dibatalkan";

      default:
        return "lainnya";
    }
  }

  const jumlahBaru = pesanan.filter(
    (item) => item.status === "baru"
  ).length;

  const jumlahDiproses = pesanan.filter(
    (item) => item.status === "diproses"
  ).length;

  const jumlahSelesai = pesanan.filter(
    (item) => item.status === "selesai"
  ).length;

  const jumlahDibatalkan = pesanan.filter(
    (item) => item.status === "dibatalkan"
  ).length;


  const urut = useUrut(pesananFiltered, {
    k0: (x) => x.nomor_pesanan,
    k1: (x) => x.created_at,
    k2: (x) => x.pelanggan?.nama,
    k3: (x) => x.cabang?.nama,
    k4: (x) => Number(x.total ?? 0),
    k5: (x) => x.status,
  });

  return (
    <main className="admin-content">
      <style jsx>{`
        .pesanan-page {
          width: 100%;
        }

        .pesanan-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 24px;
        }

        .pesanan-header h1 {
          margin: 0 0 6px;
        }

        .pesanan-header p {
          margin: 0;
        }

        .pesanan-summary {
          width: 100%;
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 12px;
          margin-bottom: 20px;
        }

        .pesanan-summary-card {
          min-width: 0;
          padding: 16px;
          border: 1px solid #e2ddd6;
          border-radius: 10px;
          background: #fff;
          box-sizing: border-box;
        }

        .pesanan-summary-label {
          margin-bottom: 6px;
          color: #75685e;
          font-size: 13px;
        }

        .pesanan-summary-number {
          color: #3f2b20;
          font-size: 24px;
          font-weight: 700;
        }

        /*
          Khusus halaman Pesanan:
          card dibuat full width supaya tidak menyisakan
          ruang kosong besar di sebelah kanan.
        */
        .pesanan-card {
          width: 100%;
          max-width: none;
          box-sizing: border-box;
          overflow: hidden;
        }

        .pesanan-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .pesanan-search {
          position: relative;
          width: 100%;
          max-width: 440px;
        }

        .pesanan-search input {
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

        .pesanan-search input:focus {
          border-color: #9a7657;
        }

        .pesanan-clear {
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

        .pesanan-filters {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .pesanan-filter {
          min-height: 40px;
          padding: 8px 14px;
          border: 1px solid #d7d0c7;
          border-radius: 8px;
          background: #fff;
          color: #5b4b40;
          cursor: pointer;
          font-size: 13px;
          white-space: nowrap;
        }

        .pesanan-filter.active {
          background: #4a372d;
          color: #fff;
          border-color: #4a372d;
        }

        .pesanan-table-wrapper {
          width: 100%;
          max-width: 100%;
          overflow-x: auto;
          border: 1px solid #e2ddd6;
          border-radius: 10px;
          box-sizing: border-box;
        }

        .pesanan-table {
          width: 100%;
          min-width: 0;
          border-collapse: collapse;
          table-layout: fixed;
        }

        .pesanan-table th {
          padding: 13px 14px;
          background: #f7f3ed;
          border-bottom: 1px solid #ddd6ce;
          text-align: left;
          font-size: 13px;
          font-weight: 700;
          white-space: nowrap;
        }

        .pesanan-table td {
          padding: 14px;
          border-bottom: 1px solid #eee9e3;
          vertical-align: middle;
          font-size: 14px;
          line-height: 1.45;
          word-break: break-word;
          overflow-wrap: anywhere;
        }

        .pesanan-table tbody tr:last-child td {
          border-bottom: none;
        }

        .pesanan-table tbody tr:hover {
          background: #fcfaf7;
        }

        .col-number {
          width: 17%;
        }

        .col-date {
          width: 15%;
        }

        .col-customer {
          width: 19%;
        }

        .col-branch {
          width: 14%;
        }

        .col-total {
          width: 12%;
        }

        .col-status {
          width: 11%;
        }

        .col-action {
          width: 12%;
        }

        .pesanan-number {
          font-weight: 700;
          color: #3f2b20;
        }

        .pesanan-subtext {
          margin-top: 3px;
          color: #888;
          font-size: 12px;
        }

        .pesanan-customer-name {
          font-weight: 600;
          color: #3f2b20;
        }

        .pesanan-customer-phone {
          margin-top: 3px;
          color: #777;
          font-size: 12px;
        }

        .pesanan-status {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 28px;
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
          line-height: 1.25;
          text-align: center;
          white-space: normal;
        }

        .pesanan-status.baru {
          background: #fff3d9;
          color: #8a641d;
        }

        .pesanan-status.diproses {
          background: #eaf2ff;
          color: #315d91;
        }

        .pesanan-status.selesai {
          background: #eaf7ed;
          color: #347045;
        }

        .pesanan-status.dibatalkan {
          background: #fbecec;
          color: #943f3f;
        }

        .pesanan-status.lainnya {
          background: #fdf0e1;
          color: #9a5b16;
        }

        .detail-button {
          width: 100%;
          min-height: 38px;
          padding: 8px 12px;
          border: 1px solid #d7d0c7;
          border-radius: 8px;
          background: #fff;
          color: #4a372d;
          cursor: pointer;
          font-size: 14px;
          white-space: nowrap;
        }

        .detail-button:hover {
          background: #f7f3ed;
        }

        .pesanan-empty {
          padding: 40px 20px;
          text-align: center;
          color: #777;
        }

        @media (max-width: 1100px) {
          .pesanan-table {
            min-width: 900px;
          }
        }

        @media (max-width: 900px) {
          .pesanan-summary {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 700px) {
          .pesanan-header {
            flex-direction: column;
          }

          .pesanan-search {
            max-width: none;
          }

          .pesanan-toolbar {
            align-items: stretch;
          }

          .pesanan-filters {
            width: 100%;
          }

          .pesanan-filter {
            flex: 1 1 auto;
          }
        }

        @media (max-width: 480px) {
          .pesanan-summary {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="pesanan-page">
        {/* HEADER */}
        <div className="pesanan-header">
          <div>
            <h1>Pesanan</h1>

            <p>
              Kelola seluruh pesanan pelanggan Toko Listrik
              Sinar Kasih.
            </p>
          </div>
        </div>

        {/* SUMMARY */}
        <div className="pesanan-summary">
          <div className="pesanan-summary-card">
            <div className="pesanan-summary-label">
              Semua Pesanan
            </div>

            <div className="pesanan-summary-number">
              {pesanan.length}
            </div>
          </div>

          <div className="pesanan-summary-card">
            <div className="pesanan-summary-label">
              Baru
            </div>

            <div className="pesanan-summary-number">
              {jumlahBaru}
            </div>
          </div>

          <div className="pesanan-summary-card">
            <div className="pesanan-summary-label">
              Diproses
            </div>

            <div className="pesanan-summary-number">
              {jumlahDiproses}
            </div>
          </div>

          <div className="pesanan-summary-card">
            <div className="pesanan-summary-label">
              Selesai
            </div>

            <div className="pesanan-summary-number">
              {jumlahSelesai}
            </div>
          </div>

          <div className="pesanan-summary-card">
            <div className="pesanan-summary-label">
              Dibatalkan
            </div>

            <div className="pesanan-summary-number">
              {jumlahDibatalkan}
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="admin-card pesanan-card">
          <div className="admin-section-header">
            <div>
              <h2>Semua Pesanan</h2>

              <p>
                {pesananFiltered.length} pesanan
                ditampilkan.
              </p>
            </div>
          </div>

          {error && (
            <div className="admin-message admin-message-error">
              {error}
            </div>
          )}

          {/* TOOLBAR */}
          <div className="pesanan-toolbar">
            <div className="pesanan-search">
              <input
                type="search"
                placeholder="Cari nomor pesanan, pelanggan, WhatsApp..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                autoComplete="off"
              />

              {search.trim() !== "" && (
                <button
                  type="button"
                  className="pesanan-clear"
                  onClick={hapusPencarian}
                  aria-label="Hapus pencarian"
                  title="Hapus pencarian"
                >
                  ×
                </button>
              )}
            </div>

            <div className="pesanan-filters">
              {[
                ["semua", "Semua"],
                ["baru", "Baru"],
                ["diproses", "Diproses"],
                ["selesai", "Selesai"],
                ["dibatalkan", "Dibatalkan"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  className={`pesanan-filter ${
                    statusFilter === value
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setStatusFilter(value)
                  }
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* TABLE */}
          {loading ? (
            <div className="pesanan-empty">
              Memuat pesanan...
            </div>
          ) : pesananFiltered.length === 0 ? (
            <div className="pesanan-empty">
              Tidak ada pesanan yang sesuai.
            </div>
          ) : (
            <div className="pesanan-table-wrapper">
              <table className="pesanan-table">
                <thead>
                  <tr>
                    <KolomUrut urut={urut} kunci="k0" className="col-number">No. Pesanan</KolomUrut>

                    <KolomUrut urut={urut} kunci="k1" className="col-date">Tanggal</KolomUrut>

                    <KolomUrut urut={urut} kunci="k2" className="col-customer">Pelanggan</KolomUrut>

                    <KolomUrut urut={urut} kunci="k3" className="col-branch">Cabang</KolomUrut>

                    <KolomUrut urut={urut} kunci="k4" className="col-total">Total</KolomUrut>

                    <KolomUrut urut={urut} kunci="k5" className="col-status">Status</KolomUrut>

                    <th className="col-action">
                      Aksi
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {urut.data.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="pesanan-number">
                          {item.nomor_pesanan ||
                            `#${item.id}`}
                        </div>

                        <div className="pesanan-subtext">
                          ID: {item.id}
                        </div>
                      </td>

                      <td>
                        {formatTanggal(
                          item.created_at
                        )}
                      </td>

                      <td>
                        <div className="pesanan-customer-name">
                          {item.pelanggan?.nama ||
                            "Guest"}
                        </div>

                        <div className="pesanan-customer-phone">
                          {item.whatsapp ||
                            item.pelanggan?.telepon ||
                            "-"}
                        </div>
                      </td>

                      <td>
                        {item.cabang?.nama || "-"}
                      </td>

                      <td>
                        <strong>
                          {formatRupiah(item.total)}
                        </strong>
                      </td>

                      <td>
                        <span
                          className={`pesanan-status ${classStatus(
                            item.status
                          )}`}
                        >
                          {labelStatus(item.status)}
                        </span>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="detail-button"
                          onClick={() =>
                            router.push(
                              `/admin/pesanan/${item.id}`
                            )
                          }
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
