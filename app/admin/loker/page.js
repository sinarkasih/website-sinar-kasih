"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

function getStatusLabel(status) {
  const item = statusOptions.find(
    (option) => option.value === status
  );

  return item ? item.label : "Belum Dipublikasikan";
}

function getTahapLabel(tahap) {
  const item = tahapSeleksi.find(
    (option) => option.key === tahap
  );

  return item ? item.judul : "Pendaftaran";
}

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

export default function AdminLokerPage() {
  const router = useRouter();

  const [lowongan, setLowongan] = useState([]);

  const [loading, setLoading] = useState(true);
  const [authChecking, setAuthChecking] = useState(true);

  const [saving, setSaving] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("semua");

  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      const supabase = getSupabase();

      if (!supabase) {
        if (!mounted) return;

        setError("Koneksi Supabase belum tersedia.");
        setLoading(false);
        setAuthChecking(false);
        return;
      }

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (!mounted) return;

      if (sessionError) {
        console.error(sessionError);

        setError(
          `Gagal memeriksa sesi login: ${sessionError.message}`
        );

        setLoading(false);
        setAuthChecking(false);
        return;
      }

      if (!session) {
        router.replace("/admin/login");
        return;
      }

      setAuthChecking(false);

      await loadLowongan(supabase);
    }

    checkSession();

    const supabase = getSupabase();

    if (!supabase) {
      return () => {
        mounted = false;
      };
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;

        if (
          event === "SIGNED_OUT" ||
          !session
        ) {
          router.replace("/admin/login");
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  async function loadLowongan(supabaseInstance = null) {
    setLoading(true);
    setError("");

    const supabase =
      supabaseInstance || getSupabase();

    if (!supabase) {
      setError("Koneksi Supabase belum tersedia.");
      setLoading(false);
      return;
    }

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error(sessionError);

      setError(
        `Gagal memeriksa sesi login: ${sessionError.message}`
      );

      setLoading(false);
      return;
    }

    if (!session) {
      router.replace("/admin/login");
      return;
    }

    const { data, error: fetchError } =
      await supabase
        .from("lowongan_kerja")
        .select(
          "id, posisi, gambar_url, deskripsi, persyaratan, lokasi, google_form_url, status, tahap_seleksi, tanggal_buka, tanggal_tutup, pengumuman, aktif, urutan"
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

  function resetForm() {
    setForm(initialForm);
    setEditingId(null);
  }

  function openAddForm() {
    resetForm();

    setSuccess("");
    setError("");
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
        item.tanggal_buka || "",
      tanggal_tutup:
        item.tanggal_tutup || "",
      pengumuman:
        item.pengumuman || "",
      aktif: Boolean(item.aktif),
      urutan: item.urutan ?? 0,
    });

    setEditingId(item.id);
    setSuccess("");
    setError("");
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
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

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      setError(
        `Gagal memeriksa sesi login: ${sessionError.message}`
      );
      return;
    }

    if (!session) {
      router.replace("/admin/login");
      return;
    }

    setSaving(true);

    const payload = {
      posisi: form.posisi.trim(),

      gambar_url:
        form.gambar_url.trim() || null,

      deskripsi:
        form.deskripsi.trim() || null,

      persyaratan:
        form.persyaratan.trim() || null,

      lokasi:
        form.lokasi.trim() || null,

      google_form_url:
        form.google_form_url.trim() || null,

      status: form.status,

      tahap_seleksi:
        form.tahap_seleksi,

      tanggal_buka:
        form.tanggal_buka || null,

      tanggal_tutup:
        form.tanggal_tutup || null,

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
        .eq("id", editingId);
    } else {
      result = await supabase
        .from("lowongan_kerja")
        .insert(payload);
    }

    if (result.error) {
      console.error(result.error);

      setError(
        `Gagal menyimpan lowongan: ${result.error.message}`
      );

      setSaving(false);
      return;
    }

    setSaving(false);

    if (editingId) {
      setSuccess(
        "Lowongan berhasil diperbarui."
      );
    } else {
      setSuccess(
        "Lowongan berhasil ditambahkan."
      );
    }

    resetForm();
    setShowForm(false);

    await loadLowongan(supabase);
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

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.replace("/admin/login");
      return;
    }

    const {
      error: deleteError,
    } = await supabase
      .from("lowongan_kerja")
      .delete()
      .eq("id", item.id);

    if (deleteError) {
      console.error(deleteError);

      setError(
        `Gagal menghapus lowongan: ${deleteError.message}`
      );

      setProcessingId(null);
      return;
    }

    setLowongan((current) =>
      current.filter(
        (itemLowongan) =>
          itemLowongan.id !== item.id
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

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.replace("/admin/login");
      return;
    }

    const {
      error: updateError,
    } = await supabase
      .from("lowongan_kerja")
      .update({
        aktif: !item.aktif,
      })
      .eq("id", item.id);

    if (updateError) {
      console.error(updateError);

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
      const keyword =
        search.trim().toLowerCase();

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

  const aktif =
    lowongan.filter(
      (item) => item.aktif
    ).length;

  const dibuka =
    lowongan.filter(
      (item) =>
        item.status === "dibuka" &&
        item.aktif
    ).length;

  const nonaktif =
    lowongan.filter(
      (item) => !item.aktif
    ).length;

  if (authChecking) {
    return (
      <main className="lokerAdminPage">
        <div className="loadingPage">
          Memeriksa sesi Admin...
        </div>

        <style>{`
          .lokerAdminPage {
            width: 100%;
            min-height: 100%;
            color: #3f2f24;
          }

          .loadingPage {
            min-height: 300px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #76685d;
            font-size: 14px;
          }
        `}</style>
      </main>
    );
  }

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
              yang ditampilkan pada halaman
              publik.
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
            <span>
              Total Lowongan
            </span>

            <strong>
              {totalLowongan}
            </strong>
          </div>

          <div className="summaryCard">
            <span>Aktif</span>

            <strong>
              {aktif}
            </strong>
          </div>

          <div className="summaryCard">
            <span>
              Pendaftaran Dibuka
            </span>

            <strong>
              {dibuka}
            </strong>
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
                  Isi informasi lowongan
                  yang akan ditampilkan
                  kepada calon pelamar.
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

            <form
              onSubmit={handleSubmit}
            >
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
                    value={form.tahap_seleksi}
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
                  <label htmlFor="tanggal_buka">
                    Tanggal Buka
                  </label>

                  <input
                    id="tanggal_buka"
                    name="tanggal_buka"
                    type="date"
                    value={form.tanggal_buka}
                    onChange={handleChange}
                  />
                </div>

                <div className="field">
                  <label htmlFor="tanggal_tutup">
                    Tanggal Tutup
                  </label>

                  <input
                    id="tanggal_tutup"
                    name="tanggal_tutup"
                    type="date"
                    value={form.tanggal_tutup}
                    onChange={handleChange}
                  />
                </div>

                <div className="field full">
                  <label htmlFor="gambar_url">
                    URL Gambar Lowongan
                  </label>

                  <input
                    id="gambar_url"
                    name="gambar_url"
                    value={form.gambar_url}
                    onChange={handleChange}
                    placeholder="https://..."
                  />

                  <small>
                    Masukkan URL gambar
                    jika tersedia.
                  </small>
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
                    value={form.persyaratan}
                    onChange={handleChange}
                    placeholder={
                      "Contoh:\nUsia maksimal 30 tahun\nPendidikan minimal SMA/SMK\nMampu bekerja dalam tim"
                    }
                  />

                  <small>
                    Gunakan baris baru untuk
                    setiap persyaratan agar
                    lebih mudah dibaca.
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
                    value={form.google_form_url}
                    onChange={handleChange}
                    placeholder="https://forms.google.com/..."
                  />

                  <small>
                    Tombol lamaran pada
                    website akan menggunakan
                    link ini.
                  </small>
                </div>

                <div className="field full">
                  <label htmlFor="pengumuman">
                    Pengumuman
                  </label>

                  <textarea
                    id="pengumuman"
                    name="pengumuman"
                    rows="4"
                    value={form.pengumuman}
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
                      Tampilkan lowongan
                      ini di website
                      publik
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
                aria-label="Hapus pencarian"
              >
                ×
              </button>
            )}
          </div>

          <div className="filters">
            <button
              type="button"
              className={
                filter === "semua"
                  ? "filter active"
                  : "filter"
              }
              onClick={() =>
                setFilter("semua")
              }
            >
              Semua
            </button>

            <button
              type="button"
              className={
                filter === "aktif"
                  ? "filter active"
                  : "filter"
              }
              onClick={() =>
                setFilter("aktif")
              }
            >
              Aktif
            </button>

            <button
              type="button"
              className={
                filter === "dibuka"
                  ? "filter active"
                  : "filter"
              }
              onClick={() =>
                setFilter("dibuka")
              }
            >
              Dibuka
            </button>

            <button
              type="button"
              className={
                filter === "proses"
                  ? "filter active"
                  : "filter"
              }
              onClick={() =>
                setFilter("proses")
              }
            >
              Proses Seleksi
            </button>

            <button
              type="button"
              className={
                filter === "nonaktif"
                  ? "filter active"
                  : "filter"
              }
              onClick={() =>
                setFilter("nonaktif")
              }
            >
              Nonaktif
            </button>
          </div>
        </div>

        <div className="card">
          {loading ? (
            <div className="empty">
              Memuat data lowongan...
            </div>
          ) : filteredLowongan.length ===
            0 ? (
            <div className="empty">
              <div className="emptyIcon">
                💼
              </div>

              <strong>
                {search ||
                filter !== "semua"
                  ? "Tidak ada lowongan yang sesuai."
                  : "Belum ada data lowongan."}
              </strong>

              <p>
                {search ||
                filter !== "semua"
                  ? "Coba ubah pencarian atau filter."
                  : "Klik + Tambah Lowongan untuk membuat lowongan pertama."}
              </p>
            </div>
          ) : (
            <div className="tableWrap">
              <table>
                <thead>
                  <tr>
                    <th>Urutan</th>
                    <th>Posisi</th>
                    <th>Lokasi</th>
                    <th>Status</th>
                    <th>Tahap</th>
                    <th>Periode</th>
                    <th>Tampil</th>
                    <th>Aksi</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredLowongan.map(
                    (item) => (
                      <tr key={item.id}>
                        <td>
                          {item.urutan ?? 0}
                        </td>

                        <td>
                          <div className="positionCell">
                            {item.gambar_url ? (
                              <img
                                src={
                                  item.gambar_url
                                }
                                alt=""
                                className="thumb"
                              />
                            ) : (
                              <div className="thumbPlaceholder">
                                💼
                              </div>
                            )}

                            <div>
                              <strong>
                                {item.posisi ||
                                  "-"}
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
                            {getStatusLabel(
                              item.status
                            )}
                          </span>
                        </td>

                        <td>
                          {getTahapLabel(
                            item.tahap_seleksi
                          )}
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
                            className={
                              item.aktif
                                ? "toggle active"
                                : "toggle"
                            }
                            onClick={() =>
                              toggleAktif(
                                item
                              )
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
                              {processingId ===
                              item.id
                                ? "..."
                                : "Hapus"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .lokerAdminPage {
          width: 100%;
          min-height: 100%;
          color: #3f2f24;
        }

        .page {
          width: 100%;
          max-width: none;
          margin: 0;
        }

        .topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
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
          text-decoration: none;
          font-weight: 700;
          font-size: 14px;
          box-sizing: border-box;
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
          grid-template-columns:
            repeat(4, minmax(0, 1fr));
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
          border-bottom:
            1px solid #eee5dc;
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

        .closeButton:hover {
          background: #f5eee7;
        }

        .formGrid {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
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
          border-top:
            1px solid #eee5dc;
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

        .cancelButton:disabled,
        .saveButton:disabled {
          opacity: 0.6;
          cursor: not-allowed;
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
          padding:
            12px 42px 12px 14px;
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
          transform:
            translateY(-50%);
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
          border-bottom:
            1px solid #eee5dc;
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

        .thumb,
        .thumbPlaceholder {
          width: 48px;
          height: 48px;
          flex-shrink: 0;
          border-radius: 8px;
          object-fit: cover;
        }

        .thumbPlaceholder {
          display: flex;
          align-items: center;
          justify-content: center;
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
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
        }

        .editButton {
          border: none;
          background: #f3eadf;
          color: #4b3326;
        }

        .deleteButton {
          border: none;
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
              repeat(2, minmax(0, 1fr));
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
