-- Lokasi file: supabase/beranda-musiman.sql
-- Jalankan SEKALI di Supabase > SQL Editor.
-- 1. Tabel pengaturan "Produk Musiman" di Beranda (diatur dari admin Tampilan Website).
-- 2. Fungsi "produk_populer" untuk bagian Produk Populer di Beranda
--    (dihitung otomatis dari Statistik, hanya mengembalikan id produk & jumlah).
-- Aman dijalankan ulang.

-- ===== 1. PRODUK MUSIMAN =====
create table if not exists public.beranda_musiman (
  id integer primary key default 1 check (id = 1),  -- hanya satu baris pengaturan
  aktif boolean not null default false,
  judul text not null default 'Produk Musiman' check (length(judul) <= 80),
  keterangan text check (keterangan is null or length(keterangan) <= 200),
  tanggal_mulai date,
  tanggal_selesai date,
  produk_ids bigint[] not null default '{}',
  updated_at timestamptz not null default now()
);

insert into public.beranda_musiman (id) values (1) on conflict (id) do nothing;

alter table public.beranda_musiman enable row level security;

drop policy if exists "Semua orang boleh melihat produk musiman" on public.beranda_musiman;
create policy "Semua orang boleh melihat produk musiman"
  on public.beranda_musiman for select
  to anon, authenticated
  using (true);

drop policy if exists "Admin utama boleh mengubah produk musiman" on public.beranda_musiman;
create policy "Admin utama boleh mengubah produk musiman"
  on public.beranda_musiman for update
  to authenticated
  using (
    exists (select 1 from public.admin a
            where a.auth_user_id = auth.uid() and a.aktif = true and a.role = 'admin_utama')
  )
  with check (
    exists (select 1 from public.admin a
            where a.auth_user_id = auth.uid() and a.aktif = true and a.role = 'admin_utama')
  );

grant select on public.beranda_musiman to anon, authenticated;
grant update on public.beranda_musiman to authenticated;

-- ===== 2. PRODUK POPULER =====
-- Produk aktif yang paling banyak dilihat orang (bukan jumlah klik) dalam p_hari terakhir.
create or replace function public.produk_populer(p_hari integer default 30, p_batas integer default 6)
returns table (produk_id bigint, orang bigint)
language sql
stable
security definer
set search_path = public
as $$
  select k.produk_id, count(distinct k.pengunjung) as orang
  from public.statistik_kunjungan k
  join public.produk p on p.id = k.produk_id
  where k.jenis = 'halaman'
    and k.produk_id is not null
    and k.created_at >= now() - make_interval(days => least(greatest(coalesce(p_hari, 30), 1), 90))
    and p.aktif = true
    and p.deleted_at is null
  group by k.produk_id
  order by count(distinct k.pengunjung) desc, count(*) desc
  limit least(greatest(coalesce(p_batas, 6), 1), 12);
$$;

revoke all on function public.produk_populer(integer, integer) from public;
grant execute on function public.produk_populer(integer, integer) to anon, authenticated;
