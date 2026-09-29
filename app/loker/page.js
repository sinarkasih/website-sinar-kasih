import { getSupabase } from "@/lib/supabase";

const tahapSeleksi = [
  {
    key: "pendaftaran",
    nomor: "01",
    judul: "Pendaftaran",
    icon: "📝",
  },
  {
    key: "seleksi_berkas",
    nomor: "02",
    judul: "Seleksi Berkas",
    icon: "📄",
  },
  {
    key: "psikotest",
    nomor: "03",
    judul: "Psikotest",
    icon: "🧠",
  },
  {
    key: "interview",
    nomor: "04",
    judul: "Interview",
    icon: "💬",
  },
  {
    key: "tes_kerja",
    nomor: "05",
    judul: "Tes Kerja",
    icon: "🛠️",
  },
  {
    key: "pengumuman",
    nomor: "06",
    judul: "Pengumuman",
    icon: "📢",
  },
];

const statusInfo = {
  dibuka: {
    label: "PENDAFTARAN DIBUKA",
    className: "statusDibuka",
  },
  proses_seleksi: {
    label: "PROSES SELEKSI",
    className: "statusProses",
  },
  ditutup: {
    label: "LOWONGAN DITUTUP",
    className: "statusDitutup",
  },
  terisi: {
    label: "LOWONGAN TELAH TERISI",
    className: "statusTerisi",
  },
  draft: {
    label: "BELUM DIPUBLIKASIKAN",
    className: "statusDraft",
  },
};

function formatTanggal(tanggal) {
  if (!tanggal) return null;

  const date = new Date(
    `${tanggal}T00:00:00`
  );

  if (Number.isNaN(date.getTime())) {
    return tanggal;
  }

  return new Intl.DateTimeFormat(
    "id-ID",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  ).format(date);
}

function getTahapIndex(tahap) {
  const index =
    tahapSeleksi.findIndex(
      (item) =>
        item.key === tahap
    );

  return index === -1
    ? 0
    : index;
}

function getStatusInfo(status) {
  return (
    statusInfo[status] ||
    statusInfo.draft
  );
}

