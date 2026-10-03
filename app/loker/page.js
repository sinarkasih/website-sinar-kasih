// Lokasi file: app/loker/page.js
// Lowongan Kerja: judul & jejak seragam, kartu lowongan, tahapan seleksi
// dengan ikon garis (pengganti emoji), pengumuman, dan tombol lamaran.
// Format teks dari admin (*tebal*, _miring_, ~coret~) tetap didukung.

import { unstable_noStore as noStore } from "next/cache";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
import IkonSitus from "../IkonSitus";

const tahapSeleksi = [
  {
    key: "pendaftaran",
    nomor: "01",
    judul: "Pendaftaran",
    icon: "daftar",
  },
  {
    key: "seleksi_berkas",
    nomor: "02",
    judul: "Seleksi Berkas",
    icon: "berkas",
  },
  {
    key: "psikotest",
    nomor: "03",
    judul: "Psikotest",
    icon: "otak",
  },
  {
    key: "interview",
    nomor: "04",
    judul: "Interview",
    icon: "obrolan",
  },
  {
    key: "tes_kerja",
    nomor: "05",
    judul: "Tes Kerja",
    icon: "alat",
  },
  {
    key: "pengumuman",
    nomor: "06",
    judul: "Pengumuman",
    icon: "toa",
  },
];

const statusInfo = {
  dibuka: {
    label: "Pendaftaran Dibuka",
    className: "statusDibuka",
  },
  proses_seleksi: {
    label: "Proses Seleksi",
    className: "statusProses",
  },
  ditutup: {
    label: "Lowongan Ditutup",
    className: "statusDitutup",
  },
  terisi: {
    label: "Lowongan Telah Terisi",
    className: "statusTerisi",
  },
  draft: {
    label: "Belum Dipublikasikan",
    className: "statusDraft",
  },
};

