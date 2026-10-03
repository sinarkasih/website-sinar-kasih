"use client";

// Lokasi file: app/checkout/page.js
// Checkout: jejak Troli › Checkout, langkah pemesanan, formulir data pemesan
// (nama, WhatsApp, pilihan cabang berupa kartu, catatan), ringkasan pesanan
// dengan foto & perkiraan total, lalu pesanan dikirim lewat WhatsApp.
// Logika penyimpanan pesanan tetap memakai fungsi database buat_pesanan.

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabase } from "../../lib/supabase";

const KUNCI_TROLI = "sinar_kasih_cart";

function rupiah(n) {
  return "Rp " + Number(n || 0).toLocaleString("id-ID");
}

function teksHarga(item) {
  if (item.mode_harga === "pasti") return rupiah(item.harga);
  if (item.mode_harga === "range") return `${rupiah(item.harga_min)} – ${rupiah(item.harga_max)}`;
  if (item.mode_harga === "mulai_dari") return `Mulai ${rupiah(item.harga_min || item.harga)}`;
  return "Hubungi kami";
}

// 081285750033 / 8128... / +62 812... -> 6281285750033
function formatNomorWhatsApp(nilai) {
  const d = String(nilai || "").replace(/\D/g, "");
  if (!d) return "";
  if (d.startsWith("62")) return d;
  if (d.startsWith("0")) return "62" + d.slice(1);
  if (d.startsWith("8")) return "62" + d;
  return d;
}

function nomorPesananDari(data) {
  if (!data) return null;
  if (typeof data === "string" || typeof data === "number") return String(data);
  const baris = Array.isArray(data) ? data[0] : data;
  return baris?.nomor_pesanan || null;
}

function IkonWA({ ukuran = 20 }) {
  return (
    <svg width={ukuran} height={ukuran} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.8-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.1 5.1 0 0 0 1.1 2.7 11.7 11.7 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.4-.3Z" />
    </svg>
  );
}

function Langkah({ aktif }) {
  const daftar = ["Troli", "Data Pemesan", "Kirim via WhatsApp"];
  return (
    <ol className="co-langkah" aria-label="Langkah pemesanan">
      {daftar.map((l, i) => (
        <li key={l} className={i < aktif ? "selesai" : i === aktif ? "aktif" : ""}>
          <span className="co-langkah-no">{i < aktif ? "✓" : i + 1}</span>
          <span>{l}</span>
        </li>
      ))}
    </ol>
  );
}

