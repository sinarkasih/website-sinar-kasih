"use client";

// Lokasi file: app/admin/produk/impor-ekspor/page.js
// Ekspor: unduh semua produk ke Excel, atau unduh template kosong.
// Impor: unggah Excel/CSV untuk menambah produk baru & memperbarui produk lama
//        (data produk + harga). Foto & variasi tetap diatur satu per satu.

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSupabase } from "../../../../lib/supabase";

const KOLOM = [
  "SKU",
  "Nama Produk",
  "Kategori",
  "Brand",
  "Satuan",
  "Stok",
  "Status",
  "Mode Harga",
  "Harga",
  "Harga Min",
  "Harga Maks",
  "Deskripsi",
];

const ALIAS_KOLOM = {
  sku: "sku",
  "kode": "sku",
  "nama produk": "nama",
  nama: "nama",
  kategori: "kategori",
  brand: "brand",
  merek: "brand",
  satuan: "satuan",
  stok: "stok",
  status: "status",
  "mode harga": "mode",
  harga: "harga",
  "harga min": "hargaMin",
  "harga minimal": "hargaMin",
  "harga maks": "hargaMax",
  "harga max": "hargaMax",
  "harga maksimal": "hargaMax",
  deskripsi: "deskripsi",
};

const MODE_KE_TEKS = {
  pasti: "Pasti",
  mulai_dari: "Mulai Dari",
  range: "Rentang",
  hubungi: "Hubungi",
};

const TEKS_KE_MODE = {
  pasti: "pasti",
  "harga pasti": "pasti",
  "mulai dari": "mulai_dari",
  mulai_dari: "mulai_dari",
  rentang: "range",
  range: "range",
  hubungi: "hubungi",
  "hubungi kami": "hubungi",
};

const SHEETJS =
  "https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js";

function muatXLSX() {
  if (typeof window !== "undefined" && window.XLSX) {
    return Promise.resolve(window.XLSX);
  }
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = SHEETJS;
    s.onload = () => resolve(window.XLSX);
    s.onerror = () =>
      reject(new Error("Gagal memuat pengolah Excel. Periksa koneksi internet."));
    document.head.appendChild(s);
  });
}

function buatSlug(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function teks(v) {
  if (v === null || v === undefined) return "";
  return String(v).trim();
}

function kunciNama(v) {
  return teks(v).toLowerCase().replace(/\s+/g, " ");
}

function angkaBulat(v) {
  if (v === null || v === undefined || v === "") return null;
  if (typeof v === "number") return Math.round(v);
  const bersih = String(v).replace(/[^0-9]/g, "");
  return bersih === "" ? NaN : Number(bersih);
}

function angkaStok(v) {
  if (v === null || v === undefined || v === "") return null;
  if (typeof v === "number") return v;
  const bersih = String(v).trim().replace(/\s/g, "").replace(",", ".");
  const n = Number(bersih);
  return Number.isNaN(n) ? NaN : n;
}

async function ambilSemua(supabase, tabel, kolom, atur) {
  const hasil = [];
  let dari = 0;
  const ukuran = 1000;
  for (;;) {
    let q = supabase
      .from(tabel)
      .select(kolom)
      .order("id", { ascending: true })
      .range(dari, dari + ukuran - 1);
    if (atur) q = atur(q);
    const { data, error } = await q;
    if (error) throw error;
    hasil.push(...(data || []));
    if (!data || data.length < ukuran) break;
    dari += ukuran;
  }
  return hasil;
}

async function jalankanBertahap(daftar, jumlahSekaligus, kerja, onMaju) {
  let i = 0;
  const gagal = [];
  async function pekerja() {
    while (i < daftar.length) {
      const item = daftar[i++];
      try {
        await kerja(item);
      } catch (e) {
        gagal.push({ item, pesan: e.message || String(e) });
      }
      onMaju();
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(jumlahSekaligus, daftar.length) }, pekerja)
  );
  return gagal;
}

function potong(arr, ukuran) {
  const hasil = [];
  for (let i = 0; i < arr.length; i += ukuran) hasil.push(arr.slice(i, i + ukuran));
  return hasil;
}

