import Link from "next/link";
import { getSupabase } from "@/lib/supabase";

const HARI = [
  { value: 0, label: "Minggu" },
  { value: 1, label: "Senin" },
  { value: 2, label: "Selasa" },
  { value: 3, label: "Rabu" },
  { value: 4, label: "Kamis" },
  { value: 5, label: "Jumat" },
  { value: 6, label: "Sabtu" },
];

function WhatsAppIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.52 3.48A11.83 11.83 0 0 0 12.04 0C5.5 0 .17 5.33.17 11.87c0 2.09.55 4.13 1.59 5.93L.06 24l6.34-1.66a11.84 11.84 0 0 0 5.63 1.43h.01c6.54 0 11.87-5.33 11.87-11.87 0-3.17-1.24-6.15-3.39-8.42ZM12.04 21.8h-.01a9.88 9.88 0 0 1-5.04-1.38l-.36-.21-3.76.99 1-3.67-.23-.38a9.88 9.88 0 1 1 8.4 4.65Zm5.42-7.41c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.47-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.05 1.03-1.05 2.5s1.08 2.9 1.23 3.1c.15.2 2.13 3.25 5.16 4.56.72.31 1.28.49 1.72.63.72.23 1.37.2 1.89.12.58-.09 1.76-.72 2.01-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2a8 8 0 0 0-8 8c0 5.75 8 12 8 12s8-6.25 8-12a8 8 0 0 0-8-8Zm0 11.2A3.2 3.2 0 1 1 12 6.8a3.2 3.2 0 0 1 0 6.4Zm0-4.8a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2Z" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6.62 10.79a15.47 15.47 0 0 0 6.59 6.59l2.2-2.2c.28-.28.67-.37 1.02-.25 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1C10.61 21 3 13.39 3 4c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.24.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2Z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function normalizeWhatsApp(value) {
  if (!value) return "";

  let number = String(value).replace(/\D/g, "");

  if (number.startsWith("0")) {
    number = `62${number.slice(1)}`;
  }

  if (!number.startsWith("62")) {
    number = `62${number}`;
  }

  return number;
}

function formatJam(value) {
  if (!value) return "";

  const text = String(value);
  return text.length >= 5 ? text.substring(0, 5) : text;
}

function formatJamOperasional(item) {
  if (!item || !item.buka) return "Tutup";

  const buka = formatJam(item.jam_buka);
  const tutup = formatJam(item.jam_tutup);

  if (!buka || !tutup) return "Buka";

  return `${buka}–${tutup} WIT`;
}

function formatTanggalIndonesia(value) {
  if (!value) return "";

  const parts = String(value).split("-");

  if (parts.length !== 3) return value;

  const [tahun, bulan, hari] = parts;

  return `${hari}/${bulan}/${tahun}`;
}

function getTodayWIT() {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jayapura",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return formatter.format(new Date());
}

function isDateInPeriod(today, tanggalMulai, tanggalSelesai) {
  if (!today || !tanggalMulai || !tanggalSelesai) {
    return false;
  }

  return today >= tanggalMulai && today <= tanggalSelesai;
}

function getRelevantSpecialPeriod(periods, today) {
  if (!Array.isArray(periods)) return null;

  const active = periods.find((period) =>
    isDateInPeriod(
      today,
      period.tanggal_mulai,
      period.tanggal_selesai
    )
  );

  if (active) {
    return {
      period: active,
      isUpcoming: false,
    };
  }

  const upcoming = periods
    .filter(
      (period) =>
        period.tanggal_mulai &&
        period.tanggal_mulai > today
    )
    .sort((a, b) =>
      String(a.tanggal_mulai).localeCompare(
        String(b.tanggal_mulai)
      )
    );

  if (upcoming.length > 0) {
    return {
      period: upcoming[0],
      isUpcoming: true,
    };
  }

  return null;
}

