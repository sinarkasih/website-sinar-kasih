"use client";

// Lokasi file: app/admin/produk/page.js
// Daftar produk: kartu ringkasan, filter (kategori, brand, status,
// termasuk "belum ada foto" dan "belum ada kategori"),
// foto kecil, urutkan kolom, halaman 1 2 3, dan pilihan jumlah per halaman.
// Tombol "Pindahkan ke Trash" dan "Impor / Ekspor" hanya untuk Admin Utama.

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "../../../lib/supabase";
import Paginasi from "../Paginasi";
import { KolomUrut } from "../Urut";
import { useAdmin } from "../AdminContext";
import { buatPohon } from "../../KategoriPohon";

const PILIHAN_PER_HALAMAN = [10, 25, 50];

// Filter status yang boleh dibuka lewat alamat, contoh dari Dashboard:
// /admin/produk?status=tanpa_foto
const STATUS_DARI_ALAMAT = ["aktif", "nonaktif", "tanpa_harga", "tanpa_foto", "tanpa_kategori"];

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
  if (!h || !h.mode_harga) return null;
  if (h.mode_harga === "pasti") return formatRupiah(h.harga);
  if (h.mode_harga === "mulai_dari") return "Mulai " + formatRupiah(h.harga);
  if (h.mode_harga === "range")
    return formatRupiah(h.harga_min) + " – " + formatRupiah(h.harga_max);
  if (h.mode_harga === "hubungi") return "Hubungi kami";
  return null;
}

function IkonKartu({ nama }) {
  const isi = {
    total: <path d="M21 8 12 3 3 8v8l9 5 9-5V8ZM3 8l9 5 9-5M12 13v8" />,
    aktif: (
      <>
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
    nonaktif: (
      <>
        <path d="M3 3l18 18" />
        <path d="M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4M6.6 6.6C3.8 8.4 2 12 2 12s3.5 7 10 7a9.7 9.7 0 0 0 5.4-1.6" />
      </>
    ),
    harga: (
      <>
        <path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z" />
        <circle cx="7.5" cy="7.5" r="1.5" />
      </>
    ),
  }[nama];
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {isi}
    </svg>
  );
}

