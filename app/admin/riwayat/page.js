"use client";

// Lokasi file: app/admin/riwayat/page.js
// Riwayat Perubahan (khusus Admin Utama):
// mencatat siapa menambah/mengubah/menghapus data produk, kapan, dan apa yang berubah.
// Catatan dibuat otomatis oleh database, jadi tidak bisa dilewati atau dihapus karyawan.

import { useCallback, useEffect, useState } from "react";
import { getSupabase } from "../../../lib/supabase";

const PER_HALAMAN = 30;

const NAMA_BAGIAN = {
  produk: "Produk",
  harga_produk: "Harga",
  variasi_produk: "Variasi",
  produk_gambar: "Foto produk",
  produk_label: "Label pada produk",
  label_produk: "Daftar label",
};

const KOLOM_DISEMBUNYIKAN = ["id", "created_at", "updated_at"];

function rapikanNamaKolom(kolom) {
  if (kolom === "deleted_at") return "Trash";
  const teks = kolom.replace(/_/g, " ");
  return teks.charAt(0).toUpperCase() + teks.slice(1);
}

function formatNilai(kolom, nilai) {
  if (nilai === null || nilai === undefined || nilai === "") return "(kosong)";

  if (kolom === "deleted_at") return "Dipindahkan ke Trash";

  if (typeof nilai === "boolean") {
    if (kolom === "aktif") return nilai ? "Aktif" : "Nonaktif";
    return nilai ? "Ya" : "Tidak";
  }

  if (typeof nilai === "number" && kolom.includes("harga")) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(nilai);
  }

  if (typeof nilai === "string" && kolom.endsWith("_at")) {
    const t = new Date(nilai);
    if (!isNaN(t)) return t.toLocaleString("id-ID");
  }

  const teks = typeof nilai === "object" ? JSON.stringify(nilai) : String(nilai);
  return teks.length > 70 ? teks.slice(0, 70) + "…" : teks;
}

function judulAksi(item) {
  if (item.aksi === "ubah" && item.data_baru && "deleted_at" in item.data_baru) {
    return item.data_baru.deleted_at ? "Pindah ke Trash" : "Dipulihkan";
  }
  return { tambah: "Tambah", ubah: "Ubah", hapus: "Hapus" }[item.aksi] || item.aksi;
}

function kelasAksi(item) {
  const judul = judulAksi(item);
  if (judul === "Tambah" || judul === "Dipulihkan") return "tambah";
  if (judul === "Hapus" || judul === "Pindah ke Trash") return "hapus";
  return "ubah";
}

function RincianPerubahan({ item }) {
  if (item.aksi === "ubah") {
    const kolom = Object.keys(item.data_baru || {}).filter(
      (k) => !KOLOM_DISEMBUNYIKAN.includes(k)
    );
    if (kolom.length === 0) return <span className="rw-redup">-</span>;

    return (
      <ul className="rw-rincian">
        {kolom.map((k) => (
          <li key={k}>
            <span className="rw-kolom">{rapikanNamaKolom(k)}:</span>{" "}
            <span className="rw-lama">
              {k === "deleted_at" && !item.data_lama?.[k]
                ? "Tidak"
                : formatNilai(k, item.data_lama?.[k])}
            </span>{" "}
            <span className="rw-panah">→</span>{" "}
            <span className="rw-baru">
              {k === "deleted_at" && !item.data_baru[k]
                ? "Dipulihkan"
                : formatNilai(k, item.data_baru[k])}
            </span>
          </li>
        ))}
      </ul>
    );
  }

  const data = item.aksi === "tambah" ? item.data_baru : item.data_lama;
  const kolom = Object.keys(data || {})
    .filter(
      (k) =>
        !KOLOM_DISEMBUNYIKAN.includes(k) &&
        k !== "deleted_at" &&
        data[k] !== null &&
        data[k] !== ""
    )
    .slice(0, 4);

  if (kolom.length === 0) return <span className="rw-redup">-</span>;

  return (
    <ul className="rw-rincian">
      {kolom.map((k) => (
        <li key={k}>
          <span className="rw-kolom">{rapikanNamaKolom(k)}:</span>{" "}
          {formatNilai(k, data[k])}
        </li>
      ))}
    </ul>
  );
}

