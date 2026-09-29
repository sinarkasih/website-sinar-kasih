"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";

const tahapSeleksi = [
  { value: "pendaftaran", label: "Pendaftaran" },
  { value: "seleksi_berkas", label: "Seleksi Berkas" },
  { value: "psikotest", label: "Psikotest" },
  { value: "interview", label: "Interview" },
  { value: "tes_kerja", label: "Tes Kerja" },
  { value: "pengumuman", label: "Pengumuman" },
];

const statusOptions = [
  { value: "draft", label: "Draft" },
  { value: "dibuka", label: "Pendaftaran Dibuka" },
  { value: "proses_seleksi", label: "Proses Seleksi" },
  { value: "ditutup", label: "Lowongan Ditutup" },
  { value: "terisi", label: "Lowongan Telah Terisi" },
];

const initialForm = {
  posisi: "",
  lokasi: "",
  deskripsi: "",
  persyaratan: "",
  google_form_url: "",
  status: "draft",
  tahap_seleksi: "pendaftaran",
  tanggal_buka: "",
  tanggal_tutup: "",
  pengumuman: "",
  urutan: 0,
  aktif: true,
  gambar_url: "",
};

function isoToDisplayDate(value) {
  if (!value) return "";

  const parts = String(value).split("-");

  if (parts.length !== 3) return "";

  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function displayToIsoDate(value) {
  if (!value) {
    return {
      value: null,
      valid: true,
    };
  }

  const cleaned = value.replace(/[^\d]/g, "");

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

  if (yearNumber < 1900 || yearNumber > 2100) {
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
  const digits = value.replace(/[^\d]/g, "").slice(0, 8);

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

function isoToDateInput(value) {
  if (!value) return "";

  return value;
}

function getStatusInfo(status) {
  const map = {
    dibuka: {
      label: "PENDAFTARAN DIBUKA",
      background: "#dcfce7",
      color: "#166534",
    },
    proses_seleksi: {
      label: "PROSES SELEKSI",
      background: "#dbeafe",
      color: "#1d4ed8",
    },
    ditutup: {
      label: "LOWONGAN DITUTUP",
      background: "#fee2e2",
      color: "#991b1b",
    },
    terisi: {
      label: "LOWONGAN TELAH TERISI",
      background: "#f3f4f6",
      color: "#374151",
    },
    draft: {
      label: "DRAFT",
      background: "#fef3c7",
      color: "#92400e",
    },
  };

  return (
    map[status] || {
      label: status || "DRAFT",
      background: "#f3f4f6",
      color: "#374151",
    }
  );
}

function getTahapLabel(value) {
  const item = tahapSeleksi.find(
    (item) => item.value === value
  );

  return item ? item.label : value || "-";
}

export default function AdminLokerPage() {
  const supabase = getSupabase();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [lowongan, setLowongan] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("semua");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState(initialForm);

  const [gambarFile, setGambarFile] = useState(null);
  const [gambarPreview, setGambarPreview] = useState("");

  const tanggalBukaPickerRef = useRef(null);
  const tanggalTutupPickerRef = useRef(null);

  useEffect(() => {
    loadLowongan();
  }, []);

  async function loadLowongan() {
    setLoading(true);
    setError("");

    try {
      if (!supabase) {
        setError("Koneksi database belum tersedia.");
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("lowongan_kerja")
        .select(
          "id, posisi, gambar_url, deskripsi, persyaratan, lokasi, google_form_url, status, tahap_seleksi, tanggal_buka, tanggal_tutup, pengumuman, aktif, urutan"
        )
        .order("urutan", { ascending: true })
        .order("id", { ascending: false });

      if (fetchError) {
        setError(
          `Gagal mengambil data lowongan: ${fetchError.message}`
        );
        setLowongan([]);
      } else {
        setLowongan(data || []);
      }
    } catch (err) {
      setError(
        `Terjadi kesalahan: ${
          err?.message || "Tidak diketahui"
        }`
      );
    }

    setLoading(false);
  }

  function resetImage() {
    setGambarFile(null);
    setGambarPreview("");
  }

  function resetForm() {
    setForm(initialForm);
    setEditingId(null);
    resetImage();
    setShowForm(false);
  }

  function openAddForm() {
    setError("");
    setSuccess("");
    setForm(initialForm);
    setEditingId(null);
    resetImage();
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function openEditForm(item) {
    setError("");
    setSuccess("");

    setEditingId(item.id);

    setForm({
      posisi: item.posisi || "",
      lokasi: item.lokasi || "",
      deskripsi: item.deskripsi || "",
      persyaratan: item.persyaratan || "",
      google_form_url: item.google_form_url || "",
      status: item.status || "draft",
      tahap_seleksi:
        item.tahap_seleksi || "pendaftaran",
      tanggal_buka: isoToDisplayDate(
        item.tanggal_buka
      ),
      tanggal_tutup: isoToDisplayDate(
        item.tanggal_tutup
      ),
      pengumuman: item.pengumuman || "",
      urutan: item.urutan ?? 0,
      aktif: item.aktif !== false,
      gambar_url: item.gambar_url || "",
    });

    setGambarFile(null);
    setGambarPreview(item.gambar_url || "");
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function handleChange(event) {
    const { name, value, type, checked } =
      event.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? checked : value,
    }));
  }

  function handleDateChange(event) {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: formatDateInput(value),
    }));
  }

  function openDatePicker(ref) {
    const input = ref.current;

    if (!input) return;

    try {
      if (typeof input.showPicker === "function") {
        input.showPicker();
      } else {
        input.click();
      }
    } catch {
      input.click();
    }
  }

  function handleNativeDateChange(
    event,
    fieldName
  ) {
    const isoValue = event.target.value;

    setForm((prev) => ({
      ...prev,
      [fieldName]: isoToDisplayDate(isoValue),
    }));
  }

  function handleImageChange(event) {
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
        "Format gambar harus JPG, PNG, atau WEBP."
      );

      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(
        "Ukuran gambar maksimal 5 MB."
      );

      event.target.value = "";
      return;
    }

    setGambarFile(file);

    const previewUrl =
      URL.createObjectURL(file);

    setGambarPreview(previewUrl);
  }

  async function uploadImage() {
    if (!gambarFile) {
      return form.gambar_url || "";
    }

    const extension =
      gambarFile.name
        .split(".")
        .pop()
        ?.toLowerCase() || "jpg";

    const safePosition =
      (form.posisi || "lowongan")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 50);

    const fileName = `${Date.now()}-${safePosition}.${extension}`;

    const filePath = `lowongan/${fileName}`;

    const { error: uploadError } =
      await supabase.storage
        .from("lowongan-images")
        .upload(filePath, gambarFile, {
          cacheControl: "3600",
          upsert: false,
          contentType: gambarFile.type,
        });

    if (uploadError) {
      throw new Error(
        `Gagal upload gambar: ${uploadError.message}`
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

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      if (!supabase) {
        throw new Error(
          "Koneksi database belum tersedia."
        );
      }

      if (!form.posisi.trim()) {
        throw new Error(
          "Posisi lowongan wajib diisi."
        );
      }

      const tanggalBuka =
        displayToIsoDate(form.tanggal_buka);

      const tanggalTutup =
        displayToIsoDate(form.tanggal_tutup);

      if (!tanggalBuka.valid) {
        throw new Error(
          "Tanggal buka tidak valid. Gunakan format DD/MM/YYYY."
        );
      }

      if (!tanggalTutup.valid) {
        throw new Error(
          "Tanggal tutup tidak valid. Gunakan format DD/MM/YYYY."
        );
      }

      if (
        tanggalBuka.value &&
        tanggalTutup.value &&
        tanggalTutup.value < tanggalBuka.value
      ) {
        throw new Error(
          "Tanggal tutup tidak boleh lebih awal dari tanggal buka."
        );
      }

      let gambarUrl = form.gambar_url || "";

      if (gambarFile) {
        gambarUrl = await uploadImage();
      }

      const payload = {
        posisi: form.posisi.trim(),
        lokasi: form.lokasi.trim(),
        deskripsi: form.deskripsi.trim(),
        persyaratan: form.persyaratan.trim(),
        google_form_url:
          form.google_form_url.trim(),
        status: form.status,
        tahap_seleksi:
          form.tahap_seleksi,
        tanggal_buka:
          tanggalBuka.value,
        tanggal_tutup:
          tanggalTutup.value,
        pengumuman:
          form.pengumuman.trim(),
        urutan:
          Number(form.urutan) || 0,
        aktif: form.aktif,
        gambar_url: gambarUrl,
      };

      if (editingId) {
        const { error: updateError } =
          await supabase
            .from("lowongan_kerja")
            .update(payload)
            .eq("id", editingId);

        if (updateError) {
          throw new Error(
            `Gagal memperbarui lowongan: ${updateError.message}`
          );
        }

        setSuccess(
          "Lowongan kerja berhasil diperbarui."
        );
      } else {
        const { error: insertError } =
          await supabase
            .from("lowongan_kerja")
            .insert(payload);

        if (insertError) {
          throw new Error(
            `Gagal menambahkan lowongan: ${insertError.message}`
          );
        }

        setSuccess(
          "Lowongan kerja berhasil ditambahkan."
        );
      }

      resetForm();
      await loadLowongan();

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err) {
      setError(
        err?.message ||
          "Terjadi kesalahan saat menyimpan data."
      );
    }

    setSaving(false);
  }

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Yakin ingin menghapus lowongan ini?"
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      const { error: deleteError } =
        await supabase
          .from("lowongan_kerja")
          .delete()
          .eq("id", id);

      if (deleteError) {
        throw new Error(
          `Gagal menghapus lowongan: ${deleteError.message}`
        );
      }

      setSuccess(
        "Lowongan kerja berhasil dihapus."
      );

      await loadLowongan();
    } catch (err) {
      setError(
        err?.message ||
          "Gagal menghapus lowongan."
      );
    }
  }

  async function toggleActive(item) {
    setError("");
    setSuccess("");

    try {
      const { error: updateError } =
        await supabase
          .from("lowongan_kerja")
          .update({
            aktif: !item.aktif,
          })
          .eq("id", item.id);

      if (updateError) {
        throw new Error(
          `Gagal mengubah status tampil: ${updateError.message}`
        );
      }

      await loadLowongan();
    } catch (err) {
      setError(
        err?.message ||
          "Gagal mengubah status lowongan."
      );
    }
  }

  const filteredLowongan = lowongan.filter(
    (item) => {
      const keyword =
        search.trim().toLowerCase();

      const matchesSearch =
        !keyword ||
        item.posisi
          ?.toLowerCase()
          .includes(keyword) ||
        item.lokasi
          ?.toLowerCase()
          .includes(keyword);

      const matchesStatus =
        filterStatus === "semua" ||
        item.status === filterStatus;

      return (
        matchesSearch && matchesStatus
      );
    }
  );

  const total = lowongan.length;

  const aktif = lowongan.filter(
    (item) => item.aktif
  ).length;

  const nonaktif = lowongan.filter(
    (item) => !item.aktif
  ).length;

  const dibuka = lowongan.filter(
    (item) =>
      item.status === "dibuka" &&
      item.aktif
  ).length;

  return (
    <main className="lokerAdminPage">
      <style>{`
        .lokerAdminPage {
          width: 100%;
          min-height: 100%;
          box-sizing: border-box;
        }

        .page {
          width: 100%;
          max-width: none;
          margin: 0;
          box-sizing: border-box;
        }

        .pageHeader {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 24px;
        }

        .pageHeader h1 {
          margin: 0 0 7px;
          font-size: 30px;
          line-height: 1.2;
          color: #111827;
          font-weight: 800;
        }

        .pageHeader p {
          margin: 0;
          color: #6b7280;
          font-size: 14px;
          line-height: 1.6;
        }

        .headerActions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .button {
          min-height: 42px;
          padding: 0 16px;
          border-radius: 10px;
          border: 1px solid transparent;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          text-decoration: none;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }

        .buttonPrimary {
          background: #111827;
          color: #ffffff;
        }

        .buttonPrimary:hover {
          background: #000000;
        }

        .buttonSecondary {
          background: #ffffff;
          color: #111827;
          border-color: #d1d5db;
        }

        .buttonSecondary:hover {
          background: #f9fafb;
        }

        .buttonDanger {
          background: #fff1f2;
          color: #be123c;
          border-color: #fecdd3;
        }

        .buttonDanger:hover {
          background: #ffe4e6;
        }

        .buttonSmall {
          min-height: 36px;
          padding: 0 11px;
          font-size: 13px;
          border-radius: 8px;
        }

        .summaryGrid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
          margin-bottom: 22px;
        }

        .summaryCard {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 14px;
          padding: 18px;
          box-sizing: border-box;
        }

        .summaryLabel {
          font-size: 13px;
          color: #6b7280;
          margin-bottom: 8px;
        }

        .summaryValue {
          font-size: 28px;
          line-height: 1;
          font-weight: 800;
          color: #111827;
        }

        .card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 14px;
          box-sizing: border-box;
        }

        .cardHeader {
          padding: 18px 20px;
          border-bottom: 1px solid #e5e7eb;
        }

        .cardHeader h2 {
          margin: 0 0 5px;
          font-size: 18px;
          color: #111827;
        }

        .cardHeader p {
          margin: 0;
          font-size: 13px;
          color: #6b7280;
        }

        .formCard {
          margin-bottom: 22px;
        }

        .formBody {
          padding: 22px;
        }

        .formGrid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .fieldFull {
          grid-column: 1 / -1;
        }

        .field label {
          font-size: 13px;
          font-weight: 700;
          color: #374151;
        }

        .required {
          color: #dc2626;
        }

        .input,
        .textarea,
        .select {
          width: 100%;
          min-height: 43px;
          box-sizing: border-box;
          border: 1px solid #d1d5db;
          border-radius: 9px;
          background: #ffffff;
          padding: 10px 12px;
          color: #111827;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s ease,
            box-shadow 0.2s ease;
        }

        .input:focus,
        .textarea:focus,
        .select:focus {
          border-color: #111827;
          box-shadow: 0 0 0 3px rgba(17, 24, 39, 0.08);
        }

        .textarea {
          min-height: 130px;
          resize: vertical;
          font-family: inherit;
          line-height: 1.6;
        }

        .dateWrapper {
          position: relative;
          width: 100%;
        }

        .dateDisplay {
          padding-right: 48px;
        }

        .calendarButton {
          position: absolute;
          top: 50%;
          right: 7px;
          transform: translateY(-50%);
          width: 34px;
          height: 34px;
          border: 0;
          border-radius: 8px;
          background: #f3f4f6;
          color: #374151;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 18px;
          z-index: 3;
        }

        .calendarButton:hover {
          background: #e5e7eb;
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

        .fieldHint {
          margin: 0;
          color: #6b7280;
          font-size: 12px;
          line-height: 1.5;
        }

        .uploadBox {
          border: 2px dashed #d1d5db;
          border-radius: 12px;
          padding: 18px;
          background: #fafafa;
        }

        .uploadRow {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
        }

        .fileInput {
          font-size: 13px;
          color: #374151;
          max-width: 100%;
        }

        .imagePreview {
          width: 150px;
          height: 100px;
          object-fit: cover;
          border-radius: 10px;
          border: 1px solid #e5e7eb;
          background: #f3f4f6;
        }

        .uploadInfo {
          min-width: 0;
          flex: 1;
        }

        .uploadInfo strong {
          display: block;
          color: #111827;
          font-size: 13px;
          margin-bottom: 5px;
        }

        .uploadInfo span {
          display: block;
          color: #6b7280;
          font-size: 12px;
          line-height: 1.5;
        }

        .checkboxRow {
          display: flex;
          align-items: center;
          gap: 9px;
          min-height: 43px;
        }

        .checkboxRow input {
          width: 18px;
          height: 18px;
          accent-color: #111827;
        }

        .formActions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 22px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
        }

        .alert {
          border-radius: 10px;
          padding: 13px 15px;
          margin-bottom: 18px;
          font-size: 14px;
          line-height: 1.5;
        }

        .alertError {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #991b1b;
        }

        .alertSuccess {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          color: #166534;
        }

        .toolbar {
          padding: 16px 20px;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .searchInput {
          flex: 1;
          min-width: 220px;
        }

        .statusFilter {
          width: 210px;
        }

        .tableWrap {
          width: 100%;
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          min-width: 1050px;
        }

        th {
          background: #f9fafb;
          color: #6b7280;
          text-align: left;
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          padding: 13px 15px;
          border-bottom: 1px solid #e5e7eb;
          white-space: nowrap;
        }

        td {
          padding: 15px;
          border-bottom: 1px solid #f3f4f6;
          vertical-align: middle;
          font-size: 13px;
          color: #374151;
        }

        .positionCell {
          min-width: 220px;
        }

        .positionTitle {
          font-weight: 800;
          color: #111827;
          margin-bottom: 4px;
        }

        .locationText {
          color: #6b7280;
          font-size: 12px;
        }

        .thumbnail {
          width: 70px;
          height: 50px;
          object-fit: cover;
          border-radius: 7px;
          border: 1px solid #e5e7eb;
          background: #f3f4f6;
        }

        .noImage {
          width: 70px;
          height: 50px;
          border-radius: 7px;
          background: #f3f4f6;
          color: #9ca3af;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          text-align: center;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          border-radius: 999px;
          padding: 6px 9px;
          font-size: 11px;
          font-weight: 800;
          white-space: nowrap;
        }

        .activeBadge {
          background: #dcfce7;
          color: #166534;
        }

        .inactiveBadge {
          background: #f3f4f6;
          color: #6b7280;
        }

        .actions {
          display: flex;
          gap: 7px;
          flex-wrap: wrap;
        }

        .empty {
          padding: 55px 20px;
          text-align: center;
          color: #6b7280;
        }

        .emptyIcon {
          font-size: 42px;
          margin-bottom: 10px;
        }

        .empty h3 {
          margin: 0 0 6px;
          color: #111827;
          font-size: 18px;
        }

        .empty p {
          margin: 0;
          font-size: 13px;
        }

        .loading {
          padding: 50px 20px;
          text-align: center;
          color: #6b7280;
        }

        @media (max-width: 1000px) {
          .summaryGrid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .formGrid {
            grid-template-columns: 1fr;
          }

          .fieldFull {
            grid-column: auto;
          }
        }

        @media (max-width: 700px) {
          .pageHeader {
            flex-direction: column;
          }

          .headerActions {
            width: 100%;
            justify-content: flex-start;
          }

          .summaryGrid {
            grid-template-columns: 1fr 1fr;
          }

          .summaryCard {
            padding: 14px;
          }

          .summaryValue {
            font-size: 24px;
          }

          .formBody {
            padding: 16px;
          }

          .toolbar {
            padding: 14px;
          }

          .statusFilter {
            width: 100%;
          }

          .formActions {
            flex-direction: column-reverse;
          }

          .formActions .button {
            width: 100%;
          }

          .uploadRow {
            align-items: flex-start;
            flex-direction: column;
          }
        }

        @media (max-width: 480px) {
          .summaryGrid {
            grid-template-columns: 1fr;
          }

          .pageHeader h1 {
            font-size: 25px;
          }
        }
      `}</style>

      <div className="page">
        <div className="pageHeader">
          <div>
            <h1>Lowongan Kerja</h1>
            <p>
              Kelola informasi lowongan kerja
              yang tampil di website Sinar Kasih.
            </p>
          </div>

          <div className="headerActions">
            <Link
              href="/loker"
              target="_blank"
              className="button buttonSecondary"
            >
              👁 Lihat Halaman Loker
            </Link>

            <button
              type="button"
              className="button buttonPrimary"
              onClick={openAddForm}
            >
              + Tambah Lowongan
            </button>
          </div>
        </div>

        {error && (
          <div className="alert alertError">
            {error}
          </div>
        )}

        {success && (
          <div className="alert alertSuccess">
            {success}
          </div>
        )}

        <div className="summaryGrid">
          <div className="summaryCard">
            <div className="summaryLabel">
              Total Lowongan
            </div>
            <div className="summaryValue">
              {total}
            </div>
          </div>

          <div className="summaryCard">
            <div className="summaryLabel">
              Aktif
            </div>
            <div className="summaryValue">
              {aktif}
            </div>
          </div>

          <div className="summaryCard">
            <div className="summaryLabel">
              Nonaktif
            </div>
            <div className="summaryValue">
              {nonaktif}
            </div>
          </div>

          <div className="summaryCard">
            <div className="summaryLabel">
              Pendaftaran Dibuka
            </div>
            <div className="summaryValue">
              {dibuka}
            </div>
          </div>
        </div>

        {showForm && (
          <section className="card formCard">
            <div className="cardHeader">
              <h2>
                {editingId
                  ? "Edit Lowongan Kerja"
                  : "Tambah Lowongan Kerja"}
              </h2>

              <p>
                Isi informasi lowongan yang
                akan ditampilkan kepada
                calon pelamar.
              </p>
            </div>

            <div className="formBody">
              <form onSubmit={handleSubmit}>
                <div className="formGrid">
                  <div className="field">
                    <label>
                      Posisi Lowongan{" "}
                      <span className="required">
                        *
                      </span>
                    </label>

                    <input
                      className="input"
                      name="posisi"
                      value={form.posisi}
                      onChange={handleChange}
                      placeholder="Contoh: Teknisi Listrik"
                      required
                    />
                  </div>

                  <div className="field">
                    <label>
                      Lokasi
                    </label>

                    <input
                      className="input"
                      name="lokasi"
                      value={form.lokasi}
                      onChange={handleChange}
                      placeholder="Contoh: Ambon"
                    />
                  </div>

                  <div className="field">
                    <label>
                      Urutan Tampil
                    </label>

                    <input
                      className="input"
                      type="number"
                      name="urutan"
                      value={form.urutan}
                      onChange={handleChange}
                      min="0"
                    />

                    <p className="fieldHint">
                      Angka lebih kecil akan
                      ditampilkan lebih dahulu.
                    </p>
                  </div>

                  <div className="field">
                    <label>
                      Status Lowongan
                    </label>

                    <select
                      className="select"
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                    >
                      {statusOptions.map(
                        (item) => (
                          <option
                            key={item.value}
                            value={item.value}
                          >
                            {item.label}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div className="field">
                    <label>
                      Tahap Seleksi
                    </label>

                    <select
                      className="select"
                      name="tahap_seleksi"
                      value={
                        form.tahap_seleksi
                      }
                      onChange={handleChange}
                    >
                      {tahapSeleksi.map(
                        (item) => (
                          <option
                            key={item.value}
                            value={item.value}
                          >
                            {item.label}
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
                        className="input dateDisplay"
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
                        aria-label="Pilih tanggal buka"
                        title="Pilih tanggal"
                      >
                        📅
                      </button>

                      <input
                        ref={
                          tanggalBukaPickerRef
                        }
                        type="date"
                        className="hiddenDatePicker"
                        value={isoToDateInput(
                          displayToIsoDate(
                            form.tanggal_buka
                          ).value || ""
                        )}
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

                    <p className="fieldHint">
                      Pilih dari kalender atau
                      ketik dengan format
                      DD/MM/YYYY.
                    </p>
                  </div>

                  <div className="field">
                    <label>
                      Tanggal Tutup
                    </label>

                    <div className="dateWrapper">
                      <input
                        className="input dateDisplay"
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
                        aria-label="Pilih tanggal tutup"
                        title="Pilih tanggal"
                      >
                        📅
                      </button>

                      <input
                        ref={
                          tanggalTutupPickerRef
                        }
                        type="date"
                        className="hiddenDatePicker"
                        value={isoToDateInput(
                          displayToIsoDate(
                            form.tanggal_tutup
                          ).value || ""
                        )}
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

                    <p className="fieldHint">
                      Pilih dari kalender atau
                      ketik dengan format
                      DD/MM/YYYY.
                    </p>
                  </div>

                  <div className="field fieldFull">
                    <label>
                      Gambar Lowongan
                    </label>

                    <div className="uploadBox">
                      <div className="uploadRow">
                        {gambarPreview ? (
                          <img
                            src={gambarPreview}
                            alt="Preview gambar lowongan"
                            className="imagePreview"
                          />
                        ) : (
                          <div className="noImage">
                            Belum ada
                            gambar
                          </div>
                        )}

                        <div className="uploadInfo">
                          <strong>
                            Upload gambar
                            lowongan
                          </strong>

                          <span>
                            Format JPG, PNG,
                            atau WEBP.
                            Maksimal 5 MB.
                          </span>

                          {gambarFile && (
                            <span>
                              File:{" "}
                              {gambarFile.name}
                            </span>
                          )}
                        </div>

                        <input
                          className="fileInput"
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={
                            handleImageChange
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="field fieldFull">
                    <label>
                      Link Form Pendaftaran
                    </label>

                    <input
                      className="input"
                      type="url"
                      name="google_form_url"
                      value={
                        form.google_form_url
                      }
                      onChange={handleChange}
                      placeholder="https://forms.google.com/..."
                    />

                    <p className="fieldHint">
                      Masukkan link formulir
                      pendaftaran jika
                      tersedia.
                    </p>
                  </div>

                  <div className="field fieldFull">
                    <label>
                      Deskripsi Posisi
                    </label>

                    <textarea
                      className="textarea"
                      name="deskripsi"
                      value={form.deskripsi}
                      onChange={handleChange}
                      placeholder="Jelaskan posisi dan pekerjaan yang akan dilakukan..."
                    />
                  </div>

                  <div className="field fieldFull">
                    <label>
                      Persyaratan
                    </label>

                    <textarea
                      className="textarea"
                      name="persyaratan"
                      value={
                        form.persyaratan
                      }
                      onChange={handleChange}
                      placeholder="Tuliskan persyaratan calon pelamar..."
                    />
                  </div>

                  <div className="field fieldFull">
                    <label>
                      Pengumuman
                    </label>

                    <textarea
                      className="textarea"
                      name="pengumuman"
                      value={
                        form.pengumuman
                      }
                      onChange={handleChange}
                      placeholder="Informasi tambahan atau pengumuman untuk pelamar..."
                    />
                  </div>

                  <div className="field">
                    <label>
                      Tampilkan di Website
                    </label>

                    <div className="checkboxRow">
                      <input
                        type="checkbox"
                        name="aktif"
                        checked={form.aktif}
                        onChange={handleChange}
                        id="aktifLowongan"
                      />

                      <label
                        htmlFor="aktifLowongan"
                      >
                        Aktif dan tampil di
                        halaman lowongan
                      </label>
                    </div>
                  </div>
                </div>

                <div className="formActions">
                  <button
                    type="button"
                    className="button buttonSecondary"
                    onClick={resetForm}
                    disabled={saving}
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    className="button buttonPrimary"
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
            </div>
          </section>
        )}

        <section className="card">
          <div className="cardHeader">
            <h2>
              Daftar Lowongan
            </h2>

            <p>
              Kelola semua lowongan kerja
              yang tersedia.
            </p>
          </div>

          <div className="toolbar">
            <input
              className="input searchInput"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Cari posisi atau lokasi..."
            />

            <select
              className="select statusFilter"
              value={filterStatus}
              onChange={(event) =>
                setFilterStatus(
                  event.target.value
                )
              }
            >
              <option value="semua">
                Semua Status
              </option>

              {statusOptions.map(
                (item) => (
                  <option
                    key={item.value}
                    value={item.value}
                  >
                    {item.label}
                  </option>
                )
              )}
            </select>
          </div>

          {loading ? (
            <div className="loading">
              Memuat data lowongan...
            </div>
          ) : filteredLowongan.length ===
            0 ? (
            <div className="empty">
              <div className="emptyIcon">
                💼
              </div>

              <h3>
                Belum ada data lowongan
              </h3>

              <p>
                Tambahkan lowongan kerja
                menggunakan tombol
                &quot;+ Tambah Lowongan&quot;.
              </p>
            </div>
          ) : (
            <div className="tableWrap">
              <table>
                <thead>
                  <tr>
                    <th>
                      Gambar
                    </th>
                    <th>
                      Posisi
                    </th>
                    <th>
                      Status
                    </th>
                    <th>
                      Tahap
                    </th>
                    <th>
                      Tanggal
                    </th>
                    <th>
                      Tampil
                    </th>
                    <th>
                      Aksi
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredLowongan.map(
                    (item) => {
                      const status =
                        getStatusInfo(
                          item.status
                        );

                      return (
                        <tr
                          key={item.id}
                        >
                          <td>
                            {item.gambar_url ? (
                              <img
                                src={
                                  item.gambar_url
                                }
                                alt={
                                  item.posisi
                                }
                                className="thumbnail"
                              />
                            ) : (
                              <div className="noImage">
                                Tidak ada
                              </div>
                            )}
                          </td>

                          <td>
                            <div className="positionCell">
                              <div className="positionTitle">
                                {
                                  item.posisi
                                }
                              </div>

                              <div className="locationText">
                                📍{" "}
                                {item.lokasi ||
                                  "Lokasi belum diisi"}
                              </div>
                            </div>
                          </td>

                          <td>
                            <span
                              className="badge"
                              style={{
                                background:
                                  status.background,
                                color:
                                  status.color,
                              }}
                            >
                              {
                                status.label
                              }
                            </span>
                          </td>

                          <td>
                            {
                              getTahapLabel(
                                item.tahap_seleksi
                              )
                            }
                          </td>

                          <td>
                            <div>
                              {item.tanggal_buka
                                ? isoToDisplayDate(
                                    item.tanggal_buka
                                  )
                                : "-"}
                            </div>

                            <div
                              style={{
                                color:
                                  "#6b7280",
                                fontSize:
                                  "12px",
                                marginTop:
                                  "4px",
                              }}
                            >
                              s/d{" "}
                              {item.tanggal_tutup
                                ? isoToDisplayDate(
                                    item.tanggal_tutup
                                  )
                                : "-"}
                            </div>
                          </td>

                          <td>
                            <button
                              type="button"
                              className="button buttonSmall"
                              style={{
                                background:
                                  item.aktif
                                    ? "#dcfce7"
                                    : "#f3f4f6",
                                color:
                                  item.aktif
                                    ? "#166534"
                                    : "#6b7280",
                                borderColor:
                                  item.aktif
                                    ? "#bbf7d0"
                                    : "#e5e7eb",
                              }}
                              onClick={() =>
                                toggleActive(
                                  item
                                )
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
                                className="button buttonSmall buttonSecondary"
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
                                className="button buttonSmall buttonDanger"
                                onClick={() =>
                                  handleDelete(
                                    item.id
                                  )
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
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
