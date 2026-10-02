"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";

import { useUrut, KolomUrut } from "../Urut";
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

const statusOptions = [
  {
    value: "draft",
    label: "Belum Dipublikasikan",
  },
  {
    value: "dibuka",
    label: "Pendaftaran Dibuka",
  },
  {
    value: "proses_seleksi",
    label: "Proses Seleksi",
  },
  {
    value: "ditutup",
    label: "Lowongan Ditutup",
  },
  {
    value: "terisi",
    label: "Lowongan Telah Terisi",
  },
];

const initialForm = {
  posisi: "",
  gambar_url: "",
  cover_url: "",
  deskripsi: "",
  persyaratan: "",
  lokasi: "",
  google_form_url: "",
  status: "draft",
  tahap_seleksi: "pendaftaran",
  tanggal_buka: "",
  tanggal_tutup: "",
  pengumuman: "",
  aktif: true,
  urutan: 0,
};

function formatTanggal(tanggal) {
  if (!tanggal) return "-";

  const date = new Date(`${tanggal}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return tanggal;
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function isoToDisplayDate(value) {
  if (!value) return "";

  const parts = String(value).split("-");

  if (parts.length !== 3) {
    return "";
  }

  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function displayToIsoDate(value) {
  if (!value) {
    return {
      value: null,
      valid: true,
    };
  }

  const cleaned = String(value)
    .replace(/[^\d]/g, "")
    .slice(0, 8);

  if (cleaned.length !== 8) {
    return {
      value: null,
      valid: false,
    };
  }

  const day = cleaned.slice(0, 2);
  const month = cleaned.slice(2, 4);
  const year = cleaned.slice(4, 8);

  const dayNumber = Number(day);
  const monthNumber = Number(month);
  const yearNumber = Number(year);

  if (
    !Number.isInteger(dayNumber) ||
    !Number.isInteger(monthNumber) ||
    !Number.isInteger(yearNumber)
  ) {
    return {
      value: null,
      valid: false,
    };
  }

  if (
    yearNumber < 1900 ||
    yearNumber > 2100
  ) {
    return {
      value: null,
      valid: false,
    };
  }

  const date = new Date(
    yearNumber,
    monthNumber - 1,
    dayNumber
  );

  if (
    date.getFullYear() !== yearNumber ||
    date.getMonth() !== monthNumber - 1 ||
    date.getDate() !== dayNumber
  ) {
    return {
      value: null,
      valid: false,
    };
  }

  return {
    value: `${year}-${month}-${day}`,
    valid: true,
  };
}

function formatDateInput(value) {
  const digits = String(value)
    .replace(/[^\d]/g, "")
    .slice(0, 8);

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }

  return `${digits.slice(0, 2)}/${digits.slice(
    2,
    4
  )}/${digits.slice(4, 8)}`;
}

function isVideoUrl(url) {
  if (!url) return false;

  return /\.(mp4|webm)(\?.*)?$/i.test(
    String(url)
  );
}

function getMediaTypeFromFile(file) {
  if (!file) return null;

  if (file.type.startsWith("video/")) {
    return "video";
  }

  if (file.type.startsWith("image/")) {
    return "image";
  }

  return null;
}

export default function AdminLokerPage() {
  const [lowongan, setLowongan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("semua");

  const [form, setForm] = useState(initialForm);

  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState("");
  const [mediaType, setMediaType] = useState("");

  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState("");

  const tanggalBukaPickerRef = useRef(null);
  const tanggalTutupPickerRef = useRef(null);

  useEffect(() => {
    loadLowongan();
  }, []);

  async function loadLowongan() {
    setLoading(true);
    setError("");

    const supabase = getSupabase();

    if (!supabase) {
      setError(
        "Koneksi Supabase belum tersedia."
      );
      setLoading(false);
      return;
    }

    const { data, error: fetchError } =
      await supabase
        .from("lowongan_kerja")
        .select(
          "id, posisi, gambar_url, cover_url, deskripsi, persyaratan, lokasi, google_form_url, status, tahap_seleksi, tanggal_buka, tanggal_tutup, pengumuman, aktif, urutan"
        )
        .order("urutan", {
          ascending: true,
        })
        .order("id", {
          ascending: false,
        });

    if (fetchError) {
      console.error(fetchError);

      setError(
        `Gagal mengambil data lowongan: ${fetchError.message}`
      );

      setLoading(false);
      return;
    }

    setLowongan(data || []);
    setLoading(false);
  }

  function handleChange(event) {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm((current) => ({
      ...current,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  }

  function handleDateChange(event) {
    const {
      name,
      value,
    } = event.target;

    setForm((current) => ({
      ...current,
      [name]: formatDateInput(value),
    }));
  }

  function handleNativeDateChange(
    event,
    fieldName
  ) {
    setForm((current) => ({
      ...current,
      [fieldName]: isoToDisplayDate(
        event.target.value
      ),
    }));
  }

  function openDatePicker(ref) {
    const input = ref.current;

    if (!input) return;

    try {
      if (
        typeof input.showPicker ===
        "function"
      ) {
        input.showPicker();
      } else {
        input.click();
      }
    } catch {
      input.click();
    }
  }

  function resetMedia() {
    setMediaFile(null);
    setMediaPreview("");
    setMediaType("");
  }

  function resetCover() {
    setCoverFile(null);
    setCoverPreview("");
  }

  function resetForm() {
    setForm(initialForm);
    setEditingId(null);
    resetMedia();
    resetCover();
  }

  function openAddForm() {
    resetForm();
    setError("");
    setSuccess("");
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function openEditForm(item) {
    setForm({
      posisi: item.posisi || "",
      gambar_url: item.gambar_url || "",
      cover_url: item.cover_url || "",
      deskripsi: item.deskripsi || "",
      persyaratan: item.persyaratan || "",
      lokasi: item.lokasi || "",
      google_form_url:
        item.google_form_url || "",
      status: item.status || "draft",
      tahap_seleksi:
        item.tahap_seleksi ||
        "pendaftaran",
      tanggal_buka:
        isoToDisplayDate(
          item.tanggal_buka
        ),
      tanggal_tutup:
        isoToDisplayDate(
          item.tanggal_tutup
        ),
      pengumuman:
        item.pengumuman || "",
      aktif: Boolean(item.aktif),
      urutan: item.urutan ?? 0,
    });

    setEditingId(item.id);

    setMediaFile(null);
    setMediaPreview(
      item.gambar_url || ""
    );

    setMediaType(
      isVideoUrl(item.gambar_url)
        ? "video"
        : item.gambar_url
        ? "image"
        : ""
    );

    setCoverFile(null);
    setCoverPreview(
      item.cover_url || ""
    );

    setError("");
    setSuccess("");
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function handleMediaChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "video/mp4",
      "video/webm",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        "Format media harus JPG, PNG, WEBP, MP4, atau WEBM."
      );
      event.target.value = "";
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setError(
        "Ukuran foto atau video maksimal 20 MB."
      );
      event.target.value = "";
      return;
    }

    const type =
      getMediaTypeFromFile(file);

    setMediaFile(file);
    setMediaType(type);

    setMediaPreview(
      URL.createObjectURL(file)
    );
  }

  function handleCoverChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        "Cover harus berupa JPG, PNG, atau WEBP."
      );
      event.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError(
        "Ukuran cover maksimal 10 MB."
      );
      event.target.value = "";
      return;
    }

    setCoverFile(file);

    setCoverPreview(
      URL.createObjectURL(file)
    );
  }

  async function uploadMedia() {
    if (!mediaFile) {
      return form.gambar_url || "";
    }

    const extension =
      mediaFile.name
        .split(".")
        .pop()
        ?.toLowerCase() || "jpg";

    const safePosition = (
      form.posisi || "lowongan"
    )
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 50);

    const fileName =
      `${Date.now()}-${safePosition}.${extension}`;

    const filePath =
      `lowongan/${fileName}`;

    const supabase = getSupabase();

    if (!supabase) {
      throw new Error(
        "Koneksi Supabase belum tersedia."
      );
    }

    const { error: uploadError } =
      await supabase.storage
        .from("lowongan-images")
        .upload(
          filePath,
          mediaFile,
          {
            cacheControl: "3600",
            upsert: false,
            contentType: mediaFile.type,
          }
        );

    if (uploadError) {
      throw new Error(
        `Gagal upload media: ${uploadError.message}`
      );
    }

    const { data } =
      supabase.storage
        .from("lowongan-images")
        .getPublicUrl(filePath);

    return data?.publicUrl || "";
  }

  async function uploadCover() {
    if (!coverFile) {
      return form.cover_url || "";
    }

    const extension =
      coverFile.name
        .split(".")
        .pop()
        ?.toLowerCase() || "jpg";

    const safePosition = (
      form.posisi || "lowongan"
    )
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 50);

    const fileName =
      `cover-${Date.now()}-${safePosition}.${extension}`;

    const filePath =
      `lowongan/covers/${fileName}`;

    const supabase = getSupabase();

    if (!supabase) {
      throw new Error(
        "Koneksi Supabase belum tersedia."
      );
    }

    const { error: uploadError } =
      await supabase.storage
        .from("lowongan-images")
        .upload(
          filePath,
          coverFile,
          {
            cacheControl: "3600",
            upsert: false,
            contentType: coverFile.type,
          }
        );

    if (uploadError) {
      throw new Error(
        `Gagal upload cover: ${uploadError.message}`
      );
    }

    const { data } =
      supabase.storage
        .from("lowongan-images")
        .getPublicUrl(filePath);

    return data?.publicUrl || "";
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.posisi.trim()) {
      setError(
        "Nama posisi lowongan wajib diisi."
      );
      return;
    }

    const supabase = getSupabase();

    if (!supabase) {
      setError(
        "Koneksi Supabase belum tersedia."
      );
      return;
    }

    const tanggalBuka =
      displayToIsoDate(
        form.tanggal_buka
      );

    const tanggalTutup =
      displayToIsoDate(
        form.tanggal_tutup
      );

    if (!tanggalBuka.valid) {
      setError(
        "Tanggal buka tidak valid. Gunakan format DD/MM/YYYY."
      );
      return;
    }

    if (!tanggalTutup.valid) {
      setError(
        "Tanggal tutup tidak valid. Gunakan format DD/MM/YYYY."
      );
      return;
    }

    if (
      tanggalBuka.value &&
      tanggalTutup.value &&
      tanggalTutup.value <
        tanggalBuka.value
    ) {
      setError(
        "Tanggal tutup tidak boleh lebih awal dari tanggal buka."
      );
      return;
    }

    setSaving(true);

    try {
      let gambarUrl =
        form.gambar_url || null;

      let coverUrl =
        form.cover_url || null;

      if (mediaFile) {
        gambarUrl =
          await uploadMedia();
      }

      if (coverFile) {
        coverUrl =
          await uploadCover();
      }

      const payload = {
        posisi: form.posisi.trim(),
        gambar_url: gambarUrl,
        cover_url: coverUrl,
        deskripsi:
          form.deskripsi.trim() || null,
        persyaratan:
          form.persyaratan.trim() || null,
        lokasi:
          form.lokasi.trim() || null,
        google_form_url:
          form.google_form_url.trim() ||
          null,
        status: form.status,
        tahap_seleksi:
          form.tahap_seleksi,
        tanggal_buka:
          tanggalBuka.value,
        tanggal_tutup:
          tanggalTutup.value,
        pengumuman:
          form.pengumuman.trim() || null,
        aktif: Boolean(form.aktif),
        urutan:
          Number(form.urutan) || 0,
      };

      let result;

      if (editingId) {
        result = await supabase
          .from("lowongan_kerja")
          .update(payload)
          .eq("id", editingId)
          .select("id")
          .single();
      } else {
        result = await supabase
          .from("lowongan_kerja")
          .insert(payload)
          .select("id")
          .single();
      }

      if (result.error) {
        throw new Error(
          `Gagal menyimpan lowongan: ${result.error.message}`
        );
      }

      setSuccess(
        editingId
          ? "Lowongan berhasil diperbarui."
          : "Lowongan berhasil ditambahkan."
      );

      resetForm();
      setShowForm(false);

      await loadLowongan();

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err) {
      console.error(err);

      setError(
        err?.message ||
          "Terjadi kesalahan saat menyimpan lowongan."
      );
    } finally {
      setSaving(false);
    }
  }

  async function hapusLowongan(item) {
    const yakin = window.confirm(
      `Hapus lowongan "${item.posisi}"?\n\nData lowongan ini akan dihapus dari database.`
    );

    if (!yakin) return;

    setProcessingId(item.id);
    setError("");
    setSuccess("");

    const supabase = getSupabase();

    if (!supabase) {
      setError(
        "Koneksi Supabase belum tersedia."
      );
      setProcessingId(null);
      return;
    }

    const { error: deleteError } =
      await supabase
        .from("lowongan_kerja")
        .delete()
        .eq("id", item.id);

    if (deleteError) {
      setError(
        `Gagal menghapus lowongan: ${deleteError.message}`
      );
      setProcessingId(null);
      return;
    }

    setLowongan((current) =>
      current.filter(
        (currentItem) =>
          currentItem.id !== item.id
      )
    );

    setProcessingId(null);
    setSuccess(
      "Lowongan berhasil dihapus."
    );
  }

  async function toggleAktif(item) {
    setProcessingId(item.id);
    setError("");
    setSuccess("");

    const supabase = getSupabase();

    if (!supabase) {
      setError(
        "Koneksi Supabase belum tersedia."
      );
      setProcessingId(null);
      return;
    }

    const { error: updateError } =
      await supabase
        .from("lowongan_kerja")
        .update({
          aktif: !item.aktif,
        })
        .eq("id", item.id);

    if (updateError) {
      setError(
        `Gagal mengubah status: ${updateError.message}`
      );
      setProcessingId(null);
      return;
    }

    setLowongan((current) =>
      current.map((currentItem) =>
        currentItem.id === item.id
          ? {
              ...currentItem,
              aktif: !currentItem.aktif,
            }
          : currentItem
      )
    );

    setProcessingId(null);

    setSuccess(
      item.aktif
        ? "Lowongan berhasil dinonaktifkan."
        : "Lowongan berhasil diaktifkan."
    );
  }

  const filteredLowongan =
    lowongan.filter((item) => {
      const keyword = search
        .trim()
        .toLowerCase();

      const matchesSearch =
        !keyword ||
        (item.posisi || "")
          .toLowerCase()
          .includes(keyword) ||
        (item.lokasi || "")
          .toLowerCase()
          .includes(keyword);

      const matchesFilter =
        filter === "semua" ||
        (filter === "aktif" &&
          item.aktif) ||
        (filter === "nonaktif" &&
          !item.aktif) ||
        (filter === "dibuka" &&
          item.status === "dibuka") ||
        (filter === "proses" &&
          item.status ===
            "proses_seleksi");

      return (
        matchesSearch &&
        matchesFilter
      );
    });

  const totalLowongan =
    lowongan.length;

  const aktif = lowongan.filter(
    (item) => item.aktif
  ).length;

  const dibuka = lowongan.filter(
    (item) =>
      item.status === "dibuka" &&
      item.aktif
  ).length;

  const nonaktif =
    lowongan.filter(
      (item) => !item.aktif
    ).length;


  const urut = useUrut(filteredLowongan, {
    k0: (x) => Number(x.urutan ?? 0),
    k1: (x) => x.posisi,
    k2: (x) => x.lokasi,
    k3: (x) => x.status,
    k4: (x) => x.tahap_seleksi,
    k5: (x) => x.tanggal_buka,
    k6: (x) => x.aktif,
  });

  return (
    <main className="lokerAdminPage">
      <div className="page">
        <div className="topbar">
          <div>
            <div className="eyebrow">
              ADMINISTRASI WEBSITE
            </div>

            <h1>Lowongan Kerja</h1>

            <p>
              Kelola informasi lowongan kerja
              yang ditampilkan pada halaman publik.
            </p>
          </div>

          <div className="topActions">
            <Link
              href="/loker"
              target="_blank"
              className="previewButton"
            >
              👁 Lihat Halaman Loker
            </Link>

            <button
              type="button"
              className="addButton"
              onClick={openAddForm}
            >
              + Tambah Lowongan
            </button>
          </div>
        </div>

        {success && (
          <div className="success">
            ✓ {success}
          </div>
        )}

        {error && (
          <div className="error">
            {error}
          </div>
        )}

        <div className="summary">
          <div className="summaryCard">
            <span>Total Lowongan</span>
            <strong>
              {totalLowongan}
            </strong>
          </div>

          <div className="summaryCard">
            <span>Aktif</span>
            <strong>{aktif}</strong>
          </div>

          <div className="summaryCard">
            <span>Pendaftaran Dibuka</span>
            <strong>{dibuka}</strong>
          </div>

          <div className="summaryCard">
            <span>Nonaktif</span>
            <strong>
              {nonaktif}
            </strong>
          </div>
        </div>

        {showForm && (
          <section className="formCard">
            <div className="formHeader">
              <div>
                <div className="eyebrow">
                  {editingId
                    ? "EDIT LOWONGAN"
                    : "LOWONGAN BARU"}
                </div>

                <h2>
                  {editingId
                    ? "Edit Lowongan Kerja"
                    : "Tambah Lowongan Kerja"}
                </h2>

                <p>
                  Isi informasi lowongan yang akan
                  ditampilkan kepada calon pelamar.
                </p>
              </div>

              <button
                type="button"
                className="closeButton"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="formGrid">
                <div className="field full">
                  <label htmlFor="posisi">
                    Posisi Lowongan *
                  </label>

                  <input
                    id="posisi"
                    name="posisi"
                    value={form.posisi}
                    onChange={handleChange}
                    placeholder="Contoh: Staff Toko"
                    required
                  />
                </div>

                <div className="field">
                  <label htmlFor="lokasi">
                    Lokasi
                  </label>

                  <input
                    id="lokasi"
                    name="lokasi"
                    value={form.lokasi}
                    onChange={handleChange}
                    placeholder="Contoh: Sinar Kasih Kota"
                  />
                </div>

                <div className="field">
                  <label htmlFor="urutan">
                    Urutan Tampil
                  </label>

                  <input
                    id="urutan"
                    name="urutan"
                    type="number"
                    min="0"
                    value={form.urutan}
                    onChange={handleChange}
                  />
                </div>

                <div className="field">
                  <label htmlFor="status">
                    Status Lowongan
                  </label>

                  <select
                    id="status"
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                  >
                    {statusOptions.map(
                      (option) => (
                        <option
                          key={option.value}
                          value={option.value}
                        >
                          {option.label}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="tahap_seleksi">
                    Tahap Seleksi
                  </label>

                  <select
                    id="tahap_seleksi"
                    name="tahap_seleksi"
                    value={
                      form.tahap_seleksi
                    }
                    onChange={handleChange}
                  >
                    {tahapSeleksi.map(
                      (item) => (
                        <option
                          key={item.key}
                          value={item.key}
                        >
                          {item.nomor} —{" "}
                          {item.judul}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="field">
                  <label>
                    Tanggal Buka
                  </label>

                  <div className="dateWrapper">
                    <input
                      className="dateDisplay"
                      name="tanggal_buka"
                      value={
                        form.tanggal_buka
                      }
                      onChange={
                        handleDateChange
                      }
                      placeholder="DD/MM/YYYY"
                      inputMode="numeric"
                      maxLength={10}
                      autoComplete="off"
                    />

                    <button
                      type="button"
                      className="calendarButton"
                      onClick={() =>
                        openDatePicker(
                          tanggalBukaPickerRef
                        )
                      }
                    >
                      📅
                    </button>

                    <input
                      ref={
                        tanggalBukaPickerRef
                      }
                      type="date"
                      className="hiddenDatePicker"
                      value={
                        displayToIsoDate(
                          form.tanggal_buka
                        ).value || ""
                      }
                      onChange={(event) =>
                        handleNativeDateChange(
                          event,
                          "tanggal_buka"
                        )
                      }
                      tabIndex={-1}
                      aria-hidden="true"
                    />
                  </div>

                  <small>
                    Pilih dari kalender atau ketik
                    DD/MM/YYYY.
                  </small>
                </div>

                <div className="field">
                  <label>
                    Tanggal Tutup
                  </label>

                  <div className="dateWrapper">
                    <input
                      className="dateDisplay"
                      name="tanggal_tutup"
                      value={
                        form.tanggal_tutup
                      }
                      onChange={
                        handleDateChange
                      }
                      placeholder="DD/MM/YYYY"
                      inputMode="numeric"
                      maxLength={10}
                      autoComplete="off"
                    />

                    <button
                      type="button"
                      className="calendarButton"
                      onClick={() =>
                        openDatePicker(
                          tanggalTutupPickerRef
                        )
                      }
                    >
                      📅
                    </button>

                    <input
                      ref={
                        tanggalTutupPickerRef
                      }
                      type="date"
                      className="hiddenDatePicker"
                      value={
                        displayToIsoDate(
                          form.tanggal_tutup
                        ).value || ""
                      }
                      onChange={(event) =>
                        handleNativeDateChange(
                          event,
                          "tanggal_tutup"
                        )
                      }
                      tabIndex={-1}
                      aria-hidden="true"
                    />
                  </div>

                  <small>
                    Pilih dari kalender atau ketik
                    DD/MM/YYYY.
                  </small>
                </div>

                <div className="field full">
                  <label>
                    Foto / Video Lowongan
                  </label>

                  <div className="mediaUploadBox">
                    <div className="mediaPreview">
                      {mediaPreview &&
                      mediaType === "video" ? (
                        <video
                          src={mediaPreview}
                          poster={
                            coverPreview ||
                            form.cover_url ||
                            undefined
                          }
                          muted
                          autoPlay
                          loop
                          controls
                          playsInline
                          preload="auto"
                          className="mediaPreviewContent"
                        />
                      ) : mediaPreview ? (
                        <img
                          src={mediaPreview}
                          alt="Preview media lowongan"
                          className="mediaPreviewContent"
                        />
                      ) : (
                        <div className="mediaPlaceholder">
                          <span>🖼️</span>
                          <small>
                            Belum ada media
                          </small>
                        </div>
                      )}
                    </div>

                    <div className="mediaUploadInfo">
                      <strong>
                        Upload foto atau video
                      </strong>

                      <p>
                        Bisa menggunakan:
                      </p>

                      <ul>
                        <li>
                          JPG, PNG, WEBP
                        </li>
                        <li>
                          MP4, WEBM
                        </li>
                        <li>
                          Maksimal 20 MB
                        </li>
                      </ul>

                      {mediaFile && (
                        <div className="selectedMedia">
                          <strong>
                            File dipilih:
                          </strong>

                          <span>
                            {mediaFile.name}
                          </span>
                        </div>
                      )}

                      <label className="chooseMediaButton">
                        📁 Pilih Foto / Video

                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
                          onChange={
                            handleMediaChange
                          }
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="field full">
                  <label>
                    Cover / Thumbnail Video
                    <span className="optionalText">
                      {" "}
                      (Opsional)
                    </span>
                  </label>

                  <div className="coverUploadBox">
                    <div className="coverPreview">
                      {coverPreview ? (
                        <img
                          src={coverPreview}
                          alt="Preview cover lowongan"
                          className="coverPreviewImage"
                        />
                      ) : (
                        <div className="coverPlaceholder">
                          <span>🖼️</span>
                          <small>
                            Cover belum diisi
                          </small>
                        </div>
                      )}
                    </div>

                    <div className="coverInfo">
                      <strong>
                        Cover tidak wajib
                      </strong>

                      <p>
                        Cover digunakan sebagai gambar
                        depan video.
                      </p>

                      <p>
                        Jika cover tidak diisi, video
                        tetap dapat digunakan.
                      </p>

                      {coverFile && (
                        <div className="selectedMedia">
                          <strong>
                            Cover dipilih:
                          </strong>

                          <span>
                            {coverFile.name}
                          </span>
                        </div>
                      )}

                      <label className="chooseMediaButton">
                        🖼️ Pilih Cover

                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={
                            handleCoverChange
                          }
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="field full">
                  <label htmlFor="deskripsi">
                    Deskripsi Posisi
                  </label>

                  <textarea
                    id="deskripsi"
                    name="deskripsi"
                    rows="6"
                    value={form.deskripsi}
                    onChange={handleChange}
                    placeholder="Jelaskan posisi dan pekerjaan yang ditawarkan..."
                  />
                </div>

                <div className="field full">
                  <label htmlFor="persyaratan">
                    Persyaratan
                  </label>

                  <textarea
                    id="persyaratan"
                    name="persyaratan"
                    rows="7"
                    value={
                      form.persyaratan
                    }
                    onChange={handleChange}
                    placeholder={
                      "Contoh:\nUsia maksimal 30 tahun\nPendidikan minimal SMA/SMK\nMampu bekerja dalam tim"
                    }
                  />

                  <small>
                    Gunakan baris baru untuk setiap
                    persyaratan.
                  </small>
                </div>

                <div className="field full">
                  <label htmlFor="google_form_url">
                    Link Google Form Lamaran
                  </label>

                  <input
                    id="google_form_url"
                    name="google_form_url"
                    type="url"
                    value={
                      form.google_form_url
                    }
                    onChange={handleChange}
                    placeholder="https://forms.google.com/..."
                  />
                </div>

                <div className="field full">
                  <label htmlFor="pengumuman">
                    Pengumuman
                  </label>

                  <textarea
                    id="pengumuman"
                    name="pengumuman"
                    rows="4"
                    value={
                      form.pengumuman
                    }
                    onChange={handleChange}
                    placeholder="Contoh: Pelamar yang lolos akan dihubungi melalui WhatsApp."
                  />
                </div>

                <div className="field full">
                  <label className="checkLabel">
                    <input
                      type="checkbox"
                      name="aktif"
                      checked={form.aktif}
                      onChange={handleChange}
                    />

                    <span>
                      Tampilkan lowongan ini di
                      website publik
                    </span>
                  </label>
                </div>
              </div>

              <div className="formActions">
                <button
                  type="button"
                  className="cancelButton"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  disabled={saving}
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="saveButton"
                  disabled={saving}
                >
                  {saving
                    ? "Menyimpan..."
                    : editingId
                    ? "Simpan Perubahan"
                    : "Simpan Lowongan"}
                </button>
              </div>
            </form>
          </section>
        )}

        <div className="toolbar">
          <div className="searchWrap">
            <input
              type="search"
              placeholder="Cari posisi atau lokasi..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />

            {search && (
              <button
                type="button"
                className="clearSearch"
                onClick={() =>
                  setSearch("")
                }
              >
                ×
              </button>
            )}
          </div>

          <div className="filters">
            {[
              ["semua", "Semua"],
              ["aktif", "Aktif"],
              ["dibuka", "Dibuka"],
              ["proses", "Proses"],
              ["nonaktif", "Nonaktif"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={`filter ${
                  filter === value
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setFilter(value)
                }
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="tableWrap">
            {loading ? (
              <div className="empty">
                <div className="emptyIcon">
                  ⏳
                </div>
                <strong>
                  Memuat data lowongan...
                </strong>
              </div>
            ) : filteredLowongan.length ===
              0 ? (
              <div className="empty">
                <div className="emptyIcon">
                  💼
                </div>

                <strong>
                  Belum ada lowongan
                </strong>

                <p>
                  Tambahkan lowongan kerja untuk
                  ditampilkan di website.
                </p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <KolomUrut urut={urut} kunci="k0">Urutan</KolomUrut>
                    <KolomUrut urut={urut} kunci="k1">Posisi</KolomUrut>
                    <KolomUrut urut={urut} kunci="k2">Lokasi</KolomUrut>
                    <KolomUrut urut={urut} kunci="k3">Status</KolomUrut>
                    <KolomUrut urut={urut} kunci="k4">Tahap</KolomUrut>
                    <KolomUrut urut={urut} kunci="k5">Periode</KolomUrut>
                    <KolomUrut urut={urut} kunci="k6">Tampil</KolomUrut>
                    <th>Aksi</th>
                  </tr>
                </thead>

                <tbody>
                  {urut.data.map(
                    (item) => {
                      const video =
                        isVideoUrl(
                          item.gambar_url
                        );

                      return (
                        <tr key={item.id}>
                          <td>
                            {item.urutan ?? 0}
                          </td>

                          <td>
                            <div className="positionCell">
                              {video ? (
                                <div className="thumbMedia">
                                  {item.cover_url ? (
                                    <img
                                      src={
                                        item.cover_url
                                      }
                                      alt={`Thumbnail ${item.posisi}`}
                                      className="thumb"
                                    />
                                  ) : (
                                    <video
                                      src={
                                        item.gambar_url
                                      }
                                      muted
                                      autoPlay
                                      loop
                                      playsInline
                                      preload="auto"
                                      className="thumb thumbVideo"
                                    />
                                  )}

                                  <span className="videoPlayBadge">
                                    ▶
                                  </span>
                                </div>
                              ) : item.gambar_url ? (
                                <img
                                  src={
                                    item.gambar_url
                                  }
                                  alt={`Thumbnail ${item.posisi}`}
                                  className="thumb"
                                />
                              ) : (
                                <div className="thumbPlaceholder">
                                  💼
                                </div>
                              )}

                              <div>
                                <strong>
                                  {item.posisi}
                                </strong>

                                <small>
                                  ID #{item.id}
                                </small>
                              </div>
                            </div>
                          </td>

                          <td>
                            {item.lokasi ||
                              "-"}
                          </td>

                          <td>
                            <span
                              className={`status status-${item.status}`}
                            >
                              {statusOptions.find(
                                (option) =>
                                  option.value ===
                                  item.status
                              )?.label ||
                                "Belum Dipublikasikan"}
                            </span>
                          </td>

                          <td>
                            {tahapSeleksi.find(
                              (stage) =>
                                stage.key ===
                                item.tahap_seleksi
                            )?.judul ||
                              "Pendaftaran"}
                          </td>

                          <td>
                            <div className="dateCell">
                              <span>
                                {formatTanggal(
                                  item.tanggal_buka
                                )}
                              </span>

                              <small>
                                sampai{" "}
                                {formatTanggal(
                                  item.tanggal_tutup
                                )}
                              </small>
                            </div>
                          </td>

                          <td>
                            <button
                              type="button"
                              className={`toggle ${
                                item.aktif
                                  ? "active"
                                  : ""
                              }`}
                              onClick={() =>
                                toggleAktif(item)
                              }
                              disabled={
                                processingId ===
                                item.id
                              }
                            >
                              {item.aktif
                                ? "Aktif"
                                : "Nonaktif"}
                            </button>
                          </td>

                          <td>
                            <div className="actions">
                              <button
                                type="button"
                                className="editButton"
                                onClick={() =>
                                  openEditForm(
                                    item
                                  )
                                }
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                className="deleteButton"
                                onClick={() =>
                                  hapusLowongan(
                                    item
                                  )
                                }
                                disabled={
                                  processingId ===
                                  item.id
                                }
                              >
                                Hapus
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .lokerAdminPage {
          width: 100%;
          min-width: 0;
          box-sizing: border-box;
          color: #3f2f24;
        }

        .page {
          width: 100%;
          min-width: 0;
          box-sizing: border-box;
        }

        .topbar {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 20px;
          margin-bottom: 24px;
        }

        .eyebrow {
          margin-bottom: 6px;
          color: #9a806a;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.08em;
        }

        h1 {
          margin: 0 0 7px;
          color: #3f2f24;
          font-size: 30px;
          line-height: 1.2;
        }

        .topbar p {
          margin: 0;
          color: #76685d;
        }

        .topActions {
          display: flex;
          gap: 10px;
          align-items: center;
          flex-wrap: wrap;
        }

        .previewButton,
        .addButton {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 44px;
          padding: 0 18px;
          border-radius: 8px;
          box-sizing: border-box;
          text-decoration: none;
          font-weight: 700;
          font-size: 14px;
          white-space: nowrap;
          cursor: pointer;
        }

        .previewButton {
          background: #fff;
          border: 1px solid #cfc1b1;
          color: #4b3326;
        }

        .previewButton:hover {
          background: #f3eadf;
        }

        .addButton {
          border: 1px solid #4b3326;
          background: #4b3326;
          color: #fff;
        }

        .addButton:hover {
          background: #39251b;
        }

        .success,
        .error {
          margin-bottom: 18px;
          padding: 14px 16px;
          border-radius: 9px;
          font-weight: 600;
        }

        .success {
          background: #e9f7ed;
          border: 1px solid #b9dfc4;
          color: #28713a;
        }

        .error {
          background: #fff0f0;
          border: 1px solid #e4bcbc;
          color: #9b2929;
        }

        .summary {
          display: grid;
          grid-template-columns: repeat(
            4,
            minmax(0, 1fr)
          );
          gap: 18px;
          margin-bottom: 22px;
        }

        .summaryCard {
          background: #fff;
          border: 1px solid #dfd2c3;
          border-radius: 12px;
          padding: 20px;
        }

        .summaryCard span {
          display: block;
          color: #76685d;
          margin-bottom: 8px;
          font-size: 13px;
        }

        .summaryCard strong {
          font-size: 28px;
          color: #3f2f24;
        }

        .formCard {
          margin-bottom: 24px;
          padding: 24px;
          background: #fff;
          border: 1px solid #dfd2c3;
          border-radius: 14px;
          box-shadow:
            0 8px 25px
            rgba(75, 51, 38, 0.05);
        }

        .formHeader {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 24px;
          padding-bottom: 18px;
          border-bottom: 1px solid #eee5dc;
        }

        .formHeader h2 {
          margin: 0 0 6px;
          color: #3f2f24;
          font-size: 22px;
        }

        .formHeader p {
          margin: 0;
          color: #76685d;
          font-size: 13px;
        }

        .closeButton {
          width: 38px;
          height: 38px;
          flex-shrink: 0;
          border: 1px solid #d8cabc;
          border-radius: 8px;
          background: #fff;
          color: #6c5b50;
          font-size: 25px;
          line-height: 1;
          cursor: pointer;
        }

        .formGrid {
          display: grid;
          grid-template-columns: repeat(
            2,
            minmax(0, 1fr)
          );
          gap: 18px;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .field.full {
          grid-column: 1 / -1;
        }

        .field label {
          color: #4b3326;
          font-size: 13px;
          font-weight: 700;
        }

        .optionalText {
          color: #9a806a;
          font-weight: 500;
        }

        .field input,
        .field select,
        .field textarea {
          width: 100%;
          box-sizing: border-box;
          padding: 12px 13px;
          border: 1px solid #cfc1b1;
          border-radius: 8px;
          background: #fff;
          color: #3f2f24;
          font-family: inherit;
          font-size: 14px;
          outline: none;
        }

        .field textarea {
          resize: vertical;
          line-height: 1.6;
        }

        .field input:focus,
        .field select:focus,
        .field textarea:focus {
          border-color: #8d6c53;
          box-shadow:
            0 0 0 3px
            rgba(141, 108, 83, 0.1);
        }

        .field small {
          color: #8a796e;
          font-size: 11px;
        }

        .dateWrapper {
          position: relative;
          width: 100%;
        }

        .dateDisplay {
          padding-right: 50px !important;
        }

        .calendarButton {
          position: absolute;
          right: 7px;
          top: 50%;
          transform: translateY(-50%);
          width: 35px;
          height: 35px;
          border: none;
          border-radius: 7px;
          background: #f3eadf;
          color: #4b3326;
          cursor: pointer;
          z-index: 3;
          font-size: 17px;
        }

        .hiddenDatePicker {
          position: absolute;
          width: 1px;
          height: 1px;
          opacity: 0;
          pointer-events: none;
          left: 0;
          bottom: 0;
        }

        .mediaUploadBox,
        .coverUploadBox {
          display: grid;
          grid-template-columns:
            220px minmax(0, 1fr);
          gap: 20px;
          padding: 18px;
          border: 1px dashed #cfc1b1;
          border-radius: 12px;
          background: #faf7f3;
        }

        .coverUploadBox {
          grid-template-columns:
            220px minmax(0, 1fr);
        }

        .mediaPreview,
        .coverPreview {
          width: 100%;
          height: 145px;
          overflow: hidden;
          border-radius: 10px;
          background: #f0e8df;
          border: 1px solid #dfd2c3;
        }

        .mediaPreviewContent {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: contain;
          background: #f0e8df;
        }

        .coverPreviewImage {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .mediaPlaceholder,
        .coverPlaceholder {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 7px;
          color: #9a806a;
        }

        .mediaPlaceholder span,
        .coverPlaceholder span {
          font-size: 32px;
        }

        .mediaPlaceholder small,
        .coverPlaceholder small {
          font-size: 11px;
          color: #8a796e;
        }

        .mediaUploadInfo,
        .coverInfo {
          min-width: 0;
        }

        .mediaUploadInfo > strong,
        .coverInfo > strong {
          display: block;
          margin-bottom: 5px;
          color: #4b3326;
          font-size: 15px;
        }

        .mediaUploadInfo p,
        .coverInfo p {
          margin: 0 0 6px;
          color: #76685d;
          font-size: 13px;
          line-height: 1.5;
        }

        .mediaUploadInfo ul {
          margin: 4px 0 12px;
          padding-left: 18px;
          color: #76685d;
          font-size: 12px;
          line-height: 1.6;
        }

        .selectedMedia {
          display: flex;
          flex-direction: column;
          gap: 2px;
          margin-bottom: 12px;
          padding: 9px 11px;
          border-radius: 7px;
          background: #f1e9e0;
          color: #5f5045;
          font-size: 12px;
        }

        .selectedMedia span {
          word-break: break-all;
        }

        .chooseMediaButton {
          display: inline-flex !important;
          align-items: center;
          justify-content: center;
          min-height: 40px;
          padding: 0 14px;
          border-radius: 8px;
          background: #4b3326;
          color: #fff !important;
          cursor: pointer;
          font-size: 13px !important;
          font-weight: 700 !important;
        }

        .chooseMediaButton input {
          display: none;
        }

        .checkLabel {
          display: flex !important;
          flex-direction: row !important;
          align-items: center;
          gap: 10px;
          padding: 13px 14px;
          border: 1px solid #dfd2c3;
          border-radius: 9px;
          background: #faf6f0;
          cursor: pointer;
        }

        .checkLabel input {
          width: 18px;
          height: 18px;
          margin: 0;
        }

        .formActions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid #eee5dc;
        }

        .cancelButton,
        .saveButton {
          min-height: 44px;
          padding: 0 18px;
          border-radius: 8px;
          font-weight: 700;
          cursor: pointer;
        }

        .cancelButton {
          border: 1px solid #cfc1b1;
          background: #fff;
          color: #4b3326;
        }

        .saveButton {
          border: 1px solid #4b3326;
          background: #4b3326;
          color: #fff;
        }

        .toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          margin-bottom: 18px;
        }

        .searchWrap {
          position: relative;
          flex: 1;
          max-width: 550px;
        }

        .searchWrap input {
          width: 100%;
          box-sizing: border-box;
          padding: 12px 42px 12px 14px;
          border: 1px solid #cfc1b1;
          border-radius: 8px;
          background: #fff;
          font-size: 14px;
          color: #3f2f24;
        }

        .clearSearch {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          width: 28px;
          height: 28px;
          border: none;
          background: transparent;
          color: #76685d;
          font-size: 23px;
          cursor: pointer;
        }

        .filters {
          display: flex;
          gap: 7px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .filter {
          padding: 10px 14px;
          border: 1px solid #cfc1b1;
          background: #fff;
          color: #4b3326;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
        }

        .filter.active {
          background: #4b3326;
          color: #fff;
          border-color: #4b3326;
        }

        .card {
          width: 100%;
          background: #fff;
          border: 1px solid #dfd2c3;
          border-radius: 12px;
          overflow: hidden;
        }

        .tableWrap {
          width: 100%;
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          min-width: 1150px;
        }

        th,
        td {
          padding: 14px;
          border-bottom: 1px solid #eee5dc;
          text-align: left;
          vertical-align: middle;
        }

        th {
          background: #faf6f0;
          color: #5f5045;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        tbody tr:last-child td {
          border-bottom: none;
        }

        .positionCell {
          display: flex;
          align-items: center;
          gap: 11px;
          min-width: 230px;
        }

        .positionCell strong {
          display: block;
          color: #3f2f24;
          font-size: 14px;
          margin-bottom: 3px;
        }

        .positionCell small {
          color: #9a8b80;
          font-size: 11px;
        }

        .thumbMedia {
          position: relative;
          width: 48px;
          height: 48px;
          flex-shrink: 0;
          overflow: hidden;
          border-radius: 8px;
          background: #f3eadf;
        }

        .thumb {
          display: block;
          width: 48px;
          height: 48px;
          flex-shrink: 0;
          border-radius: 8px;
          object-fit: cover;
        }

        .thumbVideo {
          background: #f3eadf;
        }

        .videoPlayBadge {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 23px;
          height: 23px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: rgba(
            63,
            47,
            36,
            0.92
          );
          color: #fff;
          font-size: 10px;
          line-height: 1;
          box-shadow:
            0 2px 7px
            rgba(0, 0, 0, 0.22);
          pointer-events: none;
        }

        .thumbPlaceholder {
          width: 48px;
          height: 48px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          background: #f3eadf;
          color: #755337;
          font-size: 22px;
        }

        .status {
          display: inline-flex;
          align-items: center;
          min-height: 28px;
          padding: 5px 9px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 800;
          white-space: nowrap;
        }

        .status-draft {
          background: #f1eeee;
          color: #7a6d68;
        }

        .status-dibuka {
          background: #dcf8e7;
          color: #16834b;
        }

        .status-proses_seleksi {
          background: #e5f0ff;
          color: #3575c5;
        }

        .status-ditutup {
          background: #f0e9e5;
          color: #80695d;
        }

        .status-terisi {
          background: #eee5ff;
          color: #7650c9;
        }

        .dateCell span,
        .dateCell small {
          display: block;
        }

        .dateCell span {
          color: #4b3326;
          font-weight: 600;
          font-size: 13px;
        }

        .dateCell small {
          margin-top: 3px;
          color: #918178;
          font-size: 11px;
        }

        .toggle {
          min-width: 78px;
          padding: 7px 10px;
          border: none;
          border-radius: 999px;
          background: #f1eeee;
          color: #796d68;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        .toggle.active {
          background: #e8f5e9;
          color: #2f6d35;
        }

        .toggle:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .actions {
          display: flex;
          gap: 7px;
          align-items: center;
        }

        .editButton,
        .deleteButton {
          padding: 8px 12px;
          border-radius: 7px;
          border: none;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
        }

        .editButton {
          background: #f3eadf;
          color: #4b3326;
        }

        .deleteButton {
          background: #f7dddd;
          color: #9b2929;
        }

        .deleteButton:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .empty {
          padding: 55px 30px;
          text-align: center;
          color: #76685d;
        }

        .emptyIcon {
          margin-bottom: 12px;
          font-size: 40px;
        }

        .empty strong {
          display: block;
          color: #4b3326;
          font-size: 17px;
        }

        .empty p {
          margin: 7px 0 0;
          color: #8b7a70;
          font-size: 13px;
        }

        @media (max-width: 1100px) {
          .summary {
            grid-template-columns:
              repeat(
                2,
                minmax(0, 1fr)
              );
          }

          .topbar {
            align-items: flex-start;
            flex-direction: column;
          }

          .toolbar {
            align-items: stretch;
            flex-direction: column;
          }

          .searchWrap {
            max-width: none;
          }

          .filters {
            justify-content: flex-start;
          }
        }

        @media (max-width: 800px) {
          .formGrid {
            grid-template-columns: 1fr;
          }

          .field.full {
            grid-column: auto;
          }

          .summary {
            grid-template-columns: 1fr;
          }

          .topActions {
            width: 100%;
          }

          .previewButton,
          .addButton {
            flex: 1;
          }

          .filters {
            width: 100%;
          }

          .filter {
            flex: 1;
          }

          .mediaUploadBox,
          .coverUploadBox {
            grid-template-columns: 1fr;
          }

          .mediaPreview,
          .coverPreview {
            max-width: 320px;
          }
        }

        @media (max-width: 520px) {
          h1 {
            font-size: 26px;
          }

          .formCard {
            padding: 18px;
          }

          .formActions {
            flex-direction: column-reverse;
          }

          .cancelButton,
          .saveButton {
            width: 100%;
          }

          .topActions {
            flex-direction: column;
          }

          .previewButton,
          .addButton {
            width: 100%;
            flex: none;
          }
        }
      `}</style>
    </main>
  );
}