function formatTanggal(tanggal) {
  if (!tanggal) return null;

  const date = new Date(`${tanggal}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return tanggal;
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function getTahapIndex(tahap) {
  const index = tahapSeleksi.findIndex(
    (item) => item.key === tahap
  );

  return index === -1 ? 0 : index;
}

function getStatusInfo(status) {
  return statusInfo[status] || statusInfo.draft;
}

function isVideoUrl(url) {
  if (!url) return false;

  return /\.(mp4|webm)(\?.*)?$/i.test(String(url));
}

/*
 * ============================================================
 * FORMAT TULISAN
 * ============================================================
 *
 * Format yang didukung:
 *
 * *tebal*
 * **tebal**
 *
 * _miring_
 * __miring__
 *
 * ~coret~
 * ~~coret~~
 *
 * `teks khusus`
 *
 * Format dapat mencakup beberapa baris sekaligus.
 *
 * Contoh:
 *
 * *Benefit:
 * Gaji UMP
 * Makan Siang
 * BPJS TK*
 *
 * Baris baru tetap dipertahankan.
 *
 * Isi database tetap berupa teks biasa.
 * Tidak menggunakan dangerouslySetInnerHTML.
 */

function renderTextWithLineBreaks(text, keyPrefix) {
  const parts = String(text).split(/\r?\n/);

  return parts.map((part, index) => (
    <span key={`${keyPrefix}-line-${index}`}>
      {part}

      {index < parts.length - 1 && <br />}
    </span>
  ));
}

function renderFormattedText(text, keyPrefix) {
  if (!text) return null;

  const value = String(text);

  /*
   * Urutan regex sengaja dimulai dari format dua karakter
   * sebelum format satu karakter agar:
   *
   * **tebal** tidak dibaca sebagai *tebal*
   * __miring__ tidak dibaca sebagai _miring_
   * ~~coret~~ tidak dibaca sebagai ~coret~
   */
  const pattern =
    /(\*\*[\s\S]+?\*\*|\*[\s\S]+?\*|__[\s\S]+?__|_[\s\S]+?_|~~[\s\S]+?~~|~[\s\S]+?~|`[\s\S]+?`)/g;

  const parts = value.split(pattern);

  return parts.map((part, index) => {
    if (!part) return null;

    /*
     * TEBAL
     * **teks**
     */
    if (
      part.startsWith("**") &&
      part.endsWith("**") &&
      part.length > 4
    ) {
      return (
        <strong key={`${keyPrefix}-bold-double-${index}`}>
          {renderTextWithLineBreaks(
            part.slice(2, -2),
            `${keyPrefix}-bold-double-${index}`
          )}
        </strong>
      );
    }

    /*
     * TEBAL
     * *teks*
     */
    if (
      part.startsWith("*") &&
      part.endsWith("*") &&
      part.length > 2
    ) {
      return (
        <strong key={`${keyPrefix}-bold-${index}`}>
          {renderTextWithLineBreaks(
            part.slice(1, -1),
            `${keyPrefix}-bold-${index}`
          )}
        </strong>
      );
    }

    /*
     * MIRING
     * __teks__
     */
    if (
      part.startsWith("__") &&
      part.endsWith("__") &&
      part.length > 4
    ) {
      return (
        <em key={`${keyPrefix}-italic-double-${index}`}>
          {renderTextWithLineBreaks(
            part.slice(2, -2),
            `${keyPrefix}-italic-double-${index}`
          )}
        </em>
      );
    }

    /*
     * MIRING
     * _teks_
     */
    if (
      part.startsWith("_") &&
      part.endsWith("_") &&
      part.length > 2
    ) {
      return (
        <em key={`${keyPrefix}-italic-${index}`}>
          {renderTextWithLineBreaks(
            part.slice(1, -1),
            `${keyPrefix}-italic-${index}`
          )}
        </em>
      );
    }

    /*
     * CORET
     * ~~teks~~
     */
    if (
      part.startsWith("~~") &&
      part.endsWith("~~") &&
      part.length > 4
    ) {
      return (
        <del key={`${keyPrefix}-strike-double-${index}`}>
          {renderTextWithLineBreaks(
            part.slice(2, -2),
            `${keyPrefix}-strike-double-${index}`
          )}
        </del>
      );
    }

    /*
     * CORET
     * ~teks~
     */
    if (
      part.startsWith("~") &&
      part.endsWith("~") &&
      part.length > 2
    ) {
      return (
        <del key={`${keyPrefix}-strike-${index}`}>
          {renderTextWithLineBreaks(
            part.slice(1, -1),
            `${keyPrefix}-strike-${index}`
          )}
        </del>
      );
    }

    /*
     * TEKS KHUSUS
     * `teks`
     */
    if (
      part.startsWith("`") &&
      part.endsWith("`") &&
      part.length > 2
    ) {
      return (
        <code
          key={`${keyPrefix}-code-${index}`}
          className="inlineCode"
        >
          {renderTextWithLineBreaks(
            part.slice(1, -1),
            `${keyPrefix}-code-${index}`
          )}
        </code>
      );
    }

    /*
     * Teks biasa.
     * Baris baru tetap dipertahankan.
     */
    return (
      <span key={`${keyPrefix}-text-${index}`}>
        {renderTextWithLineBreaks(
          part,
          `${keyPrefix}-text-${index}`
        )}
      </span>
    );
  });
}

function formatRichText(text, keyPrefix = "rich-text") {
  if (!text) return null;

  return renderFormattedText(text, keyPrefix);
}

function JobBriefIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="34"
      height="34"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5.5A1.5 1.5 0 0 1 9.5 4h5A1.5 1.5 0 0 1 16 5.5V7" />
      <path d="M3 12h18" />
      <path d="M10 12v2h4v-2" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M16 2v4" />
      <path d="M8 2v4" />
      <path d="M3 9h18" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="19"
      height="19"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

export const metadata = {
  title: "Lowongan Kerja | Sinar Kasih",
  description: "Lowongan kerja terbaru di Toko Listrik Sinar Kasih Ambon beserta tahapan seleksinya.",
};

