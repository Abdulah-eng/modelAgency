-- ============================================================
-- MODEL AGENCY — SUPABASE SQL SCHEMA
-- Paste this entire script into your Supabase SQL Editor and run it
-- ============================================================

-- ── 1. SITE SETTINGS ─────────────────────────────────────────
create table if not exists site_settings (
  id          uuid primary key default gen_random_uuid(),
  site_name   text not null default 'Elara Models',
  about_text  text,
  hero_image  text,
  telegram_link text,
  updated_at  timestamptz not null default now()
);

-- Insert a default row (only one row is used)
insert into site_settings (site_name, about_text, telegram_link)
values (
  'Elara Models',
  'A curated selection of professional models. We connect exceptional talent with visionary clients across fashion, editorial, and commercial projects.',
  ''
)
on conflict do nothing;

-- ── 2. MODELS ────────────────────────────────────────────────
create table if not exists models (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  slug          text not null unique,
  age           int  not null check (age >= 16 and age <= 100),
  height        text,
  measurements  text,
  category      text not null default 'Fashion',
  bio           text,
  cover_photo   text,
  is_featured   boolean not null default false,
  created_at    timestamptz not null default now()
);

create index if not exists models_slug_idx on models(slug);
create index if not exists models_created_at_idx on models(created_at desc);

