-- Signed-out visitors can't call any Kifak function
revoke execute on function public.couple_streak(), public.create_invite(), public.handle_new_user(), public.has_access(),
  public.i_answered(uuid, date), public.is_member(uuid), public.join_couple(text), public.leave_couple(),
  public.log_activity_generic(), public.my_couple_id(), public.partner_answered(date), public.partner_id(),
  public.save_streak(), public.set_together_since(date) from public, anon;

-- Internal trigger helpers aren't callable from the app at all
revoke execute on function public.handle_new_user(), public.log_activity_generic() from authenticated;

grant execute on function public.couple_streak(), public.create_invite(), public.has_access(),
  public.i_answered(uuid, date), public.is_member(uuid), public.join_couple(text), public.leave_couple(),
  public.my_couple_id(), public.partner_answered(date), public.partner_id(),
  public.save_streak(), public.set_together_since(date) to authenticated;

alter default privileges in schema public revoke execute on functions from public, anon;