export default function CheckoutPage() {
  const [cart, setCart] = useState([]);
  const [branches, setBranches] = useState([]);
  const [whatsapp, setWhatsapp] = useState("");
  const [nama, setNama] = useState("");
  const [nomorWhatsapp, setNomorWhatsapp] = useState("");
  const [cabangId, setCabangId] = useState("");
  const [catatan, setCatatan] = useState("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [salahKolom, setSalahKolom] = useState({});
  const [selesai, setSelesai] = useState(null);

  useEffect(() => {
    async function loadCheckout() {
      let tersimpan = [];
      try {
        tersimpan = JSON.parse(localStorage.getItem(KUNCI_TROLI) || "[]");
        if (!Array.isArray(tersimpan)) tersimpan = [];
      } catch {
        tersimpan = [];
      }
      setCart(tersimpan);

      const supabase = getSupabase();
      if (!supabase) {
        setErrorMessage("Koneksi database belum tersedia. Silakan coba lagi nanti.");
        setLoading(false);
        return;
      }

      const [cb, kt] = await Promise.all([
        supabase.from("cabang_toko").select("id, nama, alamat").eq("aktif", true).order("urutan", { ascending: true }),
        supabase.from("kontak_toko").select("whatsapp").eq("aktif", true).limit(1).maybeSingle(),
      ]);

      if (cb.error) {
        setErrorMessage(cb.error.message);
      } else {
        setBranches(cb.data || []);
        if (cb.data?.length === 1) setCabangId(String(cb.data[0].id));
      }
      if (!kt.error && kt.data?.whatsapp) setWhatsapp(kt.data.whatsapp);

      setLoading(false);
    }

    loadCheckout();
  }, []);

  const totalItem = cart.reduce((s, i) => s + Math.max(0, Number(i.qty) || 0), 0);
  const semuaPasti = cart.length > 0 && cart.every((i) => i.mode_harga === "pasti");
  const totalPasti = cart
    .filter((i) => i.mode_harga === "pasti")
    .reduce((s, i) => s + (Number(i.harga) || 0) * (Number(i.qty) || 0), 0);
  const adaPasti = cart.some((i) => i.mode_harga === "pasti");

  function periksa() {
    const salah = {};
    if (!nama.trim()) salah.nama = "Nama wajib diisi.";
    const digit = nomorWhatsapp.replace(/\D/g, "");
    if (!digit) salah.wa = "Nomor WhatsApp wajib diisi.";
    else if (digit.length < 9 || digit.length > 15) salah.wa = "Nomor WhatsApp sepertinya belum benar. Contoh: 0812 3456 7890.";
    if (!cabangId) salah.cabang = "Silakan pilih cabang toko.";
    setSalahKolom(salah);
    return Object.keys(salah).length === 0;
  }

  async function submitOrder(event) {
    event.preventDefault();
    setErrorMessage("");

    if (cart.length === 0) {
      setErrorMessage("Troli masih kosong.");
      return;
    }
    if (!periksa()) {
      setErrorMessage("Mohon lengkapi data yang ditandai merah.");
      return;
    }

    const supabase = getSupabase();
    if (!supabase) {
      setErrorMessage("Koneksi database belum tersedia. Silakan coba lagi nanti.");
      return;
    }

    setProcessing(true);

    const items = cart.map((item) => ({
      produk_id: item.id,
      variasi_id: null,
      jumlah: item.qty,
    }));

    const { data, error } = await supabase.rpc("buat_pesanan", {
      p_nama: nama.trim(),
      p_whatsapp: nomorWhatsapp.trim(),
      p_cabang_id: Number(cabangId),
      p_catatan: catatan.trim() || null,
      p_items: items,
    });

    if (error) {
      console.error("CHECKOUT ERROR:", error);
      setErrorMessage(`Pesanan belum terkirim: ${error.message}`);
      setProcessing(false);
      return;
    }

    const nomorPesanan = nomorPesananDari(data);
    const cabang = branches.find((b) => String(b.id) === String(cabangId));

    let pesan = "Halo Toko Listrik Sinar Kasih,\n\n";
    pesan += nomorPesanan ? `Saya ingin memesan (No. Pesanan ${nomorPesanan}):\n` : "Saya ingin memesan:\n";
    cart.forEach((item, i) => {
      pesan += `${i + 1}. ${item.nama}\n`;
      pesan += `   Jumlah: ${item.qty}\n`;
      pesan += `   Harga: ${teksHarga(item)}\n`;
    });
    pesan += `\nNama: ${nama.trim()}\n`;
    pesan += `WhatsApp: ${nomorWhatsapp.trim()}\n`;
    if (cabang) pesan += `Cabang: ${cabang.nama}\n`;
    if (catatan.trim()) pesan += `Catatan: ${catatan.trim()}\n`;
    pesan += "\nMohon konfirmasi ketersediaan dan harga final.";

    localStorage.removeItem(KUNCI_TROLI);
    window.dispatchEvent(new Event("sinar-kasih-cart-updated"));

    const nomorToko = formatNomorWhatsApp(whatsapp);
    const linkWA = nomorToko ? `https://wa.me/${nomorToko}?text=${encodeURIComponent(pesan)}` : "";

    setSelesai({ nomorPesanan, linkWA, cabang: cabang?.nama || "" });
    setCart([]);
    setProcessing(false);

    if (linkWA) window.location.href = linkWA;
  }

  // ===== Setelah pesanan terkirim =====
  if (selesai) {
    return (
      <section className="section halaman-atas">
        <div className="wrap co-sempit">
          <Langkah aktif={selesai.linkWA ? 2 : 3} />
          <div className="co-selesai">
            <span className="co-selesai-ikon" aria-hidden="true">✓</span>
            <h1>Pesanan Anda sudah kami terima</h1>
            {selesai.nomorPesanan && <p className="co-nomor">No. Pesanan: <strong>{selesai.nomorPesanan}</strong></p>}
            {selesai.linkWA ? (
              <>
                <p>
                  WhatsApp sedang dibuka dengan pesan pesanan Anda. <strong>Tekan tombol kirim</strong> di WhatsApp
                  supaya toko bisa segera mengonfirmasi ketersediaan dan harga.
                </p>
                <a href={selesai.linkWA} className="co-kirim">
                  <IkonWA /> Buka WhatsApp Lagi
                </a>
              </>
            ) : (
              <p>Nomor WhatsApp toko belum tersedia. Toko akan menghubungi Anda lewat nomor yang Anda isi.</p>
            )}
            <Link href="/kategori" className="co-lanjut">← Kembali belanja</Link>
          </div>
        </div>
        <GayaCheckout />
      </section>
    );
  }

  return (
    <section className="section halaman-atas">
      <div className="wrap">
        <nav className="jejak" aria-label="Posisi halaman">
          <Link href="/">Beranda</Link>
          <span>›</span>
          <Link href="/troli">Troli</Link>
          <span>›</span>
          <strong>Checkout</strong>
        </nav>

        <div className="kepala-halaman">
          <h1>Checkout</h1>
          <p>Isi data Anda, lalu pesanan dikirim ke toko lewat WhatsApp untuk dikonfirmasi.</p>
        </div>

        <Langkah aktif={1} />

        {loading ? (
          <div className="kosong-cantik"><p>Memuat data checkout...</p></div>
        ) : cart.length === 0 ? (
          <div className="kosong-cantik">
            <h2>Troli masih kosong</h2>
            <p>Pilih produk kebutuhan listrik Anda terlebih dahulu.</p>
            <Link href="/kategori" className="btn">Belanja Produk</Link>
          </div>
        ) : (
          <form className="co-tata" onSubmit={submitOrder} noValidate>
            <div className="co-form">
              <section className="co-kartu">
                <h2>Data Pemesan</h2>

                <div className="co-kolom">
                  <label htmlFor="co-nama">Nama</label>
                  <input
                    id="co-nama"
                    value={nama}
                    onChange={(e) => { setNama(e.target.value); if (salahKolom.nama) setSalahKolom((s) => ({ ...s, nama: null })); }}
                    placeholder="Nama Anda"
                    autoComplete="name"
                    aria-invalid={!!salahKolom.nama}
                    className={salahKolom.nama ? "salah" : ""}
                  />
                  {salahKolom.nama && <span className="co-salah">{salahKolom.nama}</span>}
                </div>

                <div className="co-kolom">
                  <label htmlFor="co-wa">Nomor WhatsApp</label>
                  <input
                    id="co-wa"
                    type="tel"
                    inputMode="tel"
                    value={nomorWhatsapp}
                    onChange={(e) => { setNomorWhatsapp(e.target.value); if (salahKolom.wa) setSalahKolom((s) => ({ ...s, wa: null })); }}
                    placeholder="08xx xxxx xxxx"
                    autoComplete="tel"
                    aria-invalid={!!salahKolom.wa}
                    className={salahKolom.wa ? "salah" : ""}
                  />
                  {salahKolom.wa ? (
                    <span className="co-salah">{salahKolom.wa}</span>
                  ) : (
                    <span className="co-bantu">Toko akan menghubungi Anda lewat nomor ini.</span>
                  )}
                </div>
              </section>

              <section className="co-kartu">
                <h2>Pilih Cabang</h2>
                <p className="co-bantu co-bantu-atas">Cabang tempat Anda ingin mengambil atau memesan barang.</p>
                {branches.length === 0 ? (
                  <p className="co-bantu">Data cabang belum tersedia.</p>
                ) : (
                  <div className="co-cabang" role="radiogroup" aria-label="Pilih cabang">
                    {branches.map((b) => (
                      <label key={b.id} className={`co-cabang-item ${String(b.id) === cabangId ? "dipilih" : ""}`}>
                        <input
                          type="radio"
                          name="cabang"
                          value={b.id}
                          checked={String(b.id) === cabangId}
                          onChange={() => { setCabangId(String(b.id)); setSalahKolom((s) => ({ ...s, cabang: null })); }}
                        />
                        <span className="co-cabang-teks">
                          <strong>{b.nama}</strong>
                          {b.alamat && <span>{b.alamat}</span>}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
                {salahKolom.cabang && <span className="co-salah">{salahKolom.cabang}</span>}
              </section>

              <section className="co-kartu">
                <h2>Catatan <span className="co-opsional">(boleh dikosongkan)</span></h2>
                <textarea
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  placeholder="Contoh: Tolong konfirmasi stok dulu. Barang akan diambil sore hari."
                  rows={3}
                  maxLength={500}
                />
                <span className="co-bantu">Mohon tidak menulis data pribadi seperti nomor KTP atau rekening.</span>
              </section>
            </div>

            <aside className="co-ringkas">
              <div className="co-ringkas-kepala">
                <h2>Pesanan Anda</h2>
                <Link href="/troli">Ubah</Link>
              </div>

              <ul className="co-item">
                {cart.map((item) => (
                  <li key={item.id}>
                    <span className="co-foto">
                      {item.gambar ? <img src={item.gambar} alt="" /> : <span>Foto</span>}
                      <span className="co-qty">{item.qty}</span>
                    </span>
                    <span className="co-item-teks">
                      <span className="co-item-nama">{item.nama}</span>
                      <span className="co-item-harga">{teksHarga(item)}</span>
                    </span>
                    {item.mode_harga === "pasti" && (
                      <strong className="co-item-sub">{rupiah((Number(item.harga) || 0) * (Number(item.qty) || 0))}</strong>
                    )}
                  </li>
                ))}
              </ul>

              <div className="co-total">
                <div><span>Jumlah barang</span><strong>{totalItem}</strong></div>
                {adaPasti && (
                  <div className="besar">
                    <span>{semuaPasti ? "Perkiraan total" : "Subtotal harga pasti"}</span>
                    <strong>{rupiah(totalPasti)}</strong>
                  </div>
                )}
                <p className="co-bantu">
                  {semuaPasti
                    ? "Harga final dan ketersediaan dikonfirmasi toko lewat WhatsApp."
                    : "Sebagian produk harganya dikonfirmasi toko lewat WhatsApp."}
                </p>
              </div>

              {errorMessage && <div className="co-error" role="alert">{errorMessage}</div>}

              <button type="submit" className="co-kirim" disabled={processing}>
                <IkonWA /> {processing ? "Mengirim pesanan..." : "Kirim Pesanan via WhatsApp"}
              </button>
              <p className="co-kecil">
                Dengan mengirim pesanan, Anda menyetujui <Link href="/kebijakan-privasi">Kebijakan Privasi</Link> kami.
              </p>
            </aside>
          </form>
        )}
      </div>
      <GayaCheckout />
    </section>
  );
}

function GayaCheckout() {
  return (
    <style>{`
      .co-sempit { max-width: 640px; }
      .co-langkah { display: flex; gap: 8px; list-style: none; margin: 0 0 24px; padding: 0; flex-wrap: wrap; }
      .co-langkah li { display: flex; align-items: center; gap: 8px; padding: 6px 14px 6px 6px; border-radius: 999px; background: #f6efe6; color: #9a8571; font-size: 13.5px; font-weight: 600; }
      .co-langkah li.aktif { background: #6f4c36; color: #fff; }
      .co-langkah li.selesai { background: #eaf7ed; color: #2f6b3f; }
      .co-langkah-no { width: 24px; height: 24px; display: grid; place-items: center; border-radius: 50%; background: rgba(255,255,255,.75); color: inherit; font-size: 12.5px; font-weight: 800; }
      .co-langkah li.aktif .co-langkah-no { background: rgba(255,255,255,.2); }

      .co-tata { display: grid; grid-template-columns: minmax(0, 1fr) 380px; gap: 24px; align-items: start; }
      .co-form { display: grid; gap: 16px; min-width: 0; }
      .co-kartu { padding: 20px 22px; background: #fff; border: 1px solid #eadfce; border-radius: 16px; display: grid; gap: 14px; }
      .co-kartu h2 { margin: 0; font-size: 18px; color: #3f2f24; }
      .co-opsional { font-size: 13.5px; font-weight: 500; color: #9a8571; }
      .co-kolom { display: grid; gap: 6px; }
      .co-kolom label { font-size: 14px; font-weight: 700; color: #4b3326; }
      .co-kartu input[type="text"], .co-kartu input:not([type]), .co-kartu input[type="tel"], .co-kartu textarea {
        width: 100%; box-sizing: border-box; padding: 12px 14px; border: 1px solid #e0cfbb; border-radius: 12px;
        background: #fff; font-size: 16px; color: #3f2f24; outline: none; transition: border-color .15s ease, box-shadow .15s ease;
      }
      .co-kartu input { height: 50px; }
      .co-kartu textarea { resize: vertical; min-height: 90px; line-height: 1.5; }
      .co-kartu input:focus, .co-kartu textarea:focus { border-color: #6f4c36; box-shadow: 0 0 0 3px rgba(111,76,54,.12); }
      .co-kartu input.salah { border-color: #c0392b; }
      .co-salah { font-size: 13px; font-weight: 600; color: #b23b2e; }
      .co-bantu { font-size: 13px; color: #9a8571; margin: 0; }
      .co-bantu-atas { margin-top: -8px; }

      .co-cabang { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 10px; }
      .co-cabang-item { position: relative; display: flex; gap: 10px; align-items: flex-start; padding: 14px; border: 1.5px solid #eadfce; border-radius: 12px; background: #fcfaf7; cursor: pointer; transition: border-color .15s ease, background .15s ease; }
      .co-cabang-item:hover { border-color: #d6c1a8; }
      .co-cabang-item.dipilih { border-color: #6f4c36; background: #fff8ee; }
      .co-cabang-item input { margin: 3px 0 0; width: 18px; height: 18px; accent-color: #6f4c36; flex-shrink: 0; }
      .co-cabang-teks { display: grid; gap: 3px; min-width: 0; }
      .co-cabang-teks strong { font-size: 15px; color: #3f2f24; }
      .co-cabang-teks span { font-size: 13px; line-height: 1.45; color: #7a6555; }

      .co-ringkas { position: sticky; top: 90px; display: grid; gap: 14px; padding: 20px; background: #fff; border: 1px solid #eadfce; border-radius: 16px; }
      .co-ringkas-kepala { display: flex; justify-content: space-between; align-items: baseline; }
      .co-ringkas-kepala h2 { margin: 0; font-size: 18px; color: #3f2f24; }
      .co-ringkas-kepala a { font-size: 14px; font-weight: 700; color: #6f4c36; }
      .co-item { list-style: none; margin: 0; padding: 0; display: grid; gap: 12px; max-height: 360px; overflow-y: auto; }
      .co-item li { display: flex; align-items: center; gap: 12px; }
      .co-foto { position: relative; width: 56px; height: 56px; flex-shrink: 0; display: grid; place-items: center; border-radius: 10px; background: #f7f1e8; color: #b9a690; font-size: 11px; }
      .co-foto img { width: 100%; height: 100%; object-fit: contain; border-radius: 10px; }
      .co-qty { position: absolute; top: -6px; right: -6px; min-width: 22px; height: 22px; padding: 0 6px; display: grid; place-items: center; border-radius: 999px; background: #6f4c36; color: #fff; font-size: 12px; font-weight: 800; box-sizing: border-box; }
      .co-item-teks { display: grid; gap: 2px; min-width: 0; flex: 1; }
      .co-item-nama { font-size: 14px; font-weight: 600; color: #3f2f24; line-height: 1.35; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      .co-item-harga { font-size: 13px; color: #7a6555; }
      .co-item-sub { font-size: 14px; color: #3f2f24; white-space: nowrap; }
      .co-total { display: grid; gap: 8px; padding-top: 14px; border-top: 1px dashed #e0cfbb; }
      .co-total > div { display: flex; justify-content: space-between; font-size: 14.5px; color: #6f5a49; }
      .co-total > div.besar { font-size: 16px; color: #3f2f24; }
      .co-total > div.besar strong { font-size: 19px; }
      .co-error { padding: 10px 12px; border-radius: 10px; background: #fbebe7; color: #8a3b2b; font-size: 14px; }

      .co-kirim { display: inline-flex; align-items: center; justify-content: center; gap: 10px; width: 100%; min-height: 54px; padding: 0 18px; border: none; border-radius: 14px; background: #1f9d55; color: #fff; font-family: inherit; font-size: 16px; font-weight: 800; text-decoration: none; cursor: pointer; transition: background .15s ease; box-sizing: border-box; }
      .co-kirim:hover { background: #188146; }
      .co-kirim:disabled { opacity: .7; cursor: wait; }
      .co-kirim:focus-visible { outline: 3px solid #c58a2b; outline-offset: 2px; }
      .co-kecil { margin: 0; font-size: 12.5px; color: #9a8571; text-align: center; }
      .co-kecil a { color: #6f4c36; }

      .co-selesai { display: grid; justify-items: center; gap: 12px; padding: 36px 26px; text-align: center; background: #fff; border: 1px solid #eadfce; border-radius: 18px; }
      .co-selesai-ikon { width: 64px; height: 64px; display: grid; place-items: center; border-radius: 50%; background: #eaf7ed; color: #2f7a46; font-size: 30px; font-weight: 800; }
      .situs .co-selesai h1 { font-size: clamp(22px, 3vw, 28px) !important; margin: 0 !important; }
      .co-selesai p { margin: 0; color: #6f5a49; line-height: 1.6; }
      .co-nomor strong { color: #3f2f24; }
      .co-selesai .co-kirim { max-width: 320px; margin-top: 6px; }
      .co-lanjut { margin-top: 4px; font-weight: 700; color: #6f4c36; text-decoration: none; }

      @media (max-width: 960px) {
        .co-tata { grid-template-columns: minmax(0, 1fr); }
        .co-ringkas { position: static; }
      }
      @media (max-width: 520px) {
        .co-kartu { padding: 16px; }
        .co-langkah li { padding-right: 10px; font-size: 12.5px; }
        .co-cabang { grid-template-columns: 1fr; }
      }
    `}</style>
  );
}