-- ── 3. MODEL PHOTOS ──────────────────────────────────────────
create table if not exists model_photos (
  id          uuid primary key default gen_random_uuid(),
  model_id    uuid not null references models(id) on delete cascade,
  url         text not null,
  caption     text,
  sort_order  int  not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists model_photos_model_id_idx on model_photos(model_id);

-- ── 4. ROW LEVEL SECURITY ────────────────────────────────────
-- site_settings: public read, authenticated write
alter table site_settings enable row level security;

create policy "Public can read site_settings"
  on site_settings for select using (true);

create policy "Authenticated users can update site_settings"
  on site_settings for update using (auth.role() = 'authenticated');

create policy "Authenticated users can insert site_settings"
  on site_settings for insert with check (auth.role() = 'authenticated');

-- models: public read, authenticated write
alter table models enable row level security;

create policy "Public can read models"
  on models for select using (true);

create policy "Authenticated users can insert models"
  on models for insert with check (auth.role() = 'authenticated');

create policy "Authenticated users can update models"
  on models for update using (auth.role() = 'authenticated');

create policy "Authenticated users can delete models"
  on models for delete using (auth.role() = 'authenticated');

-- model_photos: public read, authenticated write
alter table model_photos enable row level security;

create policy "Public can read model_photos"
  on model_photos for select using (true);

create policy "Authenticated users can insert model_photos"
  on model_photos for insert with check (auth.role() = 'authenticated');

create policy "Authenticated users can update model_photos"
  on model_photos for update using (auth.role() = 'authenticated');

create policy "Authenticated users can delete model_photos"
  on model_photos for delete using (auth.role() = 'authenticated');

-- ── 5. STORAGE BUCKET ────────────────────────────────────────
-- Run this in Supabase Dashboard > Storage > New bucket
-- OR uncomment and run:
-- insert into storage.buckets (id, name, public)
-- values ('model-photos', 'model-photos', true)
-- on conflict do nothing;

-- Storage RLS for the model-photos bucket (public read, auth write)
-- These run automatically when you create the bucket as public
-- But if you need manual policies:
create policy "Public can view model photos"
  on storage.objects for select
  using (bucket_id = 'model-photos');

create policy "Authenticated users can upload model photos"
  on storage.objects for insert
  with check (bucket_id = 'model-photos' and auth.role() = 'authenticated');

create policy "Authenticated users can delete model photos"
  on storage.objects for delete
  using (bucket_id = 'model-photos' and auth.role() = 'authenticated');

-- ============================================================
-- ── MIGRATION: New fields added in UI overhaul update
-- Run this section if you already have an existing database
-- ============================================================

-- New model measurement fields
alter table models
  add column if not exists weight        text,
  add column if not exists eyes_color    text,
  add column if not exists hair_color    text,
  add column if not exists dress_size    text,
  add column if not exists bust          text,
  add column if not exists waist         text,
  add column if not exists hips          text,
  add column if not exists shoe_size     text;

-- New site settings fields
alter table site_settings
  add column if not exists phone_number       text,
  add column if not exists facebook_link      text,
  add column if not exists twitter_link       text,
  add column if not exists instagram_link     text,
  add column if not exists model_banner_image text,
  add column if not exists hero_video_url     text,
  add column if not exists hero_video_text    text,
  add column if not exists hero_video_subtitle text;

-- Additional site settings for homepage sections
alter table site_settings
  add column if not exists contact_email         text,
  add column if not exists contact_address       text,
  add column if not exists become_model_bg_url   text,
  add column if not exists become_model_text     text,
  add column if not exists casting_image_url     text,
  add column if not exists casting_text          text,
  add column if not exists casting_manager_name  text,
  add column if not exists casting_manager_role  text;

-- New: Testimonials table
create table if not exists testimonials (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  role        text,
  quote       text not null,
  photo_url   text,
  sort_order  int not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

alter table testimonials enable row level security;

create policy "Public can read testimonials"
  on testimonials for select using (true);

create policy "Authenticated users can insert testimonials"
  on testimonials for insert with check (auth.role() = 'authenticated');

create policy "Authenticated users can update testimonials"
  on testimonials for update using (auth.role() = 'authenticated');

create policy "Authenticated users can delete testimonials"
  on testimonials for delete using (auth.role() = 'authenticated');

-- ── Model skills + contact email (new model page fields)
alter table models
  add column if not exists skills               jsonb not null default '[]'::jsonb,
  add column if not exists contact_model_email  text;

-- ── Model enquiries (Contact Model form submissions)
create table if not exists model_enquiries (
  id          uuid primary key default gen_random_uuid(),
  model_name  text,
  full_name   text,
  phone       text,
  email       text,
  message     text,
  created_at  timestamptz not null default now()
);

alter table model_enquiries enable row level security;

create policy "Public can insert model_enquiries"
  on model_enquiries for insert with check (true);

create policy "Authenticated users can read model_enquiries"
  on model_enquiries for select using (auth.role() = 'authenticated');

create policy "Authenticated users can delete model_enquiries"
  on model_enquiries for delete using (auth.role() = 'authenticated');


-- ── Model reviews (Ratings + Comments)
create table if not exists model_reviews (
  id          uuid primary key default gen_random_uuid(),
  model_id    uuid not null references models(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  rating      int  not null check (rating >= 1 and rating <= 5),
  comment     text,
  screenshots text[] default '{}'::text[],
  created_at  timestamptz not null default now(),
  unique(model_id, user_id) -- One review per user per model
);

create index if not exists model_reviews_model_id_idx on model_reviews(model_id);

alter table model_reviews enable row level security;

create policy "Public can read model_reviews"
  on model_reviews for select using (true);

create policy "Authenticated users can insert model_reviews"
  on model_reviews for insert with check (auth.uid() = user_id);

create policy "Users can update their own reviews"
  on model_reviews for update using (auth.uid() = user_id);

create policy "Users can delete their own reviews"
  on model_reviews for delete using (auth.uid() = user_id);


-- ── 6. UTILITY FUNCTIONS ──────────────────────────────────────
-- This function allows running arbitrary SQL via RPC (used for migrations)
-- Requires SERVICE_ROLE key or superuser permissions
create or replace function exec_sql(sql text)
returns void as $$
begin
  execute sql;
end;
$$ language plpgsql security definer;


-- ============================================================
-- ── MIGRATION: Enhancements UPDATE (Cumulative)
-- Run this section if you already have an existing database
-- ============================================================

-- Site settings: Add missing columns
alter table site_settings add column if not exists phone_number          text;
alter table site_settings add column if not exists facebook_link         text;
alter table site_settings add column if not exists twitter_link          text;
alter table site_settings add column if not exists instagram_link        text;
alter table site_settings add column if not exists model_banner_image    text;
alter table site_settings add column if not exists hero_video_url        text;
alter table site_settings add column if not exists hero_video_text       text;
alter table site_settings add column if not exists hero_video_subtitle   text;
alter table site_settings add column if not exists contact_email         text;
alter table site_settings add column if not exists contact_address       text;
alter table site_settings add column if not exists become_model_bg_url   text;
alter table site_settings add column if not exists become_model_text     text;
alter table site_settings add column if not exists casting_image_url     text;
alter table site_settings add column if not exists casting_text          text;
alter table site_settings add column if not exists casting_manager_name  text;
alter table site_settings add column if not exists casting_manager_role  text;
alter table site_settings add column if not exists site_logo             text;
alter table site_settings add column if not exists site_favicon          text;
alter table site_settings add column if not exists whatsapp_link          text;
alter table site_settings add column if not exists viber_link             text;

-- Support multiple categories per model
do $$ 
begin 
  if (select data_type from information_schema.columns where table_name = 'models' and column_name = 'category') = 'text' then
    alter table models alter column category type text[] using array[category];
  end if;
end $$;

-- Add screenshots to reviews if not exists
alter table model_reviews add column if not exists screenshots text[] default '{}'::text[];

-- Create profiles table if not exists
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  created_at timestamptz default now()
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Public read for profiles (so emails show in reviews)
do $$
begin
  if not exists (select 1 from pg_policies where policyname = 'Public can read profiles') then
    create policy "Public can read profiles" on public.profiles for select using (true);
  end if;
end $$;

-- Trigger to sync auth.users to public.profiles
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'on_auth_user_created') then
    create trigger on_auth_user_created
      after insert on auth.users
      for each row execute procedure public.handle_new_user();
  end if;
end $$;

-- Sync existing users to profiles
insert into public.profiles (id, email)
select id, email from auth.users
on conflict (id) do nothing;

-- Ensure model_reviews.user_id has a relationship to profiles for joins
do $$
begin
  if not exists (select 1 from information_schema.table_constraints where constraint_name = 'model_reviews_user_id_profiles_fkey') then
    alter table public.model_reviews 
    add constraint model_reviews_user_id_profiles_fkey 
    foreign key (user_id) references public.profiles(id) on delete cascade;
  end if;
end $$;
