# SafeSquare – Multi-Speciality Clinic & Practitioner Room Booking Platform

Premium full-stack web app for SafeSquare: hourly therapy / consultation room rentals for mental health practitioners.

## Stack

- **Frontend**: Next.js 15 (App Router) · TypeScript · Tailwind CSS · GSAP · Framer Motion · Shadcn UI · TanStack Query · Zod · React Hook Form
- **Backend**: FastAPI (Python 3.11) · Pydantic v2 · SQLAlchemy
- **Database / Auth**: Supabase (PostgreSQL + Auth + Storage + Realtime + RLS)
- **Infrastructure**: Docker · GitHub Actions

## Repo layout

```
.
├── frontend/                Next.js 15 application
├── backend/                 FastAPI service
├── supabase/
│   ├── migrations/          SQL migrations (run on Supabase)
│   └── seed/                Seed data
├── docker-compose.yml
├── .env.example
└── README.md
```

## Quick start (local, no Supabase)

```bash
# 1) Frontend
cd frontend
npm install
cp .env.example .env.local       # leave Supabase vars blank for mock mode
npm run dev                       # http://localhost:3000

# 2) Backend
cd ../backend
python -m venv .venv && .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload     # http://localhost:8000/docs
```

## With real Supabase

1. Create a project at https://supabase.com
2. In **SQL Editor**, run files from `supabase/migrations/` in order, then `supabase/seed/seed.sql`
3. Copy **Project URL** and **anon key** from Project Settings → API
4. Put them in `frontend/.env.local` and `backend/.env`
5. Enable Google + Microsoft providers in Supabase Auth → Providers

## Roles

- `admin` — full back-office access
- `practitioner` — bookings, profile, schedule, payments
- `public` — marketing pages, browse rooms, request booking

See `supabase/migrations/0002_rls.sql` for row-level security policies.

## Documentation

- API: http://localhost:8000/docs (Swagger UI)
- Frontend: see `frontend/README.md`
