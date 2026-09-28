import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabase } from "../../../lib/supabase";

export const dynamic = "force-dynamic";

export default async function KategoriDetailPage({ params }) {
  const supabase = getSupabase();
  const { slug } = await params;

  if (!supabase) {
    return (
      <section className="section">
        <div className="wrap">
          <div className="notice">
            Koneksi database belum tersedia.
          </div>
        </div>
      </section>
    );
  }

  // Ambil data kategori
  const { data: kategori, error: kategoriError } = await supabase
    .from("kategori")
    .select(`
      id,
      nama,
      slug,
      deskripsi,
      gambar_url
    `)
    .eq("slug", slug)
    .eq("aktif", true)
    .maybeSingle();

  if (kategoriError) {
    console.error("KATEGORI DETAIL ERROR:", kategoriError);

    return (
      <section className="section">
        <div className="wrap">
          <div className="notice">
            Gagal mengambil kategori: {kategoriError.message}
          </div>
        </div>
      </section>
    );
  }

  if (!kategori) {
    notFound();
  }

  // Ambil produk dalam kategori
  const { data: products, error: productError } = await supabase
    .from("produk")
    .select(`
      id,
      nama,
      slug,
      deskripsi,
      stok,
      aktif,
      brand:brand_id (
        id,
        nama
      ),
      produk_gambar (
        id,
        url,
        utama
      ),
      harga_produk (
        id,
        mode_harga,
        harga,
        harga_min,
        harga_max,
        aktif
      )
    `)
    .eq("kategori_id", kategori.id)
    .eq("aktif", true)
    .order("nama", {
      ascending: true,
    });

  if (productError) {
    console.error("PRODUK KATEGORI ERROR:", productError);

    return (
      <section className="section">
        <div className="wrap">
          <div className="notice">
            Gagal mengambil produk: {productError.message}
          </div>
        </div>
      </section>
    );
  }

  function getFoto(product) {
    const images = product.produk_gambar || [];

    const utama = images.find((image) => image.utama);

    return utama?.url || images[0]?.url || "";
  }

  function getHarga(product) {
    const prices = (product.harga_produk || [])
      .filter((item) => item.aktif)
      .sort((a, b) => b.id - a.id);

    const price = prices[0];

    if (!price) {
      return "Harga belum tersedia";
    }

    if (price.mode_harga === "pasti") {
      return price.harga != null
        ? `Rp${Number(price.harga).toLocaleString("id-ID")}`
        : "Harga belum tersedia";
    }

    if (price.mode_harga === "range") {
      if (
        price.harga_min != null &&
        price.harga_max != null
      ) {
        return `Rp${Number(price.harga_min).toLocaleString(
          "id-ID"
        )} - Rp${Number(price.harga_max).toLocaleString(
          "id-ID"
        )}`;
      }

      return "Harga belum tersedia";
    }

    if (price.mode_harga === "mulai_dari") {
      return price.harga_min != null
        ? `Mulai Rp${Number(price.harga_min).toLocaleString(
            "id-ID"
          )}`
        : "Harga belum tersedia";
    }

    if (price.mode_harga === "hubungi") {
      return "Hubungi kami";
    }

    return "Harga belum tersedia";
  }

  return (
    <section className="section">
      <div className="wrap">

        {/* Kembali */}
        <div style={{ marginBottom: "18px" }}>
          <Link href="/kategori">
            ← Semua Kategori
          </Link>
        </div>

        {/* Judul kategori */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "18px",
            marginBottom: "28px",
            flexWrap: "wrap",
          }}
        >
          {kategori.gambar_url && (
            <div
              style={{
                width: "90px",
                height: "90px",
                borderRadius: "12px",
                overflow: "hidden",
                background: "#f5f0e8",
                flexShrink: 0,
              }}
            >
              <img
                src={kategori.gambar_url}
                alt={kategori.nama}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                }}
              />
            </div>
          )}

          <div>
            <h1 style={{ margin: 0 }}>
              {kategori.nama}
            </h1>

            {kategori.deskripsi && (
              <p
                style={{
                  marginTop: "8px",
                  marginBottom: 0,
                  color: "#6b6258",
                }}
              >
                {kategori.deskripsi}
              </p>
            )}
          </div>
        </div>

        {/* Produk */}
        {products.length === 0 ? (
          <div className="notice">
            Belum ada produk dalam kategori ini.
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill, minmax(220px, 1fr))",
              gap: "20px",
            }}
          >
            {products.map((product) => {
              const foto = getFoto(product);

              return (
                <Link
                  href={`/produk/${product.id}`}
                  key={product.id}
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                  }}
                >
                  <article
                    style={{
                      background: "#fff",
                      border: "1px solid #e2d7c8",
                      borderRadius: "14px",
                      padding: "12px",
                      height: "100%",
                      boxSizing: "border-box",
                      transition: "transform 0.15s ease",
                    }}
                  >
                    {/* Foto Produk */}
                    <div
                      style={{
                        width: "100%",
                        height: "220px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                        background: "#f5f0e8",
                        borderRadius: "10px",
                      }}
                    >
                      {foto ? (
                        <img
                          src={foto}
                          alt={product.nama}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                            display: "block",
                          }}
                        />
                      ) : (
                        <span
                          style={{
                            color: "#8a7c6c",
                            fontSize: "14px",
                          }}
                        >
                          Belum ada foto
                        </span>
                      )}
                    </div>

                    {/* Brand */}
                    {product.brand?.nama && (
                      <div
                        style={{
                          marginTop: "12px",
                          fontSize: "13px",
                          color: "#8a7c6c",
                        }}
                      >
                        {product.brand.nama}
                      </div>
                    )}

                    {/* Nama */}
                    <h3
                      style={{
                        marginTop: "5px",
                        marginBottom: 0,
                        fontSize: "16px",
                        lineHeight: 1.4,
                      }}
                    >
                      {product.nama}
                    </h3>

                    {/* Harga */}
                    <div
                      style={{
                        marginTop: "10px",
                        fontWeight: 700,
                        fontSize: "15px",
                        color: "#4b3528",
                      }}
                    >
                      {getHarga(product)}
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
}
