-- Cricket Auction Platform — Supabase Schema
-- Run this in Supabase SQL Editor

-- Users table
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  password text not null,
  role text not null check (role in ('admin', 'operator', 'viewer')),
  created_at timestamp with time zone default now()
);

-- Tournaments table
create table if not exists tournaments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  purse integer default 2200,
  active boolean default true,
  created_at timestamp with time zone default now()
);

-- Groups table
create table if not exists groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  active boolean default true,
  created_at timestamp with time zone default now()
);

-- Captains table
create table if not exists captains (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  team_name text not null,
  purse integer default 2200,
  spent integer default 0,
  group_id uuid references groups(id) on delete set null,
  created_at timestamp with time zone default now()
);

-- Players table
create table if not exists players (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null,
  group_id uuid references groups(id) on delete set null,
  base_price integer not null default 100,
  status text default 'unsold' check (status in ('unsold', 'sold', 'in_auction')),
  sold_to uuid references captains(id) on delete set null,
  sold_price integer,
  created_at timestamp with time zone default now()
);

-- Auction logs table
create table if not exists auction_logs (
  id uuid primary key default gen_random_uuid(),
  player_id uuid references players(id),
  player_name text not null,
  captain_id uuid references captains(id),
  captain_name text,
  team_name text,
  price integer,
  action text not null check (action in ('sold', 'unsold')),
  group_name text,
  created_at timestamp with time zone default now()
);

-- Teams view (auto-generated from captain purchases)
create or replace view teams_view as
select
  c.id as captain_id,
  c.name as captain_name,
  c.team_name,
  c.purse,
  c.spent,
  c.purse - c.spent as remaining,
  count(p.id) as player_count,
  json_agg(
    json_build_object(
      'id', p.id,
      'name', p.name,
      'role', p.role,
      'sold_price', p.sold_price
    )
  ) filter (where p.id is not null) as players
from captains c
left join players p on p.sold_to = c.id and p.status = 'sold'
group by c.id, c.name, c.team_name, c.purse, c.spent;

-- Seed admin user (password: admin123 — bcrypt hash)
-- You MUST change this password after first login
insert into users (name, email, password, role) values
  ('Admin', 'admin@cpl.com', '$2b$10$8K1p/a0dL1LXMw0B0H5OzuTq.J8O5KQv5X3v5T9c7U.j5G5f5v5v5', 'admin')
on conflict (email) do nothing;

-- Note: The seeded password hash above is a placeholder.
-- Run the backend seed script to generate a proper bcrypt hash:
-- npm run seed
