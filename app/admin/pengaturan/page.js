"use client";

// Lokasi file: app/admin/pengaturan/page.js
// Pengaturan > Kelola Akun (khusus Admin Utama):
// melihat semua akun, mengubah nama, dan mengaktifkan/menonaktifkan akun.
// Membuat akun baru & reset password orang lain tetap lewat Supabase.

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { getSupabase } from "../../../lib/supabase";

const NAMA_ROLE = {
  admin_utama: "Admin Utama",
  karyawan_produk: "Karyawan Produk",
};

const DOMAIN_AKUN = "@sinarkasih.co.id";

function tampilanUsername(email) {
  if (!email) return "-";
  return email.endsWith(DOMAIN_AKUN)
    ? email.slice(0, -DOMAIN_AKUN.length)
    : email;
}

export default function PengaturanPage() {
  const [daftar, setDaftar] = useState([]);
  const [saya, setSaya] = useState(null);
  const [memuat, setMemuat] = useState(true);
  const [pesan, setPesan] = useState(null);
  const [editId, setEditId] = useState(null);
  const [namaEdit, setNamaEdit] = useState("");
  const [prosesId, setProsesId] = useState(null);

  const muat = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase) return;

    const {
      data: { session },
    } = await supabase.auth.getSession();
    setSaya(session?.user?.id || null);

    const { data, error } = await supabase
      .from("admin")
      .select("id, auth_user_id, nama, email, role, aktif, created_at")
      .order("role", { ascending: true })
      .order("nama", { ascending: true });

    if (error) {
      console.error("Gagal memuat akun:", error);
      setPesan({ jenis: "gagal", teks: "Daftar akun gagal dimuat." });
    }

    setDaftar(data || []);
    setMemuat(false);
  }, []);

  useEffect(() => {
    muat();
  }, [muat]);

  function mulaiEdit(akun) {
    setPesan(null);
    setEditId(akun.id);
    setNamaEdit(akun.nama || "");
  }

  async function simpanNama(akun) {
    const nama = namaEdit.trim();
    if (!nama) {
      setPesan({ jenis: "gagal", teks: "Nama tidak boleh kosong." });
      return;
    }

    setProsesId(akun.id);
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("admin")
      .update({ nama })
      .eq("id", akun.id)
      .select("id");

    setProsesId(null);

    if (error || !data || data.length === 0) {
      console.error("Gagal mengubah nama:", error);
      setPesan({ jenis: "gagal", teks: "Nama gagal disimpan." });
      return;
    }

    setEditId(null);
    setPesan({ jenis: "sukses", teks: `Nama berhasil diubah menjadi ${nama}.` });
    muat();
  }

  async function ubahStatus(akun) {
    const aktifkan = !akun.aktif;
    const nama = akun.nama || tampilanUsername(akun.email);

    const yakin = window.confirm(
      aktifkan
        ? `Aktifkan kembali akun ${nama}? Akun ini akan bisa login lagi.`
        : `Nonaktifkan akun ${nama}? Akun ini tidak akan bisa membuka panel admin lagi.`
    );
    if (!yakin) return;

    setPesan(null);
    setProsesId(akun.id);
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("admin")
      .update({ aktif: aktifkan })
      .eq("id", akun.id)
      .select("id");

    setProsesId(null);

    if (error || !data || data.length === 0) {
      console.error("Gagal mengubah status:", error);
      setPesan({ jenis: "gagal", teks: "Status akun gagal diubah." });
      return;
    }

    setPesan({
      jenis: "sukses",
      teks: aktifkan
        ? `Akun ${nama} sudah aktif kembali.`
        : `Akun ${nama} sudah dinonaktifkan.`,
    });
    muat();
  }

  return (
    <div className="pg">
      <div className="admin-page-header">
        <div>
          <h1>Pengaturan</h1>
          <p>Kelola akun admin dan karyawan yang bisa membuka panel admin.</p>
        </div>

        <Link href="/admin/akun" className="admin-secondary-button">
          Ganti password saya
        </Link>
      </div>

      {pesan && (
        <div
          className={`pg-pesan ${pesan.jenis}`}
          role={pesan.jenis === "gagal" ? "alert" : "status"}
        >
          {pesan.teks}
        </div>
      )}

      <div className="admin-card pg-kartu">
        <div className="admin-section-header">
          <h2>Akun</h2>
          <p>{memuat ? "Memuat..." : `${daftar.length} akun terdaftar.`}</p>
        </div>

        <div className="pg-tabel-wrap">
          <table>
            <thead>
              <tr>
                <th>Nama</th>
                <th>Username / email</th>
                <th>Jabatan</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {daftar.map((akun) => {
                const akunSaya = akun.auth_user_id === saya;
                const sedangEdit = editId === akun.id;
                const sibuk = prosesId === akun.id;

                return (
                  <tr key={akun.id}>
                    <td>
                      {sedangEdit ? (
                        <input
                          type="text"
                          value={namaEdit}
                          onChange={(e) => setNamaEdit(e.target.value)}
                          className="pg-input"
                          autoFocus
                        />
                      ) : (
                        <span className="pg-nama">
                          {akun.nama || "-"}
                          {akunSaya && <em className="pg-anda">Anda</em>}
                        </span>
                      )}
                    </td>
                    <td>{tampilanUsername(akun.email)}</td>
                    <td>{NAMA_ROLE[akun.role] || akun.role}</td>
                    <td>
                      <span
                        className={`pg-status ${akun.aktif ? "aktif" : "nonaktif"}`}
                      >
                        {akun.aktif ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td>
                      <div className="pg-aksi">
                        {sedangEdit ? (
                          <>
                            <button
                              type="button"
                              className="pg-btn utama"
                              onClick={() => simpanNama(akun)}
                              disabled={sibuk}
                            >
                              {sibuk ? "Menyimpan..." : "Simpan"}
                            </button>
                            <button
                              type="button"
                              className="pg-btn"
                              onClick={() => setEditId(null)}
                              disabled={sibuk}
                            >
                              Batal
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              className="pg-btn"
                              onClick={() => mulaiEdit(akun)}
                              disabled={sibuk}
                            >
                              Ubah nama
                            </button>
                            {!akunSaya && (
                              <button
                                type="button"
                                className={`pg-btn ${
                                  akun.aktif ? "bahaya" : "utama"
                                }`}
                                onClick={() => ubahStatus(akun)}
                                disabled={sibuk}
                              >
                                {akun.aktif ? "Nonaktifkan" : "Aktifkan"}
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="admin-card pg-info">
        <h2>Menambah akun atau reset password karyawan</h2>
        <p>Demi keamanan, dua hal ini dilakukan langsung di Supabase:</p>
        <ol>
          <li>
            <strong>Akun baru:</strong> Supabase → Authentication → Users →
            Add user. Isi email seperti <code>nama{DOMAIN_AKUN}</code>, centang{" "}
            <em>Auto Confirm User</em>, lalu daftarkan di tabel admin.
          </li>
          <li>
            <strong>Reset password karyawan:</strong> Supabase → Authentication
            → Users → klik akunnya → ganti password.
          </li>
        </ol>
        <p className="pg-kecil">
          Jika karyawan berhenti bekerja, cukup klik <strong>Nonaktifkan</strong>{" "}
          di atas. Aksesnya langsung tertutup.
        </p>
      </div>

      <style>{`
        .pg-pesan {
          margin-bottom: 20px;
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 14px;
        }

        .pg-pesan.gagal {
          background: #fbebe7;
          border: 1px solid #efc7bc;
          color: #8a3b2b;
        }

        .pg-pesan.sukses {
          background: #eaf7ed;
          border: 1px solid #c4e5cc;
          color: #2f6b3f;
        }

        .pg-kartu {
          margin-bottom: 20px;
        }

        .pg-tabel-wrap {
          overflow-x: auto;
        }

        .pg-tabel-wrap th,
        .pg-tabel-wrap td {
          padding: 12px 14px;
          border-bottom: 1px solid #f0e7db;
        }

        .pg-tabel-wrap tbody tr:last-child td {
          border-bottom: none;
        }

        .pg-nama {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
        }

        .pg-anda {
          font-style: normal;
          font-size: 11.5px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 999px;
          background: #f3eadf;
          color: #6f4c36;
        }

        .pg-input {
          width: 100%;
          min-width: 160px;
          padding: 8px 12px;
        }

        .pg-status {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
        }

        .pg-status.aktif {
          background: #eaf7ed;
          color: #347045;
        }

        .pg-status.nonaktif {
          background: #f0ece8;
          color: #66584e;
        }

        .pg-aksi {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .pg-btn {
          min-height: 34px;
          padding: 0 12px;
          border: 1px solid #e0cfbb;
          border-radius: 8px;
          background: #ffffff;
          color: #4b3326;
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
        }

        .pg-btn:hover {
          background: #f8f1e8;
        }

        .pg-btn.utama {
          background: #6f4c36;
          border-color: #6f4c36;
          color: #ffffff;
        }

        .pg-btn.bahaya {
          border-color: #efc7bc;
          background: #fbebe7;
          color: #8a3b2b;
        }

        .pg-btn:disabled {
          opacity: 0.6;
          cursor: wait;
        }

        .pg-info p {
          margin: 6px 0 10px;
          font-size: 14.5px;
          color: #5c4a3d;
        }

        .pg-info ol {
          margin: 0;
          padding-left: 20px;
          font-size: 14.5px;
          line-height: 1.7;
          color: #3f2f24;
        }

        .pg-info code {
          padding: 1px 6px;
          border-radius: 6px;
          background: #f3eadf;
          font-size: 13.5px;
        }

        .pg-kecil {
          margin-top: 14px !important;
          font-size: 13.5px !important;
          color: #7d6957 !important;
        }
      `}</style>
    </div>
  );
}
