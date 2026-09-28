import Link from "next/link";
import { getSupabase } from "../../../lib/supabase";

export const dynamic = "force-dynamic";

export default async function Page({ params }) {
  const { id } = await params;
  const supabase = getSupabase();

  let product = null;
  let errorMessage = null;

  if (supabase) {
    const { data, error } = await supabase
      .from("produk")
      .select(`
        id,
        nama,
        deskripsi,
        sku,
        brand (
          nama
        ),
        kategori (
          nama
        ),
        produk_gambar (
          url,
          alt_text,
          utama
        ),
        harga_produk (
          mode_harga,
          harga,
          harga_min,
          harga_max,
          aktif
        )
      `)
      .eq("id", id)
      .eq("aktif", true)
      .single();

    if (error) {
      console.error("SUPABASE DETAIL PRODUK ERROR:", error);
      errorMessage = error.message;
    } else {
      product = data;
    }
  } else {
    errorMessage = "Koneksi Supabase belum tersedia.";
  }

  if (errorMessage || !product) {
    return (
      <section className="section">
        <div className="wrap">
          <h1>Produk tidak ditemukan</h1>
          {errorMessage && (
            <div className="notice">
              <b>Koneksi database:</b> {errorMessage}
            </div>
          )}
          <Link href="/kategori">← Kembali ke Kategori</Link>
        </div>
      </section>
    );
  }

  const mainImage = product.produk_gambar?.find(
    (gambar) => gambar.utama
  );

  const price = product.harga_produk?.find(
    (item) => item.aktif
  );

  return (
    <section className="section">
      <div className="wrap">
        <Link href="/kategori">← Kembali ke Kategori</Link>

        <div className="product-detail">
          <div className="product-detail-image">
            {mainImage?.url ? (
              <img
                src={mainImage.url}
                alt={mainImage.alt_text || product.nama}
              />
            ) : (
              "Foto Produk"
            )}
          </div>

          <div className="product-detail-info">
            <h1>{product.nama}</h1>

            {price?.mode_harga === "pasti" && (
              <div className="price">
                Rp {Number(price.harga || 0).toLocaleString("id-ID")}
              </div>
            )}

            {price?.mode_harga === "range" && (
              <div className="price">
                Rp {Number(price.harga_min || 0).toLocaleString("id-ID")}
                {" – "}
                Rp {Number(price.harga_max || 0).toLocaleString("id-ID")}
              </div>
            )}

            {price?.mode_harga === "mulai_dari" && (
              <div className="price">
                Mulai Rp{" "}
                {Number(
                  price.harga_min || price.harga || 0
                ).toLocaleString("id-ID")}
              </div>
            )}

            {price?.mode_harga === "hubungi" && (
              <div className="price">Hubungi kami</div>
            )}

            {!price && (
              <div className="price">Harga tersedia</div>
            )}

            {product.brand?.nama && (
              <p>
                <b>Brand:</b> {product.brand.nama}
              </p>
            )}

            {product.kategori?.nama && (
              <p>
                <b>Kategori:</b> {product.kategori.nama}
              </p>
            )}

            {product.sku && (
              <p>
                <b>SKU:</b> {product.sku}
              </p>
            )}

            {product.deskripsi && (
              <p>{product.deskripsi}</p>
            )}

            <button className="btn">
              Tambah ke Troli
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
