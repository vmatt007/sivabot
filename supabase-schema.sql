-- ─────────────────────────────────────────────────────────
--  SivaBot — Supabase Schema
--  Run this in your Supabase SQL Editor
-- ─────────────────────────────────────────────────────────

-- 1. Profiles (extends auth.users)
create table public.profiles (
  id                uuid primary key references auth.users(id) on delete cascade,
  full_name         text,
  avatar_url        text,
  plan              text not null default 'free'
                    check (plan in ('free','starter','pro','trader')),
  stripe_customer_id text,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);


-- 2. User Strategies (which bots a user has subscribed to)
create table public.user_strategies (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid references public.profiles(id) on delete cascade,
  strategy_id      text not null,   -- ID from provider (PeakBot/SivaBot)
  strategy_name    text not null,
  allocated_budget numeric(12,2) default 0,
  tickers          text[] default '{}',
  is_active        boolean default true,
  subscribed_at    timestamptz default now(),
  total_pnl        numeric(12,2) default 0,
  total_pnl_pct    numeric(8,4) default 0
);

alter table public.user_strategies enable row level security;
create policy "Users see own strategies" on public.user_strategies
  for all using (auth.uid() = user_id);


-- 3. Portfolio Snapshots (daily balance history)
create table public.portfolio_snapshots (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid references public.profiles(id) on delete cascade,
  date      date not null,
  value     numeric(14,2) not null,
  pnl       numeric(12,2) default 0,
  pnl_pct   numeric(8,4) default 0,
  unique(user_id, date)
);

alter table public.portfolio_snapshots enable row level security;
create policy "Users see own portfolio" on public.portfolio_snapshots
  for all using (auth.uid() = user_id);


-- 4. Useful view: user dashboard summary
create view public.user_dashboard as
  select
    p.id,
    p.full_name,
    p.plan,
    coalesce((
      select ps.value from public.portfolio_snapshots ps
      where ps.user_id = p.id
      order by ps.date desc limit 1
    ), 0) as current_value,
    coalesce((
      select ps.pnl from public.portfolio_snapshots ps
      where ps.user_id = p.id
      order by ps.date desc limit 1
    ), 0) as total_pnl,
    (
      select count(*) from public.user_strategies us
      where us.user_id = p.id and us.is_active = true
    ) as active_strategy_count
  from public.profiles p;
