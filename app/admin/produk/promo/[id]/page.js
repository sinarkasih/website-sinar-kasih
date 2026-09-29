"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSupabase } from "../../../../../lib/supabase";

export default function KelolaLabelProdukPage() {
  const router = useRouter();
  const params = useParams();

  const produkId = params?.id;
  const supabase = getSupabase();

  const [produk, setProduk] = useState(null);
  const [labels, setLabels] = useState([]);
  const [selectedLabels, setSelectedLabels] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function loadData() {
    setLoading(true);
    setMessage("");

    if (!produkId) {
      setMessage("ID produk tidak ditemukan.");
      setLoading(false);
      return;
    }

    const [produkResult, labelsResult, relasiResult] =
      await Promise.all([
        supabase
          .from("produk")
          .select(`
            id,
            nama,
            sku,
            aktif,
            brand(nama),
            kategori(nama)
          `)
          .eq("id", produkId)
          .single(),

        supabase
          .from("label_produk")
          .select("*")
          .eq("aktif", true)
          .order("urutan", { ascending: true })
          .order("nama", { ascending: true }),

        supabase
          .from("produk_label")
          .select("label_id")
          .eq("produk_id", produkId),
      ]);

    if (produkResult.error) {
      setMessage(
        "Gagal mengambil produk: " +
          produkResult.error.message
      );
      setProduk(null);
    } else {
      setProduk(produkResult.data);
    }

    if (labelsResult.error) {
      setMessage(
        (current) =>
          current ||
          "Gagal mengambil label: " +
            labelsResult.error.message
      );
      setLabels([]);
    } else {
      setLabels(labelsResult.data || []);
    }

    if (relasiResult.error) {
      setMessage(
        (current) =>
          current ||
          "Gagal mengambil label produk: " +
            relasiResult.error.message
      );
      setSelectedLabels([]);
    } else {
      setSelectedLabels(
        (relasiResult.data || []).map(
          (item) => item.label_id
        )
      );
    }

    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, [produkId]);

  function toggleLabel(labelId) {
    setSelectedLabels((current) => {
      if (current.includes(labelId)) {
        return current.filter(
          (id) => id !== labelId
        );
      }

      return [...current, labelId];
    });
  }

  async function handleSave() {
    if (!produkId) {
      setMessage("ID produk tidak ditemukan.");
      return;
    }

    setSaving(true);
    setMessage("");

    /*
     * Hapus semua label produk yang lama terlebih dahulu.
     * Setelah itu masukkan kembali label yang dipilih.
     */

    const { error: deleteError } = await supabase
      .from("produk_label")
      .delete()
      .eq("produk_id", produkId);

    if (deleteError) {
      setMessage(
        "Gagal memperbarui label: " +
          deleteError.message
      );
      setSaving(false);
      return;
    }

    if (selectedLabels.length > 0) {
      const rows = selectedLabels.map((labelId) => ({
        produk_id: Number(produkId),
        label_id: labelId,
      }));

      const { error: insertError } = await supabase
        .from("produk_label")
        .insert(rows);

      if (insertError) {
        setMessage(
          "Gagal menyimpan label: " +
            insertError.message
        );
        setSaving(false);
        return;
      }
    }

    router.push("/admin/produk/promo");
  }

  function handleCancel() {
    router.push("/admin/produk/promo");
  }

  if (loading) {
    return (
      <main className="admin-content">
        <div className="admin-card">
          <p>Memuat data produk...</p>
        </div>
      </main>
    );
  }

  if (!produk) {
    return (
      <main className="admin-content">

        <div className="admin-page-header">
          <div>
            <h1>Kelola Label Produk</h1>
            <p>Produk tidak ditemukan.</p>
          </div>

          <button
            className="admin-secondary-button"
            onClick={() =>
              router.push(
                "/admin/produk/promo"
              )
            }
          >
            ← Kembali
          </button>
        </div>

        {message && (
          <div className="admin-message">
            {message}
          </div>
        )}

      </main>
    );
  }

  return (
    <main className="admin-content">

      {/* HEADER */}

      <div className="admin-page-header">

        <div>
          <h1>Kelola Label Produk</h1>

          <p>
            Pilih satu atau beberapa label untuk
            produk ini.
          </p>
        </div>

        <button
          className="admin-secondary-button"
          onClick={() =>
            router.push(
              "/admin/produk/promo"
            )
          }
        >
          ← Kembali
        </button>

      </div>

      {/* INFORMASI PRODUK */}

      <div className="admin-card">

        <div className="admin-section-header">

          <div>
            <h2>{produk.nama}</h2>

            <p>
              SKU: {produk.sku || "-"}
            </p>
          </div>

        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "12px",
            marginBottom: "24px",
          }}
        >

          <div
            style={{
              padding: "14px",
              background: "#f7f3ed",
              borderRadius: "10px",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                color: "#777",
                marginBottom: "5px",
              }}
            >
              Kategori
            </div>

            <strong>
              {produk.kategori?.nama || "-"}
            </strong>
          </div>

          <div
            style={{
              padding: "14px",
              background: "#f7f3ed",
              borderRadius: "10px",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                color: "#777",
                marginBottom: "5px",
              }}
            >
              Brand
            </div>

            <strong>
              {produk.brand?.nama || "-"}
            </strong>
          </div>

          <div
            style={{
              padding: "14px",
              background: "#f7f3ed",
              borderRadius: "10px",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                color: "#777",
                marginBottom: "5px",
              }}
            >
              Status
            </div>

            <strong>
              {produk.aktif
                ? "Aktif"
                : "Nonaktif"}
            </strong>
          </div>

        </div>

        {message && (
          <div className="admin-message">
            {message}
          </div>
        )}

        {/* PILIH LABEL */}

        <div>

          <h3
            style={{
              marginBottom: "6px",
            }}
          >
            Pilih Label
          </h3>

          <p
            style={{
              color: "#777",
              marginBottom: "18px",
            }}
          >
            Satu produk dapat memiliki beberapa
            label sekaligus.
          </p>

          {labels.length === 0 ? (
            <div
              style={{
                padding: "18px",
                background: "#f7f3ed",
                borderRadius: "10px",
              }}
            >
              Belum ada label aktif.
              Silakan buat label terlebih dahulu
              di menu Label Produk.
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "12px",
              }}
            >

              {labels.map((label) => {

                const checked =
                  selectedLabels.includes(
                    label.id
                  );

                return (
                  <label
                    key={label.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "16px",
                      border: checked
                        ? "2px solid #8b5e3c"
                        : "1px solid #ddd",
                      borderRadius: "12px",
                      cursor: "pointer",
                      background: checked
                        ? "#faf4ec"
                        : "#fff",
                      transition:
                        "all 0.15s ease",
                    }}
                  >

                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        toggleLabel(
                          label.id
                        )
                      }
                      style={{
                        width: "18px",
                        height: "18px",
                        cursor: "pointer",
                      }}
                    />

                    <span
                      style={{
                        width: "22px",
                        height: "22px",
                        borderRadius: "6px",
                        background:
                          label.warna ||
                          "#ddd",
                        border:
                          "1px solid #ccc",
                        flexShrink: 0,
                      }}
                    />

                    <span>
                      <strong>
                        {label.nama}
                      </strong>

                      {label.deskripsi && (
                        <small
                          style={{
                            display: "block",
                            color: "#777",
                            marginTop: "3px",
                          }}
                        >
                          {label.deskripsi}
                        </small>
                      )}
                    </span>

                  </label>
                );
              })}

            </div>
          )}

        </div>

        {/* RINGKASAN */}

        <div
          style={{
            marginTop: "24px",
            padding: "14px 16px",
            background: "#f7f3ed",
            borderRadius: "10px",
          }}
        >
          <strong>
            {selectedLabels.length}
          </strong>{" "}
          label dipilih.
        </div>

        {/* TOMBOL */}

        <div
          style={{
            display: "flex",
            gap: "10px",
            justifyContent: "flex-end",
            flexWrap: "wrap",
            marginTop: "24px",
          }}
        >

          <button
            type="button"
            className="admin-secondary-button"
            onClick={handleCancel}
            disabled={saving}
          >
            Batal
          </button>

          <button
            type="button"
            className="admin-primary-button"
            onClick={handleSave}
            disabled={saving}
          >
            {saving
              ? "Menyimpan..."
              : "Simpan Label"}
          </button>

        </div>

      </div>

    </main>
  );
}
