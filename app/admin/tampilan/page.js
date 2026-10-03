"use client";

// Lokasi file: app/admin/tampilan/page.js
// Tampilan Website:
// - Produk Musiman: produk pilihan musim (Natal, Lebaran, dll) di Beranda
// - Formulir: tautan Google Form (klaim garansi, kepuasan pelanggan, komplain)
// - Lagu Tema: lagu Sinar Kasih yang bisa diputar pengunjung (tidak otomatis)
// Keduanya tampil di halaman Info website.

import { useCallback, useEffect, useState } from "react";
import { getSupabase } from "../../../lib/supabase";
import { useUrut, KolomUrut } from "../Urut";
import { ambilIdYoutube } from "../../info/VideoPromosi";
import BagianMusiman from "./BagianMusiman";

const FORM_KOSONG = { judul: "", deskripsi: "", url: "", urutan: 0, aktif: true };
const LAGU_KOSONG = { judul: "", keterangan: "", urutan: 0, aktif: true };

function Pesan({ pesan }) {
  if (!pesan) return null;
  return (
    <div
      className={`tw-pesan ${pesan.jenis}`}
      role={pesan.jenis === "gagal" ? "alert" : "status"}
    >
      {pesan.teks}
    </div>
  );
}

// ================= FORMULIR =================
function BagianFormulir() {
  const [daftar, setDaftar] = useState([]);
  const [form, setForm] = useState(null); // null = tertutup
  const [editId, setEditId] = useState(null);
  const [pesan, setPesan] = useState(null);
  const [simpan, setSimpan] = useState(false);

  const muat = useCallback(async () => {
    const { data, error } = await getSupabase()
      .from("formulir_tautan")
      .select("*")
      .order("urutan", { ascending: true })
      .order("id", { ascending: true });
    if (error) {
      setPesan({
        jenis: "gagal",
        teks: "Data formulir gagal dimuat. Pastikan langkah SQL sudah dijalankan. (" + error.message + ")",
      });
      return;
    }
    setDaftar(data || []);
  }, []);

  useEffect(() => {
    muat();
  }, [muat]);

  const urut = useUrut(daftar, {
    urutan: (x) => Number(x.urutan ?? 0),
    judul: (x) => x.judul,
    status: (x) => x.aktif,
  });

  function buka(item) {
    setPesan(null);
    setEditId(item ? item.id : null);
    setForm(
      item
        ? {
            judul: item.judul,
            deskripsi: item.deskripsi || "",
            url: item.url,
            urutan: item.urutan ?? 0,
            aktif: item.aktif,
          }
        : { ...FORM_KOSONG, urutan: daftar.length + 1 }
    );
  }

  async function kirim(e) {
    e.preventDefault();
    const url = form.url.trim();
    if (!/^https?:\/\//i.test(url)) {
      setPesan({ jenis: "gagal", teks: "Link harus diawali https://" });
      return;
    }
    setSimpan(true);
    const isi = {
      judul: form.judul.trim(),
      deskripsi: form.deskripsi.trim() || null,
      url,
      urutan: Number(form.urutan) || 0,
      aktif: form.aktif,
    };
    const q = getSupabase().from("formulir_tautan");
    const { error } = editId
      ? await q.update(isi).eq("id", editId)
      : await q.insert(isi);
    setSimpan(false);
    if (error) {
      setPesan({ jenis: "gagal", teks: "Gagal menyimpan: " + error.message });
      return;
    }
    setPesan({ jenis: "sukses", teks: `Formulir "${isi.judul}" tersimpan.` });
    setForm(null);
    muat();
  }

  async function hapus(item) {
    if (!window.confirm(`Hapus formulir "${item.judul}"?`)) return;
    const { error } = await getSupabase()
      .from("formulir_tautan")
      .delete()
      .eq("id", item.id);
    if (error) {
      setPesan({ jenis: "gagal", teks: "Gagal menghapus: " + error.message });
      return;
    }
    setPesan({ jenis: "sukses", teks: `Formulir "${item.judul}" dihapus.` });
    muat();
  }

  return (
    <div className="admin-card tw-kartu">
      <div className="tw-kepala">
        <div>
          <h2>Formulir</h2>
          <p>
            Link Google Form untuk pelanggan, misalnya klaim garansi, survei
            kepuasan, atau komplain pelayanan. Tampil di halaman Info.
          </p>
        </div>
        <button
          type="button"
          className="admin-primary-button"
          onClick={() => buka(null)}
        >
          + Tambah formulir
        </button>
      </div>

      <Pesan pesan={pesan} />

      {form && (
        <form onSubmit={kirim} className="tw-form">
          <div className="tw-grid">
            <label>
              Judul
              <input
                type="text"
                value={form.judul}
                onChange={(e) => setForm({ ...form, judul: e.target.value })}
                placeholder="Contoh: Klaim Garansi"
                required
              />
            </label>
            <label>
              Link Google Form
              <input
                type="url"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                placeholder="https://forms.gle/..."
                required
              />
            </label>
            <label className="tw-lebar">
              Keterangan singkat
              <input
                type="text"
                value={form.deskripsi}
                onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                placeholder="Contoh: Ajukan klaim garansi untuk produk yang dibeli di Sinar Kasih."
              />
            </label>
            <label>
              Urutan tampil
              <input
                type="number"
                value={form.urutan}
                onChange={(e) => setForm({ ...form, urutan: e.target.value })}
              />
            </label>
            <label className="tw-cek">
              <input
                type="checkbox"
                checked={form.aktif}
                onChange={(e) => setForm({ ...form, aktif: e.target.checked })}
              />
              Tampilkan di website
            </label>
          </div>
          <div className="tw-aksi">
            <button type="submit" className="admin-primary-button" disabled={simpan}>
              {simpan ? "Menyimpan..." : "Simpan"}
            </button>
            <button
              type="button"
              className="admin-secondary-button"
              onClick={() => setForm(null)}
            >
              Batal
            </button>
          </div>
        </form>
      )}

      {daftar.length === 0 ? (
        <p className="tw-kosong">Belum ada formulir.</p>
      ) : (
        <div className="tw-tabel">
          <table>
            <thead>
              <tr>
                <KolomUrut urut={urut} kunci="urutan">Urutan</KolomUrut>
                <KolomUrut urut={urut} kunci="judul">Judul</KolomUrut>
                <th>Link</th>
                <KolomUrut urut={urut} kunci="status">Status</KolomUrut>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {urut.data.map((item) => (
                <tr key={item.id}>
                  <td>{item.urutan}</td>
                  <td>
                    <strong>{item.judul}</strong>
                    {item.deskripsi && <small className="tw-ket">{item.deskripsi}</small>}
                  </td>
                  <td>
                    <a href={item.url} target="_blank" rel="noreferrer" className="tw-link">
                      Buka formulir ↗
                    </a>
                  </td>
                  <td>
                    <span className={`admin-status ${item.aktif ? "active" : "inactive"}`}>
                      {item.aktif ? "Tampil" : "Disembunyikan"}
                    </span>
                  </td>
                  <td>
                    <div className="tw-aksi-baris">
                      <button type="button" className="tw-btn" onClick={() => buka(item)}>
                        Edit
                      </button>
                      <button type="button" className="tw-btn bahaya" onClick={() => hapus(item)}>
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ================= VIDEO =================
function BagianVideo() {
  const [daftar, setDaftar] = useState([]);
  const [form, setForm] = useState(null); // null = tertutup
  const [editId, setEditId] = useState(null);
  const [pesan, setPesan] = useState(null);
  const [simpan, setSimpan] = useState(false);

  const muat = useCallback(async () => {
    const { data, error } = await getSupabase()
      .from("video_promosi")
      .select("*")
      .order("urutan", { ascending: true })
      .order("id", { ascending: true });
    if (error) {
      setPesan({
        jenis: "gagal",
        teks: "Data video gagal dimuat. Pastikan langkah SQL sudah dijalankan. (" + error.message + ")",
      });
      return;
    }
    setDaftar(data || []);
  }, []);

  useEffect(() => {
    muat();
  }, [muat]);

  const urut = useUrut(daftar, {
    urutan: (x) => Number(x.urutan ?? 0),
    judul: (x) => x.judul,
    status: (x) => x.aktif,
  });

  function buka(item) {
    setPesan(null);
    setEditId(item ? item.id : null);
    setForm(
      item
        ? {
            judul: item.judul,
            deskripsi: item.keterangan || "",
            url: item.youtube_url,
            urutan: item.urutan ?? 0,
            aktif: item.aktif,
          }
        : { ...FORM_KOSONG, urutan: daftar.length + 1 }
    );
  }

  async function kirim(e) {
    e.preventDefault();
    const url = form.url.trim();
    if (!ambilIdYoutube(url)) {
      setPesan({
        jenis: "gagal",
        teks: "Link YouTube tidak dikenali. Salin link dari tombol Bagikan di YouTube, contoh: https://youtu.be/abc123xyz00",
      });
      return;
    }
    setSimpan(true);
    const isi = {
      judul: form.judul.trim(),
      keterangan: form.deskripsi.trim() || null,
      youtube_url: url,
      urutan: Number(form.urutan) || 0,
      aktif: form.aktif,
    };
    const q = getSupabase().from("video_promosi");
    const { error } = editId
      ? await q.update(isi).eq("id", editId)
      : await q.insert(isi);
    setSimpan(false);
    if (error) {
      setPesan({ jenis: "gagal", teks: "Gagal menyimpan: " + error.message });
      return;
    }
    setPesan({ jenis: "sukses", teks: `Video "${isi.judul}" tersimpan.` });
    setForm(null);
    muat();
  }

  async function hapus(item) {
    if (!window.confirm(`Hapus video "${item.judul}"?`)) return;
    const { error } = await getSupabase()
      .from("video_promosi")
      .delete()
      .eq("id", item.id);
    if (error) {
      setPesan({ jenis: "gagal", teks: "Gagal menghapus: " + error.message });
      return;
    }
    setPesan({ jenis: "sukses", teks: `Video "${item.judul}" dihapus.` });
    muat();
  }

  return (
    <div className="admin-card tw-kartu">
      <div className="tw-kepala">
        <div>
          <h2>Video Promosi</h2>
          <p>
            Video dari YouTube yang tampil di halaman Info. Unggah video ke
            YouTube Sinar Kasih dulu, lalu tempel link-nya di sini. Video
            hanya diputar saat pengunjung menekan tombol putar.
          </p>
        </div>
        <button
          type="button"
          className="admin-primary-button"
          onClick={() => buka(null)}
        >
          + Tambah video
        </button>
      </div>

      <Pesan pesan={pesan} />

      {form && (
        <form onSubmit={kirim} className="tw-form">
          <div className="tw-grid">
            <label>
              Judul
              <input
                type="text"
                value={form.judul}
                onChange={(e) => setForm({ ...form, judul: e.target.value })}
                placeholder="Contoh: Promo Lampu Takajo"
                required
              />
            </label>
            <label>
              Link YouTube
              <input
                type="url"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                placeholder="https://youtu.be/..."
                required
              />
            </label>
            <label className="tw-lebar">
              Keterangan singkat
              <input
                type="text"
                value={form.deskripsi}
                onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                placeholder="Contoh: Lampu hemat energi untuk rumah Anda"
              />
            </label>
            <label>
              Urutan tampil
              <input
                type="number"
                value={form.urutan}
                onChange={(e) => setForm({ ...form, urutan: e.target.value })}
              />
            </label>
            <label className="tw-cek">
              <input
                type="checkbox"
                checked={form.aktif}
                onChange={(e) => setForm({ ...form, aktif: e.target.checked })}
              />
              Tampilkan di website
            </label>
          </div>
          <div className="tw-aksi">
            <button type="submit" className="admin-primary-button" disabled={simpan}>
              {simpan ? "Menyimpan..." : "Simpan"}
            </button>
            <button
              type="button"
              className="admin-secondary-button"
              onClick={() => setForm(null)}
            >
              Batal
            </button>
          </div>
        </form>
      )}

      {daftar.length === 0 ? (
        <p className="tw-kosong">Belum ada video.</p>
      ) : (
        <div className="tw-tabel">
          <table>
            <thead>
              <tr>
                <KolomUrut urut={urut} kunci="urutan">Urutan</KolomUrut>
                <KolomUrut urut={urut} kunci="judul">Judul</KolomUrut>
                <th>Link</th>
                <KolomUrut urut={urut} kunci="status">Status</KolomUrut>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {urut.data.map((item) => (
                <tr key={item.id}>
                  <td>{item.urutan}</td>
                  <td>
                    <strong>{item.judul}</strong>
                    {item.keterangan && <small className="tw-ket">{item.keterangan}</small>}
                  </td>
                  <td>
                    <a href={item.youtube_url} target="_blank" rel="noreferrer" className="tw-link">
                      Buka video ↗
                    </a>
                  </td>
                  <td>
                    <span className={`admin-status ${item.aktif ? "active" : "inactive"}`}>
                      {item.aktif ? "Tampil" : "Disembunyikan"}
                    </span>
                  </td>
                  <td>
                    <div className="tw-aksi-baris">
                      <button type="button" className="tw-btn" onClick={() => buka(item)}>
                        Edit
                      </button>
                      <button type="button" className="tw-btn bahaya" onClick={() => hapus(item)}>
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ================= LAGU =================
function BagianLagu() {
  const [daftar, setDaftar] = useState([]);
  const [form, setForm] = useState(null);
  const [file, setFile] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [pesan, setPesan] = useState(null);
  const [simpan, setSimpan] = useState(false);

  const muat = useCallback(async () => {
    const { data, error } = await getSupabase()
      .from("lagu_tema")
      .select("*")
      .order("urutan", { ascending: true })
      .order("id", { ascending: true });
    if (error) {
      setPesan({
        jenis: "gagal",
        teks: "Data lagu gagal dimuat. Pastikan langkah SQL sudah dijalankan. (" + error.message + ")",
      });
      return;
    }
    setDaftar(data || []);
  }, []);

  useEffect(() => {
    muat();
  }, [muat]);

  const urut = useUrut(daftar, {
    urutan: (x) => Number(x.urutan ?? 0),
    judul: (x) => x.judul,
    status: (x) => x.aktif,
  });

  function buka(item) {
    setPesan(null);
    setFile(null);
    setEditItem(item);
    setForm(
      item
        ? {
            judul: item.judul,
            keterangan: item.keterangan || "",
            urutan: item.urutan ?? 0,
            aktif: item.aktif,
          }
        : { ...LAGU_KOSONG, urutan: daftar.length + 1 }
    );
  }

  async function kirim(e) {
    e.preventDefault();
    if (!editItem && !file) {
      setPesan({ jenis: "gagal", teks: "Pilih file lagu terlebih dahulu." });
      return;
    }
    if (file && file.size > 20 * 1024 * 1024) {
      setPesan({ jenis: "gagal", teks: "Ukuran file lagu maksimal 20 MB." });
      return;
    }

    setSimpan(true);
    const supabase = getSupabase();
    const isi = {
      judul: form.judul.trim(),
      keterangan: form.keterangan.trim() || null,
      urutan: Number(form.urutan) || 0,
      aktif: form.aktif,
    };

    if (file) {
      const ext = (file.name.split(".").pop() || "mp3").toLowerCase();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: gagalUnggah } = await supabase.storage
        .from("lagu")
        .upload(path, file, { contentType: file.type || "audio/mpeg" });
      if (gagalUnggah) {
        setSimpan(false);
        setPesan({ jenis: "gagal", teks: "File gagal diunggah: " + gagalUnggah.message });
        return;
      }
      isi.audio_path = path;
      isi.audio_url = supabase.storage.from("lagu").getPublicUrl(path).data.publicUrl;
    }

    const q = supabase.from("lagu_tema");
    const { error } = editItem
      ? await q.update(isi).eq("id", editItem.id)
      : await q.insert(isi);

    if (!error && file && editItem?.audio_path) {
      await supabase.storage.from("lagu").remove([editItem.audio_path]);
    }

    setSimpan(false);
    if (error) {
      setPesan({ jenis: "gagal", teks: "Gagal menyimpan: " + error.message });
      return;
    }
    setPesan({ jenis: "sukses", teks: `Lagu "${isi.judul}" tersimpan.` });
    setForm(null);
    setFile(null);
    muat();
  }

  async function hapus(item) {
    if (!window.confirm(`Hapus lagu "${item.judul}"?`)) return;
    const supabase = getSupabase();
    const { error } = await supabase.from("lagu_tema").delete().eq("id", item.id);
    if (error) {
      setPesan({ jenis: "gagal", teks: "Gagal menghapus: " + error.message });
      return;
    }
    if (item.audio_path) {
      await supabase.storage.from("lagu").remove([item.audio_path]);
    }
    setPesan({ jenis: "sukses", teks: `Lagu "${item.judul}" dihapus.` });
    muat();
  }

  return (
    <div className="admin-card tw-kartu">
      <div className="tw-kepala">
        <div>
          <h2>Lagu Tema</h2>
          <p>
            Lagu Sinar Kasih yang bisa diputar pengunjung di halaman Info.
            Lagu tidak pernah diputar otomatis; pengunjung harus menekan
            tombol putar.
          </p>
        </div>
        <button
          type="button"
          className="admin-primary-button"
          onClick={() => buka(null)}
        >
          + Tambah lagu
        </button>
      </div>

      <Pesan pesan={pesan} />

      {form && (
        <form onSubmit={kirim} className="tw-form">
          <div className="tw-grid">
            <label>
              Judul lagu
              <input
                type="text"
                value={form.judul}
                onChange={(e) => setForm({ ...form, judul: e.target.value })}
                placeholder="Contoh: Terang Bersama Sinar Kasih"
                required
              />
            </label>
            <label>
              File lagu (MP3, M4A, MP4, MPEG, maks. 20 MB)
              <input
                type="file"
                accept="audio/*,video/mp4,video/mpeg,.mp3,.m4a,.mp4,.mpeg,.mpg"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              {editItem && (
                <small className="tw-ket">Kosongkan jika tidak ingin mengganti file.</small>
              )}
            </label>
            <label className="tw-lebar">
              Keterangan singkat
              <input
                type="text"
                value={form.keterangan}
                onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
                placeholder="Contoh: Lagu tema resmi Toko Listrik Sinar Kasih"
              />
            </label>
            <label>
              Urutan tampil
              <input
                type="number"
                value={form.urutan}
                onChange={(e) => setForm({ ...form, urutan: e.target.value })}
              />
            </label>
            <label className="tw-cek">
              <input
                type="checkbox"
                checked={form.aktif}
                onChange={(e) => setForm({ ...form, aktif: e.target.checked })}
              />
              Tampilkan di website
            </label>
          </div>
          <div className="tw-aksi">
            <button type="submit" className="admin-primary-button" disabled={simpan}>
              {simpan ? "Mengunggah..." : "Simpan"}
            </button>
            <button
              type="button"
              className="admin-secondary-button"
              onClick={() => setForm(null)}
              disabled={simpan}
            >
              Batal
            </button>
          </div>
        </form>
      )}

      {daftar.length === 0 ? (
        <p className="tw-kosong">Belum ada lagu.</p>
      ) : (
        <div className="tw-tabel">
          <table>
            <thead>
              <tr>
                <KolomUrut urut={urut} kunci="urutan">Urutan</KolomUrut>
                <KolomUrut urut={urut} kunci="judul">Judul</KolomUrut>
                <th>Putar</th>
                <KolomUrut urut={urut} kunci="status">Status</KolomUrut>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {urut.data.map((item) => (
                <tr key={item.id}>
                  <td>{item.urutan}</td>
                  <td>
                    <strong>{item.judul}</strong>
                    {item.keterangan && <small className="tw-ket">{item.keterangan}</small>}
                  </td>
                  <td>
                    <audio controls preload="none" src={item.audio_url} className="tw-audio" />
                  </td>
                  <td>
                    <span className={`admin-status ${item.aktif ? "active" : "inactive"}`}>
                      {item.aktif ? "Tampil" : "Disembunyikan"}
                    </span>
                  </td>
                  <td>
                    <div className="tw-aksi-baris">
                      <button type="button" className="tw-btn" onClick={() => buka(item)}>
                        Edit
                      </button>
                      <button type="button" className="tw-btn bahaya" onClick={() => hapus(item)}>
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function TampilanWebsitePage() {
  return (
    <div className="tw">
      <div className="admin-page-header">
        <div>
          <h1>Tampilan Website</h1>
          <p>Atur Produk Musiman di Beranda, serta formulir pelanggan, lagu tema, dan video promosi di halaman Info.</p>
        </div>
        <a href="/info" target="_blank" rel="noreferrer" className="admin-secondary-button">
          Lihat halaman Info ↗
        </a>
      </div>

      <BagianMusiman />
      <BagianFormulir />
      <BagianLagu />
      <BagianVideo />

      <style>{`
        .tw-kartu { margin-bottom: 20px; }
        .tw-kepala { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; flex-wrap: wrap; margin-bottom: 16px; }
        .tw-kepala p { margin: 4px 0 0; max-width: 640px; font-size: 14.5px; color: #7d6957; line-height: 1.5; }
        .tw-pesan { margin-bottom: 16px; padding: 11px 14px; border-radius: 10px; font-size: 14px; }
        .tw-pesan.gagal { background: #fbebe7; border: 1px solid #efc7bc; color: #8a3b2b; }
        .tw-pesan.sukses { background: #eaf7ed; border: 1px solid #c4e5cc; color: #2f6b3f; }
        .tw-form { margin-bottom: 20px; padding: 18px; border: 1px solid #e6d9c8; border-radius: 12px; background: #fcf8f2; }
        .tw-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px 18px; }
        .tw-grid label { display: grid; gap: 6px; font-size: 14px; font-weight: 600; color: #3f2f24; }
        .tw-grid input[type="text"], .tw-grid input[type="url"], .tw-grid input[type="number"] { width: 100%; padding: 10px 12px; }
        .tw-grid input[type="file"] { font-size: 14px; }
        .tw-lebar { grid-column: 1 / -1; }
        .tw-cek { display: flex !important; align-items: center; gap: 8px; align-self: end; padding-bottom: 10px; }
        .tw-aksi { display: flex; gap: 10px; margin-top: 16px; flex-wrap: wrap; }
        .tw-kosong { margin: 0; color: #7d6957; font-size: 14.5px; }
        .tw-tabel { overflow-x: auto; }
        .tw-tabel th, .tw-tabel td { padding: 12px 14px; border-bottom: 1px solid #f0e7db; }
        .tw-tabel tbody tr:last-child td { border-bottom: none; }
        .tw-ket { display: block; margin-top: 3px; font-size: 12.5px; color: #9a8571; font-weight: 400; }
        .tw-link { color: #6f4c36; font-weight: 600; text-decoration: none; white-space: nowrap; }
        .tw-link:hover { text-decoration: underline; }
        .tw-audio { height: 36px; max-width: 260px; }
        .tw-aksi-baris { display: flex; gap: 8px; }
        .tw-btn { min-height: 34px; padding: 0 12px; border: 1px solid #e0cfbb; border-radius: 8px; background: #fff; color: #4b3326; font-size: 13.5px; font-weight: 600; cursor: pointer; }
        .tw-btn:hover { background: #f8f1e8; }
        .tw-btn.bahaya { border-color: #efc7bc; background: #fbebe7; color: #8a3b2b; }
        @media (max-width: 760px) { .tw-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
