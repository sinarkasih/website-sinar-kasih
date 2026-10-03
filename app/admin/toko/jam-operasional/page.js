"use client";

import { useEffect, useMemo, useState } from "react";
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

function formatTime(value) {
  if (!value) return "";

  const text = String(value);

  if (text.length >= 5) {
    return text.substring(0, 5);
  }

  return text;
}

function createEmptySchedule() {
  return HARI.map((hari) => ({
    hari: hari.value,
    buka: hari.value !== 0,
    jam_buka: hari.value !== 0 ? "09:00" : "",
    jam_tutup: hari.value !== 0 ? "18:00" : "",
  }));
}

function createEmptySpecialSchedule() {
  return HARI.map((hari) => ({
    hari: hari.value,
    buka: hari.value === 0,
    jam_buka: hari.value === 0 ? "11:00" : "",
    jam_tutup: hari.value === 0 ? "19:00" : "",
  }));
}

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [savingNormal, setSavingNormal] = useState(false);
  const [savingSpecial, setSavingSpecial] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [cabang, setCabang] = useState([]);
  const [selectedCabangId, setSelectedCabangId] = useState("");

  const [schedule, setSchedule] = useState(
    createEmptySchedule()
  );

  const [specialPeriods, setSpecialPeriods] = useState([]);

  const [showSpecialForm, setShowSpecialForm] =
    useState(false);

  const [editingSpecialId, setEditingSpecialId] =
    useState(null);

  const [specialForm, setSpecialForm] = useState({
    nama: "",
    tanggal_mulai: "",
    tanggal_selesai: "",
    aktif: true,
  });

  const [specialSchedule, setSpecialSchedule] =
    useState(createEmptySpecialSchedule());

  const selectedCabang = useMemo(() => {
    return cabang.find(
      (item) =>
        String(item.id) ===
        String(selectedCabangId)
    );
  }, [cabang, selectedCabangId]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!selectedCabangId) return;

    loadCabangSchedule(selectedCabangId);
  }, [selectedCabangId]);

  async function loadData() {
    setLoading(true);
    setError("");

    const supabase = getSupabase();

    if (!supabase) {
      setError("Koneksi database belum tersedia.");
      setLoading(false);
      return;
    }

    const { data, error: cabangError } =
      await supabase
        .from("cabang_toko")
        .select("id, nama, aktif, urutan")
        .order("urutan", { ascending: true })
        .order("id", { ascending: true });

    if (cabangError) {
      setError(
        "Gagal memuat data cabang: " +
          cabangError.message
      );
      setLoading(false);
      return;
    }

    const daftarCabang = data || [];

    setCabang(daftarCabang);

    if (daftarCabang.length > 0) {
      setSelectedCabangId(
        String(daftarCabang[0].id)
      );
    }

    setLoading(false);
  }

  async function loadCabangSchedule(
    cabangId,
    clearMessages = true
  ) {
    if (clearMessages) {
      setError("");
      setSuccess("");
    }

    const supabase = getSupabase();

    if (!supabase) {
      setError("Koneksi database belum tersedia.");
      return;
    }

    const [
      normalResult,
      specialResult,
    ] = await Promise.all([
      supabase
        .from("jam_operasional_toko")
        .select(
          "id, cabang_id, hari, buka, jam_buka, jam_tutup"
        )
        .eq("cabang_id", cabangId)
        .order("hari", {
          ascending: true,
        }),

      supabase
        .from("periode_operasional_khusus")
        .select(
          "id, cabang_id, nama, tanggal_mulai, tanggal_selesai, aktif"
        )
        .eq("cabang_id", cabangId)
        .order("tanggal_mulai", {
          ascending: true,
        }),
    ]);

    if (normalResult.error) {
      setError(
        "Gagal memuat jam operasional: " +
          normalResult.error.message
      );
      return;
    }

    if (specialResult.error) {
      setError(
        "Gagal memuat jam khusus: " +
          specialResult.error.message
      );
      return;
    }

    const existingNormal =
      normalResult.data || [];

    const mergedSchedule =
      createEmptySchedule().map(
        (defaultItem) => {
          const found =
            existingNormal.find(
              (item) =>
                Number(item.hari) ===
                Number(defaultItem.hari)
            );

          if (!found) {
            return defaultItem;
          }

          return {
            hari: Number(found.hari),
            buka: found.buka !== false,
            jam_buka: formatTime(
              found.jam_buka
            ),
            jam_tutup: formatTime(
              found.jam_tutup
            ),
          };
        }
      );

    setSchedule(mergedSchedule);
    setSpecialPeriods(
      specialResult.data || []
    );
  }

  function handleScheduleChange(
    hari,
    field,
    value
  ) {
    setSchedule((current) =>
      current.map((item) => {
        if (
          Number(item.hari) !==
          Number(hari)
        ) {
          return item;
        }

        return {
          ...item,
          [field]: value,
        };
      })
    );
  }

  async function simpanJamNormal(event) {
    event.preventDefault();

    if (!selectedCabangId) {
      setError(
        "Pilih cabang terlebih dahulu."
      );
      return;
    }

    setSavingNormal(true);
    setError("");
    setSuccess("");

    const supabase = getSupabase();

    if (!supabase) {
      setError(
        "Koneksi database belum tersedia."
      );
      setSavingNormal(false);
      return;
    }

    const payload = schedule.map(
      (item) => ({
        cabang_id:
          Number(selectedCabangId),
        hari: Number(item.hari),
        buka: Boolean(item.buka),
        jam_buka: item.buka
          ? item.jam_buka || null
          : null,
        jam_tutup: item.buka
          ? item.jam_tutup || null
          : null,
      })
    );

    const invalid = payload.find(
      (item) =>
        item.buka &&
        (!item.jam_buka ||
          !item.jam_tutup)
    );

    if (invalid) {
      setError(
        "Hari yang berstatus Buka harus memiliki jam buka dan jam tutup."
      );
      setSavingNormal(false);
      return;
    }

    const { error: saveError } =
      await supabase
        .from("jam_operasional_toko")
        .upsert(payload, {
          onConflict:
            "cabang_id,hari",
        });

    if (saveError) {
      setError(
        "Gagal menyimpan jam operasional: " +
          saveError.message
      );
      setSavingNormal(false);
      return;
    }

    /*
      Refresh data terlebih dahulu.
      clearMessages = false supaya pesan sukses
      tidak langsung terhapus.
    */
    await loadCabangSchedule(
      selectedCabangId,
      false
    );

    setSuccess(
      "Jam operasional " +
        (selectedCabang?.nama ||
          "cabang") +
        " berhasil disimpan."
    );

    setSavingNormal(false);
  }

  function bukaFormTambahSpecial() {
    setEditingSpecialId(null);

    setSpecialForm({
      nama: "",
      tanggal_mulai: "",
      tanggal_selesai: "",
      aktif: true,
    });

    setSpecialSchedule(
      createEmptySpecialSchedule()
    );

    setShowSpecialForm(true);

    setError("");
    setSuccess("");
  }

  async function editSpecial(period) {
    const supabase = getSupabase();

    if (!supabase) {
      setError(
        "Koneksi database belum tersedia."
      );
      return;
    }

    setError("");
    setSuccess("");

    const {
      data,
      error: detailError,
    } = await supabase
      .from(
        "periode_operasional_khusus_detail"
      )
      .select(
        "id, periode_id, hari, buka, jam_buka, jam_tutup"
      )
      .eq(
        "periode_id",
        period.id
      )
      .order("hari", {
        ascending: true,
      });

    if (detailError) {
      setError(
        "Gagal memuat detail jam khusus: " +
          detailError.message
      );
      return;
    }

    const mergedSchedule =
      createEmptySpecialSchedule().map(
        (defaultItem) => {
          const found =
            (data || []).find(
              (item) =>
                Number(item.hari) ===
                Number(defaultItem.hari)
            );

          if (!found) {
            return defaultItem;
          }

          return {
            hari: Number(found.hari),
            buka: found.buka !== false,
            jam_buka: formatTime(
              found.jam_buka
            ),
            jam_tutup: formatTime(
              found.jam_tutup
            ),
          };
        }
      );

    setEditingSpecialId(period.id);

    setSpecialForm({
      nama: period.nama || "",
      tanggal_mulai:
        period.tanggal_mulai || "",
      tanggal_selesai:
        period.tanggal_selesai || "",
      aktif: period.aktif !== false,
    });

    setSpecialSchedule(
      mergedSchedule
    );

    setShowSpecialForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function handleSpecialScheduleChange(
    hari,
    field,
    value
  ) {
    setSpecialSchedule((current) =>
      current.map((item) => {
        if (
          Number(item.hari) !==
          Number(hari)
        ) {
          return item;
        }

        return {
          ...item,
          [field]: value,
        };
      })
    );
  }

  async function simpanSpecial(event) {
    event.preventDefault();

    if (!selectedCabangId) {
      setError(
        "Pilih cabang terlebih dahulu."
      );
      return;
    }

    if (!specialForm.nama.trim()) {
      setError(
        "Nama periode wajib diisi."
      );
      return;
    }

    if (!specialForm.tanggal_mulai) {
      setError(
        "Tanggal mulai wajib diisi."
      );
      return;
    }

    if (!specialForm.tanggal_selesai) {
      setError(
        "Tanggal selesai wajib diisi."
      );
      return;
    }

    if (
      specialForm.tanggal_selesai <
      specialForm.tanggal_mulai
    ) {
      setError(
        "Tanggal selesai tidak boleh sebelum tanggal mulai."
      );
      return;
    }

    const invalid =
      specialSchedule.find(
        (item) =>
          item.buka &&
          (!item.jam_buka ||
            !item.jam_tutup)
      );

    if (invalid) {
      setError(
        "Hari khusus yang berstatus Buka harus memiliki jam buka dan jam tutup."
      );
      return;
    }

    setSavingSpecial(true);
    setError("");
    setSuccess("");

    const supabase = getSupabase();

    if (!supabase) {
      setError(
        "Koneksi database belum tersedia."
      );
      setSavingSpecial(false);
      return;
    }

    let periodId =
      editingSpecialId;

    if (editingSpecialId) {
      const {
        error: updateError,
      } = await supabase
        .from(
          "periode_operasional_khusus"
        )
        .update({
          nama:
            specialForm.nama.trim(),
          tanggal_mulai:
            specialForm.tanggal_mulai,
          tanggal_selesai:
            specialForm.tanggal_selesai,
          aktif:
            specialForm.aktif,
          updated_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          editingSpecialId
        );

      if (updateError) {
        setError(
          "Gagal memperbarui periode: " +
            updateError.message
        );
        setSavingSpecial(false);
        return;
      }

      const {
        error: deleteDetailError,
      } = await supabase
        .from(
          "periode_operasional_khusus_detail"
        )
        .delete()
        .eq(
          "periode_id",
          editingSpecialId
        );

      if (deleteDetailError) {
        setError(
          "Gagal memperbarui detail periode: " +
            deleteDetailError.message
        );
        setSavingSpecial(false);
        return;
      }
    } else {
      const {
        data,
        error: insertError,
      } = await supabase
        .from(
          "periode_operasional_khusus"
        )
        .insert({
          cabang_id:
            Number(selectedCabangId),
          nama:
            specialForm.nama.trim(),
          tanggal_mulai:
            specialForm.tanggal_mulai,
          tanggal_selesai:
            specialForm.tanggal_selesai,
          aktif:
            specialForm.aktif,
        })
        .select()
        .single();

      if (insertError) {
        setError(
          "Gagal membuat periode: " +
            insertError.message
        );
        setSavingSpecial(false);
        return;
      }

      periodId = data.id;
    }

    const detailPayload =
      specialSchedule.map(
        (item) => ({
          periode_id: periodId,
          hari: Number(item.hari),
          buka: Boolean(item.buka),
          jam_buka: item.buka
            ? item.jam_buka || null
            : null,
          jam_tutup: item.buka
            ? item.jam_tutup || null
            : null,
        })
      );

    const {
      error: detailInsertError,
    } = await supabase
      .from(
        "periode_operasional_khusus_detail"
      )
      .insert(detailPayload);

    if (detailInsertError) {
      setError(
        "Periode tersimpan tetapi detail jam gagal disimpan: " +
          detailInsertError.message
      );
      setSavingSpecial(false);
      return;
    }

    await loadCabangSchedule(
      selectedCabangId,
      false
    );

    setSuccess(
      editingSpecialId
        ? "Periode operasional khusus berhasil diperbarui."
        : "Periode operasional khusus berhasil ditambahkan."
    );

    setSavingSpecial(false);
    setShowSpecialForm(false);
    setEditingSpecialId(null);

    setSpecialForm({
      nama: "",
      tanggal_mulai: "",
      tanggal_selesai: "",
      aktif: true,
    });

    setSpecialSchedule(
      createEmptySpecialSchedule()
    );
  }

  async function hapusSpecial(period) {
    const yakin = window.confirm(
      `Hapus periode "${period.nama}"?`
    );

    if (!yakin) return;

    const supabase = getSupabase();

    if (!supabase) {
      setError(
        "Koneksi database belum tersedia."
      );
      return;
    }

    setError("");
    setSuccess("");

    const {
      error: deleteError,
    } = await supabase
      .from(
        "periode_operasional_khusus"
      )
      .delete()
      .eq("id", period.id);

    if (deleteError) {
      setError(
        "Gagal menghapus periode: " +
          deleteError.message
      );
      return;
    }

    await loadCabangSchedule(
      selectedCabangId,
      false
    );

    setSuccess(
      "Periode operasional khusus berhasil dihapus."
    );
  }

  async function toggleSpecial(period) {
    const supabase = getSupabase();

    if (!supabase) {
      setError(
        "Koneksi database belum tersedia."
      );
      return;
    }

    setError("");
    setSuccess("");

    const {
      error: updateError,
    } = await supabase
      .from(
        "periode_operasional_khusus"
      )
      .update({
        aktif: !period.aktif,
        updated_at:
          new Date().toISOString(),
      })
      .eq("id", period.id);

    if (updateError) {
      setError(
        "Gagal mengubah status periode: " +
          updateError.message
      );
      return;
    }

    await loadCabangSchedule(
      selectedCabangId,
      false
    );

    setSuccess(
      `Periode "${period.nama}" berhasil ${
        period.aktif
          ? "dinonaktifkan"
          : "diaktifkan"
      }.`
    );
  }

  if (loading) {
    return (
      <main style={styles.page}>
        <div className="jo-card" style={styles.card}>
          <p style={styles.muted}>
            Memuat data jam operasional...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <div className="jo-header" style={styles.header}>
        <div>
          <h1 style={styles.title}>
            Jam Operasional
          </h1>

          <p style={styles.subtitle}>
            Atur jam buka normal dan jam
            operasional khusus setiap
            cabang toko.
          </p>
        </div>

        <a
          href="/admin/toko"
          style={styles.secondaryButton}
        >
          ← Kembali ke Toko
        </a>
      </div>

      {error && (
        <div
          style={styles.errorBox}
          role="alert"
          aria-live="assertive"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          style={styles.successBox}
          role="status"
          aria-live="polite"
        >
          {success}
        </div>
      )}

      <section className="jo-card" style={styles.card}>
        <div className="jo-sectionHeader" style={styles.sectionHeader}>
          <div>
            <h2 style={styles.sectionTitle}>
              Pilih Cabang
            </h2>

            <p style={styles.muted}>
              Pengaturan jam operasional
              berlaku untuk cabang yang
              dipilih.
            </p>
          </div>
        </div>

        <select
          value={selectedCabangId}
          onChange={(event) =>
            setSelectedCabangId(
              event.target.value
            )
          }
          style={styles.select}
        >
          {cabang.map((item) => (
            <option
              key={item.id}
              value={item.id}
            >
              {item.nama}
              {item.aktif === false
                ? " — Tidak Aktif"
                : ""}
            </option>
          ))}
        </select>
      </section>

      <section className="jo-card" style={styles.card}>
        <div className="jo-sectionHeader" style={styles.sectionHeader}>
          <div>
            <h2 style={styles.sectionTitle}>
              🕐 Jam Operasional Normal
            </h2>

            <p style={styles.muted}>
              {selectedCabang?.nama ||
                "Cabang terpilih"}
            </p>
          </div>
        </div>

        <form onSubmit={simpanJamNormal}>
          <div style={styles.scheduleList}>
            {schedule.map((item) => {
              const hari = HARI.find(
                (day) =>
                  Number(day.value) ===
                  Number(item.hari)
              );

              return (
                <div
                  key={item.hari}
                  className="jo-scheduleRow" style={styles.scheduleRow}
                >
                  <div
                    style={styles.dayName}
                  >
                    {hari?.label}
                  </div>

                  <label
                    style={styles.switchRow}
                  >
                    <input
                      type="checkbox"
                      checked={item.buka}
                      onChange={(event) =>
                        handleScheduleChange(
                          item.hari,
                          "buka",
                          event.target
                            .checked
                        )
                      }
                    />

                    <span>
                      {item.buka
                        ? "Buka"
                        : "Tutup"}
                    </span>
                  </label>

                  <div
                    style={styles.timeGroup}
                  >
                    <input
                      type="time"
                      value={item.jam_buka}
                      disabled={!item.buka}
                      onChange={(event) =>
                        handleScheduleChange(
                          item.hari,
                          "jam_buka",
                          event.target.value
                        )
                      }
                      style={{
                        ...styles.timeInput,
                        opacity: item.buka
                          ? 1
                          : 0.5,
                      }}
                    />

                    <span
                      style={styles.timeDash}
                    >
                      –
                    </span>

                    <input
                      type="time"
                      value={item.jam_tutup}
                      disabled={!item.buka}
                      onChange={(event) =>
                        handleScheduleChange(
                          item.hari,
                          "jam_tutup",
                          event.target.value
                        )
                      }
                      style={{
                        ...styles.timeInput,
                        opacity: item.buka
                          ? 1
                          : 0.5,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="jo-formActions" style={styles.formActions}>
            <button
              type="submit"
              disabled={savingNormal}
              style={{
                ...styles.primaryButton,
                opacity: savingNormal
                  ? 0.7
                  : 1,
              }}
            >
              {savingNormal
                ? "Menyimpan..."
                : "Simpan Jam Operasional"}
            </button>
          </div>
        </form>
      </section>

      <section className="jo-card" style={styles.card}>
        <div className="jo-sectionHeader" style={styles.sectionHeader}>
          <div>
            <h2 style={styles.sectionTitle}>
              🗓️ Jam Operasional Khusus
            </h2>

            <p style={styles.muted}>
              Digunakan untuk periode
              tertentu, misalnya Natal,
              Paskah, atau periode khusus
              lainnya.
            </p>
          </div>

          {!showSpecialForm && (
            <button
              type="button"
              onClick={
                bukaFormTambahSpecial
              }
              style={
                styles.primaryButton
              }
            >
              + Tambah Periode
            </button>
          )}
        </div>

        {showSpecialForm && (
          <form
            onSubmit={simpanSpecial}
            className="jo-card" style={styles.specialForm}
          >
            <div
              className="jo-specialFormHeader" style={styles.specialFormHeader}
            >
              <div>
                <h3
                  style={styles.formTitle}
                >
                  {editingSpecialId
                    ? "Edit Periode Operasional"
                    : "Tambah Periode Operasional"}
                </h3>

                <p style={styles.muted}>
                  Atur periode dan jam
                  khusus untuk cabang{" "}
                  <strong>
                    {selectedCabang?.nama}
                  </strong>
                  .
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowSpecialForm(
                    false
                  );
                  setEditingSpecialId(
                    null
                  );
                }}
                style={
                  styles.smallSecondaryButton
                }
              >
                Batal
              </button>
            </div>

            <div className="jo-formGrid" style={styles.formGrid}>
              <div style={styles.field}>
                <label style={styles.label}>
                  Nama Periode *
                </label>

                <input
                  value={
                    specialForm.nama
                  }
                  onChange={(event) =>
                    setSpecialForm(
                      (current) => ({
                        ...current,
                        nama: event.target
                          .value,
                      })
                    )
                  }
                  placeholder="Contoh: Periode Natal"
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>
                  Status
                </label>

                <label
                  style={
                    styles.checkboxLabel
                  }
                >
                  <input
                    type="checkbox"
                    checked={
                      specialForm.aktif
                    }
                    onChange={(event) =>
                      setSpecialForm(
                        (current) => ({
                          ...current,
                          aktif:
                            event.target
                              .checked,
                        })
                      )
                    }
                  />

                  <span>
                    Periode aktif
                  </span>
                </label>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>
                  Tanggal Mulai *
                </label>

                <input
                  type="date"
                  value={
                    specialForm.tanggal_mulai
                  }
                  onChange={(event) =>
                    setSpecialForm(
                      (current) => ({
                        ...current,
                        tanggal_mulai:
                          event.target
                            .value,
                      })
                    )
                  }
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>
                  Tanggal Selesai *
                </label>

                <input
                  type="date"
                  value={
                    specialForm.tanggal_selesai
                  }
                  onChange={(event) =>
                    setSpecialForm(
                      (current) => ({
                        ...current,
                        tanggal_selesai:
                          event.target
                            .value,
                      })
                    )
                  }
                  style={styles.input}
                />
              </div>
            </div>

            <div
              style={
                styles.specialScheduleBox
              }
            >
              <h3
                style={styles.formTitle}
              >
                Jam Selama Periode Ini
              </h3>

              <div
                style={
                  styles.scheduleList
                }
              >
                {specialSchedule.map(
                  (item) => {
                    const hari =
                      HARI.find(
                        (day) =>
                          Number(
                            day.value
                          ) ===
                          Number(
                            item.hari
                          )
                      );

                    return (
                      <div
                        key={item.hari}
                        style={
                          styles.scheduleRow
                        }
                      >
                        <div
                          style={
                            styles.dayName
                          }
                        >
                          {hari?.label}
                        </div>

                        <label
                          style={
                            styles.switchRow
                          }
                        >
                          <input
                            type="checkbox"
                            checked={
                              item.buka
                            }
                            onChange={(
                              event
                            ) =>
                              handleSpecialScheduleChange(
                                item.hari,
                                "buka",
                                event.target
                                  .checked
                              )
                            }
                          />

                          <span>
                            {item.buka
                              ? "Buka"
                              : "Tutup"}
                          </span>
                        </label>

                        <div
                          style={
                            styles.timeGroup
                          }
                        >
                          <input
                            type="time"
                            value={
                              item.jam_buka
                            }
                            disabled={
                              !item.buka
                            }
                            onChange={(
                              event
                            ) =>
                              handleSpecialScheduleChange(
                                item.hari,
                                "jam_buka",
                                event.target
                                  .value
                              )
                            }
                            style={{
                              ...styles.timeInput,
                              opacity:
                                item.buka
                                  ? 1
                                  : 0.5,
                            }}
                          />

                          <span
                            style={
                              styles.timeDash
                            }
                          >
                            –
                          </span>

                          <input
                            type="time"
                            value={
                              item.jam_tutup
                            }
                            disabled={
                              !item.buka
                            }
                            onChange={(
                              event
                            ) =>
                              handleSpecialScheduleChange(
                                item.hari,
                                "jam_tutup",
                                event.target
                                  .value
                              )
                            }
                            style={{
                              ...styles.timeInput,
                              opacity:
                                item.buka
                                  ? 1
                                  : 0.5,
                            }}
                          />
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>

            <div
              className="jo-formActions" style={styles.formActions}
            >
              <button
                type="button"
                onClick={() => {
                  setShowSpecialForm(
                    false
                  );
                  setEditingSpecialId(
                    null
                  );
                }}
                style={
                  styles.secondaryButton
                }
              >
                Batal
              </button>

              <button
                type="submit"
                disabled={savingSpecial}
                style={{
                  ...styles.primaryButton,
                  opacity: savingSpecial
                    ? 0.7
                    : 1,
                }}
              >
                {savingSpecial
                  ? "Menyimpan..."
                  : editingSpecialId
                  ? "Simpan Perubahan"
                  : "Simpan Periode"}
              </button>
            </div>
          </form>
        )}

        {specialPeriods.length ===
        0 ? (
          <div style={styles.emptyBox}>
            <div
              style={styles.emptyIcon}
            >
              🗓️
            </div>

            <strong>
              Belum ada periode khusus
            </strong>

            <p style={styles.muted}>
              Tambahkan periode khusus
              jika ada perubahan jam buka
              pada tanggal tertentu.
            </p>
          </div>
        ) : (
          <div
            style={styles.periodList}
          >
            {specialPeriods.map(
              (period) => (
                <div
                  key={period.id}
                  style={styles.periodCard}
                >
                  <div
                    className="jo-periodMain" style={styles.periodMain}
                  >
                    <div>
                      <div
                        style={
                          styles.periodTitleRow
                        }
                      >
                        <h3
                          style={
                            styles.periodTitle
                          }
                        >
                          {period.nama}
                        </h3>

                        <span
                          style={{
                            ...styles.statusBadge,
                            ...(period.aktif
                              ? styles.statusActive
                              : styles.statusInactive),
                          }}
                        >
                          {period.aktif
                            ? "Aktif"
                            : "Nonaktif"}
                        </span>
                      </div>

                      <p
                        style={
                          styles.periodDate
                        }
                      >
                        {
                          period.tanggal_mulai
                        }{" "}
                        →{" "}
                        {
                          period.tanggal_selesai
                        }
                      </p>

                      <p
                        style={styles.muted}
                      >
                        Cabang:{" "}
                        <strong>
                          {
                            selectedCabang?.nama
                          }
                        </strong>
                      </p>
                    </div>

                    <div
                      className="jo-periodActions" style={styles.periodActions}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          editSpecial(
                            period
                          )
                        }
                        style={
                          styles.smallSecondaryButton
                        }
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          toggleSpecial(
                            period
                          )
                        }
                        style={
                          styles.smallSecondaryButton
                        }
                      >
                        {period.aktif
                          ? "Nonaktifkan"
                          : "Aktifkan"}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          hapusSpecial(
                            period
                          )
                        }
                        style={
                          styles.smallDangerButton
                        }
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </section>
      <style>{`
        /* Tampilan HP untuk Jam Operasional */
        @media (max-width: 760px) {
          .jo-card { padding: 18px !important; border-radius: 14px !important; }
          .jo-header, .jo-sectionHeader, .jo-specialFormHeader, .jo-periodMain { flex-direction: column !important; align-items: stretch !important; gap: 12px !important; }
          .jo-scheduleRow { grid-template-columns: 1fr 1fr !important; gap: 10px !important; padding: 12px !important; }
          .jo-scheduleRow > :last-child { grid-column: 1 / -1; }
          .jo-formGrid { grid-template-columns: 1fr !important; }
          .jo-periodActions { justify-content: flex-start !important; }
          .jo-formActions { flex-wrap: wrap; }
          .jo-formActions > * { flex: 1 1 auto; }
        }
      `}</style>
    </main>
  );
}

const styles = {
  page: {
    width: "100%",
    maxWidth: "none",
    boxSizing: "border-box",
    padding: "28px",
    color: "#3f2f24",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    marginBottom: "24px",
  },

  title: {
    margin: 0,
    fontSize: "34px",
    lineHeight: 1.2,
    color: "#3f2f24",
  },

  subtitle: {
    margin: "8px 0 0",
    color: "#7d6957",
    fontSize: "15px",
  },

  card: {
    background: "#ffffff",
    border: "1px solid #eadfce",
    borderRadius: "16px",
    padding: "24px",
    marginBottom: "22px",
    boxSizing: "border-box",
    boxShadow:
      "0 5px 18px rgba(61, 43, 32, 0.05)",
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    marginBottom: "20px",
  },

  sectionTitle: {
    margin: 0,
    fontSize: "22px",
    color: "#3f2f24",
  },

  formTitle: {
    margin: 0,
    fontSize: "18px",
    color: "#3f2f24",
  },

  muted: {
    margin: "6px 0 0",
    color: "#7d6957",
    fontSize: "14px",
    lineHeight: 1.6,
  },

  select: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #e0cfbb",
    borderRadius: "10px",
    padding: "13px 14px",
    fontSize: "15px",
    background: "#ffffff",
    color: "#3f2f24",
    fontFamily: "inherit",
  },

  scheduleList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  scheduleRow: {
    display: "grid",
    gridTemplateColumns:
      "minmax(100px, 1fr) minmax(100px, 0.8fr) minmax(220px, 1fr)",
    alignItems: "center",
    gap: "16px",
    padding: "14px 16px",
    border: "1px solid #f0e7db",
    borderRadius: "11px",
    background: "#fcfaf7",
  },

  dayName: {
    fontWeight: 700,
    color: "#3f2f24",
  },

  switchRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    color: "#5c4a3d",
    cursor: "pointer",
  },

  timeGroup: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
  },

  timeInput: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #e0cfbb",
    borderRadius: "8px",
    padding: "10px",
    fontSize: "14px",
    background: "#ffffff",
    color: "#3f2f24",
    fontFamily: "inherit",
  },

  timeDash: {
    color: "#7d6957",
    fontWeight: 700,
  },

  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "20px",
  },

  primaryButton: {
    border: "none",
    borderRadius: "9px",
    padding: "11px 17px",
    background: "#6f4c36",
    color: "#ffffff",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: "14px",
    fontFamily: "inherit",
  },

  secondaryButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "none",
    border: "1px solid #e0cfbb",
    borderRadius: "9px",
    padding: "10px 15px",
    background: "#ffffff",
    color: "#4b3326",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: "14px",
    fontFamily: "inherit",
    boxSizing: "border-box",
  },

  smallSecondaryButton: {
    border: "1px solid #e0cfbb",
    borderRadius: "8px",
    padding: "8px 12px",
    background: "#ffffff",
    color: "#4b3326",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: "13px",
    fontFamily: "inherit",
  },

  smallDangerButton: {
    border: "1px solid #e1b8b8",
    borderRadius: "8px",
    padding: "8px 12px",
    background: "#fff7f7",
    color: "#a33a3a",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: "13px",
    fontFamily: "inherit",
  },

  specialForm: {
    border: "1px solid #eadfce",
    borderRadius: "13px",
    padding: "20px",
    background: "#fcf8f2",
    marginBottom: "22px",
  },

  specialFormHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    marginBottom: "20px",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "18px",
  },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  label: {
    fontWeight: 700,
    color: "#3f2f24",
    fontSize: "14px",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #e0cfbb",
    borderRadius: "9px",
    padding: "11px 12px",
    background: "#ffffff",
    color: "#3f2f24",
    fontSize: "14px",
    fontFamily: "inherit",
  },

  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    minHeight: "42px",
    color: "#5c4a3d",
    fontSize: "14px",
  },

  specialScheduleBox: {
    marginTop: "22px",
    paddingTop: "20px",
    borderTop: "1px solid #f0e7db",
  },

  emptyBox: {
    textAlign: "center",
    padding: "38px 20px",
    border: "1px dashed #e0cfbb",
    borderRadius: "12px",
    background: "#fcfaf7",
  },

  emptyIcon: {
    fontSize: "28px",
    marginBottom: "8px",
  },

  periodList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  periodCard: {
    border: "1px solid #eadfce",
    borderRadius: "12px",
    padding: "18px",
    background: "#ffffff",
  },

  periodMain: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
  },

  periodTitleRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
  },

  periodTitle: {
    margin: 0,
    fontSize: "17px",
    color: "#3f2f24",
  },

  periodDate: {
    margin: "8px 0 0",
    color: "#5b4d43",
    fontWeight: 600,
    fontSize: "14px",
  },

  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: "999px",
    padding: "5px 10px",
    fontSize: "12px",
    fontWeight: 700,
  },

  statusActive: {
    background: "#eaf7ed",
    color: "#2d7b42",
  },

  statusInactive: {
    background: "#f1eeeb",
    color: "#7d6957",
  },

  periodActions: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },

  errorBox: {
    marginBottom: "18px",
    padding: "13px 15px",
    borderRadius: "10px",
    background: "#fff1f1",
    border: "1px solid #e4b8b8",
    color: "#a33a3a",
    fontSize: "14px",
  },

  successBox: {
    marginBottom: "18px",
    padding: "13px 15px",
    borderRadius: "10px",
    background: "#eef9f1",
    border: "1px solid #b9dfc1",
    color: "#2d7040",
    fontSize: "14px",
  },
};
