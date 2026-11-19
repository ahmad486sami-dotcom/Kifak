-- Only rescue a streak that was alive the day before yesterday and missed yesterday
create or replace function public.save_streak() returns boolean
language plpgsql security definer set search_path = public as $$
declare cid uuid := public.my_couple_id(); z text; y date;
begin
  if cid is null then return false; end if;
  select tz into z from profiles where id = auth.uid();
  y := (now() at time zone coalesce(z,'Asia/Dubai'))::date - 1;
  if exists(select 1 from activity where couple_id = cid and day = y) then return false; end if;
  if not exists(select 1 from activity where couple_id = cid and day = y - 1)
     and not exists(select 1 from streak_saves where couple_id = cid and day = y - 1) then return false; end if;
  if exists(select 1 from streak_saves where couple_id = cid and date_trunc('month', day) = date_trunc('month', y)) then return false; end if;
  insert into streak_saves (couple_id, day, used_by) values (cid, y, auth.uid());
  return true;
end $$;
revoke execute on function public.save_streak() from public, anon;
grant execute on function public.save_streak() to authenticated;
