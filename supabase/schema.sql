-- Supabase schema for the fixed two-person kaoyan partner PWA.
-- Run in Supabase SQL Editor after enabling Auth.

create table if not exists public.profiles (
  id text primary key,
  email text not null unique,
  name text not null,
  avatar text not null,
  "targetSchool" text not null,
  "targetMajor" text not null,
  "partnerId" text,
  "dailyGoalMinutes" integer not null default 480,
  "examDate" date not null,
  "createdAt" timestamptz not null default now()
);

create table if not exists public.tasks (
  id text primary key,
  "userId" text not null references public.profiles(id) on delete cascade,
  title text not null,
  subject text not null check (subject in ('数学', '英语', '政治', '专业课', '复盘', '其他')),
  date date not null,
  "startTime" text not null,
  "endTime" text not null,
  "estimatedMinutes" integer not null,
  "actualMinutes" integer not null default 0,
  priority text not null check (priority in ('高', '中', '低')),
  status text not null check (status in ('未开始', '进行中', '已完成', '已拖延')),
  note text not null default '',
  "proofRequired" boolean not null default false,
  "proofImageUrl" text,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  "completedAt" timestamptz
);

create table if not exists public.check_ins (
  id text primary key,
  "userId" text not null references public.profiles(id) on delete cascade,
  date date not null,
  "totalStudyMinutes" integer not null,
  "completedTaskCount" integer not null,
  "totalTaskCount" integer not null,
  mood text not null check (mood in ('状态很好', '正常完成', '有点拖延', '状态较差')),
  summary text not null,
  "tomorrowPlan" text not null,
  "proofImages" text[] not null default '{}',
  "createdAt" timestamptz not null default now()
);

create table if not exists public.messages (
  id text primary key,
  "fromUserId" text not null references public.profiles(id) on delete cascade,
  "toUserId" text not null references public.profiles(id) on delete cascade,
  type text not null,
  content text not null,
  "relatedTaskId" text,
  read boolean not null default false,
  "createdAt" timestamptz not null default now()
);

create table if not exists public.reviews (
  id text primary key,
  "fromUserId" text not null references public.profiles(id) on delete cascade,
  "toUserId" text not null references public.profiles(id) on delete cascade,
  date date not null,
  score integer not null check (score between 1 and 5),
  tags text[] not null default '{}',
  comment text not null,
  "createdAt" timestamptz not null default now()
);

create table if not exists public.pomodoro_sessions (
  id text primary key,
  "userId" text not null references public.profiles(id) on delete cascade,
  "taskId" text,
  subject text not null check (subject in ('数学', '英语', '政治', '专业课', '复盘', '其他')),
  "startTime" timestamptz not null,
  "endTime" timestamptz not null,
  "durationMinutes" integer not null,
  completed boolean not null default true,
  "createdAt" timestamptz not null default now()
);

create index if not exists tasks_user_date_idx on public.tasks ("userId", date);
create index if not exists check_ins_user_date_idx on public.check_ins ("userId", date);
create index if not exists messages_to_user_idx on public.messages ("toUserId", read, "createdAt");
create index if not exists reviews_to_user_date_idx on public.reviews ("toUserId", date);
create index if not exists pomodoro_user_created_idx on public.pomodoro_sessions ("userId", "createdAt");

alter table public.profiles enable row level security;
alter table public.tasks enable row level security;
alter table public.check_ins enable row level security;
alter table public.messages enable row level security;
alter table public.reviews enable row level security;
alter table public.pomodoro_sessions enable row level security;

-- MVP-friendly policies for fixed partners. Tighten these after wiring auth.uid()
-- to profile ids in production.
create policy "profiles readable" on public.profiles for select using (true);
create policy "profiles writable" on public.profiles for all using (true) with check (true);
create policy "tasks readable" on public.tasks for select using (true);
create policy "tasks writable" on public.tasks for all using (true) with check (true);
create policy "check_ins readable" on public.check_ins for select using (true);
create policy "check_ins writable" on public.check_ins for all using (true) with check (true);
create policy "messages readable" on public.messages for select using (true);
create policy "messages writable" on public.messages for all using (true) with check (true);
create policy "reviews readable" on public.reviews for select using (true);
create policy "reviews writable" on public.reviews for all using (true) with check (true);
create policy "pomodoro readable" on public.pomodoro_sessions for select using (true);
create policy "pomodoro writable" on public.pomodoro_sessions for all using (true) with check (true);

insert into public.profiles (
  id, email, name, avatar, "targetSchool", "targetMajor", "partnerId", "dailyGoalMinutes", "examDate"
) values
  ('user-a', 'userA@example.com', '林见山', '林', '北京理工大学', '能源动力', 'user-b', 480, '2026-12-26'),
  ('user-b', 'userB@example.com', '周知夏', '周', '上海交通大学', '能源动力', 'user-a', 450, '2026-12-26')
on conflict (id) do update set
  "partnerId" = excluded."partnerId",
  "dailyGoalMinutes" = excluded."dailyGoalMinutes";