export default async function LokerPage() {
  noStore();

  const supabase = getSupabase();

  const { data: lowongan } = supabase
    ? await supabase
        .from("lowongan_kerja")
        .select(
          "id, posisi, gambar_url, deskripsi, persyaratan, lokasi, google_form_url, status, tahap_seleksi, tanggal_buka, tanggal_tutup, pengumuman, aktif, urutan"
        )
        .eq("aktif", true)
        .order("urutan", { ascending: true })
        .order("id", { ascending: false })
    : { data: [] };

  const daftarLowongan = lowongan || [];
  const jumlahDibuka = daftarLowongan.filter((j) => j.status === "dibuka").length;

  return (
    <section className="section halaman-atas">
      <div className="wrap wrap-loker">
        <nav className="jejak" aria-label="Posisi halaman">
          <Link href="/">Beranda</Link>
          <span>›</span>
          <Link href="/info">Informasi &amp; Layanan</Link>
          <span>›</span>
          <strong>Lowongan Kerja</strong>
        </nav>

        <div className="kepala-halaman">
          <h1>Lowongan Kerja</h1>
          <p>
            Bergabung bersama Toko Listrik Sinar Kasih. Lihat posisi yang tersedia dan ikuti proses seleksi secara
            resmi melalui website kami.
          </p>
        </div>

        <div className="lk-aman">
          <span className="lk-aman-ikon"><IkonSitus nama="perisai" ukuran={22} /></span>
          <div>
            <strong>Rekrutmen tanpa biaya</strong>
            <p>
              Toko Listrik Sinar Kasih tidak memungut biaya dalam proses rekrutmen. Pastikan informasi lowongan dan
              formulir yang Anda gunakan berasal dari website resmi Sinar Kasih.
            </p>
          </div>
        </div>

        {daftarLowongan.length === 0 ? (
          <div className="kosong-cantik">
            <span className="lk-kosong-ikon"><JobBriefIcon /></span>
            <h2>Belum ada lowongan</h2>
            <p>
              Saat ini belum ada lowongan kerja yang sedang dibuka. Silakan kunjungi kembali halaman ini untuk melihat
              kesempatan kerja terbaru dari Toko Listrik Sinar Kasih.
            </p>
          </div>
        ) : (
          <>
            {jumlahDibuka > 0 && (
              <p className="lk-jumlah">{jumlahDibuka} posisi sedang membuka pendaftaran</p>
            )}

            <div className="lk-daftar">
              {daftarLowongan.map((job) => {
                const currentIndex = getTahapIndex(job.tahap_seleksi);
                const currentStatus = getStatusInfo(job.status);
                const tanggalBuka = formatTanggal(job.tanggal_buka);
                const tanggalTutup = formatTanggal(job.tanggal_tutup);
                const mediaIsVideo = isVideoUrl(job.gambar_url);

                return (
                  <article key={job.id} className="lk-kartu">
                    <div className={`lk-media ${job.gambar_url ? "" : "kosong"}`}>
                      {job.gambar_url ? (
                        mediaIsVideo ? (
                          <video
                            src={job.gambar_url}
                            autoPlay
                            muted
                            loop
                            playsInline
                            controls
                            preload="metadata"
                          />
                        ) : (
                          <a href={job.gambar_url} target="_blank" rel="noopener noreferrer" title="Lihat poster ukuran penuh">
                            <img src={job.gambar_url} alt={`Lowongan ${job.posisi}`} />
                          </a>
                        )
                      ) : (
                        <span className="lk-media-kosong">
                          <JobBriefIcon />
                          Lowongan Kerja
                        </span>
                      )}
                    </div>

                    <div className="lk-isi">
                      <span className={`lk-status ${currentStatus.className}`}>{currentStatus.label}</span>

                      <h2>{job.posisi}</h2>

                      {(job.lokasi || tanggalBuka || tanggalTutup) && (
                        <div className="lk-meta">
                          {job.lokasi && (
                            <span>
                              <LocationIcon />
                              {job.lokasi}
                            </span>
                          )}
                          {(tanggalBuka || tanggalTutup) && (
                            <span>
                              <CalendarIcon />
                              {tanggalBuka && `Buka ${tanggalBuka}`}
                              {tanggalBuka && tanggalTutup && " • "}
                              {tanggalTutup && `Tutup ${tanggalTutup}`}
                            </span>
                          )}
                        </div>
                      )}

                      {job.deskripsi && (
                        <div className="lk-bagian">
                          <h3>Tentang Posisi</h3>
                          <div className="lk-teks">{formatRichText(job.deskripsi, `description-${job.id}`)}</div>
                        </div>
                      )}

                      {job.persyaratan && (
                        <div className="lk-bagian">
                          <h3>Persyaratan</h3>
                          <div className="lk-teks">{formatRichText(job.persyaratan, `requirements-${job.id}`)}</div>
                        </div>
                      )}

                      <div className="lk-bagian">
                        <h3>Proses Seleksi</h3>
                        <ol className="lk-tahap">
                          {tahapSeleksi.map((tahap, index) => {
                            const selesai = index < currentIndex;
                            const berjalan = index === currentIndex;
                            return (
                              <li
                                key={tahap.key}
                                className={`${selesai ? "selesai" : ""} ${berjalan ? "berjalan" : ""}`}
                                aria-current={berjalan ? "step" : undefined}
                              >
                                <span className="lk-tahap-titik">
                                  {selesai ? <CheckIcon /> : <IkonSitus nama={tahap.icon} ukuran={18} />}
                                </span>
                                <span className="lk-tahap-teks">
                                  <strong>{tahap.judul}</strong>
                                  {berjalan && <span className="lk-tahap-label">Sedang berlangsung</span>}
                                  {selesai && <span className="lk-tahap-label selesai">Selesai</span>}
                                </span>
                              </li>
                            );
                          })}
                        </ol>
                      </div>

                      {job.pengumuman && (
                        <div className="lk-umum">
                          <div className="lk-umum-judul">
                            <IkonSitus nama="toa" ukuran={18} />
                            <strong>Pengumuman</strong>
                          </div>
                          <div className="lk-teks">{formatRichText(job.pengumuman, `announcement-${job.id}`)}</div>
                        </div>
                      )}

                      <div className="lk-aksi">
                        {job.status === "dibuka" && job.google_form_url ? (
                          <a href={job.google_form_url} target="_blank" rel="noopener noreferrer" className="btn lk-lamar">
                            Isi Formulir Lamaran
                            <ArrowIcon />
                          </a>
                        ) : (
                          <div className="lk-tutup">
                            <LockIcon />
                            <span>
                              {job.status === "dibuka"
                                ? "Formulir lamaran belum tersedia."
                                : "Pendaftaran untuk posisi ini sudah tidak dibuka."}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </div>

      <style>{`
        .wrap-loker { max-width: 980px; }

        .lk-aman { display: flex; gap: 14px; align-items: flex-start; margin-bottom: 24px; padding: 16px 18px; border-radius: 14px; background: #fcf6ee; border: 1px solid #f0e2cf; }
        .lk-aman-ikon { width: 44px; height: 44px; flex-shrink: 0; display: grid; place-items: center; border-radius: 12px; background: #eaf7ed; color: #2f7a46; }
        .lk-aman strong { color: #3f2f24; font-size: 15px; }
        .lk-aman p { margin: 4px 0 0; font-size: 14px; line-height: 1.6; color: #7a6555; }

        .lk-kosong-ikon { display: inline-grid; place-items: center; width: 64px; height: 64px; margin-bottom: 10px; border-radius: 16px; background: #f3e8da; color: #6f4c36; }
        .lk-jumlah { margin: 0 0 14px; font-size: 14.5px; font-weight: 700; color: #6f4c36; }

        .lk-daftar { display: grid; gap: 20px; }
        .lk-kartu { display: grid; grid-template-columns: 380px minmax(0, 1fr); gap: 0; align-items: start; overflow: hidden; background: #fff; border: 1px solid #eadfce; border-radius: 18px; }
        /* Poster lowongan selalu rasio 4:5, tampil utuh tanpa terpotong */
        .lk-media { align-self: start; aspect-ratio: 4 / 5; margin: 16px 0 16px 16px; border-radius: 12px; overflow: hidden; background: #f7f1e8; }
        .lk-media a { display: block; width: 100%; height: 100%; }
        .lk-media img, .lk-media video { width: 100%; height: 100%; display: block; object-fit: contain; }
        .lk-media-kosong { height: 100%; display: grid; place-content: center; justify-items: center; gap: 8px; color: #b9a48e; font-size: 14px; font-weight: 600; }
        .lk-isi { padding: 22px 24px 24px; display: grid; gap: 16px; align-content: start; min-width: 0; }
        .lk-isi h2 { margin: -6px 0 0; font-size: 23px; line-height: 1.3; color: #3f2f24; }

        .lk-status { justify-self: start; padding: 4px 12px; border-radius: 999px; font-size: 12.5px; font-weight: 800; }
        .lk-status.statusDibuka { background: #eaf7ed; color: #2f7a46; }
        .lk-status.statusProses { background: #eaf2ff; color: #315d91; }
        .lk-status.statusDitutup, .lk-status.statusTerisi { background: #f3eee8; color: #7a6555; }
        .lk-status.statusDraft { background: #fff3d9; color: #8a641d; }

        .lk-meta { display: flex; flex-wrap: wrap; gap: 8px 18px; margin-top: -8px; font-size: 14px; color: #7a6555; }
        .lk-meta span { display: inline-flex; align-items: center; gap: 6px; }
        .lk-meta svg { width: 17px; height: 17px; color: #9a8571; }

        .lk-bagian h3 { margin: 0 0 8px; font-size: 15px; color: #3f2f24; }
        .lk-teks { font-size: 15px; line-height: 1.7; color: #554840; overflow-wrap: anywhere; }
        .lk-teks strong { color: #3f2f24; }
        .lk-teks .inlineCode { padding: 1px 6px; border-radius: 6px; background: #f6efe6; font-size: .92em; }

        .lk-tahap { list-style: none; margin: 4px 0 0; padding: 0; display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 6px; }
        .lk-tahap li { position: relative; display: grid; justify-items: center; gap: 6px; text-align: center; }
        .lk-tahap li:not(:last-child)::after { content: ""; position: absolute; top: 18px; left: calc(50% + 22px); right: calc(-50% + 22px); height: 2px; background: #eadfce; }
        .lk-tahap li.selesai:not(:last-child)::after { background: #8cc49d; }
        .lk-tahap-titik { width: 38px; height: 38px; display: grid; place-items: center; border-radius: 50%; border: 2px solid #eadfce; background: #fff; color: #b9a48e; }
        .lk-tahap-titik svg { width: 18px; height: 18px; }
        .lk-tahap li.selesai .lk-tahap-titik { border-color: #2f7a46; background: #2f7a46; color: #fff; }
        .lk-tahap li.berjalan .lk-tahap-titik { border-color: #6f4c36; background: #6f4c36; color: #fff; box-shadow: 0 0 0 4px rgba(111, 76, 54, .15); }
        .lk-tahap-teks { display: grid; gap: 2px; }
        .lk-tahap-teks strong { font-size: 13px; line-height: 1.3; color: #3f2f24; }
        .lk-tahap li:not(.selesai):not(.berjalan) .lk-tahap-teks strong { color: #9a8571; font-weight: 600; }
        .lk-tahap-label { font-size: 11.5px; font-weight: 700; color: #6f4c36; }
        .lk-tahap-label.selesai { color: #2f7a46; }

        .lk-umum { padding: 14px 16px; border-radius: 12px; background: #fff8e8; border: 1px solid #f1d9a8; }
        .lk-umum-judul { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; color: #8a641d; }
        .lk-umum-judul strong { color: #6b4f1d; }

        .lk-aksi { padding-top: 4px; }
        .lk-lamar { gap: 8px; }
        .lk-lamar svg { width: 18px; height: 18px; }
        .lk-tutup { display: inline-flex; align-items: center; gap: 8px; padding: 12px 14px; border-radius: 12px; background: #f6f1eb; color: #7a6555; font-size: 14px; font-weight: 600; }

        @media (max-width: 860px) {
          .lk-kartu { grid-template-columns: minmax(0, 1fr); }
          .lk-media { margin: 12px 12px 0; }
          .lk-media.kosong { display: none; }
        }
        @media (max-width: 640px) {
          .lk-isi { padding: 18px; }
          .lk-tahap { grid-template-columns: minmax(0, 1fr); gap: 0; }
          .lk-tahap li { grid-template-columns: 38px minmax(0, 1fr); justify-items: start; align-items: center; gap: 12px; text-align: left; padding-bottom: 14px; }
          .lk-tahap li:not(:last-child)::after { top: 40px; bottom: 2px; left: 18px; right: auto; width: 2px; height: auto; }
          .lk-tahap-teks { grid-auto-flow: column; justify-content: start; align-items: center; gap: 8px; }
          .lk-lamar { width: 100%; }
        }
      `}</style>
    </section>
  );
}