function getNormalScheduleByDay(schedules, hari) {
  return (
    schedules.find(
      (item) => Number(item.hari) === Number(hari)
    ) || {
      hari,
      buka: false,
      jam_buka: null,
      jam_tutup: null,
    }
  );
}

function getSpecialScheduleByDay(details, hari) {
  return (
    details.find(
      (item) => Number(item.hari) === Number(hari)
    ) || null
  );
}

function isDifferentSchedule(normal, special) {
  if (!special) return false;

  if (normal.buka !== special.buka) {
    return true;
  }

  if (!normal.buka && !special.buka) {
    return false;
  }

  return (
    formatJam(normal.jam_buka) !==
      formatJam(special.jam_buka) ||
    formatJam(normal.jam_tutup) !==
      formatJam(special.jam_tutup)
  );
}

function getScheduleSummary(schedules) {
  const weekdaySchedules = HARI
    .filter((day) => day.value >= 1)
    .map((day) =>
      getNormalScheduleByDay(schedules, day.value)
    );

  const first = weekdaySchedules[0];
  const firstText = formatJamOperasional(first);

  const allSame = weekdaySchedules.every(
    (schedule) =>
      formatJamOperasional(schedule) === firstText
  );

  const weekdayText = allSame
    ? `Senin–Sabtu • ${firstText}`
    : "Senin–Sabtu • Lihat jam lengkap";

  const sunday = getNormalScheduleByDay(
    schedules,
    0
  );

  return `${weekdayText} • Minggu ${formatJamOperasional(sunday)}`;
}

function HoursAccordion({
  title,
  subtitle,
  summary,
  children,
  variant = "normal",
}) {
  return (
    <details
      className={`hoursAccordion ${
        variant === "special"
          ? "specialAccordion"
          : ""
      }`}
    >
      <summary className="hoursAccordionButton">
        <div className="hoursAccordionTitle">
          <div className="hoursAccordionIcon">
            {variant === "special" ? (
              "★"
            ) : (
              <ClockIcon />
            )}
          </div>

          <div className="hoursAccordionText">
            <strong>{title}</strong>

            {subtitle ? (
              <small>{subtitle}</small>
            ) : null}

            {summary ? (
              <span className="hoursAccordionSummary">
                {summary}
              </span>
            ) : null}
          </div>
        </div>

        <span
          className="hoursAccordionChevron"
          aria-hidden="true"
        >
          ⌄
        </span>
      </summary>

      <div className="hoursAccordionContent">
        {children}
      </div>
    </details>
  );
}

