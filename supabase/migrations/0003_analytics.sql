-- 0003_analytics.sql
-- Materialized view for admin dashboard

create materialized view if not exists public.mv_booking_analytics as
select
  date_trunc('day', b.booking_date) as day,
  count(*) filter (where b.status = 'confirmed') as confirmed_count,
  count(*) filter (where b.status = 'cancelled') as cancelled_count,
  coalesce(sum(p.amount) filter (where p.payment_status = 'paid'), 0) as revenue
from public.bookings b
left join public.payments p on p.booking_id = b.id
group by 1
order by 1 desc;

create unique index if not exists mv_booking_analytics_day_idx
  on public.mv_booking_analytics(day);

create or replace function public.refresh_booking_analytics() returns void
language sql as $$ refresh materialized view concurrently public.mv_booking_analytics $$;
