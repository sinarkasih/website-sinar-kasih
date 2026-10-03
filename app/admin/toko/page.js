"use client";

// Lokasi file: app/admin/toko/page.js
// Toko & Kontak: kartu ringkasan cabang (bisa diklik sebagai filter),
// ringkasan Kontak Utama (WhatsApp, email, Instagram, TikTok),
// daftar cabang dengan foto, tautan Maps/Ulasan, urutkan kolom,
// dan penanda data cabang yang belum lengkap. Gaya sama dengan Pesanan.

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSupabase } from "../../../lib/supabase";
import { useUrut, KolomUrut } from "../Urut";

// Data cabang yang sebaiknya terisi supaya tampil rapi di website
function kekuranganCabang(c) {
  const kurang = [];
  if (!c.foto) kurang.push("foto");
  if (!c.telepon) kurang.push("telepon");
  if (!c.google_maps_url) kurang.push("Google Maps");
  if (!c.google_review_url) kurang.push("link ulasan");
  return kurang;
}

function Ikon({ nama, ukuran = 24 }) {
  const isi = {
    semua: <><path d="M4 10v10h16V10" /><path d="M3 10 5 4h14l2 6Z" /><path d="M10 20v-5h4v5" /></>,
    aktif: <><circle cx="12" cy="12" r="9" /><path d="m8 12 3 3 5-6" /></>,
    nonaktif: <><circle cx="12" cy="12" r="9" /><path d="M8 12h8" /></>,
    kurang: <><path d="M12 3 2.5 20h19L12 3Z" /><path d="M12 10v4M12 17h.01" /></>,
    peta: <><path d="M12 21s7-6.2 7-11.5a7 7 0 0 0-14 0C5 14.8 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.5" /></>,
    bintang: <><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z" /></>,
    wa: <><path d="M4 20l1.3-4A8 8 0 1 1 8 18.7L4 20Z" /></>,
    email: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
    ig: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><path d="M17.5 6.5h.01" /></>,
    tiktok: <><path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5" /><path d="M14 3c.4 2.6 2.2 4.4 5 4.6" /></>,
    foto: <><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="10" r="1.8" /><path d="m21 16-5-5-8 8" /></>,
  }[nama];
  return (
    <svg width={ukuran} height={ukuran} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {isi}
    </svg>
  );
}