export default function AdminProdukPage() {
  const router = useRouter();
  const admin = useAdmin();
  const adminUtama = admin?.role === "admin_utama";

  const [produk, setProduk] = useState([]);
  const [foto, setFoto] = useState({});
  const [total, setTotal] = useState(0);
  const [ringkas, setRingkas] = useState(null);
  const [daftarKategori, setDaftarKategori] = useState([]);
  const [daftarBrand, setDaftarBrand] = useState([]);

  const [halaman, setHalaman] = useState(1);
  const [perHalaman, setPerHalaman] = useState(25);
  const [ketik, setKetik] = useState("");
  const [cari, setCari] = useState("");
  const [filterKategori, setFilterKategori] = useState("");
  const [filterBrand, setFilterBrand] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [urutan, setUrutan] = useState({ kunci: null, arah: "asc" });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState(null);
  // true setelah filter dari alamat dibaca, supaya daftar tidak dimuat dua kali
  const [siap, setSiap] = useState(false);

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

  // Tunggu sebentar setelah mengetik sebelum mencari
  useEffect(() => {
    const t = setTimeout(() => {
      setCari(ketik.trim());
      setHalaman(1);
    }, 400);
    return () => clearTimeout(t);
  }, [ketik]);

  // Data untuk pilihan filter + kartu ringkasan
  const muatRingkasan = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase) return;

    const hitung = (atur) => {
      let q = supabase
        .from("produk_katalog")
        .select("id", { count: "exact", head: true })
        .is("deleted_at", null);
      if (atur) q = atur(q);
      return q;
    };

    const [semua, aktif, nonaktif, tanpaHarga, kat, brn] = await Promise.all([
      hitung(),
      hitung((q) => q.eq("aktif", true)),
      hitung((q) => q.eq("aktif", false)),
      hitung((q) => q.is("mode_harga", null)),
      supabase.from("kategori").select("id, nama, parent_id, urutan").order("nama"),
      supabase.from("brand").select("id, nama").order("nama"),
    ]);

    setRingkas({
      total: semua.count ?? 0,
      aktif: aktif.count ?? 0,
      nonaktif: nonaktif.count ?? 0,
      tanpaHarga: tanpaHarga.count ?? 0,
    });
    setDaftarKategori(kat.data || []);
    setDaftarBrand(brn.data || []);
  }, []);

  useEffect(() => {
    muatRingkasan();
  }, [muatRingkasan]);

  const loadProduk = useCallback(async () => {
    setLoading(true);
    setError("");

    const supabase = getSupabase();
    if (!supabase) {
      setError("Koneksi database belum tersedia.");
      setLoading(false);
      return;
    }

    const dari = (halaman - 1) * perHalaman;

    let q = supabase
      .from("produk_katalog")
      .select(
        "id, nama, sku, slug, satuan, stok, aktif, kategori_nama, brand_nama, mode_harga, harga, harga_min, harga_max",
        { count: "exact" }
      )
      .is("deleted_at", null);

    if (cari) {
      const kata = cari.replace(/[,()%*]/g, " ").trim();
      if (kata) q = q.or(`nama.ilike.%${kata}%,sku.ilike.%${kata}%`);
    }
    if (filterKategori) {
      // ikut sertakan semua turunan kategori yang dipilih
      q = q.in("kategori_id", buatPohon(daftarKategori).keturunan(Number(filterKategori)));
    }
    if (filterBrand) q = q.eq("brand_id", filterBrand);
    if (filterStatus === "aktif") q = q.eq("aktif", true);
    if (filterStatus === "nonaktif") q = q.eq("aktif", false);
    if (filterStatus === "tanpa_harga") q = q.is("mode_harga", null);
    if (filterStatus === "tanpa_kategori") q = q.is("kategori_id", null);
    if (filterStatus === "tanpa_foto") {
      // Cari dulu produk yang sama sekali belum punya foto
      const { data: tanpaFoto, error: fotoError } = await supabase
        .from("produk")
        .select("id, produk_gambar(id)")
        .is("deleted_at", null)
        .is("produk_gambar", null)
        .limit(1000);
      if (fotoError) {
        setError("Gagal mencari produk tanpa foto: " + fotoError.message);
        setLoading(false);
        return;
      }
      const ids = (tanpaFoto || []).map((p) => p.id);
      if (ids.length === 0) {
        setProduk([]);
        setTotal(0);
        setFoto({});
        setLoading(false);
        return;
      }
      q = q.in("id", ids);
    }

    if (urutan.kunci) {
      q = q.order(KOLOM_URUT[urutan.kunci], {
        ascending: urutan.arah === "asc",
        nullsFirst: false,
      });
    }
    q = q.order("id", { ascending: false }).range(dari, dari + perHalaman - 1);

    const { data, count, error: produkError } = await q;

    if (produkError) {
      console.error("Gagal mengambil produk:", produkError);
      setError(produkError.message);
      setLoading(false);
      return;
    }

    setProduk(data || []);
    setTotal(count || 0);

    const ids = (data || []).map((p) => p.id);
    if (ids.length > 0) {
      const { data: gambar } = await supabase
        .from("produk_gambar")
        .select("produk_id, url, utama, id")
        .in("produk_id", ids)
        .order("utama", { ascending: false })
        .order("id", { ascending: true });
      const peta = {};
      (gambar || []).forEach((g) => {
        if (!peta[g.produk_id]) peta[g.produk_id] = g.url;
      });
      setFoto(peta);
    } else {
      setFoto({});
    }

    setLoading(false);
  }, [halaman, perHalaman, cari, filterKategori, filterBrand, filterStatus, urutan, daftarKategori]);

  // Baca filter dari alamat, contoh: /admin/produk?status=tanpa_foto
  useEffect(() => {
    const st = new URLSearchParams(window.location.search).get("status");
    if (st && STATUS_DARI_ALAMAT.includes(st)) setFilterStatus(st);
    setSiap(true);
  }, []);

  useEffect(() => {
    if (!siap) return;
    loadProduk();
  }, [loadProduk, siap]);

  function resetFilter() {
    setKetik("");
    setCari("");
    setFilterKategori("");
    setFilterBrand("");
    setFilterStatus("");
    setUrutan({ kunci: null, arah: "asc" });
    setHalaman(1);
  }

  async function pindahkanKeTrash(item) {
    const konfirmasi = window.confirm(
      `Pindahkan produk "${item.nama}" ke Trash?\n\n` +
        `Produk akan disembunyikan dari daftar produk aktif dan tidak tampil di katalog pelanggan.`
    );
    if (!konfirmasi) return;

    setProcessingId(item.id);
    setError("");

    const { error: updateError } = await getSupabase()
      .from("produk")
      .update({ deleted_at: new Date().toISOString(), aktif: false })
      .eq("id", item.id)
      .is("deleted_at", null);

    setProcessingId(null);

    if (updateError) {
      setError(`Gagal memindahkan "${item.nama}" ke Trash: ${updateError.message}`);
      return;
    }

    loadProduk();
    muatRingkasan();
  }

  const totalHalaman = Math.max(1, Math.ceil(total / perHalaman));
  const adaFilter = ketik || filterKategori || filterBrand || filterStatus || urutan.kunci;

  const kartu = [
    { kunci: "total", label: "Total Produk", nilai: ringkas?.total, warna: "coklat", status: "" },
    { kunci: "aktif", label: "Produk Aktif", nilai: ringkas?.aktif, warna: "hijau", status: "aktif" },
    { kunci: "nonaktif", label: "Produk Nonaktif", nilai: ringkas?.nonaktif, warna: "merah", status: "nonaktif" },
    { kunci: "harga", label: "Belum Ada Harga", nilai: ringkas?.tanpaHarga, warna: "kuning", status: "tanpa_harga" },
  ];

  return (
    <main className="admin-content">
      <div className="admin-page-header">
        <div>
          <h1>Produk</h1>
          <p>Kelola seluruh produk Toko Listrik Sinar Kasih.</p>
        </div>

        <div className="prd-aksi-kepala">
          {adminUtama && (
            <Link href="/admin/produk/impor-ekspor" className="admin-secondary-button">
              Impor / Ekspor
            </Link>
          )}
          <Link href="/admin/produk/tambah" className="admin-primary-button">
            + Tambah Produk
          </Link>
        </div>
      </div>

      {/* KARTU RINGKASAN (bisa diklik untuk memfilter) */}
      <div className="prd-kartu-grid">
        {kartu.map((k) => (
          <button
            key={k.kunci}
            type="button"
            className={`prd-kartu ${k.warna} ${filterStatus === k.status && k.status ? "dipilih" : ""}`}
            onClick={() => {
              setFilterStatus(filterStatus === k.status ? "" : k.status);
              setHalaman(1);
            }}
          >
            <span className="prd-kartu-ikon">
              <IkonKartu nama={k.kunci} />
            </span>
            <span className="prd-kartu-teks">
              <strong>{ringkas ? k.nilai : "–"}</strong>
              <span>{k.label}</span>
            </span>
          </button>
        ))}
      </div>

      <div className="admin-product-table-card">
        {/* BARIS FILTER */}
        <div className="prd-filter">
          <div className="cari-x-wrap prd-cari">
            <input
              type="text"
              placeholder="Cari nama produk atau SKU..."
              value={ketik}
              onChange={(e) => setKetik(e.target.value)}
            />
            {ketik !== "" && (
              <button
                type="button"
                className="cari-x"
                onClick={() => setKetik("")}
                aria-label="Hapus pencarian"
                title="Hapus pencarian"
              >
                ×
              </button>
            )}
          </div>

          <select
            value={filterKategori}
            onChange={(e) => {
              setFilterKategori(e.target.value);
              setHalaman(1);
            }}
          >
            <option value="">Semua Kategori</option>
            {buatPohon(daftarKategori).urutPohon().map((k) => (
              <option key={k.id} value={k.id}>{k.label}</option>
            ))}
          </select>

          <select
            value={filterBrand}
            onChange={(e) => {
              setFilterBrand(e.target.value);
              setHalaman(1);
            }}
          >
            <option value="">Semua Brand</option>
            {daftarBrand.map((b) => (
              <option key={b.id} value={b.id}>{b.nama}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setHalaman(1);
            }}
          >
            <option value="">Semua Status</option>
            <option value="aktif">Aktif</option>
            <option value="nonaktif">Nonaktif</option>
            <option value="tanpa_harga">Belum ada harga</option>
            <option value="tanpa_foto">Belum ada foto</option>
            <option value="tanpa_kategori">Belum ada kategori</option>
          </select>

          <button
            type="button"
            className="prd-reset"
            onClick={resetFilter}
            disabled={!adaFilter}
          >
            Reset
          </button>
        </div>

        {error && <div className="admin-message admin-message-error prd-pesan">{error}</div>}

        {!loading && produk.length === 0 ? (
          <div className="prd-kosong">
            <h2>{adaFilter ? "Produk tidak ditemukan" : "Belum ada produk"}</h2>
            <p>
              {adaFilter
                ? "Coba ubah kata pencarian atau filter, lalu coba lagi."
                : "Tambahkan produk pertama melalui tombol Tambah Produk."}
            </p>
          </div>
        ) : (
          <div className="admin-product-table-wrapper">
            <table className="admin-product-table">
              <thead>
                <tr>
                  <th className="prd-kolom-foto">Foto</th>
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
                      <td className="prd-kolom-foto">
                        <div className="prd-foto">
                          {foto[item.id] ? (
                            <img src={foto[item.id]} alt="" loading="lazy" />
                          ) : (
                            <span>Foto</span>
                          )}
                        </div>
                      </td>
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
                      <td className="prd-stok">
                        {item.stok ?? 0} {item.satuan || ""}
                      </td>
                      <td>
                        {item.aktif ? (
                          <span className="admin-status active">Aktif</span>
                        ) : (
                          <span className="admin-status inactive">Nonaktif</span>
                        )}
                      </td>
                      <td>
                        <div className="prd-aksi">
                          <button
                            type="button"
                            className="prd-btn"
                            onClick={() => router.push(`/admin/produk/${item.id}/edit`)}
                            title="Ubah data produk"
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M12 20h9" />
                              <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                            </svg>
                            Edit
                          </button>
                          <button
                            type="button"
                            className="prd-btn"
                            onClick={() => router.push(`/admin/produk/${item.id}/harga`)}
                            title="Atur harga produk"
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z" />
                              <circle cx="7.5" cy="7.5" r="1.2" />
                            </svg>
                            Harga
                          </button>
                          <a
                            href={`/produk/${item.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="prd-btn prd-ikon"
                            title="Lihat di website"
                            aria-label="Lihat di website"
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          </a>
                          {adminUtama && (
                            <button
                              type="button"
                              className="prd-btn prd-ikon bahaya"
                              disabled={processingId === item.id}
                              onClick={() => pindahkanKeTrash(item)}
                              title="Pindahkan ke Trash"
                              aria-label="Pindahkan ke Trash"
                            >
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
                              </svg>
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
        )}

        <div className="prd-bawah">
          <label className="prd-per">
            Tampilkan
            <select
              value={perHalaman}
              onChange={(e) => {
                setPerHalaman(Number(e.target.value));
                setHalaman(1);
              }}
            >
              {PILIHAN_PER_HALAMAN.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            per halaman
          </label>

          <div className="prd-paginasi">
            <Paginasi
              halaman={halaman}
              totalHalaman={totalHalaman}
              totalData={total}
              perHalaman={perHalaman}
              onGanti={setHalaman}
              satuan="produk"
            />
          </div>
        </div>
      </div>

      <style>{`
        .prd-aksi-kepala { display: flex; gap: 10px; flex-wrap: wrap; }

        .prd-kartu-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
          margin-bottom: 20px;
        }

        .prd-kartu {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px 18px;
          border: 1px solid #eadfce;
          border-radius: 14px;
          background: #fff;
          text-align: left;
          cursor: pointer;
          font: inherit;
          color: #3f2f24;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }

        .prd-kartu:hover { border-color: #d6c1a8; box-shadow: 0 4px 14px rgba(59, 42, 32, 0.06); }
        .prd-kartu.dipilih { border-color: #6f4c36; box-shadow: 0 0 0 2px rgba(111, 76, 54, 0.15); }

        .prd-kartu-ikon {
          width: 46px; height: 46px; flex-shrink: 0;
          display: grid; place-items: center; border-radius: 12px;
        }

        .prd-kartu.coklat .prd-kartu-ikon { background: #f3e8da; color: #6f4c36; }
        .prd-kartu.hijau .prd-kartu-ikon { background: #e4f5e9; color: #2f7a46; }
        .prd-kartu.merah .prd-kartu-ikon { background: #fbe9e7; color: #b23b2e; }
        .prd-kartu.kuning .prd-kartu-ikon { background: #fdf0d8; color: #a8660f; }

        .prd-kartu-teks { display: grid; gap: 2px; }
        .prd-kartu-teks strong { font-size: 24px; line-height: 1.1; }
        .prd-kartu-teks span { font-size: 13.5px; color: #7d6957; }

        .prd-filter {
          display: grid;
          grid-template-columns: minmax(220px, 2fr) repeat(3, minmax(140px, 1fr)) auto;
          gap: 10px;
          padding: 16px;
          border-bottom: 1px solid #f0e7db;
        }

        .prd-filter select { padding: 10px 12px; height: 44px; }
        .prd-cari input { height: 44px; }

        .prd-reset {
          height: 44px; padding: 0 16px;
          border: 1px solid #e0cfbb; border-radius: 10px;
          background: #fff; color: #5c3e2c; font-weight: 600; cursor: pointer;
        }
        .prd-reset:disabled { opacity: 0.45; cursor: default; }

        .prd-pesan { margin: 14px 16px 0; }

        .prd-kolom-foto { width: 64px; }
        .prd-foto {
          width: 48px; height: 48px; border-radius: 10px; overflow: hidden;
          display: grid; place-items: center; background: #f7f1e8;
          color: #b9a690; font-size: 11px; border: 1px solid #efe5d9;
        }
        .prd-foto img { width: 100%; height: 100%; object-fit: contain; background: #fff; }

        .prd-harga { white-space: nowrap; font-weight: 600; }
        .prd-stok { white-space: nowrap; }
        .prd-belum {
          font-weight: 600; font-size: 12.5px; color: #9a5b16;
          background: #fdf0e1; padding: 3px 8px; border-radius: 999px;
        }

        .prd-aksi { display: flex; gap: 6px; flex-wrap: nowrap; }
        .prd-btn {
          display: inline-flex; align-items: center; gap: 5px;
          height: 34px; padding: 0 10px;
          border: 1px solid #e0cfbb; border-radius: 8px;
          background: #fff; color: #4b3326;
          font-size: 13px; font-weight: 600; text-decoration: none;
          cursor: pointer; white-space: nowrap;
        }
        .prd-btn:hover { background: #f8f1e8; }
        .prd-ikon { width: 34px; padding: 0; justify-content: center; }
        .prd-btn.bahaya { color: #b23b2e; border-color: #efc7bc; }
        .prd-btn.bahaya:hover { background: #fbebe7; }

        .prd-redup { opacity: 0.5; }

        .prd-kosong { padding: 40px 20px; text-align: center; }
        .prd-kosong h2 { margin-bottom: 6px !important; }
        .prd-kosong p { margin: 0; color: #7d6957; }

        .prd-bawah {
          display: flex; align-items: center; justify-content: space-between;
          gap: 14px; flex-wrap: wrap; padding: 4px 16px 16px;
        }
        .prd-per { display: flex; align-items: center; gap: 8px; font-size: 13.5px; color: #7d6957; margin-top: 18px; }
        .prd-per select { height: 36px; padding: 0 8px; }
        .prd-paginasi { flex: 1; min-width: 280px; }

        @media (max-width: 1100px) {
          .prd-filter { grid-template-columns: 1fr 1fr; }
          .prd-cari { grid-column: 1 / -1; }
        }

        @media (max-width: 900px) {
          .prd-kartu-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }

        @media (max-width: 520px) {
          .prd-filter { grid-template-columns: 1fr; }
          .prd-kartu { padding: 12px; gap: 10px; }
          .prd-kartu-ikon { width: 38px; height: 38px; }
          .prd-kartu-teks strong { font-size: 20px; }
        }
      `}</style>
    </main>
  );
}