function isVideoUrl(url) {
  if (!url) return false;

  return /\.(mp4|webm)(\?.*)?$/i.test(
    String(url)
  );
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
      <rect
        x="3"
        y="7"
        width="18"
        height="13"
        rx="2"
      />

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
      <circle
        cx="12"
        cy="10"
        r="2.5"
      />
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
      <rect
        x="3"
        y="4"
        width="18"
        height="17"
        rx="2"
      />

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
      <rect
        x="5"
        y="10"
        width="14"
        height="10"
        rx="2"
      />

      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function NoFeeIcon() {
  return (
    <svg
      viewBox="0 0 32 32"
      width="28"
      height="28"
      fill="none"
    >
      <rect
        x="2.5"
        y="7"
        width="21"
        height="15"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.6"
      />

      <circle
        cx="13"
        cy="14.5"
        r="4"
        stroke="currentColor"
        strokeWidth="1.3"
      />

      <path
        d="M11.5 12.5v4M11.5 12.5h2M11.5 14.5h2"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />

      <circle
        cx="23.5"
        cy="22.5"
        r="6"
        fill="#fff0e3"
        stroke="currentColor"
        strokeWidth="1.5"
      />

      <path
        d="M21 20l5 5M26 20l-5 5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default async function LokerPage() {
  const supabase =
    getSupabase();

  const {
    data: lowongan,
  } = await supabase
    .from("lowongan_kerja")
    .select(
      "id, posisi, gambar_url, deskripsi, persyaratan, lokasi, google_form_url, status, tahap_seleksi, tanggal_buka, tanggal_tutup, pengumuman, aktif, urutan"
    )
    .eq("aktif", true)
    .order("urutan", {
      ascending: true,
    })
    .order("id", {
      ascending: false,
    });

  const daftarLowongan =
    lowongan || [];

  return (
    <>
      <main className="lokerPage">
        <div className="lokerContainer">
          <header className="lokerHeader">
            <div className="lokerHeaderIcon">
              <JobBriefIcon />
            </div>

            <h1>
              Lowongan Kerja
            </h1>

            <p>
              Bergabung bersama Toko
              Listrik Sinar Kasih. Lihat
              posisi yang tersedia dan
              ikuti proses seleksi secara
              resmi melalui website kami.
            </p>
          </header>

          {daftarLowongan.length ===
          0 ? (
            <section className="emptyBox">
              <div className="emptyIcon">
                <JobBriefIcon />
              </div>

              <h2>
                Belum Ada Lowongan
              </h2>

              <p>
                Saat ini belum ada
                lowongan kerja yang
                sedang dibuka. Silakan
                kunjungi kembali halaman
                ini untuk melihat
                kesempatan kerja terbaru
                dari Toko Listrik Sinar
                Kasih.
              </p>
            </section>
          ) : (
            <section className="jobList">
              {daftarLowongan.map(
                (job) => {
                  const currentIndex =
                    getTahapIndex(
                      job.tahap_seleksi
                    );

                  const currentStatus =
                    getStatusInfo(
                      job.status
                    );

                  const tanggalBuka =
                    formatTanggal(
                      job.tanggal_buka
                    );

                  const tanggalTutup =
                    formatTanggal(
                      job.tanggal_tutup
                    );

                  const video =
                    isVideoUrl(
                      job.gambar_url
                    );

                  return (
                    <article
                      key={job.id}
                      className="jobCard"
                    >
                      {job.gambar_url ? (
                        video ? (
                          <div className="jobVideoWrap">
                            <video
                              src={
                                job.gambar_url
                              }
                              className="jobVideo"
                              autoPlay
                              muted
                              loop
                              playsInline
                              controls
                              preload="metadata"
                            />
                          </div>
                        ) : (
                          <div className="jobImageWrap">
                            <img
                              src={
                                job.gambar_url
                              }
                              alt={`Lowongan ${job.posisi}`}
                              className="jobImage"
                            />
                          </div>
                        )
                      ) : (
                        <div className="jobImagePlaceholder">
                          <JobBriefIcon />

                          <span>
                            Lowongan Kerja
                          </span>
                        </div>
                      )}

                      <div className="jobBody">
                        <div className="jobTop">
                          <span
                            className={`jobStatus ${currentStatus.className}`}
                          >
                            {
                              currentStatus.label
                            }
                          </span>
                        </div>

                        <h2>
                          {job.posisi}
                        </h2>

                        <div className="jobMeta">
                          {job.lokasi && (
                            <div className="jobMetaItem">
                              <LocationIcon />

                              <span>
                                {
                                  job.lokasi
                                }
                              </span>
                            </div>
                          )}

                          {(tanggalBuka ||
                            tanggalTutup) && (
                            <div className="jobMetaItem">
                              <CalendarIcon />

                              <span>
                                {tanggalBuka &&
                                  `Buka ${tanggalBuka}`}

                                {tanggalBuka &&
                                  tanggalTutup &&
                                  " • "}

                                {tanggalTutup &&
                                  `Tutup ${tanggalTutup}`}
                              </span>
                            </div>
                          )}
                        </div>

                        {job.deskripsi && (
                          <div className="jobSection">
                            <h3>
                              Tentang Posisi
                            </h3>

                            <div className="jobText">
                              {
                                job.deskripsi
                              }
                            </div>
                          </div>
                        )}

                        {job.persyaratan && (
                          <div className="jobSection">
                            <h3>
                              Persyaratan
                            </h3>

                            <div className="jobText">
                              {
                                job.persyaratan
                              }
                            </div>
                          </div>
                        )}

                        <div className="processSection">
                          <h3>
                            Proses Seleksi
                          </h3>

                          <p className="processDescription">
                            Ikuti tahapan
                            seleksi berikut
                            sesuai informasi
                            dari tim Sinar
                            Kasih.
                          </p>

                          <div className="timeline">
                            {tahapSeleksi.map(
                              (
                                tahap,
                                index
                              ) => {
                                const selesai =
                                  index <
                                  currentIndex;

                                const sedangBerjalan =
                                  index ===
                                  currentIndex;

                                return (
                                  <div
                                    key={
                                      tahap.key
                                    }
                                    className={`timelineItem ${
                                      selesai
                                        ? "timelineDone"
                                        : ""
                                    } ${
                                      sedangBerjalan
                                        ? "timelineCurrent"
                                        : ""
                                    }`}
                                  >
                                    {index !==
                                      tahapSeleksi.length -
                                        1 && (
                                      <div className="timelineLine" />
                                    )}

                                    <div className="timelineDot">
                                      {selesai ? (
                                        <CheckIcon />
                                      ) : (
                                        tahap.nomor
                                      )}
                                    </div>

                                    <div className="timelineContent">
                                      <span className="timelineIcon">
                                        {
                                          tahap.icon
                                        }
                                      </span>

                                      <div>
                                        <strong>
                                          {
                                            tahap.judul
                                          }
                                        </strong>

                                        {sedangBerjalan && (
                                          <span className="currentLabel">
                                            Sedang Berlangsung
                                          </span>
                                        )}

                                        {selesai && (
                                          <span className="doneLabel">
                                            Selesai
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              }
                            )}
                          </div>
                        </div>

                        {job.pengumuman && (
                          <div className="announcementBox">
                            <div className="announcementTitle">
                              <span>
                                📢
                              </span>

                              <strong>
                                Pengumuman
                              </strong>
                            </div>

                            <p>
                              {
                                job.pengumuman
                              }
                            </p>
                          </div>
                        )}

                        <div className="jobAction">
                          {job.status ===
                            "dibuka" &&
                          job.google_form_url ? (
                            <a
                              href={
                                job.google_form_url
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="applyButton"
                            >
                              <span>
                                Isi Formulir
                                Lamaran
                              </span>

                              <ArrowIcon />
                            </a>
                          ) : job.status ===
                            "dibuka" ? (
                            <div className="waitingNotice">
                              <LockIcon />

                              <span>
                                Formulir lamaran
                                belum tersedia.
                              </span>
                            </div>
                          ) : (
                            <div className="closedNotice">
                              <LockIcon />

                              <span>
                                Pendaftaran untuk
                                posisi ini sudah
                                tidak dibuka.
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                }
              )}
            </section>
          )}

          <div className="bottomBack">
            <a
              href="/lainnya"
              className="bottomBackButton"
            >
              ← Kembali ke
              Informasi &amp; Layanan
            </a>
          </div>

          <section className="importantNotice">
            <div className="importantIcon">
              <NoFeeIcon />
            </div>

            <div>
              <h3>
                Informasi Penting
              </h3>

              <p>
                Toko Listrik Sinar Kasih
                tidak memungut biaya dalam
                proses rekrutmen. Pastikan
                informasi lowongan dan
                formulir yang Anda gunakan
                berasal dari website resmi
                Sinar Kasih.
              </p>
            </div>
          </section>
        </div>
      </main>

      <style>{`
        .lokerPage {
          min-height: calc(100vh - 64px);
          padding: 48px 20px 70px;
          background: #fffaf3;
        }

        .lokerContainer {
          width: 100%;
          max-width: 1080px;
          margin: 0 auto;
        }

        .lokerHeader {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          margin-bottom: 38px;
        }

        .lokerHeaderIcon {
          width: 72px;
          height: 72px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 17px;
          border-radius: 20px;
          background: #e5f0ff;
          color: #3575c5;
        }

        .lokerHeader h1 {
          margin: 0 0 10px;
          color: #4b2418;
          font-size: 34px;
          line-height: 1.2;
          font-weight: 700;
        }

        .lokerHeader p {
          max-width: 610px;
          margin: 0;
          color: #725f57;
          font-size: 15px;
          line-height: 1.7;
        }

        .emptyBox {
          max-width: 720px;
          margin: 0 auto;
          padding: 48px 30px;
          text-align: center;
          background: #ffffff;
          border: 1px solid #eadfd5;
          border-radius: 20px;
          box-shadow:
            0 8px 24px
            rgba(75, 36, 24, 0.06);
        }

        .emptyIcon {
          width: 68px;
          height: 68px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 18px;
          border-radius: 18px;
          background: #e5f0ff;
          color: #3575c5;
        }

        .emptyBox h2 {
          margin: 0 0 10px;
          color: #4b2418;
          font-size: 23px;
        }

        .emptyBox p {
          max-width: 550px;
          margin: 0 auto;
          color: #76645c;
          font-size: 14px;
          line-height: 1.7;
        }

        .jobList {
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        .jobCard {
          overflow: hidden;
          border: 1px solid #eadfd5;
          border-radius: 22px;
          background: #ffffff;
          box-shadow:
            0 10px 28px
            rgba(75, 36, 24, 0.07);
        }

        .jobImageWrap,
        .jobVideoWrap {
          width: 100%;
          max-height: 520px;
          overflow: hidden;
          background: #f5eee8;
        }

        .jobImage {
          display: block;
          width: 100%;
          max-height: 520px;
          object-fit: cover;
        }

        .jobVideo {
          display: block;
          width: 100%;
          max-height: 520px;
          object-fit: cover;
          background: #111;
        }

        .jobImagePlaceholder {
          min-height: 190px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background:
            linear-gradient(
              135deg,
              #f5eee8,
              #fff8f1
            );
          color: #8a6d5d;
        }

        .jobImagePlaceholder span {
          font-size: 13px;
          font-weight: 600;
        }

        .jobBody {
          padding: 30px;
        }

        .jobTop {
          margin-bottom: 12px;
        }

        .jobStatus {
          display: inline-flex;
          align-items: center;
          min-height: 30px;
          padding: 6px 12px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.3px;
        }

        .statusDibuka {
          background: #dcf8e7;
          color: #16834b;
        }

        .statusProses {
          background: #e5f0ff;
          color: #3575c5;
        }

        .statusDitutup {
          background: #f0e9e5;
          color: #80695d;
        }

        .statusTerisi {
          background: #eee5ff;
          color: #7650c9;
        }

        .statusDraft {
          background: #f1eeee;
          color: #7a6d68;
        }

        .jobBody > h2 {
          margin: 0 0 14px;
          color: #4b2418;
          font-size: 28px;
          line-height: 1.25;
        }

        .jobMeta {
          display: flex;
          flex-wrap: wrap;
          gap: 10px 22px;
          margin-bottom: 28px;
        }

        .jobMetaItem {
          display: flex;
          align-items: center;
          gap: 7px;
          color: #76645c;
          font-size: 13.5px;
        }

        .jobMetaItem svg {
          color: #9a6e58;
          flex-shrink: 0;
        }

        .jobSection {
          padding-top: 23px;
          margin-top: 23px;
          border-top:
            1px solid #eee5de;
        }

        .jobSection h3,
        .processSection h3 {
          margin: 0 0 9px;
          color: #4b2418;
          font-size: 18px;
        }

        .jobText {
          white-space: pre-line;
          color: #76645c;
          font-size: 14px;
          line-height: 1.75;
        }

        .processSection {
          padding-top: 25px;
          margin-top: 28px;
          border-top:
            1px solid #eee5de;
        }

        .processDescription {
          margin: 0;
          color: #8a766d;
          font-size: 13px;
          line-height: 1.6;
        }

        .timeline {
          margin-top: 24px;
        }

        .timelineItem {
          position: relative;
          display: flex;
          min-height: 72px;
        }

        .timelineLine {
          position: absolute;
          left: 17px;
          top: 36px;
          bottom: 0;
          width: 2px;
          background: #e6ddd7;
        }

        .timelineDone .timelineLine {
          background: #78bd91;
        }

        .timelineDot {
          position: relative;
          z-index: 2;
          width: 36px;
          height: 36px;
          min-width: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #e0d5ce;
          border-radius: 50%;
          background: #ffffff;
          color: #a18d82;
          font-size: 10px;
          font-weight: 800;
        }

        .timelineDone .timelineDot {
          border-color: #56a975;
          background: #56a975;
          color: #ffffff;
        }

        .timelineCurrent .timelineDot {
          border-color: #3575c5;
          background: #e5f0ff;
          color: #3575c5;
          box-shadow:
            0 0 0 5px #f2f7fd;
        }

        .timelineContent {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 0 26px 15px;
        }

        .timelineIcon {
          font-size: 22px;
        }

        .timelineContent strong {
          display: block;
          margin-bottom: 3px;
          color: #4b2418;
          font-size: 14px;
        }

        .currentLabel,
        .doneLabel {
          display: inline-block;
          font-size: 11px;
          font-weight: 700;
        }

        .currentLabel {
          color: #3575c5;
        }

        .doneLabel {
          color: #3c9960;
        }

        .announcementBox {
          margin-top: 26px;
          padding: 19px 20px;
          border: 1px solid #eadbc5;
          border-radius: 14px;
          background: #fff8e9;
        }

        .announcementTitle {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          color: #765025;
          font-size: 15px;
        }

        .announcementBox p {
          margin: 0;
          white-space: pre-line;
          color: #765f4e;
          font-size: 13.5px;
          line-height: 1.7;
        }

        .jobAction {
          margin-top: 28px;
          padding-top: 25px;
          border-top:
            1px solid #eee5de;
        }

        .applyButton {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          width: 100%;
          padding: 15px 18px;
          border-radius: 12px;
          background: #20a95b;
          color: #ffffff;
          text-decoration: none;
          font-size: 15px;
          font-weight: 700;
          box-shadow:
            0 8px 18px
            rgba(32, 169, 91, 0.18);
        }

        .waitingNotice,
        .closedNotice {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 48px;
          padding: 12px 16px;
          border-radius: 11px;
          font-size: 13px;
          text-align: center;
        }

        .waitingNotice {
          background: #f5f0ec;
          color: #78685f;
        }

        .closedNotice {
          background: #f2eeee;
          color: #7b6e68;
        }

        .bottomBack {
          display: flex;
          justify-content: center;
          margin-top: 32px;
        }

        .bottomBackButton {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 11px 18px;
          border: 1px solid #dbcbbf;
          border-radius: 10px;
          background: #ffffff;
          color: #5a3325;
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
        }

        .bottomBackButton:hover {
          background: #f8f1eb;
          border-color: #cdb9aa;
          transform:
            translateY(-1px);
        }

        .importantNotice {
          display: flex;
          align-items: flex-start;
          gap: 13px;
          max-width: 850px;
          margin: 26px auto 0;
          padding: 18px 20px;
          border: 1px solid #eadfd5;
          border-radius: 14px;
          background: #ffffff;
        }

        .importantIcon {
          width: 38px;
          height: 38px;
          min-width: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          background: #fff0e3;
          color: #b76432;
        }

        .importantNotice h3 {
          margin: 2px 0 5px;
          color: #5a3325;
          font-size: 14px;
        }

        .importantNotice p {
          margin: 0;
          color: #806f67;
          font-size: 12.5px;
          line-height: 1.65;
        }

        @media (max-width: 760px) {
          .lokerPage {
            min-height:
              calc(100vh - 60px);
            padding:
              34px 16px 55px;
          }

          .lokerHeader {
            margin-bottom: 28px;
          }

          .lokerHeaderIcon {
            width: 62px;
            height: 62px;
            margin-bottom: 15px;
            border-radius: 17px;
          }

          .lokerHeader h1 {
            font-size: 28px;
          }

          .lokerHeader p {
            font-size: 14px;
          }

          .emptyBox {
            padding:
              38px 22px;
            border-radius: 18px;
          }

          .emptyIcon {
            width: 62px;
            height: 62px;
          }

          .emptyBox h2 {
            font-size: 21px;
          }

          .emptyBox p {
            font-size: 13.5px;
          }

          .jobCard {
            border-radius: 18px;
          }

          .jobBody {
            padding:
              22px 20px;
          }

          .jobBody > h2 {
            font-size: 23px;
          }

          .jobMeta {
            flex-direction: column;
            gap: 9px;
            margin-bottom: 22px;
          }

          .jobSection {
            margin-top: 20px;
            padding-top: 20px;
          }

          .processSection {
            margin-top: 23px;
            padding-top: 21px;
          }

          .timelineContent {
            padding-left: 12px;
          }

          .timelineIcon {
            font-size: 20px;
          }

          .bottomBackButton {
            width: 100%;
            box-sizing: border-box;
          }

          .importantNotice {
            padding: 16px;
          }

          .importantIcon {
            width: 36px;
            height: 36px;
            min-width: 36px;
          }

          .importantNotice p {
            font-size: 12px;
          }

          .jobVideoWrap,
          .jobImageWrap {
            max-height: 360px;
          }

          .jobVideo,
          .jobImage {
            max-height: 360px;
          }
        }
      `}</style>
    </>
  );
}
