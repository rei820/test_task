-- ① members テーブル
create table if not exists members (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  color      text not null,
  is_admin   boolean not null default false,
  pin        text,
  created_at timestamptz not null default now()
);

-- ② tasks テーブル
create table if not exists tasks (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  status      text not null default 'todo'
                check (status in ('todo','in_progress','done')),
  priority    text not null default 'medium'
                check (priority in ('high','medium','low')),
  tags        text[] not null default '{}',
  due_date    date,
  archived    boolean not null default false,
  assignee_id uuid references members(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ③ updated_at を自動更新するトリガー
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger tasks_updated_at
  before update on tasks
  for each row execute procedure update_updated_at();

-- ④ RLS を有効化（anon キーで全操作を許可）
alter table members enable row level security;
alter table tasks   enable row level security;

create policy "allow_all_members" on members
  for all using (true) with check (true);

create policy "allow_all_tasks" on tasks
  for all using (true) with check (true);

-- ⑤ リアルタイム購読を有効化
alter publication supabase_realtime add table members;
alter publication supabase_realtime add table tasks;
