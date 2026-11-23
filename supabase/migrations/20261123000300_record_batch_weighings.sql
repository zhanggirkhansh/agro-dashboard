create function public.record_batch_weighings(
  p_batch_id bigint,
  p_weighing_date date,
  p_weights jsonb
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  measurement record;
begin
  if p_batch_id is null or p_weighing_date is null
    or jsonb_typeof(p_weights) is distinct from 'array' then
    raise exception 'A batch, a date and a list of weights are required' using errcode = '22023';
  end if;

  if jsonb_array_length(p_weights) = 0 or exists (
    select 1
    from jsonb_to_recordset(p_weights) as entry(animal_id bigint, weight numeric)
    group by entry.animal_id
    having entry.animal_id is null or count(*) > 1
  ) then
    raise exception 'At least one weight and unique animal IDs are required' using errcode = '22023';
  end if;

  -- Take animal locks in a stable order when two batch submissions overlap.
  for measurement in
    select entry.animal_id, entry.weight
    from jsonb_to_recordset(p_weights) as entry(animal_id bigint, weight numeric)
    order by entry.animal_id
  loop
    perform 1
    from public.livestock as animal
    where animal.id = measurement.animal_id and animal.batch_id = p_batch_id
    for no key update;

    if not found then
      raise exception 'Animal is no longer available in this batch' using errcode = '42501';
    end if;

    perform public.mutate_weighing(
      'insert',
      p_animal_id => measurement.animal_id,
      p_weighing_date => p_weighing_date,
      p_weight => measurement.weight
    );
  end loop;
end;
$$;

revoke execute on function public.record_batch_weighings(bigint, date, jsonb) from public, anon;
grant execute on function public.record_batch_weighings(bigint, date, jsonb) to authenticated;
