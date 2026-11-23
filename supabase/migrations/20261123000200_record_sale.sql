create unique index sales_one_per_animal_idx
  on public.sales (animal_id)
  where animal_id is not null;

create function public.record_sale(
  p_animal_id bigint,
  p_sale_date date,
  p_price_per_kg numeric
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  sale_batch_id public.livestock.batch_id%type;
  sale_weight public.livestock.current_weight%type;
  animal_status public.livestock.status%type;
begin
  if p_animal_id is null or p_sale_date is null or p_price_per_kg is null
    or p_price_per_kg <= 0 or p_price_per_kg >= 'Infinity'::numeric then
    raise exception 'An animal, a date and a positive finite price are required'
      using errcode = '22023';
  end if;

  -- Serialize sales and weighing changes for this animal.
  select a.batch_id, a.current_weight, a.status
  into sale_batch_id, sale_weight, animal_status
  from public.livestock as a
  where a.id = p_animal_id
  for no key update;

  if not found then
    raise exception 'Animal unavailable for sale' using errcode = '42501';
  end if;

  if animal_status = 'Продан' then
    raise exception 'Animal already sold' using errcode = '23505';
  end if;

  if sale_weight is null or sale_weight <= 0 or sale_weight::numeric >= 'Infinity'::numeric then
    raise exception 'A positive finite current weight is required' using errcode = '23514';
  end if;

  insert into public.sales (animal_id, batch_id, sale_date, weight, price_per_kg, total_amount)
  values (p_animal_id, sale_batch_id, p_sale_date, sale_weight, p_price_per_kg, sale_weight::numeric * p_price_per_kg);

  update public.livestock
  set status = 'Продан'
  where id = p_animal_id;

  if not found then
    raise exception 'Animal status could not be updated' using errcode = '42501';
  end if;
end;
$$;

revoke execute on function public.record_sale(bigint, date, numeric) from public, anon;
grant execute on function public.record_sale(bigint, date, numeric) to authenticated;
