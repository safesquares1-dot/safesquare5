-- 0001_init.sql
-- SafeSquare core schema
-- Idempotent: safe to re-run

create extension if not exists "pgcrypto";

-- =========================================================
-- Enums
-- =========================================================
do $$ begin
  create type user_role as enum ('admin', 'practitioner', 'public');
exception when duplicate_object then null; end $$;

do $$ begin
  create type verification_status as enum ('pending', 'approved', 'rejected', 'suspended');
exception when duplicate_object then null; end $$;

do $$ begin
  create type room_status as enum ('active', 'maintenance', 'archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type booking_status as enum ('pending', 'confirmed', 'cancelled', 'completed', 'no_show');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_status as enum ('pending', 'paid', 'refunded', 'failed');
exception when duplicate_object then null; end $$;

-- =========================================================
-- profiles (mirrors auth.users; one row per signed-in user)
-- =========================================================
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text not null unique,
  full_name    text,
  phone        text,
  avatar_url   text,
  role         user_role not null default 'public',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- =========================================================
-- practitioners
-- =========================================================
create table if not exists public.practitioners (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null unique references public.profiles(id) on delete cascade,
  profession          text not null,
  qualifications      text not null,
  license_number      text not null,
  bio                 text,
  profile_image       text,
  documents           jsonb default '[]'::jsonb,
  verification_status verification_status not null default 'pending',
  verified_at         timestamptz,
  verified_by         uuid references public.profiles(id),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index if not exists practitioners_status_idx on public.practitioners(verification_status);

-- =========================================================
-- rooms
-- =========================================================
create table if not exists public.rooms (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  slug         text not null unique,
  description  text,
  room_type    text not null,            -- therapy | consultation | meeting
  capacity     int  not null default 1,
  hourly_rate  numeric(10,2) not null,
  amenities    jsonb default '[]'::jsonb,
  images       jsonb default '[]'::jsonb,
  status       room_status not null default 'active',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists rooms_status_idx on public.rooms(status);

-- =========================================================
-- room_availability (opening hours per weekday, 0=Sun)
-- =========================================================
create table if not exists public.room_availability (
  id          uuid primary key default gen_random_uuid(),
  room_id     uuid not null references public.rooms(id) on delete cascade,
  weekday     int  not null check (weekday between 0 and 6),
  open_time   time not null,
  close_time  time not null,
  unique (room_id, weekday)
);

-- =========================================================
-- bookings
-- =========================================================
create table if not exists public.bookings (
  id              uuid primary key default gen_random_uuid(),
  room_id         uuid not null references public.rooms(id) on delete restrict,
  practitioner_id uuid not null references public.practitioners(id) on delete restrict,
  booking_date    date not null,
  start_time      time not null,
  end_time        time not null,
  status          booking_status not null default 'pending',
  notes           text,
  total_amount    numeric(10,2) not null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  check (end_time > start_time)
);
create index if not exists bookings_room_date_idx on public.bookings(room_id, booking_date);
create index if not exists bookings_practitioner_idx on public.bookings(practitioner_id);
create index if not exists bookings_status_idx on public.bookings(status);

-- =========================================================
-- payments
-- =========================================================
create table if not exists public.payments (
  id              uuid primary key default gen_random_uuid(),
  booking_id      uuid not null references public.bookings(id) on delete cascade,
  amount          numeric(10,2) not null,
  currency        text not null default 'USD',
  payment_status  payment_status not null default 'pending',
  transaction_id  text,
  provider        text,
  paid_at         timestamptz,
  created_at      timestamptz not null default now()
);
create index if not exists payments_booking_idx on public.payments(booking_id);

-- =========================================================
-- blog categories
-- =========================================================
create table if not exists public.blog_categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  slug        text not null unique,
  description text
);

-- =========================================================
-- blogs
-- =========================================================
create table if not exists public.blogs (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  slug            text not null unique,
  excerpt         text,
  content         text not null,
  featured_image  text,
  category_id     uuid references public.blog_categories(id) on delete set null,
  tags            text[] default '{}',
  author_id       uuid references public.profiles(id) on delete set null,
  published       boolean not null default false,
  published_at    timestamptz,
  meta_title      text,
  meta_description text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists blogs_published_idx on public.blogs(published, published_at desc);
create index if not exists blogs_category_idx on public.blogs(category_id);

-- =========================================================
-- contact_messages
-- =========================================================
create table if not exists public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  phone      text,
  subject    text,
  message    text not null,
  read       boolean not null default false,
  created_at timestamptz not null default now()
);

-- =========================================================
-- audit_log
-- =========================================================
create table if not exists public.audit_log (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid references public.profiles(id) on delete set null,
  action      text not null,
  entity_type text,
  entity_id   uuid,
  meta        jsonb default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

-- =========================================================
-- updated_at trigger
-- =========================================================
create or replace function public.set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end $$ language plpgsql;

do $$ declare t text; begin
  for t in select unnest(array['profiles','practitioners','rooms','bookings','blogs']) loop
    execute format('drop trigger if exists trg_%I_updated on public.%I', t, t);
    execute format('create trigger trg_%I_updated before update on public.%I
                    for each row execute function public.set_updated_at()', t, t);
  end loop;
end $$;

-- =========================================================
-- on auth.user signup → create profile row
-- =========================================================
create or replace function public.handle_new_user() returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'public')
  )
  on conflict (id) do nothing;
  return new;
end $$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