export default async function Page() {
  let cabang = [];
  let errorMessage = "";

  const supabase = getSupabase();

  if (supabase) {
    const { data, error } = await supabase
      .from("cabang_toko")
      .select(
        "id, nama, alamat, telepon, google_maps_url, google_review_url, foto, aktif, urutan"
      )
      .eq("aktif", true)
      .order("urutan", {
        ascending: true,
      })
      .order("id", {
        ascending: true,
      });

    if (error) {
      console.error(error);
      errorMessage =
        "Data toko belum dapat dimuat.";
    } else {
      cabang = data || [];
    }
  } else {
    errorMessage =
      "Koneksi database belum tersedia.";
  }

  const cabangIds = cabang.map((item) =>
    Number(item.id)
  );

  let jamNormal = [];
  let periodeKhusus = [];
  let detailPeriodeKhusus = [];

  if (
    supabase &&
    cabangIds.length > 0
  ) {
    const [
      normalResult,
      periodResult,
    ] = await Promise.all([
      supabase
        .from("jam_operasional_toko")
        .select(
          "id, cabang_id, hari, buka, jam_buka, jam_tutup"
        )
        .in("cabang_id", cabangIds)
        .order("hari", {
          ascending: true,
        }),

      supabase
        .from("periode_operasional_khusus")
        .select(
          "id, cabang_id, nama, tanggal_mulai, tanggal_selesai, aktif"
        )
        .in("cabang_id", cabangIds)
        .eq("aktif", true)
        .order("tanggal_mulai", {
          ascending: true,
        }),
    ]);

    if (normalResult.error) {
      console.error(
        "Gagal memuat jam normal:",
        normalResult.error
      );
    } else {
      jamNormal = normalResult.data || [];
    }

    if (periodResult.error) {
      console.error(
        "Gagal memuat periode khusus:",
        periodResult.error
      );
    } else {
      periodeKhusus =
        periodResult.data || [];
    }

    const periodIds =
      periodeKhusus.map((item) =>
        Number(item.id)
      );

    if (periodIds.length > 0) {
      const { data, error } =
        await supabase
          .from(
            "periode_operasional_khusus_detail"
          )
          .select(
            "id, periode_id, hari, buka, jam_buka, jam_tutup"
          )
          .in(
            "periode_id",
            periodIds
          )
          .order("hari", {
            ascending: true,
          });

      if (error) {
        console.error(
          "Gagal memuat detail periode:",
          error
        );
      } else {
        detailPeriodeKhusus =
          data || [];
      }
    }
  }

  const todayWIT = getTodayWIT();

  return (
    <>
      <section className="section">
        <div className="wrap">
          <div className="tokoHeader">
            <h1>Toko Kami</h1>

            <p>
              Temukan lokasi Toko Listrik
              Sinar Kasih dan kunjungi
              cabang terdekat.
            </p>
          </div>

          {errorMessage ? (
            <div className="tokoMessage">
              {errorMessage}
            </div>
          ) : cabang.length === 0 ? (
            <div className="tokoMessage">
              Belum ada cabang toko yang aktif.
            </div>
          ) : (
            <div className="tokoGrid">
              {cabang.map((item) => {
                const whatsappNumber =
                  normalizeWhatsApp(
                    item.telepon
                  );

                const whatsappUrl =
                  whatsappNumber
                    ? `https://wa.me/${whatsappNumber}`
                    : "";

                const normalSchedule =
                  jamNormal.filter(
                    (schedule) =>
                      Number(
                        schedule.cabang_id
                      ) === Number(item.id)
                  );

                const periods =
                  periodeKhusus.filter(
                    (period) =>
                      Number(
                        period.cabang_id
                      ) === Number(item.id)
                  );

                const relevantSpecial =
                  getRelevantSpecialPeriod(
                    periods,
                    todayWIT
                  );

                const specialPeriod =
                  relevantSpecial?.period ||
                  null;

                const isUpcoming =
                  relevantSpecial?.isUpcoming ||
                  false;

                const specialDetails =
                  specialPeriod
                    ? detailPeriodeKhusus.filter(
                        (detail) =>
                          Number(
                            detail.periode_id
                          ) ===
                          Number(
                            specialPeriod.id
                          )
                      )
                    : [];

                const specialChanges =
                  specialPeriod
                    ? HARI.filter((hari) => {
                        const normal =
                          getNormalScheduleByDay(
                            normalSchedule,
                            hari.value
                          );

                        const special =
                          getSpecialScheduleByDay(
                            specialDetails,
                            hari.value
                          );

                        return (
                          special &&
                          isDifferentSchedule(
                            normal,
                            special
                          )
                        );
                      }).map((hari) => {
                        const special =
                          getSpecialScheduleByDay(
                            specialDetails,
                            hari.value
                          );

                        return {
                          hari: hari.value,
                          label: hari.label,
                          ...special,
                        };
                      })
                    : [];

                return (
                  <article
                    key={item.id}
                    className="tokoCard"
                  >
                    <div className="tokoPhoto">
                      {item.foto ? (
                        <img
                          src={item.foto}
                          alt={`Foto ${item.nama}`}
                        />
                      ) : (
                        <div className="noPhoto">
                          <span>🏪</span>
                          <strong>
                            Sinar Kasih
                          </strong>
                          <small>
                            Foto toko belum
                            tersedia
                          </small>
                        </div>
                      )}
                    </div>

                    <div className="tokoContent">
                      <div className="tokoTitleRow">
                        <div>
                          <span className="branchLabel">
                            TOKO / CABANG
                          </span>

                          <h2>{item.nama}</h2>
                        </div>

                        <span className="activeBadge">
                          ● Aktif
                        </span>
                      </div>

                      <div className="infoItem">
                        <span className="infoIcon">
                          <LocationIcon />
                        </span>

                        <div>
                          <strong>Alamat</strong>
                          <p>{item.alamat}</p>
                        </div>
                      </div>

                      {item.telepon && (
                        <div className="infoItem">
                          <span className="infoIcon">
                            <PhoneIcon />
                          </span>

                          <div>
                            <strong>
                              Telepon / WhatsApp
                            </strong>
                            <p>
                              {item.telepon}
                            </p>
                          </div>
                        </div>
                      )}

                      <HoursAccordion
                        title="Jam Operasional"
                        subtitle="Waktu Indonesia Timur (WIT)"
                        summary={getScheduleSummary(
                          normalSchedule
                        )}
                      >
                        <div className="hoursList">
                          {HARI.map((hari) => {
                            const schedule =
                              getNormalScheduleByDay(
                                normalSchedule,
                                hari.value
                              );

                            return (
                              <div
                                key={hari.value}
                                className="hoursRow"
                              >
                                <span>
                                  {hari.label}
                                </span>

                                <strong
                                  className={
                                    schedule.buka
                                      ? ""
                                      : "closedText"
                                  }
                                >
                                  {formatJamOperasional(
                                    schedule
                                  )}
                                </strong>
                              </div>
                            );
                          })}
                        </div>
                      </HoursAccordion>

                      {specialPeriod &&
                        specialChanges.length >
                          0 && (
                          <HoursAccordion
                            title={
                              isUpcoming
                                ? "Jam Operasional Khusus Mendatang"
                                : "Jam Operasional Khusus"
                            }
                            subtitle={
                              specialPeriod.nama
                            }
                            variant="special"
                            summary={
                              <>
                                {isUpcoming
                                  ? "Akan berlaku "
                                  : "Berlaku "}
                                {formatTanggalIndonesia(
                                  specialPeriod.tanggal_mulai
                                )}
                                {" – "}
                                {formatTanggalIndonesia(
                                  specialPeriod.tanggal_selesai
                                )}
                              </>
                            }
                          >
                            <div className="specialPeriodDate">
                              {isUpcoming
                                ? "Periode khusus mendatang"
                                : "Periode khusus aktif"}
                            </div>

                            <div className="specialHoursList">
                              {specialChanges.map(
                                (special) => (
                                  <div
                                    key={
                                      special.hari
                                    }
                                    className="hoursRow specialRow"
                                  >
                                    <span>
                                      {
                                        special.label
                                      }
                                    </span>

                                    <strong
                                      className={
                                        special.buka
                                          ? ""
                                          : "closedText"
                                      }
                                    >
                                      {formatJamOperasional(
                                        special
                                      )}
                                    </strong>
                                  </div>
                                )
                              )}
                            </div>

                            <p className="specialNote">
                              {isUpcoming
                                ? "Jam khusus ini akan berlaku selama periode yang tercantum di atas."
                                : "Jam di atas berlaku khusus selama periode tersebut."}
                            </p>
                          </HoursAccordion>
                        )}

                      <div className="tokoActions">
                        {item.google_maps_url && (
                          <a
                            href={
                              item.google_maps_url
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mapsButton"
                          >
                            <LocationIcon />
                            Lihat Google Maps
                          </a>
                        )}

                        {item.google_review_url && (
                          <a
                            href={
                              item.google_review_url
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="reviewButton"
                          >
                            <span
                              className="reviewStars"
                              aria-hidden="true"
                            >
                              ⭐⭐⭐⭐⭐
                            </span>

                            <span className="reviewText">
                              <strong>
                                Beri Review Google
                              </strong>

                              <small>
                                Bantu kami dengan
                                ulasan Anda
                              </small>
                            </span>
                          </a>
                        )}

                        {whatsappUrl && (
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="whatsappButton"
                          >
                            <WhatsAppIcon />
                            Hubungi via WhatsApp
                          </a>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          <div className="backArea">
            <Link
              href="/lainnya"
              className="backButton"
            >
              ← Kembali ke Lainnya
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        .tokoHeader {
          margin-bottom: 28px;
        }

        .tokoHeader h1 {
          margin: 0 0 8px;
          font-size: 36px;
          color: #3f2f24;
        }

        .tokoHeader p {
          margin: 0;
          color: #76685d;
          font-size: 16px;
        }

        .tokoGrid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 24px;
        }

        .tokoCard {
          overflow: hidden;
          background: #fff;
          border: 1px solid #e1d7cc;
          border-radius: 18px;
          box-shadow: 0 8px 25px rgba(75, 51, 38, 0.07);
        }

        .tokoPhoto {
          width: 100%;
          height: 260px;
          overflow: hidden;
          background: #f3ece4;
        }

        .tokoPhoto img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .noPhoto {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 6px;
          color: #76685d;
        }

        .noPhoto span {
          font-size: 42px;
        }

        .noPhoto strong {
          color: #4b3326;
          font-size: 18px;
        }

        .noPhoto small {
          font-size: 12px;
        }

        .tokoContent {
          padding: 22px;
        }

        .tokoTitleRow {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 14px;
          margin-bottom: 22px;
        }

        .branchLabel {
          display: block;
          margin-bottom: 5px;
          color: #9a806a;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.08em;
        }

        .tokoTitleRow h2 {
          margin: 0;
          color: #3f2f24;
          font-size: 23px;
        }

        .activeBadge {
          flex-shrink: 0;
          padding: 6px 10px;
          border-radius: 999px;
          background: #e8f5e9;
          color: #2f6d35;
          font-size: 12px;
          font-weight: 700;
        }

        .infoItem {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 16px;
        }

        .infoIcon {
          width: 36px;
          height: 36px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          background: #f5ede4;
          color: #755337;
        }

        .infoItem strong {
          display: block;
          margin-bottom: 3px;
          color: #5f5045;
          font-size: 13px;
        }

        .infoItem p {
          margin: 0;
          color: #3f2f24;
          line-height: 1.5;
          font-size: 14px;
        }

        .hoursAccordion {
          margin-top: 20px;
          overflow: hidden;
          border: 1px solid #e5d9cc;
          border-radius: 13px;
          background: #fcfaf8;
        }

        .hoursAccordionButton {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          padding: 15px 17px;
          cursor: pointer;
          list-style: none;
        }

        .hoursAccordionButton::-webkit-details-marker {
          display: none;
        }

        .hoursAccordionButton::marker {
          display: none;
        }

        .hoursAccordionTitle {
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 11px;
        }

        .hoursAccordionIcon {
          width: 36px;
          height: 36px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          background: #f0e4d7;
          color: #755337;
        }

        .hoursAccordionText {
          min-width: 0;
        }

        .hoursAccordionText strong {
          display: block;
          color: #4a382c;
          font-size: 14px;
        }

        .hoursAccordionText small {
          display: block;
          margin-top: 2px;
          color: #8a7767;
          font-size: 11px;
        }

        .hoursAccordionSummary {
          display: block;
          margin-top: 5px;
          color: #6f5c4e;
          font-size: 12px;
          line-height: 1.45;
        }

        .hoursAccordionChevron {
          flex-shrink: 0;
          color: #765b45;
          font-size: 22px;
          line-height: 1;
          transition: transform 0.2s ease;
        }

        .hoursAccordion[open]
          .hoursAccordionChevron {
          transform: rotate(180deg);
        }

        .hoursAccordionContent {
          padding: 0 17px 16px;
          border-top: 1px solid #eee5dc;
        }

        .hoursList,
        .specialHoursList {
          display: flex;
          flex-direction: column;
          gap: 0;
          margin-top: 9px;
        }

        .hoursRow {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          padding: 7px 0;
          color: #5c4d42;
          font-size: 13px;
        }

        .hoursRow strong {
          color: #3f2f24;
          text-align: right;
          font-size: 13px;
        }

        .hoursRow .closedText {
          color: #9a7069;
        }

        .specialAccordion {
          border-color: #ead8b8;
          background: #fffaf0;
        }

        .specialAccordion .hoursAccordionIcon {
          background: #f4e4c6;
          color: #9a6c28;
          font-size: 16px;
        }

        .specialAccordion .hoursAccordionText strong {
          color: #60482d;
        }

        .specialAccordion .hoursAccordionText small {
          color: #987d5c;
        }

        .specialAccordion .hoursAccordionSummary {
          color: #745735;
        }

        .specialPeriodDate {
          margin-top: 12px;
          padding: 8px 10px;
          border-radius: 8px;
          background: #f8edd9;
          color: #745735;
          font-size: 12px;
          font-weight: 700;
        }

        .specialRow {
          color: #60482d;
        }

        .specialRow strong {
          color: #60482d;
        }

        .specialNote {
          margin: 10px 0 0;
          color: #92795c;
          font-size: 11px;
          line-height: 1.5;
        }

        .tokoActions {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 22px;
          padding-top: 18px;
          border-top: 1px solid #eee5dc;
        }

        .mapsButton,
        .reviewButton,
        .whatsappButton {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          min-height: 48px;
          padding: 0 16px;
          box-sizing: border-box;
          border-radius: 10px;
          text-decoration: none;
          font-size: 14px;
          font-weight: 700;
          transition:
            transform 0.15s ease,
            opacity 0.15s ease;
        }

        .mapsButton:hover,
        .reviewButton:hover,
        .whatsappButton:hover {
          transform: translateY(-1px);
          opacity: 0.92;
        }

        .mapsButton {
          background: #f5ede4;
          color: #5f432e;
          border: 1px solid #dfd0c0;
        }

        .reviewButton {
          background: #fffaf0;
          color: #5a4229;
          border: 1px solid #ead8b8;
        }

        .reviewStars {
          font-size: 18px;
          line-height: 1;
          white-space: nowrap;
        }

        .reviewText {
          display: flex;
          align-items: flex-start;
          flex-direction: column;
          gap: 2px;
        }

        .reviewText small {
          color: #8a7766;
          font-size: 11px;
          font-weight: 500;
        }

        .whatsappButton {
          background: #3d8b4b;
          color: #fff;
          border: 1px solid #3d8b4b;
        }

        .backArea {
          margin-top: 28px;
          text-align: center;
        }

        .backButton {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 44px;
          padding: 0 18px;
          border: 1px solid #d4c5b5;
          border-radius: 9px;
          background: #fff;
          color: #5f432e;
          text-decoration: none;
          font-weight: 700;
        }

        .backButton:hover {
          background: #f5ede4;
        }

        .tokoMessage {
          padding: 30px;
          border: 1px solid #dfd2c3;
          border-radius: 14px;
          background: #fff;
          color: #76685d;
          text-align: center;
        }

        @media (max-width: 850px) {
          .tokoGrid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 600px) {
          .tokoHeader h1 {
            font-size: 30px;
          }

          .tokoPhoto {
            height: 220px;
          }

          .tokoContent {
            padding: 18px;
          }

          .tokoTitleRow {
            flex-direction: column;
          }

          .hoursAccordionButton {
            padding: 14px;
          }

          .hoursAccordionContent {
            padding: 0 14px 14px;
          }

          .hoursAccordionSummary {
            font-size: 11px;
          }

          .hoursRow {
            font-size: 12px;
          }

          .hoursRow strong {
            font-size: 12px;
          }
        }
      `}</style>
    </>
  );
}
