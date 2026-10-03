"use client";

// Lokasi file: app/admin/pengaturan/BagianOptimasiFoto.js
// "Kecilkan Foto Lama": mengecilkan foto produk yang sudah terlanjur di-upload
// dalam ukuran besar (sebelum fitur pengecil otomatis ada).
// Langkah: 1) Periksa ukuran semua foto, 2) Kecilkan yang besar satu per satu.
// Setiap foto: diunduh -> dikecilkan di browser -> di-upload sebagai file baru
// -> alamat foto di database diganti -> file lama dihapus. Bisa dihentikan kapan saja.

import { useRef, useState } from "react";
import { getSupabase } from "../../../lib/supabase";
import { kompresGambar } from "../../../lib/kompresGambar";

const BUCKET = "produk";
const PENANDA = `/storage/v1/object/public/${BUCKET}/`;
const BATAS_BESAR = 500 * 1024; // foto di atas 500 KB dianggap perlu dikecilkan

function ukuran(n) {
  const v = Number(n) || 0;
  if (v >= 1024 * 1024) return (v / 1024 / 1024).toLocaleString("id-ID", { maximumFractionDigits: 1 }) + " MB";
  return Math.round(v / 1024).toLocaleString("id-ID") + " KB";
}

function pathDariUrl(url) {
  const i = String(url || "").indexOf(PENANDA);
  if (i < 0) return null;
  return decodeURIComponent(String(url).slice(i + PENANDA.length).split("?")[0]);
}

async function ukuranFile(url) {
  try {
    const r = await fetch(url, { method: "HEAD", cache: "no-store" });
    if (!r.ok) return null;
    return Number(r.headers.get("content-length")) || null;
  } catch {
    return null;
  }
}

