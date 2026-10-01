import Link from "next/link";
import { getSupabase } from "../../lib/supabase";

export const dynamic = "force-dynamic";

export default async function Page({ searchParams }) {
  const params = await searchParams;

  const activeTab =
    params?.tab === "brand"
      ? "brand"
      : "kategori";

  const supabase = getSupabase();

  let categories = [];
  let brands = [];
  let errorMessage = null;

  if (!supabase) {
    errorMessage =
      "Koneksi Supabase belum tersedia.";
  } else {
    const [
      categoriesResult,
      brandsResult,
    ] = await Promise.all([
      supabase
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

    if (categoriesResult.error) {
      console.error(
        "SUPABASE KATEGORI ERROR:",
        categoriesResult.error
      );

      errorMessage =
        categoriesResult.error.message;
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

  return (
    <>
      <section className="section">
        <div className="wrap">

          {/* KEMBALI KE BERANDA */}

          <div
            style={{
              marginBottom: "18px",
            }}
          >
            <Link
              href="/"
              style={{
                display:
                  "inline-flex",
                alignItems:
                  "center",
                gap: "6px",
                textDecoration:
                  "none",
                color: "#7a4f35",
                fontWeight: 700,
                fontSize: "14px",
              }}
            >
              ← Kembali ke Beranda
            </Link>
          </div>

          {/* JUDUL */}

          <h1>
            Kategori Produk
          </h1>

          <p
            style={{
              marginTop: "8px",
              color: "#6b6258",
            }}
          >
            Jelajahi produk berdasarkan
            kategori atau brand.
          </p>

          {/* LAYOUT SIDEBAR + KONTEN */}

          <div
            className="kategori-public-layout"
            style={{
              marginTop: "28px",
            }}
          >

            {/* SIDEBAR PUBLIK */}

            <aside
              className="kategori-public-sidebar"
            >
              <div
                style={{
                  background:
                    "#fff",
                  border:
                    "1px solid #e2d7c8",
                  borderRadius:
                    "14px",
                  padding:
                    "18px",
                }}
              >
                <h3
                  style={{
                    margin:
                      "0 0 14px",
                    fontSize:
                      "17px",
                  }}
                >
                  Jelajahi Produk
                </h3>

                {/* MENU UTAMA */}

                <div
                  style={{
                    display:
                      "flex",
                    flexDirection:
                      "column",
                    gap: "6px",
                  }}
                >
                  <Link
                    href="/kategori"
                    style={{
                      display:
                        "block",
                      padding:
                        "10px 12px",
                      borderRadius:
                        "8px",
                      textDecoration:
                        "none",
                      background:
                        activeTab ===
                        "kategori"
                          ? "#7a4f35"
                          : "#f7f2eb",
                      color:
                        activeTab ===
                        "kategori"
                          ? "#fff"
                          : "#4b3528",
                      fontWeight:
                        700,
                      fontSize:
                        "14px",
                    }}
                  >
                    Kategori
                  </Link>

                  <Link
                    href="/kategori?tab=brand"
                    style={{
                      display:
                        "block",
                      padding:
                        "10px 12px",
                      borderRadius:
                        "8px",
                      textDecoration:
                        "none",
                      background:
                        activeTab ===
                        "brand"
                          ? "#7a4f35"
                          : "#f7f2eb",
                      color:
                        activeTab ===
                        "brand"
                          ? "#fff"
                          : "#4b3528",
                      fontWeight:
                        700,
                      fontSize:
                        "14px",
                    }}
                  >
                    Brand
                  </Link>
                </div>

                {/* DAFTAR KATEGORI */}

                {activeTab ===
                  "kategori" &&
                  categories.length >
                    0 && (
                    <div
                      style={{
                        marginTop:
                          "20px",
                        paddingTop:
                          "16px",
                        borderTop:
                          "1px solid #e8ddd0",
                      }}
                    >
                      <div
                        style={{
                          fontSize:
                            "12px",
                          fontWeight:
                            700,
                          color:
                            "#8a7c6c",
                          textTransform:
                            "uppercase",
                          letterSpacing:
                            "0.04em",
                          marginBottom:
                            "8px",
                        }}
                      >
                        Kategori
                      </div>

                      <div
                        style={{
                          display:
                            "flex",
                          flexDirection:
                            "column",
                          gap:
                            "2px",
                        }}
                      >
                        {categories.map(
                          (category) => (
                            <Link
                              key={
                                category.id
                              }
                              href={`/kategori/${category.slug}`}
                              style={{
                                padding:
                                  "8px 10px",
                                borderRadius:
                                  "7px",
                                textDecoration:
                                  "none",
                                color:
                                  "#5b4436",
                                fontSize:
                                  "13px",
                              }}
                            >
                              {category.nama}
                            </Link>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {/* DAFTAR BRAND */}

                {activeTab ===
                  "brand" &&
                  brands.length >
                    0 && (
                    <div
                      style={{
                        marginTop:
                          "20px",
                        paddingTop:
                          "16px",
                        borderTop:
                          "1px solid #e8ddd0",
                      }}
                    >
                      <div
                        style={{
                          fontSize:
                            "12px",
                          fontWeight:
                            700,
                          color:
                            "#8a7c6c",
                          textTransform:
                            "uppercase",
                          letterSpacing:
                            "0.04em",
                          marginBottom:
                            "8px",
                        }}
                      >
                        Brand
                      </div>

                      <div
                        style={{
                          display:
                            "flex",
                          flexDirection:
                            "column",
                          gap:
                            "2px",
                        }}
                      >
                        {brands.map(
                          (brand) => (
                            <a
                              key={
                                brand.id
                              }
                              href={`#brand-${brand.slug}`}
                              style={{
                                padding:
                                  "8px 10px",
                                borderRadius:
                                  "7px",
                                textDecoration:
                                  "none",
                                color:
                                  "#5b4436",
                                fontSize:
                                  "13px",
                              }}
                            >
                              {brand.nama}
                            </a>
                          )
                        )}
                      </div>
                    </div>
                  )}
              </div>
            </aside>

            {/* KONTEN UTAMA */}

            <div
              className="kategori-public-content"
            >

              {/* TAB KATEGORI / BRAND */}

              <div
                style={{
                  display:
                    "flex",
                  gap: "8px",
                  marginBottom:
                    "24px",
                  borderBottom:
                    "1px solid #e2d7c8",
                }}
              >
                <Link
                  href="/kategori"
                  style={{
                    textDecoration:
                      "none",
                    background:
                      activeTab ===
                      "kategori"
                        ? "#7a4f35"
                        : "#f5f0e8",
                    color:
                      activeTab ===
                      "kategori"
                        ? "#ffffff"
                        : "#4b3528",
                    padding:
                      "10px 20px",
                    borderRadius:
                      "10px 10px 0 0",
                    fontWeight:
                      700,
                  }}
                >
                  Kategori
                </Link>

                <Link
                  href="/kategori?tab=brand"
                  style={{
                    textDecoration:
                      "none",
                    background:
                      activeTab ===
                      "brand"
                        ? "#7a4f35"
                        : "#f5f0e8",
                    color:
                      activeTab ===
                      "brand"
                        ? "#ffffff"
                        : "#4b3528",
                    padding:
                      "10px 20px",
                    borderRadius:
                      "10px 10px 0 0",
                    fontWeight:
                      700,
                  }}
                >
                  Brand
                </Link>
              </div>

              {/* ERROR */}

              {errorMessage ? (
                <div className="notice">
                  <b>
                    Koneksi database:
                  </b>{" "}
                  {errorMessage}
                </div>
              ) : activeTab ===
                "brand" ? (

                /* =========================
                   BRAND
                   ========================= */

                <>
                  <h2
                    style={{
                      marginTop: 0,
                    }}
                  >
                    Brand
                  </h2>

                  <p
                    style={{
                      marginTop:
                        "6px",
                      color:
                        "#756b60",
                      fontSize:
                        "14px",
                    }}
                  >
                    Brand diurutkan
                    berdasarkan
                    Urutan Tampil.
                  </p>

                  {brands.length ===
                  0 ? (
                    <div className="notice">
                      Belum ada
                      brand aktif.
                    </div>
                  ) : (
                    <div
                      className="public-brand-grid"
                      style={{
                        marginTop:
                          "20px",
                      }}
                    >
                      {brands.map(
                        (brand) => (
                          <article
                            key={
                              brand.id
                            }
                            id={`brand-${brand.slug}`}
                            className="public-brand-card"
                          >
                            <div
                              style={{
                                width:
                                  "100%",
                                height:
                                  "90px",
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
                                      "82px",
                                    objectFit:
                                      "contain",
                                  }}
                                />
                              ) : (
                                <span
                                  style={{
                                    fontSize:
                                      "18px",
                                    fontWeight:
                                      800,
                                    color:
                                      "#6f4a32",
                                  }}
                                >
                                  {brand.nama}
                                </span>
                              )}
                            </div>
                          </article>
                        )
                      )}
                    </div>
                  )}
                </>

              ) : (

                /* =========================
                   KATEGORI
                   ========================= */

                <>
                  <h2
                    style={{
                      marginTop: 0,
                    }}
                  >
                    Kategori
                  </h2>

                  <p
                    style={{
                      marginTop:
                        "6px",
                      color:
                        "#756b60",
                      fontSize:
                        "14px",
                    }}
                  >
                    Kategori diurutkan
                    berdasarkan
                    Urutan Tampil.
                  </p>

                  {categories.length ===
                  0 ? (
                    <div className="notice">
                      Belum ada
                      kategori aktif.
                    </div>
                  ) : (
                    <div
                      className="public-category-grid"
                      style={{
                        marginTop:
                          "20px",
                      }}
                    >
                      {categories.map(
                        (category) => (
                          <Link
                            href={`/kategori/${category.slug}`}
                            key={
                              category.id
                            }
                            style={{
                              textDecoration:
                                "none",
                              color:
                                "inherit",
                            }}
                          >
                            <article
                              className="public-category-card"
                            >
                              <div
                                style={{
                                  width:
                                    "100%",
                                  height:
                                    "130px",
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
                                        "14px",
                                    }}
                                  >
                                    Belum
                                    ada
                                    gambar
                                  </span>
                                )}
                              </div>

                              <div
                                style={{
                                  marginTop:
                                    "12px",
                                  fontWeight:
                                    700,
                                  fontSize:
                                    "16px",
                                }}
                              >
                                {
                                  category.nama
                                }
                              </div>

                              {category.deskripsi && (
                                <div
                                  style={{
                                    marginTop:
                                      "5px",
                                    fontSize:
                                      "13px",
                                    color:
                                      "#756b60",
                                  }}
                                >
                                  {
                                    category.deskripsi
                                  }
                                </div>
                              )}
                            </article>
                          </Link>
                        )
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* STYLE KHUSUS HALAMAN KATEGORI */}

      <style>{`
        .kategori-public-layout {
          display: grid;
          grid-template-columns: 220px minmax(0, 1fr);
          gap: 28px;
          align-items: start;
        }

        .kategori-public-sidebar {
          position: sticky;
          top: 20px;
        }

        .public-brand-grid {
          display: grid;
          grid-template-columns:
            repeat(
              auto-fill,
              minmax(180px, 1fr)
            );
          gap: 18px;
        }

        .public-brand-card {
          background: #fff;
          border: 1px solid #e2d7c8;
          border-radius: 14px;
          padding: 16px;
          min-height: 160px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          box-sizing: border-box;
          scroll-margin-top: 30px;
        }

        .public-category-grid {
          display: grid;
          grid-template-columns:
            repeat(
              auto-fill,
              minmax(180px, 1fr)
            );
          gap: 18px;
        }

        .public-category-card {
          background: #fff;
          border: 1px solid #e2d7c8;
          border-radius: 14px;
          padding: 14px;
          min-height: 190px;
          box-sizing: border-box;
        }

        .kategori-public-sidebar a:hover {
          background: #eee4d8 !important;
        }

        .public-brand-card,
        .public-category-card {
          transition:
            transform 0.15s ease,
            box-shadow 0.15s ease;
        }

        .public-brand-card:hover,
        .public-category-card:hover {
          transform: translateY(-2px);
          box-shadow:
            0 6px 18px rgba(63, 47, 36, 0.08);
        }

        @media (max-width: 800px) {
          .kategori-public-layout {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .kategori-public-sidebar {
            position: static;
          }

          .public-brand-grid,
          .public-category-grid {
            grid-template-columns:
              repeat(
                auto-fill,
                minmax(145px, 1fr)
              );
          }
        }

        @media (max-width: 480px) {
          .public-brand-grid,
          .public-category-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
            gap: 12px;
          }

          .public-brand-card {
            min-height: 135px;
            padding: 12px;
          }

          .public-category-card {
            min-height: 165px;
            padding: 10px;
          }
        }
      `}</style>
    </>
  );
}
