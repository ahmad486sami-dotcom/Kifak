-- Kifak — initial schema
-- Run in the SQL editor of a NEW project (keep it separate from Habibi Gains).

create extension if not exists pgcrypto with schema extensions;

-- ───────────── PROFILES ─────────────
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  name text not null default '' check (char_length(name) <= 40),
  gender text not null default 'm' check (gender in ('m','f')),
  lang text not null default 'en' check (lang in ('en','ar')),
  avatar_path text,
  push_token text,
  tz text not null default 'Asia/Dubai',
  premium_until timestamptz,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id) values (new.id) on conflict do nothing;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ───────────── COUPLES ─────────────
create table public.couples (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references public.profiles on delete cascade,
  user_b uuid references public.profiles on delete set null,
  invite_code text unique not null,
  together_since date,
  seed int not null default floor(random()*1000)::int,
  created_at timestamptz not null default now(),
  linked_at timestamptz
);
create index on public.couples (user_a);
create index on public.couples (user_b);

-- one active couple per user
create unique index couples_one_a on public.couples (user_a) where user_b is not null;
create unique index couples_one_b on public.couples (user_b) where user_b is not null;

create or replace function public.my_couple_id() returns uuid
language sql stable security definer set search_path = public as $$
  select id from couples where (user_a = auth.uid() or user_b = auth.uid())
  order by (user_b is not null) desc, created_at desc limit 1
$$;

create or replace function public.is_member(cid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists(select 1 from couples where id = cid and (user_a = auth.uid() or user_b = auth.uid()))
$$;

create or replace function public.partner_id() returns uuid
language sql stable security definer set search_path = public as $$
  select case when user_a = auth.uid() then user_b else user_a end
  from couples where id = public.my_couple_id()
$$;

-- create (or reuse) my invite code
create or replace function public.create_invite() returns text
language plpgsql security definer set search_path = public as $$
declare c text; existing text;
begin
  select invite_code into existing from couples where user_a = auth.uid() and user_b is null limit 1;
  if existing is not null then return existing; end if;
  if exists(select 1 from couples where (user_a = auth.uid() or user_b = auth.uid()) and user_b is not null) then
    raise exception 'already_linked';
  end if;
  loop
    c := upper(substr(translate(encode(extensions.gen_random_bytes(9),'base64'),'+/=0Oo1Iil',''),1,6));
    exit when char_length(c) = 6 and not exists(select 1 from couples where invite_code = c);
  end loop;
  insert into couples (user_a, invite_code) values (auth.uid(), c);
  return c;
end $$;

create or replace function public.join_couple(code text) returns uuid
language plpgsql security definer set search_path = public as $$
declare cid uuid; owner uuid;
begin
  if exists(select 1 from couples where (user_a = auth.uid() or user_b = auth.uid()) and user_b is not null) then
    raise exception 'already_linked';
  end if;
  select id, user_a into cid, owner from couples where invite_code = upper(trim(code)) and user_b is null for update;
  if cid is null then raise exception 'invalid_code'; end if;
  if owner = auth.uid() then raise exception 'own_code'; end if;
  update couples set user_b = auth.uid(), linked_at = now() where id = cid;
  -- the joiner's own pending invite is no longer needed
  delete from couples where user_a = auth.uid() and user_b is null and id <> cid;
  return cid;
end $$;

create or replace function public.set_together_since(d date) returns void
language sql security definer set search_path = public as $$
  update couples set together_since = d where id = public.my_couple_id() and d <= current_date;
$$;

create or replace function public.leave_couple() returns void
language plpgsql security definer set search_path = public as $$
begin
  delete from couples where id = public.my_couple_id() and user_b is not null;
end $$;

-- ───────────── QUIZ ─────────────
create table public.answers (
  user_id uuid not null references public.profiles on delete cascade,
  question_id text not null check (char_length(question_id) <= 12),
  value jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, question_id)
);

create table public.personality (
  user_id uuid primary key references public.profiles on delete cascade,
  traits jsonb not null,
  archetype text not null,
  love_want text, love_show text, attachment text, conflict text,
  progress real not null default 0,
  updated_at timestamptz not null default now()
);

-- partner's own words for a decoder situation
create table public.decoder_notes (
  user_id uuid not null references public.profiles on delete cascade,
  situation_id text not null,
  note text not null check (char_length(note) <= 280),
  primary key (user_id, situation_id)
);

-- ───────────── DAILY LIFE ─────────────
create table public.moods (
  id bigint generated always as identity primary key,
  couple_id uuid not null references public.couples on delete cascade,
  user_id uuid not null references public.profiles on delete cascade,
  mood text not null,
  note text check (char_length(note) <= 120),
  created_at timestamptz not null default now()
);
create index on public.moods (couple_id, created_at desc);

