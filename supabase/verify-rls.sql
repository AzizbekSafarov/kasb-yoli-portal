-- Synthetic users and rows live only inside a rolled-back transaction.
begin;
select set_config('ky.test_user_a',gen_random_uuid()::text,true);
select set_config('ky.test_user_b',gen_random_uuid()::text,true);
insert into auth.users(id,email,aud,role) values
  (current_setting('ky.test_user_a')::uuid,'ky-a@example.test','authenticated','authenticated'),
  (current_setting('ky.test_user_b')::uuid,'ky-b@example.test','authenticated','authenticated');
set local role authenticated;
select set_config('request.jwt.claim.sub',current_setting('ky.test_user_a'),true);
select public.ky_submit_application('frontend','Sun’iy sinov: portfolio sayt yaratishni o‘rganish.');
select public.ky_submit_application('frontend','Sun’iy takror ariza sinovi uchun maqsad.');
insert into public.ky_favorites(user_id,course_id) values (auth.uid(),'frontend');
do $$ begin
  if (select count(*) from public.ky_applications)<>1 then raise exception 'Duplicate application';end if;
  if (select count(*) from public.ky_favorites)<>1 then raise exception 'Favorite not persisted';end if;
end $$;
select set_config('request.jwt.claim.sub',current_setting('ky.test_user_b'),true);
do $$ begin
  if exists(select from public.ky_applications) then raise exception 'Other user can read application';end if;
  if exists(select from public.ky_favorites) then raise exception 'Other user can read favorites';end if;
  begin
    insert into public.ky_favorites(user_id,course_id) values(current_setting('ky.test_user_a')::uuid,'ux');
    raise exception 'Forged ownership accepted';
  exception when insufficient_privilege then null;end;
  begin
    update public.ky_applications set telegram_status='sent';
    raise exception 'Forged delivery status accepted';
  exception when insufficient_privilege then null;end;
end $$;
reset role;
rollback;
select 'PASS: unique application, own read/write, foreign read blocked, forged ownership and delivery blocked. All synthetic rows rolled back.' as verification;