export default function BagianOptimasiFoto() {
  const [tahap, setTahap] = useState("awal"); // awal | memeriksa | siap | proses | selesai
  const [daftar, setDaftar] = useState([]); // foto besar
  const [ringkas, setRingkas] = useState(null);
  const [kemajuan, setKemajuan] = useState({ selesai: 0, total: 0 });
  const [hasil, setHasil] = useState({ berhasil: 0, gagal: 0, hemat: 0 });
  const [pesan, setPesan] = useState(null);
  const berhenti = useRef(false);

  async function periksa() {
    setTahap("memeriksa");
    setPesan(null);
    const supabase = getSupabase();
    const semua = [];
    for (let dari = 0; dari < 50000; dari += 1000) {
      const { data, error } = await supabase
        .from("produk_gambar")
        .select("id, produk_id, url")
        .order("id", { ascending: true })
        .range(dari, dari + 999);
      if (error) {
        setPesan({ jenis: "gagal", teks: "Gagal membaca daftar foto: " + error.message });
        setTahap("awal");
        return;
      }
      semua.push(...(data || []));
      if (!data || data.length < 1000) break;
    }

    const kandidat = semua.filter((f) => pathDariUrl(f.url));
    setKemajuan({ selesai: 0, total: kandidat.length });

    // Periksa ukuran 6 foto sekaligus
    const besar = [];
    let totalUkuran = 0;
    let terbaca = 0;
    for (let i = 0; i < kandidat.length; i += 6) {
      const potong = kandidat.slice(i, i + 6);
      const ukur = await Promise.all(potong.map((f) => ukuranFile(f.url)));
      ukur.forEach((u, j) => {
        if (u) {
          terbaca += 1;
          totalUkuran += u;
          if (u > BATAS_BESAR) besar.push({ ...potong[j], ukuran: u });
        }
      });
      setKemajuan({ selesai: Math.min(i + 6, kandidat.length), total: kandidat.length });
    }

    besar.sort((a, b) => b.ukuran - a.ukuran);
    setDaftar(besar);
    setRingkas({
      total: semua.length,
      terbaca,
      totalUkuran,
      besar: besar.length,
      ukuranBesar: besar.reduce((s, f) => s + f.ukuran, 0),
    });
    setTahap("siap");
  }

  async function kecilkan() {
    if (daftar.length === 0) return;
    if (!window.confirm(`Kecilkan ${daftar.length} foto sekarang?\n\nJangan tutup halaman ini sampai selesai. Proses bisa dihentikan kapan saja.`)) return;

    berhenti.current = false;
    setTahap("proses");
    setPesan(null);
    const supabase = getSupabase();
    let berhasil = 0;
    let gagal = 0;
    let hemat = 0;
    setKemajuan({ selesai: 0, total: daftar.length });

    for (let i = 0; i < daftar.length; i += 1) {
      if (berhenti.current) break;
      const foto = daftar[i];
      try {
        const pathLama = pathDariUrl(foto.url);
        const r = await fetch(foto.url, { cache: "no-store" });
        if (!r.ok) throw new Error("Foto tidak dapat diunduh");
        const blob = await r.blob();
        const namaLama = pathLama.split("/").pop() || "foto.jpg";
        const asli = new File([blob], namaLama, { type: blob.type || "image/jpeg" });
        const kecil = await kompresGambar(asli);

        // Lewati jika penghematannya kurang dari 20%
        if (kecil === asli || kecil.size > asli.size * 0.8) {
          setKemajuan({ selesai: i + 1, total: daftar.length });
          continue;
        }

        const ekstensi = kecil.name.split(".").pop() || "webp";
        const pathBaru = `produk/${foto.produk_id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ekstensi}`;
        const { error: eUp } = await supabase.storage
          .from(BUCKET)
          .upload(pathBaru, kecil, { cacheControl: "3600", upsert: false, contentType: kecil.type });
        if (eUp) throw eUp;

        const urlBaru = supabase.storage.from(BUCKET).getPublicUrl(pathBaru).data.publicUrl;
        const { error: eDb } = await supabase.from("produk_gambar").update({ url: urlBaru }).eq("id", foto.id);
        if (eDb) {
          await supabase.storage.from(BUCKET).remove([pathBaru]);
          throw eDb;
        }

        // File lama dihapus setelah alamat baru tersimpan (jika gagal, tidak mengganggu tampilan)
        await supabase.storage.from(BUCKET).remove([pathLama]);

        berhasil += 1;
        hemat += asli.size - kecil.size;
      } catch (e) {
        console.error("Gagal mengecilkan foto", foto.id, e);
        gagal += 1;
      }
      setHasil({ berhasil, gagal, hemat });
      setKemajuan({ selesai: i + 1, total: daftar.length });
    }

    setHasil({ berhasil, gagal, hemat });
    setTahap("selesai");
    setPesan({
      jenis: gagal > 0 ? "gagal" : "sukses",
      teks: berhentiTeks(berhenti.current, berhasil, gagal, hemat),
    });
  }

  function berhentiTeks(dihentikan, berhasil, gagal, hemat) {
    let t = `${berhasil} foto berhasil dikecilkan, menghemat ${ukuran(hemat)}.`;
    if (gagal) t += ` ${gagal} foto gagal (bisa dicoba lagi).`;
    if (dihentikan) t = "Proses dihentikan. " + t;
    return t;
  }

  const persen = kemajuan.total ? Math.round((kemajuan.selesai / kemajuan.total) * 100) : 0;

  return (
    <div className="admin-card of">
      <h2>Kecilkan Foto Lama</h2>
      <p className="of-ket">
        Foto produk yang di-upload sebelum fitur pengecil otomatis ada masih berukuran besar, sehingga website terasa
        lambat di HP. Alat ini mengecilkan foto-foto tersebut tanpa mengubah tampilannya. Foto baru sudah otomatis
        dikecilkan, jadi alat ini cukup dipakai sekali.
      </p>

      {pesan && (
        <div className={`of-pesan ${pesan.jenis}`} role={pesan.jenis === "gagal" ? "alert" : "status"}>
          {pesan.teks}
        </div>
      )}

      {(tahap === "memeriksa" || tahap === "proses") && (
        <div className="of-kemajuan" role="status">
          <div className="of-kemajuan-teks">
            <span>{tahap === "memeriksa" ? "Memeriksa ukuran foto..." : "Mengecilkan foto..."}</span>
            <strong>{kemajuan.selesai} / {kemajuan.total}</strong>
          </div>
          <div className="of-jalur"><span style={{ width: `${persen}%` }} /></div>
          {tahap === "proses" && (
            <p className="of-kecil">
              Berhasil {hasil.berhasil} · Gagal {hasil.gagal} · Hemat {ukuran(hasil.hemat)}. Jangan tutup halaman ini.
            </p>
          )}
        </div>
      )}

      {ringkas && tahap !== "memeriksa" && (
        <div className="of-ringkas">
          <div><strong>{ringkas.total}</strong><span>Total foto produk</span></div>
          <div><strong>{ukuran(ringkas.totalUkuran)}</strong><span>Ukuran semua foto</span></div>
          <div className={ringkas.besar ? "perlu" : ""}>
            <strong>{ringkas.besar}</strong>
            <span>Foto besar (&gt; 500 KB), total {ukuran(ringkas.ukuranBesar)}</span>
          </div>
        </div>
      )}

      <div className="of-aksi">
        {tahap === "awal" && (
          <button type="button" className="admin-primary-button" onClick={periksa}>
            1. Periksa Ukuran Foto
          </button>
        )}
        {(tahap === "siap" || tahap === "selesai") && (
          <>
            {tahap === "siap" && daftar.length > 0 && (
              <button type="button" className="admin-primary-button" onClick={kecilkan}>
                2. Kecilkan {daftar.length} Foto Sekarang
              </button>
            )}
            {tahap === "siap" && daftar.length === 0 && (
              <span className="of-ok">Semua foto sudah berukuran ringan. Tidak ada yang perlu dikecilkan.</span>
            )}
            <button type="button" className="admin-secondary-button" onClick={periksa}>
              Periksa Ulang
            </button>
          </>
        )}
        {tahap === "proses" && (
          <button type="button" className="admin-secondary-button" onClick={() => { berhenti.current = true; }}>
            Hentikan
          </button>
        )}
      </div>

      <style>{`
        .of { margin-bottom: 20px; }
        .of-ket { margin: 4px 0 16px !important; max-width: 760px; font-size: 14.5px; line-height: 1.6; color: #7d6957; }
        .of-pesan { margin-bottom: 14px; padding: 11px 14px; border-radius: 10px; font-size: 14px; }
        .of-pesan.gagal { background: #fbebe7; border: 1px solid #efc7bc; color: #8a3b2b; }
        .of-pesan.sukses { background: #eaf7ed; border: 1px solid #c4e5cc; color: #2f6b3f; }
        .of-kemajuan { margin-bottom: 16px; padding: 14px 16px; border-radius: 12px; background: #fcf8f2; border: 1px solid #f0e7db; }
        .of-kemajuan-teks { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; color: #4b3326; }
        .of-jalur { height: 10px; border-radius: 999px; background: #f0e7db; overflow: hidden; }
        .of-jalur span { display: block; height: 100%; background: #6f4c36; border-radius: 999px; transition: width .2s ease; }
        .of-kecil { margin: 8px 0 0 !important; font-size: 13px; color: #7d6957; }
        .of-ringkas { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; margin-bottom: 16px; }
        .of-ringkas > div { display: grid; gap: 2px; padding: 12px 14px; border-radius: 12px; background: #fcf6ee; }
        .of-ringkas > div.perlu { background: #fff3d9; }
        .of-ringkas strong { font-size: 20px; color: #3f2f24; }
        .of-ringkas span { font-size: 13px; color: #7d6957; }
        .of-aksi { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
        .of-ok { font-size: 14px; font-weight: 600; color: #2f7a46; }
        @media (max-width: 700px) { .of-ringkas { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