create table public.daily_answers (
  couple_id uuid not null references public.couples on delete cascade,
  user_id uuid not null references public.profiles on delete cascade,
  day date not null,
  question_idx int not null,
  answer text not null check (char_length(answer) between 1 and 500),
  created_at timestamptz not null default now(),
  primary key (couple_id, user_id, day)
);

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples on delete cascade,
  from_id uuid not null references public.profiles on delete cascade,
  kind text not null check (kind in ('text','voice','tap')),
  body text check (char_length(body) <= 1000),
  audio_path text,
  opened_at timestamptz,
  created_at timestamptz not null default now()
);
create index on public.notes (couple_id, created_at desc);

-- every "start something" action — drives the streak
create table public.activity (
  couple_id uuid not null references public.couples on delete cascade,
  user_id uuid not null references public.profiles on delete cascade,
  day date not null,
  first_at timestamptz not null default now(),
  primary key (couple_id, user_id, day)
);

create table public.streak_saves (
  couple_id uuid not null references public.couples on delete cascade,
  day date not null,
  used_by uuid references public.profiles on delete set null,
  primary key (couple_id, day)
);

-- ───────────── PLANNING & MEMORIES ─────────────
create table public.events (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples on delete cascade,
  created_by uuid references public.profiles on delete set null,
  title text not null check (char_length(title) <= 80),
  starts_at timestamptz not null,
  kind text not null default 'date' check (kind in ('date','anniversary','birthday','trip','other')),
  plan jsonb,
  repeats_yearly boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.memories (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples on delete cascade,
  created_by uuid references public.profiles on delete set null,
  title text not null check (char_length(title) <= 80),
  body text check (char_length(body) <= 1000),
  photo_path text,
  happened_on date not null default current_date,
  created_at timestamptz not null default now()
);

create table public.wishlist (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples on delete cascade,
  owner_id uuid not null references public.profiles on delete cascade,
  title text not null check (char_length(title) <= 80),
  link text check (char_length(link) <= 500),
  note text check (char_length(note) <= 200),
  created_at timestamptz not null default now()
);
-- who secretly reserved a gift — only the reserver can see this row
create table public.wishlist_claims (
  item_id uuid primary key references public.wishlist on delete cascade,
  claimed_by uuid not null references public.profiles on delete cascade,
  claimed_at timestamptz not null default now()
);

create table public.date_swipes (
  couple_id uuid not null references public.couples on delete cascade,
  user_id uuid not null references public.profiles on delete cascade,
  idea_id text not null,
  liked boolean not null,
  created_at timestamptz not null default now(),
  primary key (couple_id, user_id, idea_id)
);

create table public.spots (
  id text primary key,
  emirate text not null,
  data jsonb not null,
  active boolean not null default true
);

-- ───────────── FUN ─────────────
create table public.challenge_progress (
  couple_id uuid not null references public.couples on delete cascade,
  challenge_id text not null,
  day int not null,
  user_id uuid not null references public.profiles on delete cascade,
  done_at timestamptz not null default now(),
  primary key (couple_id, challenge_id, day, user_id)
);

create table public.game_rounds (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples on delete cascade,
  guesser_id uuid not null references public.profiles on delete cascade,
  question_id text not null,
  guess jsonb not null,
  correct boolean not null,
  created_at timestamptz not null default now()
);

create table public.conflicts (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples on delete cascade,
  started_by uuid references public.profiles on delete set null,
  cooldown_minutes int not null default 20 check (cooldown_minutes between 5 and 240),
  started_at timestamptz not null default now(),
  resolved_at timestamptz
);

-- ───────────── ROW LEVEL SECURITY ─────────────
alter table public.profiles enable row level security;
alter table public.couples enable row level security;
alter table public.answers enable row level security;
alter table public.personality enable row level security;
alter table public.decoder_notes enable row level security;
alter table public.moods enable row level security;
alter table public.daily_answers enable row level security;
alter table public.notes enable row level security;
alter table public.activity enable row level security;
alter table public.streak_saves enable row level security;
alter table public.events enable row level security;
alter table public.memories enable row level security;
alter table public.wishlist enable row level security;
alter table public.wishlist_claims enable row level security;
alter table public.date_swipes enable row level security;
alter table public.spots enable row level security;
alter table public.challenge_progress enable row level security;
alter table public.game_rounds enable row level security;
alter table public.conflicts enable row level security;

-- profiles: me + my partner
create policy "read me and partner" on public.profiles for select using (id = auth.uid() or id = public.partner_id());
create policy "update me" on public.profiles for update using (id = auth.uid());
-- users may only change these columns (premium_until is set by the billing webhook only)
revoke update on public.profiles from authenticated, anon;
grant update (name, gender, lang, avatar_path, push_token, tz) on public.profiles to authenticated;

-- couples: members read; changes only via functions
create policy "members read couple" on public.couples for select using (user_a = auth.uid() or user_b = auth.uid());

-- quiz: mine read/write, partner read (needed for the decoder)
create policy "answers rw own" on public.answers for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "answers read partner" on public.answers for select using (user_id = public.partner_id());
create policy "personality rw own" on public.personality for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "personality read partner" on public.personality for select using (user_id = public.partner_id());
create policy "notes rw own" on public.decoder_notes for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "notes read partner" on public.decoder_notes for select using (user_id = public.partner_id());

-- couple-scoped tables
do $$
declare t text;
begin
  foreach t in array array['moods','notes','events','memories','date_swipes','challenge_progress','game_rounds','conflicts','activity','streak_saves'] loop
    execute format('create policy "members read %1$s" on public.%1$I for select using (public.is_member(couple_id))', t);
  end loop;
end $$;

create policy "insert own mood" on public.moods for insert with check (user_id = auth.uid() and public.is_member(couple_id));
create policy "send note" on public.notes for insert with check (from_id = auth.uid() and public.is_member(couple_id));
create policy "open note" on public.notes for update using (public.is_member(couple_id) and from_id <> auth.uid());
create policy "delete own note" on public.notes for delete using (from_id = auth.uid());
create policy "events write" on public.events for all using (public.is_member(couple_id)) with check (public.is_member(couple_id));
create policy "memories write" on public.memories for all using (public.is_member(couple_id)) with check (public.is_member(couple_id));
create policy "swipe own" on public.date_swipes for insert with check (user_id = auth.uid() and public.is_member(couple_id));
create policy "swipe update" on public.date_swipes for update using (user_id = auth.uid());
create policy "challenge own" on public.challenge_progress for insert with check (user_id = auth.uid() and public.is_member(couple_id));
create policy "challenge undo" on public.challenge_progress for delete using (user_id = auth.uid());
create policy "game own" on public.game_rounds for insert with check (guesser_id = auth.uid() and public.is_member(couple_id));
create policy "conflict write" on public.conflicts for all using (public.is_member(couple_id)) with check (public.is_member(couple_id));

-- daily answers: you only see your partner's answer after you've answered the same day
create policy "daily insert own" on public.daily_answers for insert with check (user_id = auth.uid() and public.is_member(couple_id));
create or replace function public.i_answered(cid uuid, d date) returns boolean
language sql stable security definer set search_path = public as $$
  select exists(select 1 from daily_answers where couple_id = cid and user_id = auth.uid() and day = d)
$$;
create policy "daily read" on public.daily_answers for select using (
  user_id = auth.uid() or (public.is_member(couple_id) and public.i_answered(couple_id, day))
);
-- lets the app show "they answered — answer to see it" without revealing the text
create or replace function public.partner_answered(d date) returns boolean
language sql stable security definer set search_path = public as $$
  select exists(select 1 from daily_answers where couple_id = public.my_couple_id() and user_id = public.partner_id() and day = d)
$$;

-- wishlist: both read items; owner writes; claims are secret
create policy "wishlist read" on public.wishlist for select using (public.is_member(couple_id));
create policy "wishlist write own" on public.wishlist for all using (owner_id = auth.uid()) with check (owner_id = auth.uid() and public.is_member(couple_id));
create policy "claims mine" on public.wishlist_claims for all using (claimed_by = auth.uid()) with check (
  claimed_by = auth.uid() and exists(select 1 from public.wishlist w where w.id = item_id and public.is_member(w.couple_id) and w.owner_id <> auth.uid()));

create policy "spots read" on public.spots for select using (active);

-- ───────────── STREAK ─────────────
-- any of these actions = "started something today"
create or replace function public.log_activity_generic() returns trigger
language plpgsql security definer set search_path = public as $$
declare uid uuid; d date; z text; j jsonb;
begin
  j := to_jsonb(new);
  uid := coalesce((j->>'user_id')::uuid, (j->>'from_id')::uuid, (j->>'created_by')::uuid);
  if uid is null then return new; end if;
  select tz into z from profiles where id = uid;
  d := (now() at time zone coalesce(z, 'Asia/Dubai'))::date;
  insert into activity (couple_id, user_id, day) values ((j->>'couple_id')::uuid, uid, d) on conflict do nothing;
  return new;
end $$;

create trigger act_moods after insert on public.moods for each row execute function public.log_activity_generic();
create trigger act_notes after insert on public.notes for each row execute function public.log_activity_generic();
create trigger act_daily after insert on public.daily_answers for each row execute function public.log_activity_generic();
create trigger act_events after insert on public.events for each row execute function public.log_activity_generic();
create trigger act_memories after insert on public.memories for each row execute function public.log_activity_generic();
create trigger act_challenges after insert on public.challenge_progress for each row execute function public.log_activity_generic();

-- streak = consecutive days (ending today or yesterday) where at least one of you started something
create or replace function public.couple_streak() returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare cid uuid := public.my_couple_id(); me uuid := auth.uid(); z text; today date;
  d date; cur int := 0; best int := 0; run int := 0; prev date; mine int; theirs int; both_days int; today_me boolean; today_them boolean;
begin
  if cid is null then return null; end if;
  select tz into z from profiles where id = me;
  today := (now() at time zone coalesce(z,'Asia/Dubai'))::date;

  -- current streak
  d := today;
  if not exists(select 1 from activity where couple_id = cid and day = d) and not exists(select 1 from streak_saves where couple_id = cid and day = d) then
    d := today - 1;
  end if;
  while exists(select 1 from activity where couple_id = cid and day = d) or exists(select 1 from streak_saves where couple_id = cid and day = d) loop
    cur := cur + 1; d := d - 1;
  end loop;

  -- best streak
  for d in select distinct day from (select day from activity where couple_id = cid union select day from streak_saves where couple_id = cid) x order by day loop
    if prev is not null and d = prev + 1 then run := run + 1; else run := 1; end if;
    best := greatest(best, run); prev := d;
  end loop;

  -- who started first each day
  select count(*) filter (where starter = me), count(*) filter (where starter <> me) into mine, theirs
  from (select distinct on (day) day, user_id as starter from activity where couple_id = cid order by day, first_at) s;
  select count(*) into both_days from (select day from activity where couple_id = cid group by day having count(distinct user_id) = 2) b;
  today_me := exists(select 1 from activity where couple_id = cid and day = today and user_id = me);
  today_them := exists(select 1 from activity where couple_id = cid and day = today and user_id <> me);

  return jsonb_build_object('current', cur, 'best', greatest(best, cur), 'started_by_me', mine, 'started_by_partner', theirs,
    'both_days', both_days, 'today_me', today_me, 'today_partner', today_them, 'today', today);
end $$;

-- one free streak save per calendar month
create or replace function public.save_streak() returns boolean
language plpgsql security definer set search_path = public as $$
declare cid uuid := public.my_couple_id(); z text; y date;
begin
  select tz into z from profiles where id = auth.uid();
  y := (now() at time zone coalesce(z,'Asia/Dubai'))::date - 1;
  if exists(select 1 from activity where couple_id = cid and day = y) then return false; end if;
  if exists(select 1 from streak_saves where couple_id = cid and date_trunc('month', day) = date_trunc('month', y)) then return false; end if;
  insert into streak_saves (couple_id, day, used_by) values (cid, y, auth.uid());
  return true;
end $$;

-- ───────────── ACCESS (subscription covers both) ─────────────
create or replace function public.has_access() returns boolean
language sql stable security definer set search_path = public as $$
  select exists(
    select 1 from profiles p
    where (p.id = auth.uid() or p.id = public.partner_id()) and p.premium_until > now()
  )
$$;

-- ───────────── STORAGE ─────────────
insert into storage.buckets (id, name, public) values ('couple', 'couple', false) on conflict do nothing;
create policy "couple files read" on storage.objects for select
  using (bucket_id = 'couple' and public.is_member(((storage.foldername(name))[1])::uuid));
create policy "couple files write" on storage.objects for insert
  with check (bucket_id = 'couple' and public.is_member(((storage.foldername(name))[1])::uuid));
create policy "couple files delete" on storage.objects for delete
  using (bucket_id = 'couple' and owner_id = auth.uid()::text);

-- ───────────── REALTIME ─────────────
alter publication supabase_realtime add table public.moods, public.notes, public.daily_answers, public.activity, public.couples, public.conflicts;

-- ───────────── PUSH LOG (rate limiting, service role only) ─────────────
create table public.push_log (
  id bigint generated always as identity primary key,
  sender uuid not null references public.profiles on delete cascade,
  kind text not null,
  sent_at timestamptz not null default now()
);
alter table public.push_log enable row level security;
create index on public.push_log (sender, sent_at desc);

-- profiles for any users that existed before this migration
insert into public.profiles (id) select id from auth.users on conflict do nothing;
