-- =============================================================================
-- Globe Travel Voyage — Profile dashboard fields
-- Run after schema.sql
-- =============================================================================

alter table profiles add column if not exists role text;
alter table profiles add column if not exists company_name text;
alter table profiles add column if not exists business_type text;

alter table visa_experts add column if not exists full_name text;
alter table visa_experts add column if not exists email text;
alter table visa_experts add column if not exists phone text;
alter table visa_experts add column if not exists country text;
alter table visa_experts add column if not exists city text;
alter table visa_experts add column if not exists services text[];
alter table visa_experts add column if not exists bio text;

-- Keep profile role in sync with signup metadata
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_role user_role;
begin
  begin
    v_role := coalesce(
      (new.raw_user_meta_data ->> 'role')::user_role,
      'customer'::user_role
    );
  exception when others then
    v_role := 'customer'::user_role;
  end;

  insert into public.profiles (
    id, email, full_name, phone, country, city, role, company_name, business_type, bio
  )
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'phone',
    new.raw_user_meta_data ->> 'country',
    new.raw_user_meta_data ->> 'city',
    v_role::text,
    new.raw_user_meta_data ->> 'company_name',
    new.raw_user_meta_data ->> 'business_type',
    new.raw_user_meta_data ->> 'bio'
  )
  on conflict (id) do update set
    full_name      = coalesce(excluded.full_name, profiles.full_name),
    phone          = coalesce(excluded.phone, profiles.phone),
    country        = coalesce(excluded.country, profiles.country),
    city           = coalesce(excluded.city, profiles.city),
    role           = coalesce(excluded.role, profiles.role),
    company_name   = coalesce(excluded.company_name, profiles.company_name),
    business_type  = coalesce(excluded.business_type, profiles.business_type),
    updated_at     = now();

  insert into public.user_roles (user_id, role, is_primary)
  values (new.id, v_role, true)
  on conflict (user_id, role) do update set is_primary = true;

  if v_role = 'visa_agent' then
    insert into public.visa_experts (
      user_id, full_name, email, phone, country, city, specializations, bio, verification_status
    )
    values (
      new.id,
      new.raw_user_meta_data ->> 'full_name',
      new.email,
      new.raw_user_meta_data ->> 'phone',
      new.raw_user_meta_data ->> 'country',
      new.raw_user_meta_data ->> 'city',
      case
        when new.raw_user_meta_data ->> 'specializations' is not null
        then string_to_array(new.raw_user_meta_data ->> 'specializations', ',')
        else null
      end,
      new.raw_user_meta_data ->> 'bio',
      'pending'
    )
    on conflict do nothing;
  end if;

  return new;
end;
$$;
