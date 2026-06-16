# SafeSquare Backend

FastAPI · Pydantic v2 · SQLAlchemy · JWT.

## Develop

```bash
python -m venv .venv && .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The API runs at http://localhost:8000. Swagger UI: http://localhost:8000/docs.

## Endpoints

- `POST /api/auth/register` — create account (returns JWT pair)
- `POST /api/auth/login` — sign in
- `POST /api/auth/refresh` — refresh access token
- `GET  /api/auth/me` — current user
- `POST /api/practitioners/me` — create practitioner profile
- `GET  /api/rooms` — list rooms (filters: room_type, min_capacity, max_price)
- `POST /api/rooms` — admin: create room
- `GET  /api/bookings/availability?room_id&date` — open slots
- `POST /api/bookings` — practitioner: create booking (verified only)
- `GET  /api/bookings/me` — practitioner: my bookings
- `GET  /api/blogs?category&q` — list published blogs
- `POST /api/contact` — public: contact form
- `GET  /api/analytics/overview` — admin: KPIs

## Switching to Postgres

The default `DATABASE_URL` is SQLite (no config). Set:

```
DATABASE_URL=postgresql+psycopg2://user:pass@host:5432/safesquare
```

For production, run the SQL in `../supabase/migrations/` on a Supabase Postgres instance and point both the backend and the frontend at it.
