import Link from "next/link";
const products=["Philips LED 9W","Inlite Panel OB 18W","Dexta Stop Kontak Gepeng","TRM Stop Kontak Kabel 3M"];
export default function Home(){return <>
<section className="hero"><div className="wrap"><p><b>TOKO LISTRIK SINAR KASIH</b></p><h1>Kebutuhan listrik, lampu & perlengkapan rumah.</h1><p>Temukan produk listrik untuk rumah, toko, kantor, dan kebutuhan proyek di Ambon.</p><Link className="btn" href="/kategori">Belanja Produk</Link></div></section>
<section className="section"><div className="wrap"><h2>Produk Pilihan</h2><div className="cards">{products.map(p=><div className="card" key={p}><div className="img">Foto Produk</div><h3>{p}</h3><div className="price">Harga tersedia</div></div>)}</div></div></section>
<section className="section"><div className="wrap"><div className="notice"><b>Catatan:</b> katalog produk nyata akan diisi setelah sistem website selesai.</div></div></section>
</>}