export default function RiwayatPage() {
  const [daftar, setDaftar] = useState([]);
  const [pengguna, setPengguna] = useState([]);
  const [filterNama, setFilterNama] = useState("");
  const [filterBagian, setFilterBagian] = useState("");
  const [memuat, setMemuat] = useState(true);
  const [masihAda, setMasihAda] = useState(false);
  const [error, setError] = useState("");

  const ambil = useCallback(
    async (mulai) => {
      const supabase = getSupabase();
      if (!supabase) return;

      setMemuat(true);
      setError("");

      let q = supabase
        .from("riwayat_perubahan")
        .select("*")
        .order("waktu", { ascending: false })
        .range(mulai, mulai + PER_HALAMAN - 1);

      if (filterNama) q = q.eq("nama_pengguna", filterNama);
      if (filterBagian) q = q.eq("tabel", filterBagian);

      const { data, error: gagal } = await q;

      if (gagal) {
        console.error("Gagal memuat riwayat:", gagal);
        setError(
          "Riwayat gagal dimuat. Pastikan langkah SQL Riwayat Perubahan di Supabase sudah dijalankan."
        );
        setMemuat(false);
        return;
      }

      setDaftar((lama) => (mulai === 0 ? data || [] : [...lama, ...(data || [])]));
      setMasihAda((data || []).length === PER_HALAMAN);
      setMemuat(false);
    },
    [filterNama, filterBagian]
  );

  useEffect(() => {
    ambil(0);
  }, [ambil]);

  useEffect(() => {
    async function muatPengguna() {
      const supabase = getSupabase();
      if (!supabase) return;
      const { data } = await supabase
        .from("admin")
        .select("nama")
        .order("nama", { ascending: true });
      setPengguna((data || []).map((a) => a.nama).filter(Boolean));
    }
    muatPengguna();
  }, []);

  return (
    <div className="rw">
      <div className="admin-page-header">
        <div>
          <h1>Riwayat Perubahan</h1>
          <p>Siapa mengubah data produk, kapan, dan apa yang diubah.</p>
        </div>
      </div>

      <div className="admin-card">
        <div className="rw-filter">
          <select value={filterNama} onChange={(e) => setFilterNama(e.target.value)}>
            <option value="">Semua pengguna</option>
            {pengguna.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
            <option value="Sistem">Sistem (otomatis)</option>
          </select>

          <select
            value={filterBagian}
            onChange={(e) => setFilterBagian(e.target.value)}
          >
            <option value="">Semua bagian</option>
            {Object.entries(NAMA_BAGIAN).map(([kode, nama]) => (
              <option key={kode} value={kode}>
                {nama}
              </option>
            ))}
          </select>
        </div>

        {error && <div className="rw-error">{error}</div>}

        {!error && !memuat && daftar.length === 0 && (
          <p className="rw-kosong">
            Belum ada perubahan yang tercatat. Catatan dimulai sejak fitur ini
            dipasang.
          </p>
        )}

        {daftar.length > 0 && (
          <div className="rw-tabel-wrap">
            <table>
              <thead>
                <tr>
                  <th>Waktu</th>
                  <th>Pengguna</th>
                  <th>Aksi</th>
                  <th>Bagian</th>
                  <th>Produk / data</th>
                  <th>Perubahan</th>
                </tr>
              </thead>
              <tbody>
                {daftar.map((item) => (
                  <tr key={item.id}>
                    <td className="rw-waktu">
                      {new Date(item.waktu).toLocaleString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="rw-nama">{item.nama_pengguna}</td>
                    <td>
                      <span className={`rw-aksi ${kelasAksi(item)}`}>
                        {judulAksi(item)}
                      </span>
                    </td>
                    <td>{NAMA_BAGIAN[item.tabel] || item.tabel}</td>
                    <td className="rw-ket">{item.keterangan || "-"}</td>
                    <td>
                      <RincianPerubahan item={item} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {memuat && <p className="rw-kosong">Memuat...</p>}

        {!memuat && masihAda && (
          <div className="rw-lagi">
            <button
              type="button"
              className="admin-secondary-button"
              onClick={() => ambil(daftar.length)}
            >
              Muat lebih banyak
            </button>
          </div>
        )}
      </div>

      <style>{`
        .rw-filter {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 18px;
        }

        .rw-filter select {
          min-width: 200px;
          padding: 10px 12px;
        }

        .rw-error {
          padding: 12px 16px;
          border-radius: 12px;
          background: #fbebe7;
          border: 1px solid #efc7bc;
          color: #8a3b2b;
          font-size: 14px;
        }

        .rw-kosong {
          margin: 8px 0;
          color: #7d6957;
          font-size: 14.5px;
        }

        .rw-tabel-wrap {
          overflow-x: auto;
        }

        .rw-tabel-wrap th,
        .rw-tabel-wrap td {
          padding: 12px 14px;
          border-bottom: 1px solid #f0e7db;
          vertical-align: top !important;
        }

        .rw-tabel-wrap tbody tr:last-child td {
          border-bottom: none;
        }

        .rw-waktu {
          white-space: nowrap;
          color: #7d6957;
          font-size: 13.5px !important;
        }

        .rw-nama {
          font-weight: 600;
          white-space: nowrap;
        }

        .rw-ket {
          font-weight: 600;
          min-width: 140px;
        }

        .rw-aksi {
          display: inline-block;
          padding: 3px 10px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
          white-space: nowrap;
        }

        .rw-aksi.tambah {
          background: #eaf7ed;
          color: #347045;
        }

        .rw-aksi.ubah {
          background: #eaf2ff;
          color: #315d91;
        }

        .rw-aksi.hapus {
          background: #fbecec;
          color: #943f3f;
        }

        .rw-rincian {
          margin: 0;
          padding: 0;
          list-style: none;
          display: grid;
          gap: 4px;
          font-size: 13.5px;
          min-width: 220px;
        }

        .rw-kolom {
          color: #7d6957;
        }

        .rw-lama {
          color: #943f3f;
          text-decoration: line-through;
          text-decoration-color: rgba(148, 63, 63, 0.4);
        }

        .rw-panah {
          color: #b9a690;
        }

        .rw-baru {
          color: #2f6b3f;
          font-weight: 600;
        }

        .rw-redup {
          color: #b9a690;
        }

        .rw-lagi {
          display: flex;
          justify-content: center;
          margin-top: 18px;
        }
      `}</style>
    </div>
  );
}
