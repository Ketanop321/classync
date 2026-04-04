begin;

create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  student_id text,
  phone text,
  address text,
  course text,
  parent_name text,
  parent_phone text,
  parent_whatsapp text,
  skills jsonb not null default '[]'::jsonb,
  certificates text[] not null default '{}'::text[],
  academic_history jsonb not null default '[]'::jsonb,
  course_distribution jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.dashboard_announcements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  content text not null,
  publish_at date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists public.dashboard_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  message text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.user_activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  activity text not null,
  happened_at timestamptz not null default now()
);

create table if not exists public.exam_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject text not null,
  exam_date date not null,
  start_time time,
  end_time time,
  room text,
  semester text,
  course text,
  created_at timestamptz not null default now()
);

create table if not exists public.marks_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  semester text not null,
  subject text not null,
  assignments numeric(5,2) not null default 0,
  midterm numeric(5,2) not null default 0,
  final numeric(5,2) not null default 0,
  total numeric(5,2) not null default 0,
  created_at timestamptz not null default now(),
  unique (user_id, semester, subject)
);

create table if not exists public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  subject text not null,
  status text not null check (status in ('Present', 'Absent', 'Leave', 'Late')),
  semester text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.academic_calendar_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null check (category in ('semester', 'deadline', 'exam', 'holiday', 'event', 'result', 'internship', 'faculty_development')),
  name text not null,
  start_date date not null,
  end_date date,
  semester text not null default 'All',
  details text,
  created_at timestamptz not null default now()
);

create table if not exists public.class_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  term text not null,
  course text not null,
  day_of_week text not null,
  start_time time not null,
  end_time time not null,
  subject text not null,
  room text,
  created_at timestamptz not null default now()
);

create table if not exists public.assignment_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  due_date date not null,
  details_url text,
  semester text,
  course text,
  created_at timestamptz not null default now()
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  department text not null,
  faculty text not null,
  availability text not null default 'Available' check (availability in ('Available', 'Full')),
  created_at timestamptz not null default now()
);

create table if not exists public.course_registrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  registered_at timestamptz not null default now(),
  unique (user_id, course_id)
);

create table if not exists public.fee_invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  semester text not null,
  tuition numeric(10,2) not null default 0,
  hostel numeric(10,2) not null default 0,
  library numeric(10,2) not null default 0,
  lab numeric(10,2) not null default 0,
  misc numeric(10,2) not null default 0,
  pending numeric(10,2) not null default 0,
  fine numeric(10,2) not null default 0,
  deadline date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, semester)
);

create table if not exists public.fee_payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  semester text not null,
  amount numeric(10,2) not null,
  method text not null,
  status text not null default 'successful',
  paid_at timestamptz not null default now(),
  receipt_note text
);

create table if not exists public.library_books (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  author text not null,
  genre text,
  description text,
  cover_url text,
  download_url text,
  available_copies integer not null default 1,
  created_at timestamptz not null default now()
);

create table if not exists public.library_reservations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  book_id uuid not null references public.library_books(id) on delete cascade,
  status text not null default 'reserved' check (status in ('reserved', 'borrowed', 'returned')),
  due_date date,
  created_at timestamptz not null default now()
);

create table if not exists public.library_read_later (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  book_id uuid not null references public.library_books(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, book_id)
);

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  message text not null,
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved')),
  created_at timestamptz not null default now()
);

create table if not exists public.feedback_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  message text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  question text not null,
  answer text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.notices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  content text not null,
  published_at date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists public.show_cause_notices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  reason text not null,
  status text not null default 'open' check (status in ('open', 'replied', 'closed')),
  created_at timestamptz not null default now()
);

