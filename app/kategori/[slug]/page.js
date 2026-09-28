import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabase } from "../../../lib/supabase";

export const dynamic = "force-dynamic";

export default async function KategoriDetailPage({
  params,
}) {
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

  const { data: kategori, error: kategoriError } =
    await supabase
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
    console.error(
      "KATEGORI DETAIL ERROR:",
      kategoriError
    );

    return (
      <section className="section">
        <div className="wrap">
          <div className="notice">
            Gagal mengambil kategori:{" "}
            {kategoriError.message}
          </div>
        </div>
      </section>
    );
  }

  if (!kategori) {
    notFound();
  }

  const { data: products, error: productError } =
    await supabase
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
    console.error(
      "PRODUK KATEGORI ERROR:",
      productError
    );

    return (
      <section className="section">
        <div className="wrap">
          <div className="notice">
            Gagal mengambil produk:{" "}
            {productError.message}
          </div>
        </div>
      </section>
    );
  }

  function getFoto(product) {
    const images =
      product.produk_gambar || [];

    const utama = images.find(
      (image) => image.utama
    );

    return (
      utama?.url ||
      images[0]?.url ||
      ""
    );
  }

  function getHarga(product) {
    const prices =
      (product.harga_produk || [])
        .filter((item) => item.aktif)
        .sort((a, b) => b.id - a.id);

    const price = prices[0];

    if (!price) {
      return "Harga belum tersedia";
    }

    if (price.mode_harga === "pasti") {
      return price.harga
        ? `Rp${Number(
            price.harga
          ).toLocaleString("id-ID")}`
        : "Harga belum tersedia";
    }

    if (price.mode_harga === "range") {
      if (
        price.harga_min != null &&
        price.harga_max != null
      ) {
        return `Rp${Number(
          price.harga_min
        ).toLocaleString(
          "id-ID"
        )} - Rp${Number(
          price.harga_max
        ).toLocaleString(
          "id-ID"
        )}`;
      }

      return "Harga belum tersedia";
    }

    if (price.mode_harga === "mulai_dari") {
      return price.harga_min != null
        ? `Mulai Rp${Number(
            price.harga_min
          ).toLocaleString(
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

        <div style={{ marginBottom: "20px" }}>
          <Link href="/kategori">
            ← Semua Kategori
          </Link>
        </div>

        <h1>{kategori.nama}</h1>

        {kategori.deskripsi && (
          <p
            style={{
              marginTop: "8px",
              color: "#6b6258",
            }}
          >
            {kategori.deskripsi}
          </p>
        )}

        {products.length === 0 ? (
          <div
            className="notice"
            style={{ marginTop: "24px" }}
          >
            Belum ada produk dalam kategori ini.
          </div>
        ) : (
          <div
            className="grid"
            style={{ marginTop: "24px" }}
          >

            {products.map((product) => (
              <Link
                href={`/produk/${product.id}`}
                key={product.id}
                className="card"
                style={{
                  textDecoration: "none",
                  color: "inherit",
                }}
              >

                <div className="img">

                  {getFoto(product) ? (
                    <img
                      src={getFoto(product)}
                      alt={product.nama}
                    />
                  ) : (
                    <span>
                      Belum ada foto
                    </span>
                  )}

                </div>

                <div
                  style={{
                    marginTop: "12px",
                    fontSize: "14px",
                    color: "#8a7c6c",
                  }}
                >
                  {product.brand?.nama ||
                    ""}
                </div>

                <h3
                  style={{
                    marginTop: "5px",
                  }}
                >
                  {product.nama}
                </h3>

                <div
                  style={{
                    marginTop: "8px",
                    fontWeight: 700,
                  }}
                >
                  {getHarga(product)}
                </div>

              </Link>
            ))}

          </div>
        )}

      </div>
    </section>
  );
}
