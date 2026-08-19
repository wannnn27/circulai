-- Auto-confirm newly registered users so they can immediately sign in
-- without requiring an external SMTP confirmation email in development / demo.
create or replace function public.handle_auto_confirm_user()
returns trigger as $$
begin
  if new.email_confirmed_at is null then
    new.email_confirmed_at := now();
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_auto_confirm on auth.users;
create trigger on_auth_user_auto_confirm
  before insert on auth.users
  for each row
  execute function public.handle_auto_confirm_user();

-- Also confirm any existing unconfirmed users
update auth.users
set email_confirmed_at = now()
where email_confirmed_at is null;
