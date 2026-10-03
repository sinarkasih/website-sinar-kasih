-- Lokasi file: supabase/statistik.sql
-- Jalankan SEKALI di Supabase > SQL Editor.
-- Membuat tabel pencatat kunjungan website dan fungsi ringkasan untuk menu Statistik.
-- Aman dijalankan ulang (tidak menghapus data yang sudah ada).

-- 1. Tabel pencatat kunjungan
create table if not exists public.statistik_kunjungan (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  jenis text not null check (jenis in ('halaman', 'klik_wa')),
  path text check (path is null or length(path) <= 300),
  produk_id bigint,
  pengunjung text check (pengunjung is null or length(pengunjung) <= 64),
  sumber text check (sumber is null or length(sumber) <= 60)
);

create index if not exists statistik_kunjungan_waktu_idx
  on public.statistik_kunjungan (created_at);
create index if not exists statistik_kunjungan_produk_idx
  on public.statistik_kunjungan (produk_id, created_at)
  where produk_id is not null;

-- 2. Keamanan: pengunjung website hanya boleh MENAMBAH catatan,
--    tidak bisa melihat, mengubah, atau menghapus.
alter table public.statistik_kunjungan enable row level security;

drop policy if exists "Pengunjung boleh mencatat kunjungan" on public.statistik_kunjungan;
create policy "Pengunjung boleh mencatat kunjungan"
  on public.statistik_kunjungan
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Admin utama boleh melihat statistik" on public.statistik_kunjungan;
create policy "Admin utama boleh melihat statistik"
  on public.statistik_kunjungan
  for select
  to authenticated
  using (
    exists (
      select 1 from public.admin a
      where a.auth_user_id = auth.uid() and a.aktif = true and a.role = 'admin_utama'
    )
  );

grant insert on public.statistik_kunjungan to anon, authenticated;
grant select on public.statistik_kunjungan to authenticated;

-- 3. Fungsi ringkasan untuk halaman Statistik (hanya Admin Utama).
--    Tanggal dihitung dengan zona waktu Ambon (WIT).
create or replace function public.statistik_ringkas(p_hari integer default 30)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_hari integer;
  v_hari_ini date;
  v_awal date;
  v_dari timestamptz;
  v_hasil jsonb;
begin
  if not exists (
    select 1 from public.admin a
    where a.auth_user_id = auth.uid() and a.aktif = true and a.role = 'admin_utama'
  ) then
    raise exception 'Hanya Admin Utama yang boleh melihat statistik';
  end if;

  v_hari := least(greatest(coalesce(p_hari, 30), 1), 366);
  v_hari_ini := (now() at time zone 'Asia/Jayapura')::date;
  v_awal := v_hari_ini - (v_hari - 1);
  v_dari := v_awal::timestamp at time zone 'Asia/Jayapura';

  with
  k as (
    select (created_at at time zone 'Asia/Jayapura')::date as tgl,
           jenis, path, produk_id, pengunjung, sumber
    from public.statistik_kunjungan
    where created_at >= v_dari
  ),
  hari as (
    select generate_series(v_awal::timestamp, v_hari_ini::timestamp, interval '1 day')::date as tgl
  ),
  kh as (
    select tgl,
           count(*) filter (where jenis = 'halaman') as kunjungan,
           count(distinct pengunjung) filter (where jenis = 'halaman') as pengunjung,
           count(*) filter (where jenis = 'klik_wa') as klik_wa
    from k
    group by tgl
  ),
  ph as (
    select (created_at at time zone 'Asia/Jayapura')::date as tgl,
           count(*) as jumlah,
           coalesce(sum(total), 0) as nilai
    from public.pesanan
    where created_at >= v_dari
      and deleted_at is null
      and status <> 'dibatalkan'
    group by 1
  )
  select jsonb_build_object(
    'dari', v_awal,
    'sampai', v_hari_ini,
    'harian', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'tgl', h.tgl,
        'kunjungan', coalesce(kh.kunjungan, 0),
        'pengunjung', coalesce(kh.pengunjung, 0),
        'klik_wa', coalesce(kh.klik_wa, 0),
        'pesanan', coalesce(ph.jumlah, 0),
        'nilai', coalesce(ph.nilai, 0)
      ) order by h.tgl), '[]'::jsonb)
      from hari h
      left join kh on kh.tgl = h.tgl
      left join ph on ph.tgl = h.tgl
    ),
    'total', (
      select jsonb_build_object(
        'kunjungan', count(*) filter (where jenis = 'halaman'),
        'pengunjung', count(distinct pengunjung) filter (where jenis = 'halaman'),
        'klik_wa', count(*) filter (where jenis = 'klik_wa'),
        'sesi', count(*) filter (where jenis = 'halaman' and sumber is not null)
      )
      from k
    ),
    'produk', (
      select coalesce(jsonb_agg(jsonb_build_object('produk_id', produk_id, 'dilihat', dilihat, 'orang', orang)), '[]'::jsonb)
      from (
        select produk_id, count(*) as dilihat, count(distinct pengunjung) as orang
        from k
        where jenis = 'halaman' and produk_id is not null
        group by produk_id
        order by count(*) desc
        limit 10
      ) t
    ),
    'halaman', (
      select coalesce(jsonb_agg(jsonb_build_object('path', path, 'jumlah', jumlah)), '[]'::jsonb)
      from (
        select path, count(*) as jumlah
        from k
        where jenis = 'halaman' and path is not null
        group by path
        order by count(*) desc
        limit 10
      ) t
    ),
    'sumber', (
      select coalesce(jsonb_agg(jsonb_build_object('sumber', sumber, 'jumlah', jumlah)), '[]'::jsonb)
      from (
        select sumber, count(*) as jumlah
        from k
        where jenis = 'halaman' and sumber is not null
        group by sumber
        order by count(*) desc
        limit 8
      ) t
    ),
    'wa_dari', (
      select coalesce(jsonb_agg(jsonb_build_object('path', path, 'jumlah', jumlah)), '[]'::jsonb)
      from (
        select coalesce(path, '/') as path, count(*) as jumlah
        from k
        where jenis = 'klik_wa'
        group by 1
        order by count(*) desc
        limit 5
      ) t
    )
  )
  into v_hasil;

  return v_hasil;
end;
$$;

revoke all on function public.statistik_ringkas(integer) from public, anon;
grant execute on function public.statistik_ringkas(integer) to authenticated;