export default function TokoPage() {
  const [cabang, setCabang] = useState([]);
  const [kontak, setKontak] = useState(null);
  const [ketik, setKetik] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    muatData();
  }, []);

  async function muatData() {
    setLoading(true);
    setError("");
    const supabase = getSupabase();
    if (!supabase) {
      setError("Koneksi database belum tersedia.");
      setLoading(false);
      return;
    }

    const [cb, kt] = await Promise.all([
      supabase
        .from("cabang_toko")
        .select("id, created_at, nama, alamat, telepon, google_maps_url, google_review_url, foto, aktif, urutan")
        .order("urutan", { ascending: true })
        .order("id", { ascending: true }),
      supabase.from("kontak_toko").select("whatsapp, email, instagram, tiktok").limit(1).maybeSingle(),
    ]);

    if (cb.error) {
      setError(`Gagal mengambil data cabang: ${cb.error.message}`);
      setLoading(false);
      return;
    }

    setCabang(cb.data || []);
    setKontak(kt.data || {});
    setLoading(false);
  }

  async function hapusCabang(item) {
    if (!window.confirm(`Hapus cabang "${item.nama}"?\n\nCabang akan diperiksa terlebih dahulu sebelum dihapus permanen.`)) return;
    if (!window.confirm(`PERINGATAN\n\nCabang "${item.nama}" akan dihapus secara permanen jika tidak memiliki riwayat pesanan.\n\nJika cabang sudah pernah menerima pesanan, sebaiknya cukup dinonaktifkan lewat tombol Edit.\n\nLanjutkan?`)) return;

    setProcessingId(item.id);
    setError("");
    const { error: gagal } = await getSupabase().rpc("hapus_cabang_permanen", { p_cabang_id: item.id });
    setProcessingId(null);

    if (gagal) {
      setError(gagal.message);
      return;
    }
    setCabang((c) => c.filter((x) => x.id !== item.id));
  }

  const ringkas = {
    semua: cabang.length,
    aktif: cabang.filter((c) => c.aktif).length,
    nonaktif: cabang.filter((c) => !c.aktif).length,
    kurang: cabang.filter((c) => kekuranganCabang(c).length > 0).length,
  };

  const kata = ketik.trim().toLowerCase();
  const tersaring = cabang.filter((c) => {
    if (filterStatus === "aktif" && !c.aktif) return false;
    if (filterStatus === "nonaktif" && c.aktif) return false;
    if (filterStatus === "kurang" && kekuranganCabang(c).length === 0) return false;
    if (!kata) return true;
    return [c.nama, c.alamat, c.telepon].filter(Boolean).some((v) => String(v).toLowerCase().includes(kata));
  });

  const urut = useUrut(tersaring, {
    urutan: (x) => Number(x.urutan ?? 0),
    nama: (x) => x.nama,
    telepon: (x) => x.telepon,
    status: (x) => x.aktif,
  });

  const adaFilter = ketik || filterStatus || urut.kunci;

  function resetFilter() {
    setKetik("");
    setFilterStatus("");
    if (urut.kunci) {
      // klik sampai kembali ke urutan awal
      if (urut.arah === "asc") { urut.ganti(urut.kunci); urut.ganti(urut.kunci); }
      else urut.ganti(urut.kunci);
    }
  }

  const kartu = [
    { kunci: "semua", status: "", label: "Total Cabang" },
    { kunci: "aktif", status: "aktif", label: "Aktif" },
    { kunci: "nonaktif", status: "nonaktif", label: "Nonaktif" },
    { kunci: "kurang", status: "kurang", label: "Data Belum Lengkap" },
  ];

  const daftarKontak = [
    { kunci: "wa", label: "WhatsApp", nilai: kontak?.whatsapp },
    { kunci: "email", label: "Email", nilai: kontak?.email },
    { kunci: "ig", label: "Instagram", nilai: kontak?.instagram },
    { kunci: "tiktok", label: "TikTok", nilai: kontak?.tiktok },
  ];

  return (
    <main className="admin-content">
      <div className="admin-page-header tk-kepala">
        <div>
          <h1>Toko &amp; Kontak</h1>
          <p>Kelola cabang toko, jam operasional, dan kontak utama Sinar Kasih yang tampil di website.</p>
        </div>
        <div className="tk-tombol-atas">
          <Link href="/admin/toko/jam-operasional" className="admin-secondary-button tk-link-btn">
            Jam Operasional
          </Link>
          <Link href="/admin/toko/cabang/tambah" className="admin-primary-button tk-link-btn">
            + Tambah Cabang
          </Link>
        </div>
      </div>

      <div className="tk-kartu-grid">
        {kartu.map((k) => (
          <button
            key={k.kunci}
            type="button"
            className={`tk-kartu ${k.kunci} ${filterStatus === k.status && (k.status || !ketik) ? "dipilih" : ""}`}
            onClick={() => setFilterStatus(filterStatus === k.status ? "" : k.status)}
          >
            <span className="tk-kartu-ikon"><Ikon nama={k.kunci} /></span>
            <span className="tk-kartu-teks">
              <strong>{loading ? "–" : ringkas[k.kunci]}</strong>
              <span>{k.label}</span>
            </span>
          </button>
        ))}
      </div>

      <section className="tk-kontak">
        <div className="tk-kontak-kepala">
          <div>
            <h2>Kontak Utama</h2>
            <p>Dipakai di seluruh website, termasuk tombol WhatsApp saat pembeli memesan.</p>
          </div>
          <Link href="/admin/toko/kontak" className="tk-ubah">Ubah Kontak</Link>
        </div>
        <div className="tk-kontak-grid">
          {daftarKontak.map((k) => (
            <div key={k.kunci} className={`tk-kontak-item ${k.nilai ? "" : "kosong"}`}>
              <span className={`tk-kontak-ikon ${k.kunci}`}><Ikon nama={k.kunci} ukuran={18} /></span>
              <span className="tk-kontak-teks">
                <span>{k.label}</span>
                <strong>{loading ? "…" : k.nilai || "Belum diisi"}</strong>
              </span>
            </div>
          ))}
        </div>
      </section>

      <div className="admin-product-table-card tk-daftar">
        <div className="tk-filter">
          <div className="cari-x-wrap">
            <input
              type="text"
              placeholder="Cari nama cabang, alamat, atau telepon..."
              value={ketik}
              onChange={(e) => setKetik(e.target.value)}
            />
            {ketik !== "" && (
              <button type="button" className="cari-x" onClick={() => setKetik("")} aria-label="Hapus pencarian" title="Hapus pencarian">
                ×
              </button>
            )}
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">Semua Status</option>
            <option value="aktif">Aktif</option>
            <option value="nonaktif">Nonaktif</option>
            <option value="kurang">Data belum lengkap</option>
          </select>
          <button type="button" className="tk-reset" onClick={resetFilter} disabled={!adaFilter}>
            Reset
          </button>
        </div>

        {error && <div className="admin-message admin-message-error tk-err">{error}</div>}

        {loading ? (
          <div className="tk-kosong"><p>Memuat data cabang...</p></div>
        ) : tersaring.length === 0 ? (
          <div className="tk-kosong">
            <h2>{adaFilter ? "Cabang tidak ditemukan" : "Belum ada cabang"}</h2>
            <p>{adaFilter ? "Coba ubah pencarian atau filter." : "Tambahkan cabang pertama lewat tombol + Tambah Cabang."}</p>
          </div>
        ) : (
          <div className="admin-product-table-wrapper">
            <table>
              <thead>
                <tr>
                  <KolomUrut urut={urut} kunci="urutan">No.</KolomUrut>
                  <KolomUrut urut={urut} kunci="nama">Cabang</KolomUrut>
                  <KolomUrut urut={urut} kunci="telepon" className="tk-sembunyi-hp">Telepon</KolomUrut>
                  <th className="tk-sembunyi-hp">Tautan</th>
                  <KolomUrut urut={urut} kunci="status">Status</KolomUrut>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {urut.data.map((c) => {
                  const kurang = kekuranganCabang(c);
                  return (
                    <tr key={c.id}>
                      <td className="tk-no">{c.urutan ?? "-"}</td>
                      <td>
                        <div className="tk-cabang">
                          {c.foto ? (
                            <img src={c.foto} alt="" className="tk-foto" loading="lazy" />
                          ) : (
                            <span className="tk-foto kosong" title="Belum ada foto"><Ikon nama="foto" ukuran={20} /></span>
                          )}
                          <span className="tk-cabang-teks">
                            <strong>{c.nama || "-"}</strong>
                            <span className="tk-kecil">{c.alamat || "Alamat belum diisi"}</span>
                            {kurang.length > 0 && (
                              <span className="tk-kurang">Belum ada: {kurang.join(", ")}</span>
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="tk-sembunyi-hp tk-nowrap">{c.telepon || <span className="tk-kecil">-</span>}</td>
                      <td className="tk-sembunyi-hp">
                        <div className="tk-tautan">
                          {c.google_maps_url ? (
                            <a href={c.google_maps_url} target="_blank" rel="noopener noreferrer" className="tk-chip">
                              <Ikon nama="peta" ukuran={14} /> Maps
                            </a>
                          ) : (
                            <span className="tk-chip mati"><Ikon nama="peta" ukuran={14} /> Maps</span>
                          )}
                          {c.google_review_url ? (
                            <a href={c.google_review_url} target="_blank" rel="noopener noreferrer" className="tk-chip">
                              <Ikon nama="bintang" ukuran={14} /> Ulasan
                            </a>
                          ) : (
                            <span className="tk-chip mati"><Ikon nama="bintang" ukuran={14} /> Ulasan</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={`tk-status ${c.aktif ? "aktif" : "nonaktif"}`}>{c.aktif ? "Aktif" : "Nonaktif"}</span>
                      </td>
                      <td>
                        <div className="tk-aksi">
                          <Link href={`/admin/toko/cabang/${c.id}/edit`} className="tk-btn">Edit</Link>
                          <button
                            type="button"
                            className="tk-btn bahaya"
                            onClick={() => hapusCabang(c)}
                            disabled={processingId === c.id}
                          >
                            {processingId === c.id ? "Menghapus..." : "Hapus"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && tersaring.length > 0 && (
          <p className="tk-bawah">Menampilkan {tersaring.length} dari {cabang.length} cabang</p>
        )}
      </div>

      <style>{`
        .tk-kepala { align-items: flex-start; }
        .tk-tombol-atas { display: flex; gap: 10px; flex-wrap: wrap; }
        .tk-link-btn { display: inline-flex; align-items: center; text-decoration: none; white-space: nowrap; }

        .tk-kartu-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; margin-bottom: 20px; }
        .tk-kartu { display: flex; align-items: center; gap: 14px; padding: 16px 18px; border: 1px solid #eadfce; border-radius: 14px; background: #fff; text-align: left; cursor: pointer; font: inherit; color: #3f2f24; transition: border-color .15s ease, box-shadow .15s ease; }
        .tk-kartu:hover { border-color: #d6c1a8; box-shadow: 0 4px 14px rgba(59,42,32,.06); }
        .tk-kartu.dipilih { border-color: #6f4c36; box-shadow: 0 0 0 2px rgba(111,76,54,.15); }
        .tk-kartu-ikon { width: 46px; height: 46px; flex-shrink: 0; display: grid; place-items: center; border-radius: 12px; }
        .tk-kartu.semua .tk-kartu-ikon { background: #f3e8da; color: #6f4c36; }
        .tk-kartu.aktif .tk-kartu-ikon { background: #e4f5e9; color: #2f7a46; }
        .tk-kartu.nonaktif .tk-kartu-ikon { background: #fbe9e7; color: #b23b2e; }
        .tk-kartu.kurang .tk-kartu-ikon { background: #fdf0d8; color: #a8660f; }
        .tk-kartu-teks { display: grid; gap: 2px; }
        .tk-kartu-teks strong { font-size: 24px; line-height: 1.1; }
        .tk-kartu-teks span { font-size: 13.5px; color: #7d6957; }

        .tk-kontak { margin-bottom: 20px; padding: 18px; background: #fff; border: 1px solid #eadfce; border-radius: 14px; }
        .tk-kontak-kepala { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 14px; }
        .tk-kontak-kepala h2 { margin: 0 0 4px !important; font-size: 17px !important; }
        .tk-kontak-kepala p { margin: 0; font-size: 13.5px; color: #7d6957; }
        .tk-ubah { flex-shrink: 0; padding: 8px 14px; border: 1px solid #e0cfbb; border-radius: 10px; color: #6f4c36; font-weight: 700; font-size: 14px; text-decoration: none; }
        .tk-ubah:hover { background: #f8f1e8; }
        .tk-kontak-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; }
        .tk-kontak-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border: 1px solid #f0e7db; border-radius: 12px; background: #fcfaf7; min-width: 0; }
        .tk-kontak-item.kosong { background: #fffaf0; border-color: #f1d9a8; }
        .tk-kontak-item.kosong strong { color: #a8660f; font-weight: 600; }
        .tk-kontak-ikon { width: 34px; height: 34px; flex-shrink: 0; display: grid; place-items: center; border-radius: 10px; background: #f3e8da; color: #6f4c36; }
        .tk-kontak-ikon.wa { background: #e3f6ea; color: #1f8f4c; }
        .tk-kontak-teks { display: grid; gap: 1px; min-width: 0; }
        .tk-kontak-teks span { font-size: 12.5px; color: #9a8571; }
        .tk-kontak-teks strong { font-size: 14px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

        .tk-daftar { min-width: 0; }
        .tk-filter { display: grid; grid-template-columns: minmax(220px, 2fr) minmax(160px, 1fr) auto; gap: 10px; padding: 16px; border-bottom: 1px solid #f0e7db; }
        .tk-filter select, .tk-filter input { height: 44px; }
        .tk-filter select { padding: 0 12px; }
        .tk-reset { height: 44px; padding: 0 16px; border: 1px solid #e0cfbb; border-radius: 10px; background: #fff; color: #5c3e2c; font-weight: 600; cursor: pointer; }
        .tk-reset:disabled { opacity: .45; cursor: default; }
        .tk-err { margin: 14px 16px 0; }

        .tk-daftar table th, .tk-daftar table td { padding: 12px 14px; border-bottom: 1px solid #f0e7db; vertical-align: middle; }
        .tk-daftar tbody tr:hover { background: #fcf8f2; }
        .tk-no { font-weight: 700; color: #7d6957; width: 60px; }
        .tk-cabang { display: flex; align-items: center; gap: 12px; min-width: 220px; }
        .tk-foto { width: 56px; height: 44px; flex-shrink: 0; border-radius: 8px; object-fit: cover; background: #f3eadf; }
        .tk-foto.kosong { display: grid; place-items: center; color: #b9a48e; border: 1px dashed #d6c1a8; background: #fcfaf7; }
        .tk-cabang-teks { display: grid; gap: 2px; min-width: 0; }
        .tk-kecil { display: block; font-size: 12.5px; color: #9a8571; }
        .tk-kurang { display: inline-block; justify-self: start; margin-top: 2px; padding: 2px 8px; border-radius: 999px; background: #fff3d9; color: #8a641d; font-size: 11.5px; font-weight: 700; }
        .tk-nowrap { white-space: nowrap; }

        .tk-tautan { display: flex; gap: 6px; flex-wrap: wrap; }
        .tk-chip { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border: 1px solid #e0cfbb; border-radius: 999px; background: #fff; color: #5c3e2c; font-size: 12.5px; font-weight: 700; text-decoration: none; white-space: nowrap; }
        .tk-chip:hover { background: #f8f1e8; }
        .tk-chip.mati { border-style: dashed; color: #b9a48e; background: transparent; }

        .tk-status { display: inline-block; padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 700; white-space: nowrap; }
        .tk-status.aktif { background: #eaf7ed; color: #347045; }
        .tk-status.nonaktif { background: #fbecec; color: #943f3f; }

        .tk-aksi { display: flex; gap: 6px; }
        .tk-btn { display: inline-flex; align-items: center; justify-content: center; height: 34px; padding: 0 12px; border: 1px solid #e0cfbb; border-radius: 8px; background: #fff; color: #4b3326; font-weight: 700; font-size: 13px; text-decoration: none; cursor: pointer; font-family: inherit; white-space: nowrap; }
        .tk-btn:hover { background: #f8f1e8; }
        .tk-btn.bahaya { background: #fbebe7; border-color: #efc7bc; color: #a33a2c; }
        .tk-btn:disabled { opacity: .6; cursor: wait; }

        .tk-kosong { padding: 40px 20px; text-align: center; }
        .tk-kosong p { margin: 0; color: #7d6957; }
        .tk-bawah { margin: 0; padding: 14px 16px; font-size: 13.5px; color: #7d6957; }

        @media (max-width: 1100px) {
          .tk-kontak-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }

        @media (max-width: 900px) {
          .tk-kartu-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .tk-filter { grid-template-columns: 1fr 1fr; }
          .tk-filter .cari-x-wrap { grid-column: 1 / -1; }
        }

        @media (max-width: 700px) {
          .tk-sembunyi-hp { display: none; }
          .tk-cabang { min-width: 0; }
          .tk-kontak-kepala { flex-direction: column; }
        }

        @media (max-width: 520px) {
          .tk-kontak-grid { grid-template-columns: 1fr; }
          .tk-filter { grid-template-columns: 1fr; }
          .tk-kartu { padding: 12px; gap: 10px; }
          .tk-kartu-ikon { width: 38px; height: 38px; }
          .tk-kartu-teks strong { font-size: 20px; }
          .tk-foto { width: 44px; height: 36px; }
          .tk-aksi { flex-direction: column; }
        }
      `}</style>
    </main>
  );
}
