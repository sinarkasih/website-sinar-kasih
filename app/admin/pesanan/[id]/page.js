"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSupabase } from "../../../../lib/supabase";

export default function DetailPesananPage() {
  const params = useParams();
  const router = useRouter();

  const id = params?.id;

  const [pesanan, setPesanan] = useState(null);
  const [detailPesanan, setDetailPesanan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (id) {
      loadDetailPesanan();
    }
  }, [id]);

  async function loadDetailPesanan() {
    setLoading(true);
    setError("");

    const supabase = getSupabase();

    if (!supabase) {
      setError("Koneksi database belum tersedia.");
      setLoading(false);
      return;
    }

    const { data: pesananData, error: pesananError } =
      await supabase
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
          deleted_at,
          pelanggan:pelanggan_id (
            id,
            nama,
            email,
            telepon,
            tipe,
            alamat
          ),
          cabang:cabang_id (
            id,
            nama,
            alamat,
            telepon,
            google_maps_url
          )
        `)
        .eq("id", id)
        .maybeSingle();

    if (pesananError) {
      console.error(
        "Gagal mengambil pesanan:",
        pesananError
      );

      setError(pesananError.message);
      setLoading(false);
      return;
    }

    if (!pesananData) {
      setError("Pesanan tidak ditemukan.");
      setLoading(false);
      return;
    }

    const {
      data: detailData,
      error: detailError,
    } = await supabase
      .from("detail_pesanan")
      .select(`
        id,
        pesanan_id,
        produk_id,
        variasi_id,
        nama_produk,
        sku,
        harga,
        jumlah,
        subtotal,
        catatan,
        mode_harga,
        harga_min,
        harga_max
      `)
      .eq("pesanan_id", id)
      .order("id", {
        ascending: true,
      });

    if (detailError) {
      console.error(
        "Gagal mengambil detail pesanan:",
        detailError
      );

      setError(detailError.message);
      setLoading(false);
      return;
    }

    setPesanan(pesananData);
    setDetailPesanan(detailData || []);
    setLoading(false);
  }

  function formatTanggal(value) {
    if (!value) return "-";

    return new Date(value).toLocaleString("id-ID", {
      dateStyle: "full",
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
        return status || "-";
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

  function formatNomorWhatsApp(value) {
    if (!value) return "";

    const digits = String(value).replace(/\D/g, "");

    if (!digits) return "";

    if (digits.startsWith("62")) {
      return digits;
    }

    if (digits.startsWith("0")) {
      return `62${digits.substring(1)}`;
    }

    if (digits.startsWith("8")) {
      return `62${digits}`;
    }

    return digits;
  }

  function bukaWhatsApp() {
    const nomor =
      pesanan?.whatsapp ||
      pesanan?.pelanggan?.telepon ||
      "";

    const nomorWhatsApp =
      formatNomorWhatsApp(nomor);

    if (!nomorWhatsApp) {
      alert(
        "Nomor WhatsApp pelanggan tidak tersedia."
      );
      return;
    }

    const nama =
      pesanan?.pelanggan?.nama || "Pelanggan";

    const nomorPesanan =
      pesanan?.nomor_pesanan ||
      `#${pesanan?.id}`;

    const pesan = `Halo ${nama}, kami dari Toko Listrik Sinar Kasih. Kami menghubungi terkait pesanan ${nomorPesanan}.`;

    const url = `https://wa.me/${nomorWhatsApp}?text=${encodeURIComponent(
      pesan
    )}`;

    window.open(url, "_blank");
  }

  async function ubahStatus(statusBaru) {
    if (!pesanan) return;

    if (statusBaru === "dibatalkan") {
      const yakin = window.confirm(
        "Batalkan pesanan ini?\n\nPesanan akan berubah menjadi Dibatalkan dan tetap tersimpan dalam riwayat."
      );

      if (!yakin) {
        return;
      }
    }

    setSaving(true);
    setError("");
    setSuccess("");

    const supabase = getSupabase();

    if (!supabase) {
      setError("Koneksi database belum tersedia.");
      setSaving(false);
      return;
    }

    let request = supabase
      .from("pesanan")
      .update({
        status: statusBaru,
      })
      .eq("id", pesanan.id);

    if (statusBaru === "diproses") {
      request = request.eq("status", "baru");
    }

    if (statusBaru === "selesai") {
      request = request.eq("status", "diproses");
    }

    if (statusBaru === "dibatalkan") {
      request = request.in("status", [
        "baru",
        "diproses",
      ]);
    }

    const { data, error: updateError } =
      await request.select("id, status, deleted_at");

    if (updateError) {
      console.error(
        "Gagal mengubah status pesanan:",
        updateError
      );

      setError(updateError.message);
      setSaving(false);
      return;
    }

    if (!data || data.length === 0) {
      setError(
        "Status pesanan tidak dapat diubah. Kemungkinan status sudah berubah."
      );

      setSaving(false);
      return;
    }

    setSuccess(
      `Pesanan berhasil diubah menjadi ${labelStatus(
        statusBaru
      )}.`
    );

    setPesanan((current) => ({
      ...current,
      status: statusBaru,
    }));

    setSaving(false);

    if (statusBaru !== "dibatalkan") {
      setTimeout(() => {
        router.push("/admin/pesanan");
      }, 700);
    }
  }

  async function pindahkanKeTrash() {
    if (!pesanan) return;

    const yakin = window.confirm(
      "Pindahkan pesanan ini ke Trash?\n\nPesanan akan disembunyikan dari daftar pesanan aktif, tetapi masih dapat dipulihkan dari Trash Pesanan."
    );

    if (!yakin) {
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    const supabase = getSupabase();

    if (!supabase) {
      setError("Koneksi database belum tersedia.");
      setSaving(false);
      return;
    }

    const { error: trashError } = await supabase
      .from("pesanan")
      .update({
        deleted_at: new Date().toISOString(),
      })
      .eq("id", pesanan.id)
      .eq("status", "dibatalkan")
      .is("deleted_at", null);

    if (trashError) {
      console.error(
        "Gagal memindahkan pesanan ke Trash:",
        trashError
      );

      setError(trashError.message);
      setSaving(false);
      return;
    }

    setSuccess(
      "Pesanan berhasil dipindahkan ke Trash Pesanan."
    );

    setPesanan((current) => ({
      ...current,
      deleted_at: new Date().toISOString(),
    }));

    setSaving(false);

    setTimeout(() => {
      router.push("/admin/pesanan/trash");
    }, 700);
  }

  if (loading) {
    return (
      <main className="admin-content">
        <div className="detail-loading">
          Memuat detail pesanan...
        </div>
      </main>
    );
  }

  if (!pesanan) {
    return (
      <main className="admin-content">
        <div className="detail-page">
          <button
            type="button"
            className="back-button"
            onClick={() =>
              router.push("/admin/pesanan")
            }
          >
            ← Kembali ke Pesanan
          </button>

          <div className="admin-message admin-message-error">
            {error || "Pesanan tidak ditemukan."}
          </div>
        </div>
      </main>
    );
  }

  const nomorWhatsApp =
    pesanan.whatsapp ||
    pesanan.pelanggan?.telepon ||
    "";

  const canProcess =
    pesanan.status === "baru";

  const canComplete =
    pesanan.status === "diproses";

  const canCancel =
    pesanan.status === "baru" ||
    pesanan.status === "diproses";

  const canMoveToTrash =
    pesanan.status === "dibatalkan" &&
    !pesanan.deleted_at;

  return (
    <main className="admin-content">
      <style jsx>{`
        .detail-page {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
        }

        .detail-topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
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

        .detail-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 20px;
        }

        .detail-title h1 {
          margin: 0 0 7px;
          color: #3f2b20;
        }

        .detail-title p {
          margin: 0;
          color: #75685e;
        }

        .detail-header-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .whatsapp-button {
          min-height: 42px;
          padding: 9px 16px;
          border: none;
          border-radius: 8px;
          background: #258b55;
          color: #fff;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
        }

        .whatsapp-button:hover {
          background: #1f7448;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 32px;
          padding: 5px 12px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 700;
          white-space: nowrap;
        }

        .status-badge.baru {
          background: #fff3d9;
          color: #8a641d;
        }

        .status-badge.diproses {
          background: #eaf2ff;
          color: #315d91;
        }

        .status-badge.selesai {
          background: #eaf7ed;
          color: #347045;
        }

        .status-badge.dibatalkan {
          background: #fbecec;
          color: #943f3f;
        }

        .status-badge.lainnya {
          background: #f0ece8;
          color: #66584e;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.6fr) minmax(300px, 0.9fr);
          gap: 18px;
          align-items: start;
        }

        .detail-card {
          background: #fff;
          border: 1px solid #e2ddd6;
          border-radius: 12px;
          padding: 20px;
          box-sizing: border-box;
        }

        .detail-card + .detail-card {
          margin-top: 18px;
        }

        .detail-card h2 {
          margin: 0 0 16px;
          color: #3f2b20;
          font-size: 18px;
        }

        .detail-card h3 {
          margin: 0 0 8px;
          color: #3f2b20;
          font-size: 14px;
        }

        .order-meta {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }

        .meta-box {
          padding: 13px;
          border: 1px solid #eee8e0;
          border-radius: 9px;
          background: #fcfaf7;
        }

        .meta-label {
          margin-bottom: 5px;
          color: #80736a;
          font-size: 12px;
        }

        .meta-value {
          color: #3f2b20;
          font-size: 14px;
          font-weight: 600;
        }

        .customer-name {
          margin-bottom: 5px;
          color: #3f2b20;
          font-size: 17px;
          font-weight: 700;
        }

        .customer-line {
          margin-top: 6px;
          color: #66584e;
          font-size: 14px;
          line-height: 1.5;
        }

        .branch-box {
          padding: 14px;
          border-radius: 9px;
          background: #f7f3ed;
        }

        .branch-name {
          margin-bottom: 6px;
          color: #3f2b20;
          font-weight: 700;
        }

        .branch-address {
          color: #66584e;
          font-size: 14px;
          line-height: 1.5;
        }

        .branch-map {
          display: inline-block;
          margin-top: 10px;
          color: #76563f;
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
        }

        .branch-map:hover {
          text-decoration: underline;
        }

        .product-list {
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .product-row {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 18px;
          padding: 15px 0;
          border-bottom: 1px solid #eee9e3;
        }

        .product-row:first-child {
          padding-top: 0;
        }

        .product-row:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .product-name {
          color: #3f2b20;
          font-size: 15px;
          font-weight: 700;
        }

        .product-info {
          margin-top: 5px;
          color: #80736a;
          font-size: 13px;
          line-height: 1.5;
        }

        .product-note {
          margin-top: 6px;
          color: #66584e;
          font-size: 12px;
          font-style: italic;
        }

        .product-subtotal {
          text-align: right;
          color: #3f2b20;
          font-size: 14px;
          font-weight: 700;
          white-space: nowrap;
        }

        .price-info {
          margin-top: 4px;
          color: #80736a;
          font-size: 12px;
          font-weight: 400;
        }

        .total-box {
          margin-top: 18px;
          padding: 16px;
          border-radius: 10px;
          background: #f7f3ed;
        }

        .total-line {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          padding: 6px 0;
          color: #66584e;
          font-size: 14px;
        }

        .total-line.final {
          margin-top: 7px;
          padding-top: 13px;
          border-top: 1px solid #ddd4ca;
          color: #3f2b20;
          font-size: 17px;
          font-weight: 800;
        }

        .note-box {
          padding: 14px;
          border-radius: 9px;
          background: #fff9e9;
          border: 1px solid #f0e3bb;
          color: #66584e;
          font-size: 14px;
          line-height: 1.6;
          white-space: pre-wrap;
        }

        .no-note {
          color: #999;
          font-size: 14px;
        }

        .action-card {
          position: sticky;
          top: 20px;
        }

        .action-description {
          margin: -7px 0 16px;
          color: #80736a;
          font-size: 13px;
          line-height: 1.5;
        }

        .action-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .action-button {
          width: 100%;
          min-height: 44px;
          padding: 10px 14px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
        }

        .action-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .action-process {
          border: 1px solid #315d91;
          background: #315d91;
          color: #fff;
        }

        .action-process:hover:not(:disabled) {
          background: #264d7a;
        }

        .action-complete {
          border: 1px solid #347045;
          background: #347045;
          color: #fff;
        }

        .action-complete:hover:not(:disabled) {
          background: #2a5c38;
        }

        .action-cancel {
          border: 1px solid #b24a4a;
          background: #fff;
          color: #943f3f;
        }

        .action-cancel:hover:not(:disabled) {
          background: #fbecec;
        }

        .action-trash {
          border: 1px solid #8a3f3f;
          background: #8a3f3f;
          color: #fff;
        }

        .action-trash:hover:not(:disabled) {
          background: #713333;
        }

        .action-disabled {
          padding: 13px;
          border-radius: 8px;
          background: #f5f2ee;
          color: #8a817a;
          text-align: center;
          font-size: 13px;
        }

        .success-message {
          padding: 12px 14px;
          margin-bottom: 18px;
          border: 1px solid #b8ddc2;
          border-radius: 8px;
          background: #eef9f1;
          color: #347045;
          font-size: 14px;
        }

        .error-message {
          padding: 12px 14px;
          margin-bottom: 18px;
          border: 1px solid #e4bcbc;
          border-radius: 8px;
          background: #fff1f1;
          color: #943f3f;
          font-size: 14px;
        }

        .detail-loading {
          padding: 60px 20px;
          text-align: center;
          color: #75685e;
        }

        @media (max-width: 900px) {
          .detail-grid {
            grid-template-columns: 1fr;
          }

          .action-card {
            position: static;
          }
        }

        @media (max-width: 650px) {
          .detail-header {
            flex-direction: column;
          }

          .detail-header-actions {
            width: 100%;
            justify-content: flex-start;
          }

          .order-meta {
            grid-template-columns: 1fr;
          }

          .detail-card {
            padding: 16px;
          }
        }
      `}</style>

      <div className="detail-page">
        <div className="detail-topbar">
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

        <div className="detail-header">
          <div className="detail-title">
            <h1>Detail Pesanan</h1>

            <p>
              {pesanan.nomor_pesanan ||
                `#${pesanan.id}`}
              {" · "}
              {formatTanggal(pesanan.created_at)}
            </p>
          </div>

          <div className="detail-header-actions">
            <span
              className={`status-badge ${classStatus(
                pesanan.status
              )}`}
            >
              {labelStatus(pesanan.status)}
            </span>

            {nomorWhatsApp && (
              <button
                type="button"
                className="whatsapp-button"
                onClick={bukaWhatsApp}
              >
                Chat WhatsApp
              </button>
            )}
          </div>
        </div>

        {success && (
          <div className="success-message">
            {success}
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="detail-grid">
          <div>
            <div className="detail-card">
              <h2>Informasi Pesanan</h2>

              <div className="order-meta">
                <div className="meta-box">
                  <div className="meta-label">
                    Nomor Pesanan
                  </div>

                  <div className="meta-value">
                    {pesanan.nomor_pesanan ||
                      `#${pesanan.id}`}
                  </div>
                </div>

                <div className="meta-box">
                  <div className="meta-label">
                    Tanggal Pesanan
                  </div>

                  <div className="meta-value">
                    {formatTanggal(
                      pesanan.created_at
                    )}
                  </div>
                </div>

                <div className="meta-box">
                  <div className="meta-label">
                    Status
                  </div>

                  <div>
                    <span
                      className={`status-badge ${classStatus(
                        pesanan.status
                      )}`}
                    >
                      {labelStatus(
                        pesanan.status
                      )}
                    </span>
                  </div>
                </div>

                <div className="meta-box">
                  <div className="meta-label">
                    ID Pesanan
                  </div>

                  <div className="meta-value">
                    {pesanan.id}
                  </div>
                </div>
              </div>
            </div>

            <div className="detail-card">
              <h2>Informasi Pelanggan</h2>

              <div className="customer-name">
                {pesanan.pelanggan?.nama ||
                  "Guest Checkout"}
              </div>

              <div className="customer-line">
                WhatsApp:{" "}
                {pesanan.whatsapp ||
                  pesanan.pelanggan?.telepon ||
                  "-"}
              </div>

              {pesanan.pelanggan?.email && (
                <div className="customer-line">
                  Email:{" "}
                  {pesanan.pelanggan.email}
                </div>
              )}

              {pesanan.pelanggan?.tipe && (
                <div className="customer-line">
                  Tipe:{" "}
                  {pesanan.pelanggan.tipe}
                </div>
              )}

              {pesanan.pelanggan?.alamat && (
                <div className="customer-line">
                  Alamat:{" "}
                  {pesanan.pelanggan.alamat}
                </div>
              )}
            </div>

            <div className="detail-card">
              <h2>Cabang Tujuan</h2>

              <div className="branch-box">
                <div className="branch-name">
                  {pesanan.cabang?.nama || "-"}
                </div>

                {pesanan.cabang?.alamat && (
                  <div className="branch-address">
                    {pesanan.cabang.alamat}
                  </div>
                )}

                {pesanan.cabang
                  ?.google_maps_url && (
                  <a
                    href={
                      pesanan.cabang
                        .google_maps_url
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="branch-map"
                  >
                    Lihat di Google Maps →
                  </a>
                )}
              </div>
            </div>

            <div className="detail-card">
              <h2>Daftar Produk</h2>

              {detailPesanan.length === 0 ? (
                <div className="no-note">
                  Tidak ada detail produk.
                </div>
              ) : (
                <div className="product-list">
                  {detailPesanan.map((item) => (
                    <div
                      key={item.id}
                      className="product-row"
                    >
                      <div>
                        <div className="product-name">
                          {item.nama_produk ||
                            "Produk"}
                        </div>

                        {item.sku && (
                          <div className="product-info">
                            SKU: {item.sku}
                          </div>
                        )}

                        <div className="product-info">
                          {item.jumlah} ×{" "}
                          {formatRupiah(
                            item.harga
                          )}
                        </div>

                        {item.mode_harga &&
                          item.mode_harga !==
                            "pasti" && (
                            <div className="price-info">
                              Mode harga:{" "}
                              {item.mode_harga}
                            </div>
                          )}

                        {item.catatan && (
                          <div className="product-note">
                            Catatan:{" "}
                            {item.catatan}
                          </div>
                        )}
                      </div>

                      <div className="product-subtotal">
                        {formatRupiah(
                          item.subtotal
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="total-box">
                <div className="total-line">
                  <span>Subtotal</span>

                  <span>
                    {formatRupiah(
                      detailPesanan.reduce(
                        (sum, item) =>
                          sum +
                          Number(
                            item.subtotal || 0
                          ),
                        0
                      )
                    )}
                  </span>
                </div>

                <div className="total-line final">
                  <span>Total</span>

                  <span>
                    {formatRupiah(
                      pesanan.total
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="detail-card">
              <h2>Catatan Pelanggan</h2>

              {pesanan.catatan ? (
                <div className="note-box">
                  {pesanan.catatan}
                </div>
              ) : (
                <div className="no-note">
                  Tidak ada catatan pelanggan.
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="detail-card action-card">
              <h2>Aksi Pesanan</h2>

              <p className="action-description">
                Perbarui status pesanan sesuai
                proses yang sedang dilakukan.
              </p>

              <div className="action-list">
                {canProcess && (
                  <button
                    type="button"
                    className="action-button action-process"
                    disabled={saving}
                    onClick={() =>
                      ubahStatus("diproses")
                    }
                  >
                    {saving
                      ? "Menyimpan..."
                      : "Tandai Diproses"}
                  </button>
                )}

                {canComplete && (
                  <button
                    type="button"
                    className="action-button action-complete"
                    disabled={saving}
                    onClick={() =>
                      ubahStatus("selesai")
                    }
                  >
                    {saving
                      ? "Menyimpan..."
                      : "Tandai Selesai"}
                  </button>
                )}

                {canCancel && (
                  <button
                    type="button"
                    className="action-button action-cancel"
                    disabled={saving}
                    onClick={() =>
                      ubahStatus("dibatalkan")
                    }
                  >
                    {saving
                      ? "Menyimpan..."
                      : "Batalkan Pesanan"}
                  </button>
                )}

                {canMoveToTrash && (
                  <button
                    type="button"
                    className="action-button action-trash"
                    disabled={saving}
                    onClick={pindahkanKeTrash}
                  >
                    {saving
                      ? "Memindahkan..."
                      : "🗑 Pindahkan ke Trash"}
                  </button>
                )}

                {!canProcess &&
                  !canComplete &&
                  !canCancel &&
                  !canMoveToTrash && (
                    <div className="action-disabled">
                      {pesanan.deleted_at
                        ? "Pesanan ini sudah berada di Trash Pesanan."
                        : `Pesanan ini sudah ${labelStatus(
                            pesanan.status
                          )}. Tidak ada tindakan lanjutan.`}
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
