create or replace function public.mutate_weighing(
  p_operation text,
  p_id bigint default null,
  p_animal_id bigint default null,
  p_weighing_date date default null,
  p_weight numeric default null,
  p_comment text default null
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  animal_id_to_update public.livestock.id%type;
  starting_weight public.livestock.start_weight%type;
  previous_weight public.livestock.current_weight%type;
  latest_weight public.livestock.current_weight%type;
begin
  if p_operation is null or p_operation not in ('insert', 'update', 'delete') then
    raise exception 'Invalid weighing operation' using errcode = '22023';
  end if;

  if p_operation <> 'delete' and (
    p_weighing_date is null or p_weight is null or p_weight <= 0 or p_weight >= 'Infinity'::numeric
  ) then
    raise exception 'A date and a positive finite weight are required' using errcode = '22023';
  end if;

  if p_operation = 'insert' then
    if p_animal_id is null then
      raise exception 'An animal is required' using errcode = '22023';
    end if;
    animal_id_to_update := p_animal_id;
  else
    select w.animal_id into animal_id_to_update
    from public.weighings as w
    where w.id = p_id
    for update;

    if not found then
      raise exception 'Weighing unavailable' using errcode = '42501';
    end if;
  end if;

  -- Serialize changes per animal before reading the latest weighing.
  if animal_id_to_update is not null then
    select a.start_weight, a.current_weight into starting_weight, previous_weight
    from public.livestock as a
    where a.id = animal_id_to_update
    for no key update;

    if not found then
      raise exception 'Animal unavailable' using errcode = '42501';
    end if;
  end if;

  case p_operation
    when 'insert' then
      insert into public.weighings (animal_id, weighing_date, weight, comment)
      values (animal_id_to_update, p_weighing_date, p_weight, p_comment);
    when 'update' then
      update public.weighings
      set weighing_date = p_weighing_date, weight = p_weight, comment = p_comment
      where id = p_id;
    when 'delete' then
      delete from public.weighings where id = p_id;
  end case;

  if not found then
    raise exception 'Weighing unavailable' using errcode = '42501';
  end if;

  if animal_id_to_update is null then
    return;
  end if;

  select w.weight into latest_weight
  from public.weighings as w
  where w.animal_id = animal_id_to_update
  order by w.weighing_date desc, w.id desc
  limit 1;

  latest_weight := coalesce(latest_weight, starting_weight);

  if previous_weight is distinct from latest_weight then
    update public.livestock
    set current_weight = latest_weight
    where id = animal_id_to_update;

    if not found then
      raise exception 'Animal unavailable for update' using errcode = '42501';
    end if;
  end if;
end;
$$;

revoke execute on function public.mutate_weighing(text, bigint, bigint, date, numeric, text) from public, anon;
grant execute on function public.mutate_weighing(text, bigint, bigint, date, numeric, text) to authenticated;