function samaHarga(lama, baru) {
  if (!lama) return false;
  return (
    lama.mode_harga === baru.mode_harga &&
    Number(lama.harga ?? 0) === Number(baru.harga ?? 0) &&
    Number(lama.harga_min ?? 0) === Number(baru.harga_min ?? 0) &&
    Number(lama.harga_max ?? 0) === Number(baru.harga_max ?? 0)
  );
}

export default function ImporEksporPage() {
  const [sibuk, setSibuk] = useState("");
  const [pesan, setPesan] = useState(null);
  const [namaFile, setNamaFile] = useState("");
  const [hasilCek, setHasilCek] = useState(null);
  const [kemajuan, setKemajuan] = useState(null);
  const [selesai, setSelesai] = useState(null);
  const [tampilkan, setTampilkan] = useState("semua");

  useEffect(() => {
    muatXLSX().catch(() => {});
  }, []);

  // ================= DATA REFERENSI =================
  async function ambilReferensi(supabase) {
    const [kategori, brand] = await Promise.all([
      ambilSemua(supabase, "kategori", "id, nama", (q) => q.eq("aktif", true)),
      ambilSemua(supabase, "brand", "id, nama", (q) => q.eq("aktif", true)),
    ]);
    return { kategori, brand };
  }

  async function ambilHargaAktif(supabase) {
    const daftar = await ambilSemua(
      supabase,
      "harga_produk",
      "id, produk_id, mode_harga, harga, harga_min, harga_max",
      (q) => q.eq("aktif", true).is("variasi_id", null)
    );
    const peta = {};
    daftar.forEach((h) => {
      if (!peta[h.produk_id] || h.id > peta[h.produk_id].id) peta[h.produk_id] = h;
    });
    return peta;
  }

  // ================= EKSPOR =================
  async function eksporSemua() {
    setPesan(null);
    setSibuk("ekspor");
    try {
      const XLSX = await muatXLSX();
      const supabase = getSupabase();
      const [produk, ref, harga] = await Promise.all([
        ambilSemua(
          supabase,
          "produk",
          "id, nama, sku, deskripsi, kategori_id, brand_id, satuan, stok, aktif",
          (q) => q.is("deleted_at", null)
        ),
        ambilReferensi(supabase),
        ambilHargaAktif(supabase),
      ]);

      const namaKat = Object.fromEntries(ref.kategori.map((k) => [k.id, k.nama]));
      const namaBrand = Object.fromEntries(ref.brand.map((b) => [b.id, b.nama]));

      const baris = produk.map((p) => {
        const h = harga[p.id];
        return {
          SKU: p.sku || "",
          "Nama Produk": p.nama || "",
          Kategori: namaKat[p.kategori_id] || "",
          Brand: namaBrand[p.brand_id] || "",
          Satuan: p.satuan || "",
          Stok: p.stok ?? 0,
          Status: p.aktif ? "Aktif" : "Nonaktif",
          "Mode Harga": h ? MODE_KE_TEKS[h.mode_harga] || "" : "",
          Harga: h?.harga ?? "",
          "Harga Min": h?.harga_min ?? "",
          "Harga Maks": h?.harga_max ?? "",
          Deskripsi: p.deskripsi || "",
        };
      });

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(baris, { header: KOLOM });
      ws["!cols"] = KOLOM.map((k) => ({
        wch: k === "Nama Produk" || k === "Deskripsi" ? 40 : 14,
      }));
      XLSX.utils.book_append_sheet(wb, ws, "Produk");
      tambahSheetReferensi(XLSX, wb, ref);

      const tgl = new Date().toISOString().slice(0, 10);
      XLSX.writeFile(wb, `produk-sinar-kasih-${tgl}.xlsx`);
      setPesan({
        jenis: "sukses",
        teks: `${baris.length} produk berhasil diekspor.`,
      });
    } catch (e) {
      console.error(e);
      setPesan({ jenis: "gagal", teks: "Ekspor gagal: " + e.message });
    }
    setSibuk("");
  }

  function tambahSheetReferensi(XLSX, wb, ref) {
    const petunjuk = [
      ["PETUNJUK PENGISIAN"],
      [""],
      ["Kolom", "Wajib?", "Keterangan"],
      ["SKU", "Tidak", "Kode produk. Jika diisi, dipakai untuk mencocokkan produk lama. Tidak boleh sama dengan produk lain."],
      ["Nama Produk", "Ya", "Nama produk. Jika SKU kosong, nama dipakai untuk mencocokkan produk lama."],
      ["Kategori", "Tidak", "Harus sama persis dengan nama di sheet Daftar Kategori."],
      ["Brand", "Tidak", "Harus sama persis dengan nama di sheet Daftar Brand."],
      ["Satuan", "Tidak", "Contoh: pcs, meter, roll, box. Kosong = pcs (produk baru)."],
      ["Stok", "Tidak", "Angka. Kosong = 0 (produk baru) atau tidak diubah (produk lama)."],
      ["Status", "Tidak", "Aktif atau Nonaktif. Kosong = Aktif (produk baru) atau tidak diubah (produk lama)."],
      ["Mode Harga", "Tidak", "Pasti, Mulai Dari, Rentang, atau Hubungi. Kosong + Harga diisi = Pasti."],
      ["Harga", "Tidak", "Untuk mode Pasti dan Mulai Dari. Angka saja, contoh 25000."],
      ["Harga Min / Harga Maks", "Tidak", "Khusus mode Rentang."],
      ["Deskripsi", "Tidak", "Keterangan produk."],
      [""],
      ["Aturan umum:"],
      ["- Kolom yang dikosongkan pada produk lama TIDAK akan mengubah data lama."],
      ["- Mulai mengisi dari baris ke-2 di sheet Produk. Jangan mengubah judul kolom di baris pertama."],
      ["- Foto dan variasi produk tidak bisa diimpor; atur lewat tombol Edit di halaman Produk."],
      [""],
      ["Contoh baris:"],
      KOLOM,
      ["LMP-LED-9W", "Lampu LED 9 Watt", "Lampu", "Philips", "pcs", 50, "Aktif", "Pasti", 25000, "", "", "Lampu LED putih 9W"],
    ];
    const wsPetunjuk = XLSX.utils.aoa_to_sheet(petunjuk);
    wsPetunjuk["!cols"] = [{ wch: 24 }, { wch: 10 }, { wch: 90 }];
    XLSX.utils.book_append_sheet(wb, wsPetunjuk, "Petunjuk");

    const wsKat = XLSX.utils.aoa_to_sheet([
      ["Daftar Kategori"],
      ...ref.kategori
        .map((k) => k.nama)
        .sort((a, b) => a.localeCompare(b))
        .map((n) => [n]),
    ]);
    wsKat["!cols"] = [{ wch: 36 }];
    XLSX.utils.book_append_sheet(wb, wsKat, "Daftar Kategori");

    const wsBrand = XLSX.utils.aoa_to_sheet([
      ["Daftar Brand"],
      ...ref.brand
        .map((b) => b.nama)
        .sort((a, b) => a.localeCompare(b))
        .map((n) => [n]),
    ]);
    wsBrand["!cols"] = [{ wch: 36 }];
    XLSX.utils.book_append_sheet(wb, wsBrand, "Daftar Brand");
  }

  async function unduhTemplate() {
    setPesan(null);
    setSibuk("template");
    try {
      const XLSX = await muatXLSX();
      const ref = await ambilReferensi(getSupabase());
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet([KOLOM]);
      ws["!cols"] = KOLOM.map((k) => ({
        wch: k === "Nama Produk" || k === "Deskripsi" ? 40 : 14,
      }));
      XLSX.utils.book_append_sheet(wb, ws, "Produk");
      tambahSheetReferensi(XLSX, wb, ref);
      XLSX.writeFile(wb, "template-impor-produk-sinar-kasih.xlsx");
    } catch (e) {
      console.error(e);
      setPesan({ jenis: "gagal", teks: "Template gagal dibuat: " + e.message });
    }
    setSibuk("");
  }

  // ================= IMPOR: CEK FILE =================
  async function pilihFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setPesan(null);
    setHasilCek(null);
    setSelesai(null);
    setNamaFile(file.name);
    setSibuk("cek");

    try {
      const XLSX = await muatXLSX();
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const namaSheet = wb.SheetNames.includes("Produk")
        ? "Produk"
        : wb.SheetNames[0];
      const mentah = XLSX.utils.sheet_to_json(wb.Sheets[namaSheet], {
        defval: "",
        raw: true,
      });

      const barisFile = mentah
        .map((r, i) => {
          const o = { baris: i + 2 };
          Object.entries(r).forEach(([k, v]) => {
            const kunci = ALIAS_KOLOM[kunciNama(k)];
            if (kunci) o[kunci] = v;
          });
          return o;
        })
        .filter((o) =>
          ["sku", "nama", "kategori", "brand", "stok", "harga"].some(
            (k) => teks(o[k]) !== ""
          )
        );

      if (barisFile.length === 0) {
        throw new Error(
          "Tidak ada data produk di file. Pastikan judul kolom di baris pertama sesuai template."
        );
      }

      const supabase = getSupabase();
      const [produk, ref, harga] = await Promise.all([
        ambilSemua(
          supabase,
          "produk",
          "id, nama, sku, slug, deskripsi, kategori_id, brand_id, satuan, stok, aktif, deleted_at"
        ),
        ambilReferensi(supabase),
        ambilHargaAktif(supabase),
      ]);

      setHasilCek(periksa(barisFile, produk, ref, harga));
    } catch (err) {
      console.error(err);
      setPesan({ jenis: "gagal", teks: err.message || "File gagal dibaca." });
    }
    setSibuk("");
  }

  function periksa(barisFile, produk, ref, harga) {
    const kat = Object.fromEntries(ref.kategori.map((k) => [kunciNama(k.nama), k.id]));
    const brn = Object.fromEntries(ref.brand.map((b) => [kunciNama(b.nama), b.id]));

    const perSku = {};
    const perSlug = {};
    const perNama = {};
    const slugTerpakai = new Set();
    produk.forEach((p) => {
      if (p.sku) perSku[kunciNama(p.sku)] = p;
      if (p.slug) {
        perSlug[p.slug] = p;
        slugTerpakai.add(p.slug);
      }
      const kn = kunciNama(p.nama);
      if (kn) {
        if (!perNama[kn]) perNama[kn] = [];
        perNama[kn].push(p);
      }
    });

    const skuDiFile = new Set();
    const produkDiFile = new Set();

    return barisFile.map((r) => {
      const err = [];
      const sku = teks(r.sku);
      const nama = teks(r.nama);

      // Cari produk lama
      let lama = null;
      if (sku) {
        const k = kunciNama(sku);
        if (skuDiFile.has(k)) err.push(`SKU "${sku}" muncul lebih dari sekali di file.`);
        skuDiFile.add(k);
        lama = perSku[k] || null;
      } else if (nama) {
        const samaNama = perNama[kunciNama(nama)] || [];
        const belumDihapus = samaNama.filter((p) => !p.deleted_at);
        if (belumDihapus.length > 1) {
          err.push(
            "Ada beberapa produk dengan nama ini. Isi kolom SKU agar jelas produk mana yang dimaksud."
          );
        } else if (belumDihapus.length === 1) {
          lama = belumDihapus[0];
        } else if (samaNama.length > 0) {
          lama = samaNama[0];
        } else {
          lama = perSlug[buatSlug(nama)] || null;
        }
      }

      if (lama?.deleted_at) {
        err.push("Produk ini ada di Trash. Pulihkan dulu dari Trash.");
      }
      if (lama && produkDiFile.has(lama.id)) {
        err.push("Produk yang sama muncul lebih dari sekali di file.");
      }
      if (lama) produkDiFile.add(lama.id);

      if (!lama && !nama) err.push("Nama Produk wajib diisi untuk produk baru.");

      // Kategori & brand
      let kategori_id;
      if (teks(r.kategori)) {
        kategori_id = kat[kunciNama(r.kategori)];
        if (!kategori_id) err.push(`Kategori "${teks(r.kategori)}" tidak ditemukan.`);
      }
      let brand_id;
      if (teks(r.brand)) {
        brand_id = brn[kunciNama(r.brand)];
        if (!brand_id) err.push(`Brand "${teks(r.brand)}" tidak ditemukan.`);
      }

      // Stok
      let stok = angkaStok(r.stok);
      if (Number.isNaN(stok) || (stok !== null && stok < 0)) {
        err.push("Stok harus angka 0 atau lebih.");
        stok = null;
      }

      // Status
      let aktif;
      const st = kunciNama(r.status);
      if (st) {
        if (["aktif", "ya", "yes", "1", "true"].includes(st)) aktif = true;
        else if (["nonaktif", "non aktif", "tidak", "no", "0", "false"].includes(st)) aktif = false;
        else err.push('Status harus "Aktif" atau "Nonaktif".');
      }

      // Harga
      let hargaBaru = null;
      const modeTeks = kunciNama(r.mode);
      const h = angkaBulat(r.harga);
      const hMin = angkaBulat(r.hargaMin);
      const hMax = angkaBulat(r.hargaMax);
      const adaHarga = modeTeks || h !== null || hMin !== null || hMax !== null;

      if (adaHarga) {
        let mode = modeTeks ? TEKS_KE_MODE[modeTeks] : null;
        if (!modeTeks) mode = hMin !== null || hMax !== null ? "range" : "pasti";
        if (!mode) {
          err.push('Mode Harga harus "Pasti", "Mulai Dari", "Rentang", atau "Hubungi".');
        } else if (mode === "pasti" || mode === "mulai_dari") {
          if (h === null || Number.isNaN(h)) err.push("Harga wajib diisi angka.");
          else hargaBaru = { mode_harga: mode, harga: h, harga_min: null, harga_max: null };
        } else if (mode === "range") {
          if (hMin === null || hMax === null || Number.isNaN(hMin) || Number.isNaN(hMax)) {
            err.push("Mode Rentang butuh Harga Min dan Harga Maks.");
          } else if (hMin > hMax) {
            err.push("Harga Min tidak boleh lebih besar dari Harga Maks.");
          } else {
            hargaBaru = { mode_harga: "range", harga: null, harga_min: hMin, harga_max: hMax };
          }
        } else {
          hargaBaru = { mode_harga: "hubungi", harga: null, harga_min: null, harga_max: null };
        }
      }

      if (err.length > 0) {
        return { baris: r.baris, sku, nama: nama || lama?.nama || "", status: "error", pesan: err.join(" ") };
      }

      const satuan = teks(r.satuan);
      const deskripsi = teks(r.deskripsi);

      if (!lama) {
        let slug = buatSlug(nama) || "produk";
        let n = 2;
        while (slugTerpakai.has(slug)) slug = `${buatSlug(nama)}-${n++}`;
        slugTerpakai.add(slug);

        return {
          baris: r.baris,
          sku,
          nama,
          status: "baru",
          pesan: "Produk baru",
          data: {
            nama,
            sku: sku || null,
            slug,
            deskripsi: deskripsi || null,
            kategori_id: kategori_id ?? null,
            brand_id: brand_id ?? null,
            satuan: satuan || "pcs",
            stok: stok ?? 0,
            aktif: aktif ?? true,
          },
          harga: hargaBaru,
        };
      }

      // Produk lama: hanya kolom yang diisi & berbeda
      const ubah = {};
      if (nama && nama !== lama.nama) ubah.nama = nama;
      if (sku && sku !== lama.sku) ubah.sku = sku;
      if (deskripsi && deskripsi !== (lama.deskripsi || "")) ubah.deskripsi = deskripsi;
      if (kategori_id !== undefined && kategori_id !== lama.kategori_id) ubah.kategori_id = kategori_id;
      if (brand_id !== undefined && brand_id !== lama.brand_id) ubah.brand_id = brand_id;
      if (satuan && satuan !== lama.satuan) ubah.satuan = satuan;
      if (stok !== null && Number(stok) !== Number(lama.stok)) ubah.stok = stok;
      if (aktif !== undefined && aktif !== lama.aktif) ubah.aktif = aktif;

      const hargaBerubah = hargaBaru && !samaHarga(harga[lama.id], hargaBaru);
      const jumlahUbah = Object.keys(ubah).length + (hargaBerubah ? 1 : 0);

      return {
        baris: r.baris,
        sku: sku || lama.sku || "",
        nama: nama || lama.nama,
        status: jumlahUbah > 0 ? "ubah" : "sama",
        pesan:
          jumlahUbah > 0
            ? "Diperbarui: " +
              [...Object.keys(ubah), ...(hargaBerubah ? ["harga"] : [])]
                .map((k) => k.replace("_id", "").replace("_", " "))
                .join(", ")
            : "Tidak ada perubahan",
        id: lama.id,
        data: ubah,
        harga: hargaBerubah ? hargaBaru : null,
      };
    });
  }

  // ================= IMPOR: PROSES =================
  async function prosesImpor() {
    const baru = hasilCek.filter((r) => r.status === "baru");
    const ubah = hasilCek.filter((r) => r.status === "ubah");
    const yakin = window.confirm(
      `Proses impor sekarang?\n\n${baru.length} produk baru akan ditambahkan.\n${ubah.length} produk akan diperbarui.\n\nBaris yang error akan dilewati.`
    );
    if (!yakin) return;

    setSibuk("impor");
    setPesan(null);
    const supabase = getSupabase();
    const total = baru.length + ubah.length;
    let jalan = 0;
    const maju = () => {
      jalan += 1;
      setKemajuan({ jalan, total });
    };
    setKemajuan({ jalan: 0, total });

    const gagal = [];
    const hargaUntuk = []; // { produk_id, harga }

    // 1. Produk baru (per 100)
    for (const kelompok of potong(baru, 100)) {
      const { data, error } = await supabase
        .from("produk")
        .insert(kelompok.map((r) => r.data))
        .select("id, slug");
      if (error) {
        kelompok.forEach((r) => gagal.push({ baris: r.baris, nama: r.nama, pesan: error.message }));
      } else {
        const idPerSlug = Object.fromEntries((data || []).map((d) => [d.slug, d.id]));
        kelompok.forEach((r) => {
          if (r.harga && idPerSlug[r.data.slug]) {
            hargaUntuk.push({ produk_id: idPerSlug[r.data.slug], harga: r.harga });
          }
        });
      }
      kelompok.forEach(maju);
    }

    // 2. Produk lama (8 sekaligus)
    const gagalUbah = await jalankanBertahap(
      ubah,
      8,
      async (r) => {
        if (Object.keys(r.data).length > 0) {
          const { error } = await supabase.from("produk").update(r.data).eq("id", r.id);
          if (error) throw error;
        }
        if (r.harga) hargaUntuk.push({ produk_id: r.id, harga: r.harga });
      },
      maju
    );
    gagalUbah.forEach((g) =>
      gagal.push({ baris: g.item.baris, nama: g.item.nama, pesan: g.pesan })
    );

    // 3. Harga: nonaktifkan harga lama, lalu simpan harga baru
    let gagalHarga = 0;
    for (const kelompok of potong(hargaUntuk, 100)) {
      const ids = kelompok.map((k) => k.produk_id);
      const { error: e1 } = await supabase
        .from("harga_produk")
        .update({ aktif: false })
        .in("produk_id", ids)
        .is("variasi_id", null)
        .eq("aktif", true);
      if (e1) {
        gagalHarga += kelompok.length;
        continue;
      }
      const { error: e2 } = await supabase.from("harga_produk").insert(
        kelompok.map((k) => ({
          produk_id: k.produk_id,
          variasi_id: null,
          aktif: true,
          ...k.harga,
        }))
      );
      if (e2) gagalHarga += kelompok.length;
    }

    setKemajuan(null);
    setSelesai({
      baru: baru.length - gagal.filter((g) => baru.some((b) => b.baris === g.baris)).length,
      ubah: ubah.length - gagalUbah.length,
      gagal,
      gagalHarga,
    });
    setHasilCek(null);
    setSibuk("");
  }

  // ================= TAMPILAN =================
  const ringkas = hasilCek
    ? {
        baru: hasilCek.filter((r) => r.status === "baru").length,
        ubah: hasilCek.filter((r) => r.status === "ubah").length,
        sama: hasilCek.filter((r) => r.status === "sama").length,
        error: hasilCek.filter((r) => r.status === "error").length,
      }
    : null;

  const barisTampil = hasilCek
    ? hasilCek
        .filter((r) => tampilkan === "semua" || r.status === tampilkan)
        .slice(0, 200)
    : [];

  const label = { baru: "Baru", ubah: "Diperbarui", sama: "Sama", error: "Error" };

  return (
    <main className="admin-content">
      <div className="admin-page-header">
        <div>
          <h1>Impor / Ekspor Produk</h1>
          <p>Tambah dan perbarui banyak produk sekaligus memakai file Excel.</p>
        </div>
        <Link href="/admin/produk" className="admin-secondary-button">
          ← Kembali ke Produk
        </Link>
      </div>

      {pesan && (
        <div className={`ie-pesan ${pesan.jenis}`} role={pesan.jenis === "gagal" ? "alert" : "status"}>
          {pesan.teks}
        </div>
      )}

      <div className="ie-grid">
        <div className="admin-card">
          <h2>1. Ekspor</h2>
          <p className="ie-teks">
            Unduh semua produk ke Excel. Cocok untuk melihat format, membuat
            cadangan data, atau mengubah banyak produk sekaligus lalu
            mengimpornya kembali.
          </p>
          <div className="ie-tombol">
            <button
              type="button"
              className="admin-primary-button"
              onClick={eksporSemua}
              disabled={!!sibuk}
            >
              {sibuk === "ekspor" ? "Menyiapkan file..." : "Unduh semua produk"}
            </button>
            <button
              type="button"
              className="admin-secondary-button"
              onClick={unduhTemplate}
              disabled={!!sibuk}
            >
              {sibuk === "template" ? "Menyiapkan..." : "Unduh template kosong"}
            </button>
          </div>
          <p className="ie-kecil">
            File berisi sheet Petunjuk, Daftar Kategori, dan Daftar Brand sebagai
            panduan pengisian.
          </p>
        </div>

        <div className="admin-card">
          <h2>2. Impor</h2>
          <p className="ie-teks">
            Unggah file Excel (.xlsx) atau CSV. Data akan <strong>diperiksa
            dulu</strong> sebelum disimpan, jadi Anda bisa melihat hasilnya
            terlebih dahulu.
          </p>
          <label className={`ie-unggah ${sibuk ? "nonaktif" : ""}`}>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={pilihFile}
              disabled={!!sibuk}
            />
            {sibuk === "cek" ? "Memeriksa file..." : "Pilih file untuk diimpor"}
          </label>
          {namaFile && <p className="ie-kecil">File: {namaFile}</p>}
        </div>
      </div>

      {kemajuan && (
        <div className="admin-card ie-kemajuan">
          <h2>Sedang mengimpor... jangan tutup halaman ini</h2>
          <div className="ie-bar">
            <span style={{ width: `${(kemajuan.jalan / Math.max(1, kemajuan.total)) * 100}%` }} />
          </div>
          <p className="ie-kecil">
            {kemajuan.jalan} dari {kemajuan.total} produk diproses
          </p>
        </div>
      )}

      {selesai && (
        <div className="admin-card ie-selesai">
          <h2>Impor selesai</h2>
          <ul>
            <li>{selesai.baru} produk baru ditambahkan</li>
            <li>{selesai.ubah} produk diperbarui</li>
            {selesai.gagal.length > 0 && <li className="ie-merah">{selesai.gagal.length} produk gagal disimpan</li>}
            {selesai.gagalHarga > 0 && <li className="ie-merah">{selesai.gagalHarga} harga gagal disimpan</li>}
          </ul>
          {selesai.gagal.length > 0 && (
            <div className="ie-daftar-gagal">
              {selesai.gagal.slice(0, 50).map((g, i) => (
                <div key={i}>
                  Baris {g.baris} ({g.nama}): {g.pesan}
                </div>
              ))}
            </div>
          )}
          <Link href="/admin/produk" className="admin-primary-button">
            Lihat daftar produk
          </Link>
        </div>
      )}

      {hasilCek && ringkas && (
        <div className="admin-card">
          <h2>Hasil pemeriksaan</h2>
          <div className="ie-ringkas">
            {["semua", "baru", "ubah", "sama", "error"].map((k) => (
              <button
                key={k}
                type="button"
                className={`ie-chip ${k} ${tampilkan === k ? "aktif" : ""}`}
                onClick={() => setTampilkan(k)}
              >
                {k === "semua" ? `Semua (${hasilCek.length})` : `${label[k]} (${ringkas[k]})`}
              </button>
            ))}
          </div>

          <div className="ie-tabel">
            <table>
              <thead>
                <tr>
                  <th>Baris</th>
                  <th>SKU</th>
                  <th>Nama produk</th>
                  <th>Hasil</th>
                  <th>Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {barisTampil.map((r) => (
                  <tr key={r.baris}>
                    <td>{r.baris}</td>
                    <td>{r.sku || "-"}</td>
                    <td>{r.nama || "-"}</td>
                    <td>
                      <span className={`ie-status ${r.status}`}>{label[r.status]}</span>
                    </td>
                    <td className="ie-ket">{r.pesan}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {barisTampil.length === 200 && (
            <p className="ie-kecil">Hanya 200 baris pertama yang ditampilkan.</p>
          )}

          <div className="ie-tombol ie-akhir">
            <button
              type="button"
              className="admin-primary-button"
              onClick={prosesImpor}
              disabled={!!sibuk || ringkas.baru + ringkas.ubah === 0}
            >
              Proses impor ({ringkas.baru + ringkas.ubah} produk)
            </button>
            <button
              type="button"
              className="admin-secondary-button"
              onClick={() => {
                setHasilCek(null);
                setNamaFile("");
              }}
              disabled={!!sibuk}
            >
              Batal
            </button>
          </div>
          {ringkas.error > 0 && (
            <p className="ie-kecil ie-merah">
              {ringkas.error} baris error akan dilewati. Perbaiki di file lalu
              impor ulang jika perlu.
            </p>
          )}
        </div>
      )}

      <style>{`
        .ie-pesan { margin-bottom: 20px; padding: 12px 16px; border-radius: 12px; font-size: 14px; }
        .ie-pesan.gagal { background: #fbebe7; border: 1px solid #efc7bc; color: #8a3b2b; }
        .ie-pesan.sukses { background: #eaf7ed; border: 1px solid #c4e5cc; color: #2f6b3f; }
        .ie-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; margin-bottom: 20px; }
        .ie-teks { margin: 6px 0 16px; font-size: 14.5px; color: #5c4a3d; line-height: 1.55; }
        .ie-tombol { display: flex; gap: 10px; flex-wrap: wrap; }
        .ie-akhir { margin-top: 18px; }
        .ie-kecil { margin: 12px 0 0; font-size: 13px; color: #7d6957; }
        .ie-merah { color: #8a3b2b !important; }
        .ie-unggah { display: flex; align-items: center; justify-content: center; min-height: 92px; padding: 16px; border: 2px dashed #d6c1a8; border-radius: 12px; background: #fcf8f2; color: #6f4c36; font-weight: 600; font-size: 14.5px; cursor: pointer; text-align: center; }
        .ie-unggah:hover { background: #f8f1e8; }
        .ie-unggah.nonaktif { opacity: 0.6; cursor: wait; }
        .ie-unggah input { display: none; }
        .ie-kemajuan, .ie-selesai { margin-bottom: 20px; }
        .ie-bar { height: 12px; border-radius: 999px; background: #f0e7db; overflow: hidden; margin-top: 14px; }
        .ie-bar span { display: block; height: 100%; background: #6f4c36; transition: width 0.2s ease; }
        .ie-selesai ul { margin: 10px 0 16px; padding-left: 20px; font-size: 14.5px; line-height: 1.8; }
        .ie-daftar-gagal { max-height: 220px; overflow-y: auto; margin-bottom: 16px; padding: 12px 14px; border-radius: 10px; background: #fbebe7; color: #8a3b2b; font-size: 13.5px; line-height: 1.6; }
        .ie-ringkas { display: flex; gap: 8px; flex-wrap: wrap; margin: 12px 0 16px; }
        .ie-chip { padding: 7px 12px; border: 1px solid #e0cfbb; border-radius: 999px; background: #fff; color: #4b3326; font-size: 13.5px; font-weight: 600; cursor: pointer; }
        .ie-chip.aktif { background: #6f4c36; border-color: #6f4c36; color: #fff; }
        .ie-tabel { overflow-x: auto; max-height: 520px; overflow-y: auto; border: 1px solid #f0e7db; border-radius: 10px; }
        .ie-tabel th, .ie-tabel td { padding: 10px 14px; border-bottom: 1px solid #f0e7db; text-align: left; }
        .ie-tabel th { position: sticky; top: 0; }
        .ie-ket { font-size: 13.5px !important; color: #5c4a3d; min-width: 240px; }
        .ie-status { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 12px; font-weight: 700; white-space: nowrap; }
        .ie-status.baru { background: #eaf7ed; color: #347045; }
        .ie-status.ubah { background: #eaf2ff; color: #315d91; }
        .ie-status.sama { background: #f0ece8; color: #66584e; }
        .ie-status.error { background: #fbecec; color: #943f3f; }
        @media (max-width: 900px) { .ie-grid { grid-template-columns: 1fr; } }
      `}</style>
    </main>
  );
}
