import Link from "next/link";
import { getSupabase } from "../lib/supabase";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = getSupabase();

  let products = [];
  let categories = [];
  let brands = [];
  let errorMessage = null;

  if (!supabase) {
    errorMessage =
      "Koneksi Supabase belum tersedia.";
  } else {
    const [
      productsResult,
      categoriesResult,
      brandsResult,
    ] = await Promise.all([
      supabase
        .from("produk")
        .select(`
          id,
          nama,
          deskripsi,
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
        .order("id", {
          ascending: true,
        }),

      supabase
        .from("kategori")
        .select(`
          id,
          nama,
          slug,
          deskripsi,
          gambar_url,
          urutan
        `)
        .eq("aktif", true)
        .order("urutan", {
          ascending: true,
        })
        .order("nama", {
          ascending: true,
        }),

      supabase
        .from("brand")
        .select(`
          id,
          nama,
          slug,
          logo_url,
          urutan
        `)
        .eq("aktif", true)
        .order("urutan", {
          ascending: true,
        })
        .order("nama", {
          ascending: true,
        }),
    ]);

    if (productsResult.error) {
      console.error(
        "SUPABASE PRODUK ERROR:",
        productsResult.error
      );

      errorMessage =
        productsResult.error.message;
    } else {
      products =
        productsResult.data || [];
    }

    if (categoriesResult.error) {
      console.error(
        "SUPABASE KATEGORI ERROR:",
        categoriesResult.error
      );

      if (!errorMessage) {
        errorMessage =
          categoriesResult.error.message;
      }
    } else {
      categories =
        categoriesResult.data || [];
    }

    if (brandsResult.error) {
      console.error(
        "SUPABASE BRAND ERROR:",
        brandsResult.error
      );

      if (!errorMessage) {
        errorMessage =
          brandsResult.error.message;
      }
    } else {
      brands =
        brandsResult.data || [];
    }
  }

  const popularCategories =
    categories.slice(0, 6);

  const popularBrands =
    brands.slice(0, 6);

  const featuredProducts =
    products.slice(0, 8);

  function getMainImage(product) {
    const images =
      product.produk_gambar || [];

    const mainImage = images.find(
      (image) => image.utama
    );

    return (
      mainImage ||
      images[0] ||
      null
    );
  }

  function getPrice(product) {
    const price =
      (product.harga_produk || []).find(
        (item) => item.aktif
      );

    if (!price) {
      return "Harga tersedia";
    }

    if (
      price.mode_harga === "pasti"
    ) {
      return `Rp ${Number(
        price.harga || 0
      ).toLocaleString("id-ID")}`;
    }

    if (
      price.mode_harga === "range"
    ) {
      return `Rp ${Number(
        price.harga_min || 0
      ).toLocaleString(
        "id-ID"
      )} – Rp ${Number(
        price.harga_max || 0
      ).toLocaleString(
        "id-ID"
      )}`;
    }

    if (
      price.mode_harga ===
      "mulai_dari"
    ) {
      return `Mulai Rp ${Number(
        price.harga_min ||
          price.harga ||
          0
      ).toLocaleString(
        "id-ID"
      )}`;
    }

    if (
      price.mode_harga ===
      "hubungi"
    ) {
      return "Hubungi kami";
    }

    return "Harga tersedia";
  }

  return (
    <>
      {/* HERO */}

      <section className="hero">
        <div className="wrap">
          <p>
            <b>
              TOKO LISTRIK SINAR KASIH
            </b>
          </p>

          <h1>
            Kebutuhan listrik, lampu &
            perlengkapan rumah.
          </h1>

          <p>
            Temukan berbagai kebutuhan
            listrik dan perlengkapan rumah
            dengan mudah.
          </p>

          <Link
            href="/kategori"
            className="btn"
          >
            Belanja Produk
          </Link>
        </div>
      </section>

      {/* KATEGORI POPULER */}

      <section className="section">
        <div className="wrap">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent:
                "space-between",
              gap: "12px",
              marginBottom: "18px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                }}
              >
                Kategori Populer
              </h2>

              <p
                style={{
                  margin:
                    "6px 0 0",
                  color: "#756b60",
                  fontSize: "14px",
                }}
              >
                Temukan kebutuhan
                berdasarkan kategori.
              </p>
            </div>

            <Link
              href="/kategori"
              style={{
                textDecoration:
                  "none",
                fontWeight: 700,
                color: "#7a4f35",
              }}
            >
              Lihat Semua →
            </Link>
          </div>

          {popularCategories.length ===
          0 ? (
            <div className="notice">
              Belum ada kategori aktif.
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fill, minmax(145px, 1fr))",
                gap: "14px",
              }}
            >
              {popularCategories.map(
                (category) => (
                  <Link
                    key={category.id}
                    href={`/kategori/${category.slug}`}
                    style={{
                      textDecoration:
                        "none",
                      color: "inherit",
                    }}
                  >
                    <article
                      style={{
                        background:
                          "#fff",
                        border:
                          "1px solid #e2d7c8",
                        borderRadius:
                          "14px",
                        padding:
                          "12px",
                        height: "100%",
                        boxSizing:
                          "border-box",
                      }}
                    >
                      <div
                        style={{
                          width:
                            "100%",
                          height:
                            "120px",
                          borderRadius:
                            "10px",
                          overflow:
                            "hidden",
                          background:
                            "#f5f0e8",
                          display:
                            "flex",
                          alignItems:
                            "center",
                          justifyContent:
                            "center",
                        }}
                      >
                        {category.gambar_url ? (
                          <img
                            src={
                              category.gambar_url
                            }
                            alt={
                              category.nama
                            }
                            style={{
                              width:
                                "100%",
                              height:
                                "100%",
                              objectFit:
                                "contain",
                            }}
                          />
                        ) : (
                          <span
                            style={{
                              color:
                                "#8a7c6c",
                              fontSize:
                                "13px",
                              textAlign:
                                "center",
                            }}
                          >
                            Belum ada
                            gambar
                          </span>
                        )}
                      </div>

                      <h3
                        style={{
                          margin:
                            "10px 0 0",
                          fontSize:
                            "15px",
                          lineHeight:
                            1.35,
                        }}
                      >
                        {category.nama}
                      </h3>
                    </article>
                  </Link>
                )
              )}
            </div>
          )}
        </div>
      </section>

      {/* BRAND POPULER */}

      <section className="section">
        <div className="wrap">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent:
                "space-between",
              gap: "12px",
              marginBottom: "18px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                }}
              >
                Brand Populer
              </h2>

              <p
                style={{
                  margin:
                    "6px 0 0",
                  color: "#756b60",
                  fontSize: "14px",
                }}
              >
                Pilihan brand yang
                tersedia di Sinar Kasih.
              </p>
            </div>

            <Link
              href="/kategori?tab=brand"
              style={{
                textDecoration:
                  "none",
                fontWeight: 700,
                color: "#7a4f35",
              }}
            >
              Lihat Semua →
            </Link>
          </div>

          {popularBrands.length ===
          0 ? (
            <div className="notice">
              Belum ada brand aktif.
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fill, minmax(145px, 1fr))",
                gap: "14px",
              }}
            >
              {popularBrands.map(
                (brand) => (
                  <Link
                    key={brand.id}
                    href="/kategori?tab=brand"
                    style={{
                      textDecoration:
                        "none",
                      color: "inherit",
                    }}
                  >
                    <article
                      style={{
                        background:
                          "#fff",
                        border:
                          "1px solid #e2d7c8",
                        borderRadius:
                          "14px",
                        padding:
                          "14px",
                        minHeight:
                          "120px",
                        display:
                          "flex",
                        flexDirection:
                          "column",
                        alignItems:
                          "center",
                        justifyContent:
                          "center",
                        textAlign:
                          "center",
                      }}
                    >
                      <div
                        style={{
                          width:
                            "100%",
                          height:
                            "80px",
                          display:
                            "flex",
                          alignItems:
                            "center",
                          justifyContent:
                            "center",
                        }}
                      >
                        {brand.logo_url ? (
                          <img
                            src={
                              brand.logo_url
                            }
                            alt={
                              brand.nama
                            }
                            style={{
                              maxWidth:
                                "100%",
                              maxHeight:
                                "72px",
                              objectFit:
                                "contain",
                            }}
                          />
                        ) : (
                          <span
                            style={{
                              color:
                                "#8a7c6c",
                              fontSize:
                                "13px",
                              fontWeight:
                                600,
                            }}
                          >
                            Logo belum
                            tersedia
                          </span>
                        )}
                      </div>
                    </article>
                  </Link>
                )
              )}
            </div>
          )}
        </div>
      </section>

      {/* PRODUK PILIHAN */}

      <section className="section">
        <div className="wrap">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent:
                "space-between",
              gap: "12px",
              marginBottom: "18px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                }}
              >
                Produk Pilihan
              </h2>

              <p
                style={{
                  margin:
                    "6px 0 0",
                  color: "#756b60",
                  fontSize: "14px",
                }}
              >
                Beberapa produk yang
                tersedia di katalog Sinar
                Kasih.
              </p>
            </div>

            <Link
              href="/kategori"
              style={{
                textDecoration:
                  "none",
                fontWeight: 700,
                color: "#7a4f35",
              }}
            >
              Lihat Semua →
            </Link>
          </div>

          {errorMessage ? (
            <div className="notice">
              <b>
                Koneksi database:
              </b>{" "}
              {errorMessage}
            </div>
          ) : featuredProducts.length ===
            0 ? (
            <div className="notice">
              Belum ada produk aktif di
              database.
            </div>
          ) : (
            <div className="cards">
              {featuredProducts.map(
                (product) => {
                  const mainImage =
                    getMainImage(
                      product
                    );

                  return (
                    <Link
                      key={
                        product.id
                      }
                      href={`/produk/${product.id}`}
                      className="card"
                      style={{
                        textDecoration:
                          "none",
                        color:
                          "inherit",
                      }}
                    >
                      <div className="img">
                        {mainImage?.url ? (
                          <img
                            src={
                              mainImage.url
                            }
                            alt={
                              mainImage.alt_text ||
                              product.nama
                            }
                          />
                        ) : (
                          "Foto Produk"
                        )}
                      </div>

                      <div className="price">
                        {getPrice(
                          product
                        )}
                      </div>

                      <h3>
                        {product.nama}
                      </h3>

                      {product.deskripsi && (
                        <p>
                          {
                            product.deskripsi
                          }
                        </p>
                      )}
                    </Link>
                  );
                }
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
