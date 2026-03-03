import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase-server';

// All expected site_settings columns with their DDL
const MIGRATION_DDL = `
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

  -- Convert models.category to text array if it is still text
  do $$ 
  begin 
    if (select data_type from information_schema.columns where table_name = 'models' and column_name = 'category') = 'text' then
      alter table models alter column category type text[] using array[category];
    end if;
  end $$;

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
`;

async function ensureColumns(supabase: ReturnType<typeof createServiceRoleClient>) {
    // Run migrations via rpc exec_sql — only available with service role
    try {
        // Execute each ALTER TABLE statement separately for reliability
        const statements = MIGRATION_DDL.split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        for (const stmt of statements) {
            await supabase.rpc('exec_sql', { sql: stmt }).throwOnError();
        }
    } catch (migrationErr) {
        // exec_sql RPC might not exist — that's OK, try direct method
        console.warn('Migration via rpc failed (exec_sql not available):', migrationErr);
    }
}

// GET: fetch settings
export async function GET() {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not set in .env.local' }, { status: 500 });
    }
    try {
        const supabase = createServiceRoleClient();
        // Try to select all, but fallback to specific known columns if it fails due to missing migration
        const { data, error } = await supabase
            .from('site_settings')
            .select('*')
            .order('updated_at', { ascending: true })
            .limit(1)
            .maybeSingle();

        if (error && error.message?.includes('column') && error.message?.includes('does not exist')) {
            console.warn('[settings GET] Missing columns, falling back to basic set');
            const { data: baseData, error: baseErr } = await supabase
                .from('site_settings')
                .select('id, site_name, about_text, telegram_link, updated_at')
                .order('updated_at', { ascending: true })
                .limit(1)
                .maybeSingle();
            if (baseErr) throw baseErr;
            return NextResponse.json({ data: baseData });
        }

        if (error) throw error;
        return NextResponse.json({ data });
    } catch (e: unknown) {
        const msg = (e as { message?: string }).message || String(e);
        console.error('[settings GET]', msg);
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}

// POST: upsert settings — always update the FIRST (oldest) row, never create duplicates
export async function POST(req: NextRequest) {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not set in .env.local — add it and restart the dev server' }, { status: 400 });
    }

    try {
        const body = await req.json();
        const supabase = createServiceRoleClient();

        // Always get the OLDEST row (even if duplicates exist from past bugs)
        const { data: rows, error: fetchErr } = await supabase
            .from('site_settings')
            .select('id')
            .order('updated_at', { ascending: true })
            .limit(1);

        if (fetchErr) {
            console.error('[settings POST] fetch error:', fetchErr);
            return NextResponse.json({ error: fetchErr.message }, { status: 400 });
        }

        const payload = { ...body, updated_at: new Date().toISOString() };
        const existingId = rows?.[0]?.id ?? null;

        let dbError: { message: string } | null = null;

        if (existingId) {
            // UPDATE the existing row — never insert
            const { error } = await supabase
                .from('site_settings')
                .update(payload)
                .eq('id', existingId)
                .select('id');
            dbError = error;
        } else {
            // No row at all — first-time insert (singleton)
            const { error } = await supabase
                .from('site_settings')
                .insert(payload)
                .select('id');
            dbError = error;
        }

        if (dbError) {
            console.error('[settings POST] save error:', dbError);

            // Column doesn't exist → migration not run
            if (dbError.message?.includes('column') && dbError.message?.includes('does not exist')) {
                // Fallback: save only the original base columns
                const basePayload = {
                    site_name: body.site_name,
                    about_text: body.about_text,
                    telegram_link: body.telegram_link,
                    hero_image: body.hero_image,
                    site_logo: body.site_logo,
                    site_favicon: body.site_favicon,
                    updated_at: new Date().toISOString(),
                };
                const { error: retryErr } = await supabase
                    .from('site_settings')
                    .update(basePayload)
                    .eq('id', existingId!)
                    .select('id');

                if (retryErr) {
                    return NextResponse.json({ error: `DB save failed: ${retryErr.message}` }, { status: 400 });
                }
                return NextResponse.json({
                    success: true,
                    warning: 'Only basic columns saved (site name, about, telegram). Run the migration SQL in Supabase to enable all settings.',
                });
            }

            return NextResponse.json({ error: dbError.message }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch (e: unknown) {
        const msg = (e as { message?: string }).message || String(e);
        console.error('[settings POST] exception:', msg);
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}

