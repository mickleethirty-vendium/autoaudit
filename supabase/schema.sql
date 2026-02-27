-- AutoAudit MVP schema (Supabase / Postgres)
-- Paste this into Supabase: SQL Editor → New query → Run

create extension if not exists "pgcrypto";

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  listing_url text null,

  car_year int not null,
  mileage int not null,
  fuel text not null,
  transmission text not null,
  timing_type text not null default 'unknown',
  asking_price int null,

  preview_payload jsonb not null,
  full_payload jsonb not null,

  is_paid boolean not null default false,
  stripe_session_id text null
);

-- MVP: turn OFF RLS so the anonymous key can read reports.
-- IMPORTANT: This is for MVP only. Turn on RLS before real scale.
alter table public.reports disable row level security;
