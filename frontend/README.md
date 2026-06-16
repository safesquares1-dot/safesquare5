# SafeSquare Frontend

Next.js 15 (App Router) · TypeScript · Tailwind · GSAP · Framer Motion · Shadcn UI · Supabase.

## Develop

```bash
npm install
cp .env.example .env.local       # optional: add Supabase keys for real auth
npm run dev
```

The app runs at http://localhost:3000. With no Supabase env vars, the app uses a built-in mock layer so every page works offline.

## Build

```bash
npm run build && npm start
```

## Project layout

```
src/
  app/                # App Router pages
  components/
    ui/               # Shadcn primitives
    effects/          # WebGL water background + particles
    motion.tsx        # Framer Motion helpers
  contexts/           # AuthProvider
  hooks/              # GSAP hooks
  lib/                # API client, mock data, types
```

## Connecting real Supabase

1. Create a Supabase project
2. In SQL Editor, run `supabase/migrations/0001_init.sql` then `0002_rls.sql` then `0003_analytics.sql`, then `supabase/seed/seed.sql`
3. Copy URL + anon key into `frontend/.env.local` and `backend/.env`
4. Enable Google + Microsoft in Supabase Auth → Providers
5. (Optional) Add service role key to backend for admin tasks
