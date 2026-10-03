"use client";

// Lokasi file: app/admin/tampilan/BagianMusiman.js
// Pengaturan "Produk Musiman" di Beranda (khusus Admin Utama):
// label kecil, judul & keterangan, jadwal tampil (opsional), aktif/nonaktif,
// dan pilih maksimal 6 produk lewat pencarian (urutan bisa diatur).
// Produk Populer di Beranda dihitung otomatis dari Statistik, tidak diatur di sini.

import { useCallback, useEffect, useState } from "react";
import { getSupabase } from "../../../lib/supabase";

const MAKS = 6;
const SARAN_LABEL = ["Spesial Musim Ini", "Spesial Natal", "Spesial Lebaran", "Spesial Paskah", "Promo Terbatas"];
const SARAN_JUDUL = ["Spesial Natal & Tahun Baru", "Spesial Ramadan & Lebaran", "Musim Hujan", "Promo Akhir Tahun"];

function teksHarga(p) {
  const rp = (n) => "Rp " + Number(n || 0).toLocaleString("id-ID");
  if (p.mode_harga === "pasti") return rp(p.harga);
  if (p.mode_harga === "mulai_dari") return "Mulai " + rp(p.harga ?? p.harga_min);
  if (p.mode_harga === "range") return rp(p.harga_min) + " – " + rp(p.harga_max);
  return "Tanya harga";
}

function hariIniWIT() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jayapura",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function formatTgl(s) {
  if (!s) return "";
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

function statusTampil(f, jumlah) {
  if (!f.aktif) return { kelas: "mati", teks: "Tidak tampil di Beranda (nonaktif)" };
  if (jumlah === 0) return { kelas: "mati", teks: "Belum tampil: pilih minimal satu produk" };
  const hari = hariIniWIT();
  if (f.tanggal_mulai && hari < f.tanggal_mulai) return { kelas: "jadwal", teks: `Terjadwal tampil mulai ${formatTgl(f.tanggal_mulai)}` };
  if (f.tanggal_selesai && hari > f.tanggal_selesai) return { kelas: "mati", teks: `Sudah berakhir pada ${formatTgl(f.tanggal_selesai)}` };
  return {
    kelas: "tampil",
    teks: f.tanggal_selesai ? `Sedang tampil di Beranda sampai ${formatTgl(f.tanggal_selesai)}` : "Sedang tampil di Beranda",
  };
}

