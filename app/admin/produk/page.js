"use client";

// Lokasi file: app/admin/produk/page.js
// Daftar produk dengan halaman 1 2 3 ...
// Data diambil per halaman langsung dari database, jadi tetap cepat
// walaupun jumlah produk ribuan.

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "../../../lib/supabase";
import Paginasi from "../Paginasi";
import { KolomUrut } from "../Urut";
import { useAdmin } from "../AdminContext";

const PER_HALAMAN = 25;

// Kolom tabel -> kolom database untuk mengurutkan
const KOLOM_URUT = {
  produk: "nama",
  sku: "sku",
  kategori: "kategori_nama",
  brand: "brand_nama",
  harga: "harga_urut",
  stok: "stok",
  status: "aktif",
};

function formatRupiah(angka) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(angka) || 0);
}

function teksHarga(h) {
  if (!h) return null;
  if (h.mode_harga === "pasti") return formatRupiah(h.harga);
  if (h.mode_harga === "mulai_dari") return "Mulai " + formatRupiah(h.harga);
  if (h.mode_harga === "range")
    return formatRupiah(h.harga_min) + " – " + formatRupiah(h.harga_max);
  if (h.mode_harga === "hubungi") return "Hubungi kami";
  return null;
}

export default function AdminProdukPage() {
  const router = useRouter();
  const admin = useAdmin();
  const [urutan, setUrutan] = useState({ kunci: null, arah: "asc" });

  const urut = {
    kunci: urutan.kunci,
    arah: urutan.arah,
    ganti: (kunci) => {
      setUrutan((u) => {
        if (u.kunci !== kunci) return { kunci, arah: "asc" };
        if (u.arah === "asc") return { kunci, arah: "desc" };
        return { kunci: null, arah: "asc" };
      });
      setHalaman(1);
    },
  };
  const [produk, setProduk] = useState([]);
  const [total, setTotal] = useState(0);
  const [halaman, setHalaman] = useState(1);
  const [ketik, setKetik] = useState("");
  const [cari, setCari] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState(null);

  // Tunggu sebentar setelah mengetik sebelum mencari
  useEffect(() => {
    const t = setTimeout(() => {
      setCari(ketik.trim());
      setHalaman(1);
    }, 400);
    return () => clearTimeout(t);
  }, [ketik]);

  const loadProduk = useCallback(async () => {
    setLoading(true);
    setError("");

    const supabase = getSupabase();
    if (!supabase) {
      setError("Koneksi database belum tersedia.");
      setLoading(false);
      return;
    }

    const dari = (halaman - 1) * PER_HALAMAN;

    let q = supabase
      .from("produk_katalog")
      .select(
        "id, nama, sku, slug, satuan, stok, aktif, kategori_nama, brand_nama, mode_harga, harga, harga_min, harga_max",
        { count: "exact" }
      )
      .is("deleted_at", null);

    if (urutan.kunci) {
      q = q.order(KOLOM_URUT[urutan.kunci], {
        ascending: urutan.arah === "asc",
        nullsFirst: false,
      });
    }
    q = q
      .order("id", { ascending: false })
      .range(dari, dari + PER_HALAMAN - 1);

    if (cari) {
      const kata = cari.replace(/[,()%*]/g, " ").trim();
      if (kata) {
        q = q.or(`nama.ilike.%${kata}%,sku.ilike.%${kata}%`);
      }
    }

    const { data, count, error: produkError } = await q;

    if (produkError) {
      console.error("Gagal mengambil produk:", produkError);
      setError(
        /produk_katalog/.test(produkError.message || "")
          ? "Daftar produk butuh pembaruan database. Jalankan langkah SQL dari paket terbaru di Supabase."
          : produkError.message
      );
      setLoading(false);
      return;
    }

    setProduk(data || []);
    setTotal(count || 0);

    setLoading(false);
  }, [halaman, cari, urutan]);

  useEffect(() => {
    loadProduk();
  }, [loadProduk]);

  async function pindahkanKeTrash(item) {
    const konfirmasi = window.confirm(
      `Pindahkan produk "${item.nama}" ke Trash?\n\n` +
        `Produk akan disembunyikan dari daftar produk aktif dan tidak tampil di katalog pelanggan.`
    );
    if (!konfirmasi) return;

    const supabase = getSupabase();
    if (!supabase) {
      setError("Koneksi database belum tersedia.");
      return;
    }

    setProcessingId(item.id);
    setError("");

    const { error: updateError } = await supabase
      .from("produk")
      .update({
        deleted_at: new Date().toISOString(),
        aktif: false,
      })
      .eq("id", item.id)
      .is("deleted_at", null);

    setProcessingId(null);

    if (updateError) {
      console.error("Gagal memindahkan produk ke Trash:", updateError);
      setError(
        `Gagal memindahkan "${item.nama}" ke Trash: ${updateError.message}`
      );
      return;
    }

    loadProduk();
  }

  const totalHalaman = Math.max(1, Math.ceil(total / PER_HALAMAN));

  return (
    <main className="admin-content">
      <div className="admin-page-header">
        <div>
          <h1>Produk</h1>
          <p>Kelola seluruh produk Toko Listrik Sinar Kasih.</p>
        </div>

        <div className="prd-aksi-kepala">
          {admin?.role === "admin_utama" && (
            <Link
              href="/admin/produk/impor-ekspor"
              className="admin-secondary-button"
            >
              Impor / Ekspor
            </Link>
          )}
          <Link href="/admin/produk/tambah" className="admin-primary-button">
            + Tambah Produk
          </Link>
        </div>
      </div>

      <div className="admin-product-toolbar">
        <div className="prd-cari">
          <input
            type="text"
            placeholder="Cari nama produk atau SKU..."
            value={ketik}
            onChange={(e) => setKetik(e.target.value)}
          />

          {ketik !== "" && (
            <button
              type="button"
              className="prd-hapus-cari"
              onClick={() => setKetik("")}
              aria-label="Hapus pencarian"
              title="Hapus pencarian"
            >
              ×
            </button>
          )}
        </div>

        <div className="admin-product-count">
          {loading ? "Memuat..." : `${total} produk`}
        </div>
      </div>

      {error && (
        <div className="admin-message admin-message-error">{error}</div>
      )}

      {!loading && produk.length === 0 ? (
        <div className="admin-card admin-empty">
          <h2>{cari ? "Produk tidak ditemukan" : "Belum ada produk"}</h2>
          <p>
            {cari
              ? "Coba gunakan kata pencarian yang berbeda."
              : "Tambahkan produk pertama melalui tombol Tambah Produk, atau gunakan Impor."}
          </p>
        </div>
      ) : (
        <div className="admin-product-table-card">
          <div className="admin-product-table-wrapper">
            <table className="admin-product-table">
              <thead>
                <tr>
                  <KolomUrut urut={urut} kunci="produk">Produk</KolomUrut>
                  <KolomUrut urut={urut} kunci="sku">SKU</KolomUrut>
                  <KolomUrut urut={urut} kunci="kategori">Kategori</KolomUrut>
                  <KolomUrut urut={urut} kunci="brand">Brand</KolomUrut>
                  <KolomUrut urut={urut} kunci="harga">Harga</KolomUrut>
                  <KolomUrut urut={urut} kunci="stok">Stok</KolomUrut>
                  <KolomUrut urut={urut} kunci="status">Status</KolomUrut>
                  <th>Aksi</th>
                </tr>
              </thead>

              <tbody className={loading ? "prd-redup" : ""}>
                {produk.map((item) => {
                  const h = teksHarga(item);
                  return (
                    <tr key={item.id}>
                      <td>
                        <div className="admin-product-name">{item.nama}</div>
                        <div className="admin-product-slug">/{item.slug}</div>
                      </td>
                      <td>{item.sku || "-"}</td>
                      <td>{item.kategori_nama || "-"}</td>
                      <td>{item.brand_nama || "-"}</td>
                      <td className="prd-harga">
                        {h || <span className="prd-belum">Belum diatur</span>}
                      </td>
                      <td>
                        {item.stok ?? 0} {item.satuan || ""}
                      </td>
                      <td>
                        {item.aktif ? (
                          <span className="admin-status active">Aktif</span>
                        ) : (
                          <span className="admin-status inactive">
                            Nonaktif
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="admin-product-actions prd-aksi">
                          <button
                            type="button"
                            onClick={() =>
                              router.push(`/admin/produk/${item.id}/edit`)
                            }
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              router.push(`/admin/produk/${item.id}/harga`)
                            }
                          >
                            Harga
                          </button>
                          {item.aktif && (
                            <button
                              type="button"
                              disabled={processingId === item.id}
                              onClick={() => pindahkanKeTrash(item)}
                              className="prd-trash"
                            >
                              {processingId === item.id
                                ? "Memindahkan..."
                                : "Pindahkan ke Trash"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="prd-paginasi">
            <Paginasi
              halaman={halaman}
              totalHalaman={totalHalaman}
              totalData={total}
              perHalaman={PER_HALAMAN}
              onGanti={setHalaman}
              satuan="produk"
            />
          </div>
        </div>
      )}

      <style>{`
        .prd-aksi-kepala {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .prd-cari {
          position: relative;
          width: 100%;
          max-width: 440px;
        }

        .prd-cari input {
          width: 100%;
          box-sizing: border-box;
          padding-right: 44px !important;
        }

        .prd-hapus-cari {
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
        }

        .prd-aksi {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .prd-trash {
          color: #8b3a3a !important;
        }

        .prd-harga {
          white-space: nowrap;
          font-weight: 600;
        }

        .prd-belum {
          font-weight: 600;
          font-size: 12.5px;
          color: #9a5b16;
          background: #fdf0e1;
          padding: 3px 8px;
          border-radius: 999px;
        }

        .prd-redup {
          opacity: 0.5;
        }

        .prd-paginasi {
          padding: 0 18px 18px;
        }
      `}</style>
    </main>
  );
}
