-- Exécuter ce script dans Supabase : SQL Editor → New query → Run
-- Puis : Database → Replication → activer Realtime pour la table restaurant_menu

create table if not exists public.restaurant_menu (
  id smallint primary key default 1,
  items jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  constraint restaurant_menu_single_row check (id = 1)
);

insert into public.restaurant_menu (id, items)
values (1, '[]'::jsonb)
on conflict (id) do nothing;

alter table public.restaurant_menu enable row level security;

create policy "restaurant_menu_select_anon"
  on public.restaurant_menu for select
  to anon, authenticated
  using (true);

create policy "restaurant_menu_insert_anon"
  on public.restaurant_menu for insert
  to anon, authenticated
  with check (true);

create policy "restaurant_menu_update_anon"
  on public.restaurant_menu for update
  to anon, authenticated
  using (true)
  with check (true);

-- Realtime : dans le dashboard Supabase → Database → Publications → supabase_realtime
-- → cocher la table restaurant_menu (ou exécuter la ligne ci-dessous si elle n’est pas déjà ajoutée)
-- alter publication supabase_realtime add table public.restaurant_menu;
