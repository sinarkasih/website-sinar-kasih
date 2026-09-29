"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "../../../../lib/supabase";

export default function TrashProdukPage() {
  const router = useRouter();
  const supabase = getSupabase();

  const [produk, setProduk] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");

  async function loadProduk() {
    setLoading(true);
    setMessage("");

    if (!supabase) {
      setMessage("Koneksi database belum tersedia.");
      setMessageType("error");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("produk")
      .select(`
        id,
        nama,
        sku,
        slug,
        satuan,
        stok,
        aktif,
        deleted_at,
        brand(nama),
        kategori(nama)
      `)
      .not("deleted_at", "is", null)
      .order("deleted_at", {
        ascending: false,
      });

    if (error) {
      setMessage(
        "Gagal mengambil produk Trash: " +
          error.message
      );
      setMessageType("error");
      setProduk([]);
    } else {
      setProduk(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadProduk();
  }, []);

  const filteredProduk = useMemo(() => {
    const keyword = search
      .trim()
      .toLowerCase();

    if (!keyword) {
      return produk;
    }

    return produk.filter((item) => {
      const text = `
        ${item.nama || ""}
        ${item.sku || ""}
        ${item.slug || ""}
        ${item.brand?.nama || ""}
        ${item.kategori?.nama || ""}
      `.toLowerCase();

      return text.includes(keyword);
    });
  }, [produk, search]);

  async function restoreProduk(item) {
    const yakin = window.confirm(
      `Restore produk "${item.nama}"?\n\n` +
        `Produk akan dikembalikan ke daftar produk Aktif.`
    );

    if (!yakin) return;

    setSavingId(item.id);
    setMessage("");

    const { error } = await supabase
      .from("produk")
      .update({
        deleted_at: null,
        aktif: true,
      })
      .eq("id", item.id)
      .not("deleted_at", "is", null);

    if (error) {
      setMessage(
        "Gagal melakukan restore: " +
          error.message
      );
      setMessageType("error");
      setSavingId(null);
      return;
    }

    setMessage(
      `Produk "${item.nama}" berhasil dipulihkan dan kembali Aktif.`
    );
    setMessageType("success");

    await loadProduk();
    setSavingId(null);
  }

  function getStoragePathFromUrl(value) {
    if (!value) return null;

    try {
      /*
       * Format URL Supabase Storage biasanya:
       * /storage/v1/object/public/produk/NAMA-FILE
       */

      if (value.startsWith("http://") || value.startsWith("https://")) {
        const url = new URL(value);

        const marker =
          "/storage/v1/object/public/produk/";

        const index =
          url.pathname.indexOf(marker);

        if (index !== -1) {
          const path =
            url.pathname.substring(
              index + marker.length
            );

          return decodeURIComponent(path);
        }

        return null;
      }

      /*
       * Jika suatu saat kolom url menyimpan
       * path relatif secara langsung.
       */
      const relativeMarker = "produk/";

      if (
        value.startsWith(relativeMarker)
      ) {
        return value.substring(
          relativeMarker.length
        );
      }

      return value.replace(/^\/+/, "");
    } catch (error) {
      console.error(
        "Gagal membaca path Storage:",
        error
      );

      return null;
    }
  }

  async function hapusPermanen(item) {
    const konfirmasiPertama =
      window.confirm(
        `HAPUS PERMANEN produk "${item.nama}"?\n\n` +
          `Tindakan ini tidak dapat dibatalkan.`
      );

    if (!konfirmasiPertama) return;

    const konfirmasiKedua =
      window.confirm(
        `PERINGATAN TERAKHIR!\n\n` +
          `Produk "${item.nama}" akan dihapus permanen ` +
          `beserta data harga, variasi, label, dan gambar database.\n\n` +
          `Foto produk di Storage juga akan dihapus jika tersedia.\n\n` +
          `Lanjutkan?`
      );

    if (!konfirmasiKedua) return;

    setSavingId(item.id);
    setMessage("");

    /*
     * LANGKAH 1
     * Ambil semua gambar terlebih dahulu.
     *
     * Kita simpan path Storage sebelum record
     * produk_gambar dihapus oleh RPC.
     */
    const {
      data: gambar,
      error: gambarError,
    } = await supabase
      .from("produk_gambar")
      .select("id, url")
      .eq("produk_id", item.id);

    if (gambarError) {
      setMessage(
        "Gagal membaca gambar produk: " +
          gambarError.message
      );
      setMessageType("error");
      setSavingId(null);
      return;
    }

    /*
     * LANGKAH 2
     * Cek apakah produk pernah digunakan
     * dalam pesanan.
     *
     * Produk yang pernah dipesan tidak boleh
     * dihapus permanen.
     */
    const {
      data: pernahDipesan,
      error: cekError,
    } = await supabase.rpc(
      "cek_produk_pernah_dipesan",
      {
        p_produk_id: item.id,
      }
    );

    if (cekError) {
      setMessage(
        "Gagal memeriksa riwayat pesanan: " +
          cekError.message
      );
      setMessageType("error");
      setSavingId(null);
      return;
    }

    if (pernahDipesan === true) {
      setMessage(
        `Produk "${item.nama}" tidak dapat dihapus permanen karena memiliki riwayat pesanan. Produk tetap berada di Trash.`
      );
      setMessageType("error");
      setSavingId(null);
      return;
    }

    /*
     * LANGKAH 3
     * Hapus record produk melalui RPC yang
     * sudah kita buat di database.
     *
     * RPC juga memeriksa:
     * - Admin Utama
     * - produk harus berada di Trash
     * - tidak boleh punya riwayat pesanan
     */
    const {
      error: deleteError,
    } = await supabase.rpc(
      "hapus_produk_permanen",
      {
        p_produk_id: item.id,
      }
    );

    if (deleteError) {
      console.error(
        "Gagal hapus permanen:",
        deleteError
      );

      let pesan =
        deleteError.message ||
        "Gagal menghapus produk permanen.";

      if (
        pesan
          .toLowerCase()
          .includes("riwayat pesanan")
      ) {
        pesan =
          "Produk tidak dapat dihapus permanen karena memiliki riwayat pesanan.";
      }

      setMessage(pesan);
      setMessageType("error");
      setSavingId(null);
      return;
    }

    /*
     * LANGKAH 4
     * Record database sudah berhasil dihapus.
     *
     * Sekarang hapus file fisik dari Storage.
     *
     * Supabase Storage harus dihapus melalui
     * Storage API, bukan DELETE SQL.
     */
    const storagePaths = (gambar || [])
      .map((foto) =>
        getStoragePathFromUrl(foto.url)
      )
      .filter(Boolean);

    let storageWarning = "";

    if (storagePaths.length > 0) {
      const {
        error: storageError,
      } = await supabase.storage
        .from("produk")
        .remove(storagePaths);

      if (storageError) {
        console.error(
          "Gagal menghapus gambar Storage:",
          storageError
        );

        storageWarning =
          " Data produk sudah terhapus, tetapi ada foto Storage yang gagal dihapus dan perlu dibersihkan.";
      }
    }

    setMessage(
      `Produk "${item.nama}" berhasil dihapus permanen.${storageWarning}`
    );

    setMessageType(
      storageWarning
        ? "warning"
        : "success"
    );

    await loadProduk();
    setSavingId(null);
  }

  function formatTanggal(value) {
    if (!value) return "-";

    const tanggal = new Date(value);

    return tanggal.toLocaleString(
      "id-ID",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );
  }

  return (
    <main className="admin-content">

      <style jsx>{`
        .trash-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 24px;
        }

        .trash-header h1 {
          margin: 0 0 6px;
        }

        .trash-header p {
          margin: 0;
        }

        .trash-info {
          margin-bottom: 20px;
          padding: 14px 16px;
          border-radius: 10px;
          background: #f7f3ed;
          color: #66584e;
          font-size: 14px;
          line-height: 1.5;
        }

        .trash-toolbar {
          margin-bottom: 20px;
        }

        .trash-search {
          position: relative;
          max-width: 520px;
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
          right: 9px;
          top: 50%;
          transform: translateY(-50%);
          width: 28px;
          height: 28px;
          padding: 0;
          border: none;
          background: transparent;
          color: #777;
          font-size: 20px;
          line-height: 28px;
          cursor: pointer;
        }

        .trash-table-wrapper {
          width: 100%;
          overflow-x: auto;
          border: 1px solid #e2ddd6;
          border-radius: 10px;
        }

        .trash-table {
          width: 100%;
          min-width: 1080px;
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

        .col-product {
          width: 21%;
        }

        .col-sku {
          width: 12%;
        }

        .col-category {
          width: 13%;
        }

        .col-brand {
          width: 12%;
        }

        .col-deleted {
          width: 15%;
        }

        .col-status {
          width: 8%;
        }

        .col-action {
          width: 19%;
        }

        .product-name {
          font-weight: 700;
          color: #3f2b20;
        }

        .sku-text {
          color: #555;
          font-size: 13px;
        }

        .muted-text {
          color: #888;
        }

        .trash-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 28px;
          padding: 4px 9px;
          border-radius: 999px;
          background: #f3eeee;
          color: #777;
          font-size: 12px;
          font-weight: 600;
        }

        .action-buttons {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .restore-button,
        .delete-button {
          width: 100%;
          min-height: 38px;
          padding: 8px 10px;
          white-space: nowrap;
        }

        .delete-button {
          border: 1px solid #d7b6b6;
          border-radius: 8px;
          background: #fff5f5;
          color: #9a3f3f;
          cursor: pointer;
          font-size: 14px;
        }

        .delete-button:hover:not(:disabled) {
          background: #fceaea;
        }

        .delete-button:disabled,
        .restore-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .trash-empty {
          padding: 30px 10px;
          text-align: center;
          color: #777;
        }

        .message-success {
          background: #edf8ef;
          color: #2f6b3a;
        }

        .message-error {
          background: #fff0f0;
          color: #8b3838;
        }

        .message-warning {
          background: #fff8e8;
          color: #7a5b1f;
        }

        @media (max-width: 800px) {
          .trash-header {
            flex-direction: column;
          }

          .trash-search {
            max-width: none;
          }
        }
      `}</style>

      {/* HEADER */}

      <div className="trash-header">

        <div>
          <h1>Trash Produk</h1>

          <p>
            Produk yang dihapus sementara
            dan masih dapat dipulihkan.
          </p>
        </div>

        <button
          type="button"
          className="admin-secondary-button"
          onClick={() =>
            router.push("/admin/produk")
          }
        >
          ← Kembali
        </button>

      </div>

      {/* CONTENT */}

      <div className="admin-card">

        <div className="admin-section-header">

          <div>
            <h2>Produk di Trash</h2>

            <p>
              {filteredProduk.length} produk
              ditampilkan.
            </p>
          </div>

        </div>

        <div className="trash-info">
          Produk di sini belum dihapus permanen.
          <strong> Restore</strong> untuk
          mengembalikan produk menjadi Aktif.
          <br />
          <strong>Hapus Permanen</strong> hanya
          dapat dilakukan jika produk belum pernah
          digunakan dalam pesanan.
        </div>

        {message && (
          <div
            className={`admin-message ${
              messageType === "success"
                ? "message-success"
                : messageType === "error"
                ? "message-error"
                : messageType === "warning"
                ? "message-warning"
                : ""
            }`}
            style={{
              marginBottom: "20px",
            }}
          >
            {message}
          </div>
        )}

        {/* SEARCH */}

        <div className="trash-toolbar">

          <div className="trash-search">

            <input
              type="search"
              placeholder="Cari produk di Trash..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              autoComplete="off"
            />

            {search && (
              <button
                type="button"
                className="trash-clear"
                onClick={() => setSearch("")}
                aria-label="Hapus pencarian"
                title="Hapus pencarian"
              >
                ×
              </button>
            )}

          </div>

        </div>

        {/* TABLE */}

        {loading ? (
          <div className="trash-empty">
            Memuat Trash Produk...
          </div>
        ) : filteredProduk.length === 0 ? (
          <div className="trash-empty">
            Trash Produk masih kosong.
          </div>
        ) : (
          <div className="trash-table-wrapper">

            <table className="trash-table">

              <thead>
                <tr>

                  <th className="col-product">
                    Produk
                  </th>

                  <th className="col-sku">
                    SKU
                  </th>

                  <th className="col-category">
                    Kategori
                  </th>

                  <th className="col-brand">
                    Brand
                  </th>

                  <th className="col-deleted">
                    Masuk Trash
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

                {filteredProduk.map(
                  (item) => (

                    <tr key={item.id}>

                      <td>
                        <div className="product-name">
                          {item.nama}
                        </div>
                      </td>

                      <td>
                        <span className="sku-text">
                          {item.sku || "-"}
                        </span>
                      </td>

                      <td>
                        {item.kategori?.nama || (
                          <span className="muted-text">
                            -
                          </span>
                        )}
                      </td>

                      <td>
                        {item.brand?.nama || (
                          <span className="muted-text">
                            -
                          </span>
                        )}
                      </td>

                      <td>
                        {formatTanggal(
                          item.deleted_at
                        )}
                      </td>

                      <td>
                        <span className="trash-badge">
                          Trash
                        </span>
                      </td>

                      <td>

                        <div className="action-buttons">

                          <button
                            type="button"
                            className="admin-secondary-button restore-button"
                            onClick={() =>
                              restoreProduk(item)
                            }
                            disabled={
                              savingId === item.id
                            }
                          >
                            {savingId === item.id
                              ? "Memproses..."
                              : "Restore"}
                          </button>

                          <button
                            type="button"
                            className="delete-button"
                            onClick={() =>
                              hapusPermanen(item)
                            }
                            disabled={
                              savingId === item.id
                            }
                          >
                            {savingId === item.id
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

    </main>
  );
}
