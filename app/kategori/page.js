import Link from "next/link";
import { getSupabase } from "../../lib/supabase";

export const dynamic = "force-dynamic";

export default async function Page() {
  const supabase = getSupabase();

  let categories = [];
  let errorMessage = null;

  if (!supabase) {
    errorMessage = "Koneksi Supabase belum tersedia.";
  } else {
    const { data, error } = await supabase
      .from("kategori")
      .select(`
        id,
        nama,
        slug,
        deskripsi,
        parent_id,
        urutan,
        gambar_url
      `)
      .eq("aktif", true)
      .order("urutan", { ascending: true })
      .order("nama", { ascending: true });

    if (error) {
      console.error(
        "SUPABASE KATEGORI ERROR:",
        error
      );

      errorMessage = error.message;
    } else {
      categories = data || [];
    }
  }

  return (
    <section className="section">
      <div className="wrap">

        <h1>Kategori Produk</h1>

        <p
          style={{
            marginTop: "8px",
            color: "#6b6258",
          }}
        >
          Pilih kategori untuk melihat
          produk di dalamnya.
        </p>

        {errorMessage ? (
          <div className="notice">
            <b>Koneksi database:</b>{" "}
            {errorMessage}
          </div>
        ) : categories.length === 0 ? (
          <div className="notice">
            Belum ada kategori aktif di database.
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill, minmax(180px, 1fr))",
              gap: "18px",
              marginTop: "24px",
            }}
          >
            {categories.map((category) => (
              <Link
                href={`/kategori/${category.slug}`}
                key={category.id}
                style={{
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <div
                  style={{
                    background: "#fff",
                    border: "1px solid #e2d7c8",
                    borderRadius: "14px",
                    padding: "14px",
                    minHeight: "190px",
                    transition: "0.2s",
                  }}
                >

                  <div
                    style={{
                      width: "100%",
                      height: "130px",
                      borderRadius: "10px",
                      overflow: "hidden",
                      background: "#f5f0e8",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {category.gambar_url ? (
                      <img
                        src={category.gambar_url}
                        alt={category.nama}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                        }}
                      />
                    ) : (
                      <span
                        style={{
                          color: "#8a7c6c",
                          fontSize: "14px",
                        }}
                      >
                        Belum ada gambar
                      </span>
                    )}
                  </div>

                  <div
                    style={{
                      marginTop: "12px",
                      fontWeight: 700,
                      fontSize: "16px",
                    }}
                  >
                    {category.nama}
                  </div>

                  {category.deskripsi && (
                    <div
                      style={{
                        marginTop: "5px",
                        fontSize: "13px",
                        color: "#756b60",
                      }}
                    >
                      {category.deskripsi}
                    </div>
                  )}

                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
