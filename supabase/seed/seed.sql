-- Seed data for SafeSquare
-- Run AFTER 0001, 0002, 0003

-- Categories
insert into public.blog_categories (name, slug, description) values
  ('Mental Health', 'mental-health', 'Articles about mental wellness and emotional health'),
  ('Psychology', 'psychology', 'Insights from modern psychology research'),
  ('Therapy', 'therapy', 'Therapy approaches, techniques, and case studies'),
  ('Wellness', 'wellness', 'Holistic wellbeing for practitioners and clients'),
  ('Clinical Practice', 'clinical-practice', 'Best practices for clinical work'),
  ('Practitioner Growth', 'practitioner-growth', 'Grow a sustainable practice')
on conflict (slug) do nothing;

-- Rooms
insert into public.rooms (name, slug, description, room_type, capacity, hourly_rate, amenities, images, status) values
  ('Serenity Therapy Room', 'serenity-therapy',
   'Calm, sound-insulated room with adjustable lighting, perfect for one-on-one therapy sessions.',
   'therapy', 1, 35.00,
   '["Adjustable lighting","Sound insulation","Comfortable seating","White noise","Air purifier"]'::jsonb,
   '["/rooms/serenity-1.jpg","/rooms/serenity-2.jpg"]'::jsonb,
   'active'),
  ('Aurora Consultation Room', 'aurora-consultation',
   'Modern consultation space with a desk, dual seating and natural light.',
   'consultation', 2, 45.00,
   '["Desk","Two chairs","Whiteboard","Natural light","Wi-Fi"]'::jsonb,
   '["/rooms/aurora-1.jpg"]'::jsonb,
   'active'),
  ('Lumina Meeting Room', 'lumina-meeting',
   'Spacious meeting room for group therapy, workshops, or team supervision.',
   'meeting', 8, 60.00,
   '["Conference table","Projector","Whiteboard","Video conferencing","Wi-Fi"]'::jsonb,
   '["/rooms/lumina-1.jpg"]'::jsonb,
   'active'),
  ('Cove Therapy Room', 'cove-therapy',
   'Cosy therapy suite with warm wood tones and a private entrance.',
   'therapy', 1, 32.00,
   '["Warm lighting","Private entrance","Comfortable seating","Sound insulation"]'::jsonb,
   '["/rooms/cove-1.jpg"]'::jsonb,
   'active')
on conflict (slug) do nothing;

-- Default availability: 9am-7pm Mon-Sat
insert into public.room_availability (room_id, weekday, open_time, close_time)
select r.id, wd, '09:00'::time, '19:00'::time
from public.rooms r
cross join generate_series(1,6) wd
on conflict do nothing;
