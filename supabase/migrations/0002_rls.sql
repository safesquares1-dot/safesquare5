-- 0002_rls.sql
-- Row Level Security policies

alter table public.profiles          enable row level security;
alter table public.practitioners     enable row level security;
alter table public.rooms             enable row level security;
alter table public.room_availability enable row level security;
alter table public.bookings          enable row level security;
alter table public.payments          enable row level security;
alter table public.blog_categories   enable row level security;
alter table public.blogs             enable row level security;
alter table public.contact_messages  enable row level security;
alter table public.audit_log         enable row level security;

-- Helper: is current user admin
create or replace function public.is_admin() returns boolean
language sql stable as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ================== PROFILES ==================
create policy "profiles_select_own_or_admin" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "profiles_admin_all" on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- ================== PRACTITIONERS ==================
create policy "practitioners_select_public" on public.practitioners
  for select using (verification_status = 'approved' or public.is_admin() or auth.uid() = user_id);

create policy "practitioners_insert_own" on public.practitioners
  for insert with check (auth.uid() = user_id);

create policy "practitioners_update_own_or_admin" on public.practitioners
  for update using (auth.uid() = user_id or public.is_admin())
        with check (auth.uid() = user_id or public.is_admin());

create policy "practitioners_admin_delete" on public.practitioners
  for delete using (public.is_admin());

-- ================== ROOMS ==================
create policy "rooms_select_public" on public.rooms
  for select using (status = 'active' or public.is_admin());

create policy "rooms_admin_write" on public.rooms
  for all using (public.is_admin()) with check (public.is_admin());

create policy "availability_select_public" on public.room_availability
  for select using (true);

create policy "availability_admin_write" on public.room_availability
  for all using (public.is_admin()) with check (public.is_admin());

-- ================== BOOKINGS ==================
create policy "bookings_select_own_or_admin" on public.bookings
  for select using (
    public.is_admin()
    or exists (
      select 1 from public.practitioners p
      where p.id = bookings.practitioner_id and p.user_id = auth.uid()
    )
  );

create policy "bookings_insert_practitioner" on public.bookings
  for insert with check (
    exists (
      select 1 from public.practitioners p
      where p.id = practitioner_id
        and p.user_id = auth.uid()
        and p.verification_status = 'approved'
    )
  );

create policy "bookings_update_own_or_admin" on public.bookings
  for update using (
    public.is_admin()
    or exists (
      select 1 from public.practitioners p
      where p.id = bookings.practitioner_id and p.user_id = auth.uid()
    )
  ) with check (true);

-- ================== PAYMENTS ==================
create policy "payments_select_own_or_admin" on public.payments
  for select using (
    public.is_admin()
    or exists (
      select 1 from public.bookings b
      join public.practitioners p on p.id = b.practitioner_id
      where b.id = payments.booking_id and p.user_id = auth.uid()
    )
  );

create policy "payments_admin_write" on public.payments
  for all using (public.is_admin()) with check (public.is_admin());

-- ================== BLOG CATEGORIES ==================
create policy "categories_select_public" on public.blog_categories
  for select using (true);
create policy "categories_admin_write" on public.blog_categories
  for all using (public.is_admin()) with check (public.is_admin());

-- ================== BLOGS ==================
create policy "blogs_select_published" on public.blogs
  for select using (published = true or public.is_admin() or author_id = auth.uid());

create policy "blogs_insert_admin" on public.blogs
  for insert with check (public.is_admin() or auth.uid() = author_id);

create policy "blogs_update_admin_or_author" on public.blogs
  for update using (public.is_admin() or author_id = auth.uid())
        with check (public.is_admin() or author_id = auth.uid());

create policy "blogs_delete_admin" on public.blogs
  for delete using (public.is_admin());

-- ================== CONTACT MESSAGES ==================
create policy "contact_insert_any" on public.contact_messages
  for insert with check (true);
create policy "contact_admin_read" on public.contact_messages
  for select using (public.is_admin());
create policy "contact_admin_update" on public.contact_messages
  for update using (public.is_admin()) with check (public.is_admin());

-- ================== AUDIT LOG ==================
create policy "audit_admin_read" on public.audit_log
  for select using (public.is_admin());
create policy "audit_admin_write" on public.audit_log
  for insert with check (public.is_admin());
