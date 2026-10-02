"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "../../../../lib/supabase";

import { useUrut, KolomUrut } from "../../Urut";
export default function TrashPesananPage() {
  const router = useRouter();

  const [pesanan, setPesanan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    loadTrash();
  }, []);

  async function loadTrash() {
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
        .from("pesanan")
        .select(`
          id,
          created_at,
          nomor_pesanan,
          status,
          total,
          whatsapp,
          deleted_at,
          pelanggan:pelanggan_id (
            id,
            nama,
            telepon
          ),
          cabang:cabang_id (
            id,
            nama
          )
        `)
        .eq("status", "dibatalkan")
        .not("deleted_at", "is", null)
        .order("deleted_at", {
          ascending: false,
        });

    if (queryError) {
      console.error(
        "Gagal mengambil Trash Pesanan:",
        queryError
      );

      setError(queryError.message);
      setPesanan([]);
      setLoading(false);
      return;
    }

    setPesanan(data || []);
    setLoading(false);
  }

  const filteredPesanan = useMemo(() => {
    const keyword = search
      .trim()
      .toLowerCase();

    if (!keyword) {
      return pesanan;
    }

    return pesanan.filter((item) => {
      const text = `
        ${item.nomor_pesanan || ""}
        ${item.pelanggan?.nama || ""}
        ${item.pelanggan?.telepon || ""}
        ${item.whatsapp || ""}
        ${item.cabang?.nama || ""}
        ${item.total || ""}
      `.toLowerCase();

      return text.includes(keyword);
    });
  }, [pesanan, search]);

  function formatTanggal(value) {
    if (!value) return "-";

    return new Date(value).toLocaleString(
      "id-ID",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );
  }

  function formatRupiah(value) {
    const angka = Number(value || 0);

    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(angka);
  }

  function hapusPencarian() {
    setSearch("");
  }

  async function restorePesanan(id) {
    const yakin = window.confirm(
      "Pulihkan pesanan ini dari Trash?\n\nPesanan akan kembali ke daftar pesanan dengan status Dibatalkan."
    );

    if (!yakin) {
      return;
    }

    setProcessingId(id);
    setError("");

    const supabase = getSupabase();

    if (!supabase) {
      setError("Koneksi database belum tersedia.");
      setProcessingId(null);
      return;
    }

    const { error: updateError } =
      await supabase
        .from("pesanan")
        .update({
          deleted_at: null,
          status: "dibatalkan",
        })
        .eq("id", id)
        .eq("status", "dibatalkan");

    if (updateError) {
      console.error(
        "Gagal memulihkan pesanan:",
        updateError
      );

      setError(updateError.message);
      setProcessingId(null);
      return;
    }

    setPesanan((current) =>
      current.filter(
        (item) => item.id !== id
      )
    );

    setProcessingId(null);

    // Setelah Restore berhasil,
    // otomatis kembali ke halaman Pesanan.
    router.push("/admin/pesanan");
  }

  async function hapusPermanen(id) {
    const pesananTarget = pesanan.find(
      (item) => item.id === id
    );

    const nomorPesanan =
      pesananTarget?.nomor_pesanan ||
      `#${id}`;

    const konfirmasiPertama =
      window.confirm(
        `Hapus permanen pesanan ${nomorPesanan}?\n\nData pesanan dan seluruh detail produknya akan dihapus secara permanen dan tidak dapat dipulihkan.`
      );

    if (!konfirmasiPertama) {
      return;
    }

    const konfirmasiKedua =
      window.confirm(
        `PERINGATAN TERAKHIR\n\nAnda benar-benar ingin menghapus permanen ${nomorPesanan}?\n\nTindakan ini tidak dapat dibatalkan.`
      );

    if (!konfirmasiKedua) {
      return;
    }

    setProcessingId(id);
    setError("");

    const supabase = getSupabase();

    if (!supabase) {
      setError("Koneksi database belum tersedia.");
      setProcessingId(null);
      return;
    }

    const { error: rpcError } =
      await supabase.rpc(
        "hapus_pesanan_permanen",
        {
          p_pesanan_id: id,
        }
      );

    if (rpcError) {
      console.error(
        "Gagal menghapus permanen:",
        rpcError
      );

      setError(rpcError.message);
      setProcessingId(null);
      return;
    }

    setPesanan((current) =>
      current.filter(
        (item) => item.id !== id
      )
    );

    setProcessingId(null);
  }


  const urut = useUrut(filteredPesanan, {
    k0: (x) => x.nomor_pesanan,
    k1: (x) => x.created_at,
    k2: (x) => x.pelanggan?.nama,
    k3: (x) => x.cabang?.nama,
    k4: (x) => Number(x.total ?? 0),
    k5: (x) => x.deleted_at,
  });

  return (
    <main className="admin-content">
      <style jsx>{`
        .trash-page {
          width: 100%;
        }

        .trash-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 22px;
        }

        .trash-header h1 {
          margin: 0 0 6px;
          color: #3f2b20;
        }

        .trash-header p {
          margin: 0;
          color: #75685e;
        }

        .back-button {
          min-height: 40px;
          padding: 8px 14px;
          border: 1px solid #d7d0c7;
          border-radius: 8px;
          background: #fff;
          color: #4a372d;
          cursor: pointer;
          font-size: 14px;
        }

        .back-button:hover {
          background: #f7f3ed;
        }

        .trash-card {
          width: 100%;
          max-width: none;
          box-sizing: border-box;
        }

        .trash-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .trash-search {
          position: relative;
          width: 100%;
          max-width: 440px;
        }

        .trash-search input {
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

        .trash-search input:focus {
          border-color: #9a7657;
        }

        .trash-clear {
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

        .trash-table-wrapper {
          width: 100%;
          overflow-x: auto;
          border: 1px solid #e2ddd6;
          border-radius: 10px;
        }

        .trash-table {
          width: 100%;
          min-width: 900px;
          border-collapse: collapse;
          table-layout: fixed;
        }

        .trash-table th {
          padding: 13px 14px;
          background: #f7f3ed;
          border-bottom: 1px solid #ddd6ce;
          text-align: left;
          font-size: 13px;
          font-weight: 700;
          white-space: nowrap;
        }

        .trash-table td {
          padding: 14px;
          border-bottom: 1px solid #eee9e3;
          vertical-align: middle;
          font-size: 14px;
          line-height: 1.45;
          word-break: break-word;
        }

        .trash-table tbody tr:last-child td {
          border-bottom: none;
        }

        .trash-table tbody tr:hover {
          background: #fcfaf7;
        }

        .col-number {
          width: 17%;
        }

        .col-date {
          width: 14%;
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

        .col-deleted {
          width: 14%;
        }

        .col-action {
          width: 18%;
        }

        .order-number {
          color: #3f2b20;
          font-weight: 700;
        }

        .subtext {
          margin-top: 3px;
          color: #888;
          font-size: 12px;
        }

        .customer-name {
          color: #3f2b20;
          font-weight: 600;
        }

        .customer-phone {
          margin-top: 3px;
          color: #777;
          font-size: 12px;
        }

        .status {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 28px;
          padding: 4px 10px;
          border-radius: 999px;
          background: #fbecec;
          color: #943f3f;
          font-size: 12px;
          font-weight: 700;
        }

        .action-buttons {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .action-button {
          min-height: 36px;
          padding: 7px 11px;
          border-radius: 7px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
        }

        .action-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .restore-button {
          border: 1px solid #347045;
          background: #fff;
          color: #347045;
        }

        .restore-button:hover:not(:disabled) {
          background: #eef9f1;
        }

        .delete-button {
          border: 1px solid #b24a4a;
          background: #b24a4a;
          color: #fff;
        }

        .delete-button:hover:not(:disabled) {
          background: #943f3f;
        }

        .trash-empty {
          padding: 55px 20px;
          text-align: center;
          color: #777;
        }

        .trash-empty strong {
          display: block;
          margin-bottom: 7px;
          color: #4a372d;
          font-size: 16px;
        }

        @media (max-width: 700px) {
          .trash-header {
            flex-direction: column;
          }

          .trash-search {
            max-width: none;
          }
        }
      `}</style>

      <div className="trash-page">
        <div className="trash-header">
          <div>
            <h1>Trash Pesanan</h1>

            <p>
              Kelola pesanan yang sudah
              dibatalkan dan dipindahkan ke
              Trash.
            </p>
          </div>

          <button
            type="button"
            className="back-button"
            onClick={() =>
              router.push("/admin/pesanan")
            }
          >
            ← Kembali ke Pesanan
          </button>
        </div>

        <div className="admin-card trash-card">
          <div className="admin-section-header">
            <div>
              <h2>Pesanan di Trash</h2>

              <p>
                {filteredPesanan.length} pesanan
                ditampilkan.
              </p>
            </div>
          </div>

          {error && (
            <div className="admin-message admin-message-error">
              {error}
            </div>
          )}

          <div className="trash-toolbar">
            <div className="trash-search">
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
                  className="trash-clear"
                  onClick={hapusPencarian}
                  aria-label="Hapus pencarian"
                  title="Hapus pencarian"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="trash-empty">
              Memuat Trash Pesanan...
            </div>
          ) : filteredPesanan.length === 0 ? (
            <div className="trash-empty">
              <strong>Trash Pesanan kosong</strong>
              Tidak ada pesanan yang sedang
              berada di Trash.
            </div>
          ) : (
            <div className="trash-table-wrapper">
              <table className="trash-table">
                <thead>
                  <tr>
                    <KolomUrut urut={urut} kunci="k0" className="col-number">No. Pesanan</KolomUrut>

                    <KolomUrut urut={urut} kunci="k1" className="col-date">Tanggal</KolomUrut>

                    <KolomUrut urut={urut} kunci="k2" className="col-customer">Pelanggan</KolomUrut>

                    <KolomUrut urut={urut} kunci="k3" className="col-branch">Cabang</KolomUrut>

                    <KolomUrut urut={urut} kunci="k4" className="col-total">Total</KolomUrut>

                    <KolomUrut urut={urut} kunci="k5" className="col-deleted">Masuk Trash</KolomUrut>

                    <th className="col-action">
                      Aksi
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {urut.data.map(
                    (item) => (
                      <tr key={item.id}>
                        <td>
                          <div className="order-number">
                            {item.nomor_pesanan ||
                              `#${item.id}`}
                          </div>

                          <div className="subtext">
                            ID: {item.id}
                          </div>
                        </td>

                        <td>
                          {formatTanggal(
                            item.created_at
                          )}
                        </td>

                        <td>
                          <div className="customer-name">
                            {item.pelanggan?.nama ||
                              "Guest"}
                          </div>

                          <div className="customer-phone">
                            {item.whatsapp ||
                              item.pelanggan
                                ?.telepon ||
                              "-"}
                          </div>
                        </td>

                        <td>
                          {item.cabang?.nama ||
                            "-"}
                        </td>

                        <td>
                          <strong>
                            {formatRupiah(
                              item.total
                            )}
                          </strong>
                        </td>

                        <td>
                          {formatTanggal(
                            item.deleted_at
                          )}
                        </td>

                        <td>
                          <div className="action-buttons">
                            <button
                              type="button"
                              className="action-button restore-button"
                              disabled={
                                processingId ===
                                item.id
                              }
                              onClick={() =>
                                restorePesanan(
                                  item.id
                                )
                              }
                            >
                              {processingId ===
                              item.id
                                ? "Memproses..."
                                : "Restore"}
                            </button>

                            <button
                              type="button"
                              className="action-button delete-button"
                              disabled={
                                processingId ===
                                item.id
                              }
                              onClick={() =>
                                hapusPermanen(
                                  item.id
                                )
                              }
                            >
                              {processingId ===
                              item.id
                                ? "Memproses..."
                                : "Hapus Permanen"}
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
      </div>
    </main>
  );
}
