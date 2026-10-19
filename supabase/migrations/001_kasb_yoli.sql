begin;
create table if not exists public.ky_courses (id text primary key);
insert into public.ky_courses (id) values ('frontend'),('ux'),('smm'),('python'),('data'),('video'),('mobile'),('security') on conflict do nothing;
create table if not exists public.ky_favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id text not null references public.ky_courses(id),
  primary key (user_id,course_id)
);
create table if not exists public.ky_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id text not null references public.ky_courses(id),
  goal text not null check (char_length(btrim(goal)) between 15 and 600),
  status text not null default 'received' check (status in ('received','reviewing','accepted','declined')),
  telegram_status text not null default 'pending' check (telegram_status in ('pending','sending','sent','failed','unknown','unconfigured')),
  created_at timestamptz not null default now(),
  notification_claimed_at timestamptz,
  unique(user_id,course_id)
);
alter table public.ky_courses enable row level security;
alter table public.ky_favorites enable row level security;
alter table public.ky_applications enable row level security;
drop policy if exists "ky_catalog_read" on public.ky_courses;
create policy "ky_catalog_read" on public.ky_courses for select using (true);
drop policy if exists "ky_own_favorites" on public.ky_favorites;
create policy "ky_own_favorites" on public.ky_favorites for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
drop policy if exists "ky_own_applications" on public.ky_applications;
create policy "ky_own_applications" on public.ky_applications for select to authenticated using ((select auth.uid())=user_id);
revoke all on public.ky_courses, public.ky_favorites, public.ky_applications from anon, authenticated;
grant select on public.ky_courses to anon, authenticated;
grant select,insert,delete on public.ky_favorites to authenticated;
grant select on public.ky_applications to authenticated;
grant all on public.ky_courses,public.ky_favorites,public.ky_applications to service_role;

create or replace function public.ky_submit_application(p_course_id text,p_goal text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare v_user uuid:=auth.uid(); v_app public.ky_applications; v_created boolean:=false;
begin
  if v_user is null then raise exception 'Authentication required' using errcode='42501'; end if;
  if char_length(btrim(p_goal)) not between 15 and 600 then raise exception 'Invalid goal' using errcode='22023'; end if;
  insert into public.ky_applications (user_id,course_id,goal) values (v_user,p_course_id,btrim(p_goal)) on conflict(user_id,course_id) do nothing returning * into v_app;
  v_created:=found;
  if not v_created then select * into v_app from public.ky_applications where user_id=v_user and course_id=p_course_id; end if;
  return jsonb_build_object('application',to_jsonb(v_app)-'user_id'-'notification_claimed_at','created',v_created);
end; $$;
revoke all on function public.ky_submit_application(text,text) from public,anon;
grant execute on function public.ky_submit_application(text,text) to authenticated;

create or replace function public.ky_claim_notification(p_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare v_app public.ky_applications;
begin
  update public.ky_applications set telegram_status='sending',notification_claimed_at=now()
  where id=p_id and telegram_status in ('pending','failed') returning * into v_app;
  if not found then return null; end if;
  return jsonb_build_object('id',v_app.id,'course_id',v_app.course_id);
end; $$;
revoke all on function public.ky_claim_notification(uuid) from public,anon,authenticated;
grant execute on function public.ky_claim_notification(uuid) to service_role;
commit;