create table if not exists public.show_cause_replies (
  id uuid primary key default gen_random_uuid(),
  notice_id uuid not null references public.show_cause_notices(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  message text not null,
  attachment_path text,
  created_at timestamptz not null default now()
);

create index if not exists idx_dashboard_announcements_user on public.dashboard_announcements(user_id);
create index if not exists idx_dashboard_notifications_user on public.dashboard_notifications(user_id);
create index if not exists idx_user_activities_user on public.user_activities(user_id, happened_at desc);
create index if not exists idx_exam_events_user_date on public.exam_events(user_id, exam_date);
create index if not exists idx_marks_records_user_sem on public.marks_records(user_id, semester);
create index if not exists idx_attendance_records_user_date on public.attendance_records(user_id, date desc);
create index if not exists idx_academic_calendar_user_dates on public.academic_calendar_events(user_id, start_date);
create index if not exists idx_class_sessions_user_term on public.class_sessions(user_id, term);
create index if not exists idx_assignments_user_due on public.assignment_items(user_id, due_date);
create index if not exists idx_courses_user on public.courses(user_id);
create index if not exists idx_fee_invoices_user on public.fee_invoices(user_id);
create index if not exists idx_fee_payments_user on public.fee_payments(user_id, paid_at desc);
create index if not exists idx_library_books_user on public.library_books(user_id);
create index if not exists idx_library_res_user on public.library_reservations(user_id);
create index if not exists idx_support_user on public.support_tickets(user_id, created_at desc);
create index if not exists idx_notices_user on public.notices(user_id, published_at desc);
create index if not exists idx_show_cause_user on public.show_cause_notices(user_id, created_at desc);

create unique index if not exists idx_library_reservations_active
  on public.library_reservations(user_id, book_id)
  where status in ('reserved', 'borrowed');

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do update set email = excluded.email;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists trg_fee_invoices_updated_at on public.fee_invoices;
create trigger trg_fee_invoices_updated_at
  before update on public.fee_invoices
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.dashboard_announcements enable row level security;
alter table public.dashboard_notifications enable row level security;
alter table public.user_activities enable row level security;
alter table public.exam_events enable row level security;
alter table public.marks_records enable row level security;
alter table public.attendance_records enable row level security;
alter table public.academic_calendar_events enable row level security;
alter table public.class_sessions enable row level security;
alter table public.assignment_items enable row level security;
alter table public.courses enable row level security;
alter table public.course_registrations enable row level security;
alter table public.fee_invoices enable row level security;
alter table public.fee_payments enable row level security;
alter table public.library_books enable row level security;
alter table public.library_reservations enable row level security;
alter table public.library_read_later enable row level security;
alter table public.support_tickets enable row level security;
alter table public.feedback_entries enable row level security;
alter table public.faqs enable row level security;
alter table public.notices enable row level security;
alter table public.show_cause_notices enable row level security;
alter table public.show_cause_replies enable row level security;

-- Profiles policies
drop policy if exists profiles_select_own on public.profiles;
drop policy if exists profiles_insert_own on public.profiles;
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select using (auth.uid() = id);
create policy profiles_insert_own on public.profiles
  for insert with check (auth.uid() = id);
create policy profiles_update_own on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Generic owner-based policies helper by explicit table declarations
drop policy if exists dashboard_announcements_owner_all on public.dashboard_announcements;
create policy dashboard_announcements_owner_all on public.dashboard_announcements
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists dashboard_notifications_owner_all on public.dashboard_notifications;
create policy dashboard_notifications_owner_all on public.dashboard_notifications
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists user_activities_owner_all on public.user_activities;
create policy user_activities_owner_all on public.user_activities
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists exam_events_owner_all on public.exam_events;
create policy exam_events_owner_all on public.exam_events
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists marks_records_owner_all on public.marks_records;
create policy marks_records_owner_all on public.marks_records
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists attendance_records_owner_all on public.attendance_records;
create policy attendance_records_owner_all on public.attendance_records
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists academic_calendar_events_owner_all on public.academic_calendar_events;
create policy academic_calendar_events_owner_all on public.academic_calendar_events
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists class_sessions_owner_all on public.class_sessions;
create policy class_sessions_owner_all on public.class_sessions
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists assignment_items_owner_all on public.assignment_items;
create policy assignment_items_owner_all on public.assignment_items
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists courses_owner_all on public.courses;
create policy courses_owner_all on public.courses
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists course_registrations_owner_all on public.course_registrations;
create policy course_registrations_owner_all on public.course_registrations
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists fee_invoices_owner_all on public.fee_invoices;
create policy fee_invoices_owner_all on public.fee_invoices
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists fee_payments_owner_all on public.fee_payments;
create policy fee_payments_owner_all on public.fee_payments
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists library_books_owner_all on public.library_books;
create policy library_books_owner_all on public.library_books
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists library_reservations_owner_all on public.library_reservations;
create policy library_reservations_owner_all on public.library_reservations
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists library_read_later_owner_all on public.library_read_later;
create policy library_read_later_owner_all on public.library_read_later
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists support_tickets_owner_all on public.support_tickets;
create policy support_tickets_owner_all on public.support_tickets
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists feedback_entries_owner_all on public.feedback_entries;
create policy feedback_entries_owner_all on public.feedback_entries
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists notices_owner_all on public.notices;
create policy notices_owner_all on public.notices
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists show_cause_notices_owner_all on public.show_cause_notices;
create policy show_cause_notices_owner_all on public.show_cause_notices
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists show_cause_replies_owner_all on public.show_cause_replies;
create policy show_cause_replies_owner_all on public.show_cause_replies
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- FAQ policies: user can read global FAQs (user_id is null) and their own
-- and create only their own rows.
drop policy if exists faqs_select_global_or_own on public.faqs;
drop policy if exists faqs_insert_own on public.faqs;
drop policy if exists faqs_update_own on public.faqs;
create policy faqs_select_global_or_own on public.faqs
  for select using (user_id is null or user_id = auth.uid());
create policy faqs_insert_own on public.faqs
  for insert with check (user_id = auth.uid());
create policy faqs_update_own on public.faqs
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

insert into storage.buckets (id, name, public)
values ('show-cause-attachments', 'show-cause-attachments', false)
on conflict (id) do nothing;

drop policy if exists "show_cause_attachment_select_own" on storage.objects;
drop policy if exists "show_cause_attachment_insert_own" on storage.objects;
drop policy if exists "show_cause_attachment_update_own" on storage.objects;
drop policy if exists "show_cause_attachment_delete_own" on storage.objects;

create policy "show_cause_attachment_select_own"
on storage.objects for select to authenticated
using (
  bucket_id = 'show-cause-attachments'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "show_cause_attachment_insert_own"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'show-cause-attachments'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "show_cause_attachment_update_own"
on storage.objects for update to authenticated
using (
  bucket_id = 'show-cause-attachments'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'show-cause-attachments'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "show_cause_attachment_delete_own"
on storage.objects for delete to authenticated
using (
  bucket_id = 'show-cause-attachments'
  and (storage.foldername(name))[1] = auth.uid()::text
);

commit;
