# Supabase Setup (Hosted Only)

This project is fully backend-on-Supabase. No separate backend server is required.

## 1. Configure Frontend Env

Create `.env.local` from `.env.example` and fill in values:

- `REACT_APP_SUPABASE_URL`
- `REACT_APP_SUPABASE_ANON_KEY`

Use only the public anon key in frontend env.

## 2. Run Database Migration Manually

SQL migration file:

- `supabase/migrations/20260404_mvp_schema.sql`

### Option A: Supabase SQL Editor

1. Open Supabase dashboard.
2. Go to SQL Editor.
3. Paste the SQL from migration file.
4. Run it.

### Option B: psql CLI

Use this exact command pattern:

```powershell
$env:PGPASSWORD='YOUR_DB_PASSWORD'; psql -h db.<project-id>.supabase.co -p 5432 -U postgres -d postgres -v ON_ERROR_STOP=1 -f "supabase/migrations/20260404_mvp_schema.sql" "sslmode=require"
```

Important:
- Keep `-f` outside the connection argument so the file is actually executed.
- Add `-v ON_ERROR_STOP=1` so command fails fast on SQL errors.

## 3. Start App

```bash
npm install
npm start
```

## 4. Product Areas Wired to Supabase

- Auth and profile
- Dashboard announcements/activities/notifications/exams
- Attendance records and calendar events
- Marks and academic performance
- Class sessions, exams, assignments
- Course registration
- Fees invoices/payments/support tickets
- Library books/reservations/read-later
- Student support FAQs/feedback/notices
- Show-cause notices and replies (with attachment storage bucket)