export default function BagianMusiman() {
  const [form, setForm] = useState(null);
  const [pilihan, setPilihan] = useState([]); // [{id, nama, foto, harga...}]
  const [ketik, setKetik] = useState("");
  const [hasil, setHasil] = useState([]);
  const [mencari, setMencari] = useState(false);
  const [pesan, setPesan] = useState(null);
  const [simpan, setSimpan] = useState(false);
  const [belumSiap, setBelumSiap] = useState(false);
  const [berubah, setBerubah] = useState(false);

  const ambilDetail = useCallback(async (ids) => {
    if (!ids || ids.length === 0) return [];
    const supabase = getSupabase();
    const [{ data: pr }, { data: gb }] = await Promise.all([
      supabase
        .from("produk_katalog")
        .select("id, nama, sku, mode_harga, harga, harga_min, harga_max, aktif, deleted_at")
        .in("id", ids),
      supabase.from("produk_gambar").select("produk_id, url, utama").in("produk_id", ids),
    ]);
    const foto = {};
    (gb || []).forEach((g) => {
      if (!foto[g.produk_id] || g.utama) foto[g.produk_id] = g.url;
    });
    const peta = new Map((pr || []).map((p) => [Number(p.id), { ...p, foto: foto[p.id] || null }]));
    return ids.map((id) => peta.get(Number(id))).filter(Boolean);
  }, []);

  const muat = useCallback(async () => {
    const { data, error } = await getSupabase()
      .from("beranda_musiman")
      .select("aktif, label, judul, keterangan, tanggal_mulai, tanggal_selesai, produk_ids")
      .eq("id", 1)
      .maybeSingle();
    if (error || !data) {
      setBelumSiap(true);
      return;
    }
    setForm({
      aktif: !!data.aktif,
      label: data.label ?? "",
      judul: data.judul || "Produk Musiman",
      keterangan: data.keterangan || "",
      tanggal_mulai: data.tanggal_mulai || "",
      tanggal_selesai: data.tanggal_selesai || "",
    });
    setPilihan(await ambilDetail(data.produk_ids || []));
    setBerubah(false);
  }, [ambilDetail]);

  useEffect(() => {
    muat();
  }, [muat]);

  // Cari produk (jeda sebentar setelah mengetik)
  useEffect(() => {
    const kata = ketik.replace(/[,()%*]/g, " ").trim();
    if (kata.length < 2) {
      setHasil([]);
      return;
    }
    const t = setTimeout(async () => {
      setMencari(true);
      const { data } = await getSupabase()
        .from("produk_katalog")
        .select("id, nama, sku, mode_harga, harga, harga_min, harga_max")
        .eq("aktif", true)
        .is("deleted_at", null)
        .or(`nama.ilike.%${kata}%,sku.ilike.%${kata}%`)
        .order("nama", { ascending: true })
        .limit(8);
      const daftar = data || [];
      const ids = daftar.map((p) => p.id);
      const foto = {};
      if (ids.length > 0) {
        const { data: gb } = await getSupabase().from("produk_gambar").select("produk_id, url, utama").in("produk_id", ids);
        (gb || []).forEach((g) => {
          if (!foto[g.produk_id] || g.utama) foto[g.produk_id] = g.url;
        });
      }
      setHasil(daftar.map((p) => ({ ...p, foto: foto[p.id] || null })));
      setMencari(false);
    }, 350);
    return () => clearTimeout(t);
  }, [ketik]);

  function ubah(isi) {
    setForm((f) => ({ ...f, ...isi }));
    setBerubah(true);
    setPesan(null);
  }

  function tambah(p) {
    if (pilihan.length >= MAKS || pilihan.some((x) => x.id === p.id)) return;
    setPilihan((d) => [...d, p]);
    setBerubah(true);
    setPesan(null);
  }

  function hapus(id) {
    setPilihan((d) => d.filter((x) => x.id !== id));
    setBerubah(true);
  }

  function geser(i, arah) {
    setPilihan((d) => {
      const j = i + arah;
      if (j < 0 || j >= d.length) return d;
      const baru = [...d];
      [baru[i], baru[j]] = [baru[j], baru[i]];
      return baru;
    });
    setBerubah(true);
  }

  async function kirim() {
    if (!form.judul.trim()) {
      setPesan({ jenis: "gagal", teks: "Judul bagian wajib diisi." });
      return;
    }
    if (form.tanggal_mulai && form.tanggal_selesai && form.tanggal_selesai < form.tanggal_mulai) {
      setPesan({ jenis: "gagal", teks: "Tanggal selesai tidak boleh sebelum tanggal mulai." });
      return;
    }
    setSimpan(true);
    setPesan(null);
    const { error } = await getSupabase()
      .from("beranda_musiman")
      .update({
        aktif: form.aktif,
        label: form.label.trim() || null,
        judul: form.judul.trim(),
        keterangan: form.keterangan.trim() || null,
        tanggal_mulai: form.tanggal_mulai || null,
        tanggal_selesai: form.tanggal_selesai || null,
        produk_ids: pilihan.map((p) => Number(p.id)),
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);
    setSimpan(false);
    if (error) {
      setPesan({ jenis: "gagal", teks: "Gagal menyimpan: " + error.message });
      return;
    }
    setBerubah(false);
    setPesan({ jenis: "sukses", teks: "Produk Musiman tersimpan. Beranda akan menampilkan perubahan ini." });
  }

  if (belumSiap) {
    return (
      <div className="admin-card tw-kartu">
        <div className="tw-kepala">
          <div>
            <h2>Produk Musiman di Beranda</h2>
            <p>
              Fitur ini belum siap. Jalankan dulu file <strong>supabase/beranda-musiman.sql</strong> di Supabase &gt;
              SQL Editor, lalu muat ulang halaman ini.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="admin-card tw-kartu">
        <p className="tw-kosong">Memuat pengaturan Produk Musiman...</p>
      </div>
    );
  }

  const status = statusTampil(form, pilihan.length);
  const idTerpilih = new Set(pilihan.map((p) => p.id));

  return (
    <div className="admin-card tw-kartu pm">
      <div className="tw-kepala">
        <div>
          <h2>Produk Musiman di Beranda</h2>
          <p>
            Pilih maksimal {MAKS} produk untuk ditonjolkan di bagian atas Beranda, misalnya lampu hias menjelang Natal.
            Isi tanggal jika ingin tampil dan hilang otomatis. Produk Populer di Beranda dihitung otomatis dari Statistik.
          </p>
        </div>
        <a href="/" target="_blank" rel="noreferrer" className="admin-secondary-button">
          Lihat Beranda ↗
        </a>
      </div>

      <div className={`pm-status ${status.kelas}`}>
        <span className="pm-titik" aria-hidden="true" />
        {status.teks}
      </div>

      {pesan && (
        <div className={`tw-pesan ${pesan.jenis}`} role={pesan.jenis === "gagal" ? "alert" : "status"}>
          {pesan.teks}
        </div>
      )}

      <div className="tw-grid">
        <label className="tw-lebar pm-saklar">
          <input type="checkbox" checked={form.aktif} onChange={(e) => ubah({ aktif: e.target.checked })} />
          <span>Tampilkan Produk Musiman di Beranda</span>
        </label>

        <label>
          Label kecil di atas judul (kosongkan untuk menyembunyikan)
          <input
            type="text"
            value={form.label}
            maxLength={40}
            onChange={(e) => ubah({ label: e.target.value })}
            placeholder="Contoh: Spesial Natal"
          />
        </label>
        <div className="pm-saran pm-saran-label">
          <span>Contoh label:</span>
          {SARAN_LABEL.map((l) => (
            <button key={l} type="button" className="pm-chip" onClick={() => ubah({ label: l })}>
              {l}
            </button>
          ))}
        </div>

        <label>
          Judul bagian
          <input
            type="text"
            value={form.judul}
            maxLength={80}
            onChange={(e) => ubah({ judul: e.target.value })}
            placeholder="Contoh: Spesial Natal & Tahun Baru"
          />
        </label>
        <label>
          Keterangan singkat (boleh kosong)
          <input
            type="text"
            value={form.keterangan}
            maxLength={200}
            onChange={(e) => ubah({ keterangan: e.target.value })}
            placeholder="Contoh: Lampu hias dan perlengkapan dekorasi untuk menyambut Natal."
          />
        </label>

        <div className="tw-lebar pm-saran">
          <span>Contoh judul:</span>
          {SARAN_JUDUL.map((j) => (
            <button key={j} type="button" className="pm-chip" onClick={() => ubah({ judul: j })}>
              {j}
            </button>
          ))}
        </div>

        <label>
          Tampil mulai (boleh kosong)
          <input type="date" value={form.tanggal_mulai} onChange={(e) => ubah({ tanggal_mulai: e.target.value })} />
        </label>
        <label>
          Tampil sampai (boleh kosong)
          <input type="date" value={form.tanggal_selesai} onChange={(e) => ubah({ tanggal_selesai: e.target.value })} />
        </label>
      </div>

      <div className="pm-dua">
        <div>
          <h3 className="pm-sub">
            Produk terpilih <span>{pilihan.length} / {MAKS}</span>
          </h3>
          {pilihan.length === 0 ? (
            <p className="tw-kosong pm-kosong">Belum ada produk. Cari dan tambahkan produk di sebelah kanan.</p>
          ) : (
            <ol className="pm-daftar">
              {pilihan.map((p, i) => {
                const masalah = p.aktif === false || p.deleted_at;
                return (
                  <li key={p.id} className={masalah ? "masalah" : ""}>
                    <span className="pm-no">{i + 1}</span>
                    {p.foto ? <img src={p.foto} alt="" className="pm-foto" /> : <span className="pm-foto kosong">Foto</span>}
                    <span className="pm-teks">
                      <strong>{p.nama}</strong>
                      <small>
                        {masalah ? "Produk nonaktif / di Trash, tidak akan tampil" : teksHarga(p)}
                      </small>
                    </span>
                    <span className="pm-aksi">
                      <button type="button" onClick={() => geser(i, -1)} disabled={i === 0} aria-label="Naikkan" title="Naikkan">↑</button>
                      <button type="button" onClick={() => geser(i, 1)} disabled={i === pilihan.length - 1} aria-label="Turunkan" title="Turunkan">↓</button>
                      <button type="button" className="hapus" onClick={() => hapus(p.id)} aria-label="Hapus dari daftar" title="Hapus">×</button>
                    </span>
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        <div>
          <h3 className="pm-sub">Tambah produk</h3>
          <div className="cari-x-wrap">
            <input
              type="text"
              value={ketik}
              onChange={(e) => setKetik(e.target.value)}
              placeholder={pilihan.length >= MAKS ? "Sudah 6 produk, hapus satu untuk menambah" : "Cari nama atau SKU produk..."}
              disabled={pilihan.length >= MAKS}
            />
            {ketik !== "" && (
              <button type="button" className="cari-x" onClick={() => setKetik("")} aria-label="Hapus pencarian" title="Hapus pencarian">
                ×
              </button>
            )}
          </div>
          {ketik.trim().length >= 2 && (
            <ul className="pm-hasil">
              {mencari && hasil.length === 0 ? (
                <li className="pm-info">Mencari...</li>
              ) : hasil.length === 0 ? (
                <li className="pm-info">Produk tidak ditemukan.</li>
              ) : (
                hasil.map((p) => {
                  const sudah = idTerpilih.has(p.id);
                  return (
                    <li key={p.id}>
                      {p.foto ? <img src={p.foto} alt="" className="pm-foto" /> : <span className="pm-foto kosong">Foto</span>}
                      <span className="pm-teks">
                        <strong>{p.nama}</strong>
                        <small>{p.sku ? `${p.sku} · ` : ""}{teksHarga(p)}</small>
                      </span>
                      <button
                        type="button"
                        className="tw-btn"
                        onClick={() => tambah(p)}
                        disabled={sudah || pilihan.length >= MAKS}
                      >
                        {sudah ? "Terpilih" : "+ Tambah"}
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          )}
        </div>
      </div>

      <div className="tw-aksi">
        <button type="button" className="admin-primary-button" onClick={kirim} disabled={simpan || !berubah}>
          {simpan ? "Menyimpan..." : "Simpan Produk Musiman"}
        </button>
        {berubah && (
          <button type="button" className="tw-btn" onClick={muat} disabled={simpan}>
            Batalkan perubahan
          </button>
        )}
      </div>

      <style>{`
        .pm-status { display: inline-flex; align-items: center; gap: 8px; margin-bottom: 16px; padding: 7px 12px; border-radius: 999px; font-size: 13.5px; font-weight: 700; }
        .pm-titik { width: 8px; height: 8px; border-radius: 50%; background: currentColor; }
        .pm-status.tampil { background: #eaf7ed; color: #2f7a46; }
        .pm-status.jadwal { background: #eaf2ff; color: #315d91; }
        .pm-status.mati { background: #f3eee8; color: #7d6957; }
        .pm-saklar { display: flex !important; align-items: center; gap: 10px; padding: 12px 14px; border: 1px solid #eadfce; border-radius: 10px; background: #fcf8f2; cursor: pointer; }
        .pm-saklar input { width: 18px; height: 18px; accent-color: #6f4c36; }
        .pm .tw-grid input[type="date"] { width: 100%; padding: 9px 12px; }
        .pm-saran { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin-top: -4px; font-size: 13px; color: #9a8571; }
        .pm-saran-label { align-self: end; margin-top: 0; padding-bottom: 8px; }
        .pm-chip { padding: 5px 10px; border: 1px solid #e0cfbb; border-radius: 999px; background: #fff; color: #5c3e2c; font-size: 12.5px; font-weight: 600; cursor: pointer; }
        .pm-chip:hover { background: #f8f1e8; }

        .pm-dua { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; margin-top: 20px; }
        .pm-sub { display: flex; justify-content: space-between; align-items: baseline; margin: 0 0 10px !important; font-size: 15px !important; }
        .pm-sub span { font-size: 13px; font-weight: 600; color: #9a8571; }
        .pm-kosong { padding: 18px; border: 1px dashed #e0cfbb; border-radius: 12px; text-align: center; }
        .pm-daftar, .pm-hasil { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
        .pm-hasil { margin-top: 10px; max-height: 420px; overflow-y: auto; }
        .pm-daftar li, .pm-hasil li { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border: 1px solid #f0e7db; border-radius: 12px; background: #fff; }
        .pm-daftar li.masalah { border-color: #efc7bc; background: #fdf4f2; }
        .pm-daftar li.masalah small { color: #a33a2c; }
        .pm-hasil li.pm-info { justify-content: center; color: #7d6957; font-size: 14px; }
        .pm-no { width: 22px; flex-shrink: 0; text-align: center; font-weight: 800; color: #b9a48e; }
        .pm-foto { width: 44px; height: 44px; flex-shrink: 0; border-radius: 8px; object-fit: contain; background: #f7f1e8; }
        .pm-foto.kosong { display: grid; place-items: center; font-size: 11px; color: #b9a48e; }
        .pm-teks { display: grid; gap: 1px; min-width: 0; flex: 1; }
        .pm-teks strong { font-size: 14px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .pm-teks small { font-size: 12.5px; color: #9a8571; }
        .pm-aksi { display: flex; gap: 4px; }
        .pm-aksi button { width: 30px; height: 30px; border: 1px solid #e0cfbb; border-radius: 8px; background: #fff; color: #4b3326; font-size: 15px; cursor: pointer; }
        .pm-aksi button:hover:not(:disabled) { background: #f8f1e8; }
        .pm-aksi button:disabled { opacity: .35; cursor: default; }
        .pm-aksi button.hapus { color: #a33a2c; border-color: #efc7bc; font-size: 18px; }
        .pm .cari-x-wrap input { width: 100%; height: 42px; }
        @media (max-width: 900px) { .pm-dua { grid-template-columns: minmax(0, 1fr); } }
      `}</style>
    </div>
  );
}
