"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

export default function LabelProdukPage() {
  const router = useRouter();
  const supabase = getSupabase();

  const [labels, setLabels] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadLabels() {
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase
      .from("label_produk")
      .select("*")
      .order("urutan", { ascending: true })
      .order("nama", { ascending: true });

    if (error) {
      setMessage("Gagal mengambil label: " + error.message);
      setLabels([]);
    } else {
      setLabels(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadLabels();
  }, []);

  async function toggleAktif(label) {
    const { error } = await supabase
      .from("label_produk")
      .update({ aktif: !label.aktif })
      .eq("id", label.id);

    if (error) {
      setMessage("Gagal mengubah status: " + error.message);
      return;
    }

    loadLabels();
  }

  async function hapusLabel(label) {
    const yakin = window.confirm(
      `Hapus label "${label.nama}"?`
    );

    if (!yakin) return;

    const { error } = await supabase
      .from("label_produk")
      .delete()
      .eq("id", label.id);

    if (error) {
      setMessage("Gagal menghapus label: " + error.message);
      return;
    }

    loadLabels();
  }

  const filteredLabels = labels.filter((label) => {
    const text = `${label.nama || ""} ${
      label.slug || ""
    } ${label.deskripsi || ""}`.toLowerCase();

    return text.includes(search.toLowerCase());
  });

  return (
    <main className="admin-content">

      <div className="admin-page-header">
        <div>
          <h1>Label Produk</h1>

          <p>
            Kelola label yang dapat digunakan pada
            produk Toko Listrik Sinar Kasih.
          </p>
        </div>

        <button
          className="admin-primary-button"
          onClick={() =>
            router.push("/admin/produk/label/tambah")
          }
        >
          + Tambah Label
        </button>
      </div>

      <div className="admin-card">

        <div className="admin-section-header">
          <div>
            <h2>Daftar Label</h2>

            <p>
              {labels.length} label tersimpan.
            </p>
          </div>
        </div>

        {message && (
          <div className="admin-message">
            {message}
          </div>
        )}

        <div className="admin-form-group">
          <input
            type="text"
            placeholder="Cari label..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </div>

        {loading ? (
          <p>Memuat label...</p>
        ) : filteredLabels.length === 0 ? (
          <p>Belum ada label yang sesuai.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>

            <table className="admin-table">

              <thead>
                <tr>
                  <th>Urutan</th>
                  <th>Label</th>
                  <th>Slug</th>
                  <th>Warna</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>

              <tbody>

                {filteredLabels.map((label) => (

                  <tr key={label.id}>

                    <td>
                      {label.urutan ?? 0}
                    </td>

                    <td>
                      <strong>
                        {label.nama}
                      </strong>

                      {label.deskripsi && (
                        <div
                          style={{
                            fontSize: "13px",
                            color: "#777",
                            marginTop: "4px",
                          }}
                        >
                          {label.deskripsi}
                        </div>
                      )}
                    </td>

                    <td>
                      {label.slug || "-"}
                    </td>

                    <td>
                      {label.warna ? (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <span
                            style={{
                              width: "24px",
                              height: "24px",
                              borderRadius: "6px",
                              background:
                                label.warna,
                              border:
                                "1px solid #ddd",
                              display:
                                "inline-block",
                            }}
                          />

                          <span>
                            {label.warna}
                          </span>
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>

                    <td>
                      {label.aktif
                        ? "Aktif"
                        : "Nonaktif"}
                    </td>

                    <td>

                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          flexWrap: "wrap",
                        }}
                      >

                        <button
                          className="admin-secondary-button"
                          onClick={() =>
                            router.push(
                              `/admin/produk/label/${label.id}/edit`
                            )
                          }
                        >
                          Edit
                        </button>

                        <button
                          className="admin-secondary-button"
                          onClick={() =>
                            toggleAktif(label)
                          }
                        >
                          {label.aktif
                            ? "Nonaktifkan"
                            : "Aktifkan"}
                        </button>

                        <button
                          className="admin-secondary-button"
                          onClick={() =>
                            hapusLabel(label)
                          }
                        >
                          Hapus
                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>
        )}

      </div>

    </main>
  );
}
