import Link from "next/link";
import { getSupabase } from "../../lib/supabase";

export const dynamic = "force-dynamic";

export default async function Page({ searchParams }) {
  const params = await searchParams;
  const query = params?.q || "";

  const supabase = getSupabase();

  let products = [];
  let errorMessage = null;

  if (supabase) {
    let request = supabase
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
      .eq("aktif", true)
      .order("id", { ascending: true });

    if (query) {
      request = request.ilike(
        "nama",
        `%${query}%`
      );
    }

    const { data, error } = await request;

    if (error) {
      console.error(
        "SUPABASE CARI ERROR:",
        error
      );

      errorMessage = error.message;
    } else {
      products = data || [];
    }
  } else {
    errorMessage =
      "Koneksi Supabase belum tersedia.";
  }

  return (
    <section className="section">
      <div className="wrap">

        <h1>Cari Produk</h1>

        <form
          method="GET"
          className="search-form"
        >

          <input
            className="search"
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Cari lampu, kabel, saklar..."
            autoComplete="off"
          />

          <button
            className="btn"
            type="submit"
          >
            Cari
          </button>

        </form>

        {errorMessage ? (
          <div className="notice">
            <b>Koneksi database:</b>{" "}
            {errorMessage}
          </div>
        ) : products.length === 0 ? (
          <div className="notice">
            {query
              ? `Produk "${query}" tidak ditemukan.`
              : "Belum ada produk aktif di database."}
          </div>
        ) : (
          <div className="cards">

            {products.map((product) => {

              const mainImage =
                product.produk_gambar?.find(
                  (gambar) =>
                    gambar.utama
                );

              const price =
                product.harga_produk?.find(
                  (item) =>
                    item.aktif
                );

              return (
                <Link
                  href={`/produk/${product.id}`}
                  className="card"
                  key={product.id}
                >

                  <div className="img">

                    {mainImage?.url ? (
                      <img
                        src={mainImage.url}
                        alt={
                          mainImage.alt_text ||
                          product.nama
                        }
                      />
                    ) : (
                      "Foto Produk"
                    )}

                  </div>

                  {price?.mode_harga ===
                    "pasti" && (
                    <div className="price">
                      Rp{" "}
                      {Number(
                        price.harga || 0
                      ).toLocaleString(
                        "id-ID"
                      )}
                    </div>
                  )}

                  {price?.mode_harga ===
                    "range" && (
                    <div className="price">
                      Rp{" "}
                      {Number(
                        price.harga_min || 0
                      ).toLocaleString(
                        "id-ID"
                      )}
                      {" – "}
                      Rp{" "}
                      {Number(
                        price.harga_max || 0
                      ).toLocaleString(
                        "id-ID"
                      )}
                    </div>
                  )}

                  {price?.mode_harga ===
                    "mulai_dari" && (
                    <div className="price">
                      Mulai Rp{" "}
                      {Number(
                        price.harga_min ||
                          price.harga ||
                          0
                      ).toLocaleString(
                        "id-ID"
                      )}
                    </div>
                  )}

                  {price?.mode_harga ===
                    "hubungi" && (
                    <div className="price">
                      Hubungi kami
                    </div>
                  )}

                  {!price && (
                    <div className="price">
                      Harga tersedia
                    </div>
                  )}

                  <h3>
                    {product.nama}
                  </h3>

                  {product.brand?.nama && (
                    <p>
                      Brand:{" "}
                      {product.brand.nama}
                    </p>
                  )}

                  {product.kategori?.nama && (
                    <p>
                      Kategori:{" "}
                      {product.kategori.nama}
                    </p>
                  )}

                  {product.deskripsi && (
                    <p>
                      {product.deskripsi}
                    </p>
                  )}

                </Link>
              );
            })}

          </div>
        )}

      </div>
    </section>
  );
}
