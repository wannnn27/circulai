drop policy if exists "Users manage own orders" on public.orders;
drop policy if exists "Users read own orders" on public.orders;
drop policy if exists "Users delete own orders" on public.orders;

drop policy if exists "Users manage own return requests" on public.return_requests;
drop policy if exists "Users read own return requests" on public.return_requests;

drop policy if exists "Users manage own messages" on public.messages;
drop policy if exists "Users read own messages" on public.messages;
drop policy if exists "Users send own messages" on public.messages;
drop policy if exists "Users delete own messages" on public.messages;

create policy "Users read own orders"
  on public.orders for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users delete own orders"
  on public.orders for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users read own return requests"
  on public.return_requests for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users read own messages"
  on public.messages for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users send own messages"
  on public.messages for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and sender = 'user'
  );

create policy "Users delete own messages"
  on public.messages for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create or replace function public.place_order(
  p_order_id text,
  p_status text,
  p_payload jsonb
)
returns public.orders
language plpgsql
security definer
set search_path = ''
as $$
declare
  requester uuid := auth.uid();
  created_order public.orders;
  secured_payload jsonb;
begin
  if requester is null then
    raise exception 'Authentication required';
  end if;

  if p_status <> 'WAITING_PAYMENT' or p_payload->>'status' <> 'WAITING_PAYMENT' then
    raise exception 'New orders must start in WAITING_PAYMENT';
  end if;

  if not exists (
    select 1 from public.cart_items where user_id = requester
  ) then
    raise exception 'Cart is empty';
  end if;

  secured_payload := jsonb_set(p_payload, '{status}', to_jsonb('WAITING_PAYMENT'::text), true);

  insert into public.orders (id, user_id, status, payload)
  values (p_order_id, requester, 'WAITING_PAYMENT', secured_payload)
  returning * into created_order;

  delete from public.cart_items where user_id = requester;
  return created_order;
end;
$$;

create or replace function public.complete_order(p_order_id text)
returns public.orders
language plpgsql
security definer
set search_path = ''
as $$
declare
  requester uuid := auth.uid();
  target public.orders;
  next_payload jsonb;
  next_passports jsonb;
begin
  if requester is null then
    raise exception 'Authentication required';
  end if;

  select *
  into target
  from public.orders
  where id = p_order_id and user_id = requester
  for update;

  if target.id is null then
    raise exception 'Order not found';
  end if;

  if target.status <> 'DELIVERED' then
    raise exception 'Only delivered orders can be completed';
  end if;

  next_payload := jsonb_set(target.payload, '{status}', to_jsonb('COMPLETED'::text), true);
  next_payload := jsonb_set(
    next_payload,
    '{statusHistory}',
    coalesce(target.payload->'statusHistory', '[]'::jsonb) || jsonb_build_array(
      jsonb_build_object(
        'status', 'COMPLETED',
        'label', to_char(current_date, 'YYYY-MM-DD'),
        'note', 'Pesanan selesai dan passport telah aktif',
        'actor', 'customer'
      )
    ),
    true
  );

  if jsonb_typeof(target.payload->'passports') = 'array' then
    select coalesce(
      jsonb_agg(
        passport || jsonb_build_object(
          'status', 'ACTIVE',
          'verification', 'Passport aktif & terverifikasi',
          'activatedAt', to_char(current_date, 'YYYY-MM-DD')
        )
      ),
      '[]'::jsonb
    )
    into next_passports
    from jsonb_array_elements(target.payload->'passports') as passports(passport);

    next_payload := jsonb_set(next_payload, '{passports}', next_passports, true);
    if jsonb_array_length(next_passports) > 0 then
      next_payload := jsonb_set(next_payload, '{passport}', next_passports->0, true);
    end if;
  end if;

  update public.orders
  set
    status = 'COMPLETED',
    payload = next_payload,
    updated_at = now()
  where id = target.id
  returning * into target;

  return target;
end;
$$;

create or replace function public.submit_return_request(
  p_order_id text,
  p_request jsonb
)
returns public.return_requests
language plpgsql
security definer
set search_path = ''
as $$
declare
  requester uuid := auth.uid();
  target_order public.orders;
  created_request public.return_requests;
  secured_request jsonb;
  request_id text := nullif(btrim(p_request->>'id'), '');
  request_reason_id text := nullif(btrim(p_request->>'reasonId'), '');
  request_reason_label text := nullif(btrim(p_request->>'reasonLabel'), '');
  request_notes text := btrim(coalesce(p_request->>'notes', ''));
begin
  if requester is null then
    raise exception 'Authentication required';
  end if;

  select *
  into target_order
  from public.orders
  where id = p_order_id and user_id = requester
  for update;

  if target_order.id is null then
    raise exception 'Order not found';
  end if;

  if target_order.status not in ('DELIVERED', 'COMPLETED') or target_order.return_request is not null then
    raise exception 'Return request is not available for this order';
  end if;

  if request_id is null or request_reason_id is null or request_reason_label is null then
    raise exception 'Return request details are incomplete';
  end if;

  if length(request_notes) < 12 then
    raise exception 'Return notes must contain at least 12 characters';
  end if;

  if coalesce(jsonb_typeof(p_request->'evidencePhotos'), '') <> 'array'
    or jsonb_array_length(p_request->'evidencePhotos') = 0 then
    raise exception 'At least one evidence photo is required';
  end if;

  secured_request := p_request || jsonb_build_object('status', 'REVIEWING');

  insert into public.return_requests (
    id,
    user_id,
    order_id,
    status,
    reason_id,
    reason_label,
    notes,
    evidence_photos,
    payload
  )
  values (
    request_id,
    requester,
    target_order.id,
    'REVIEWING',
    request_reason_id,
    request_reason_label,
    request_notes,
    array(select jsonb_array_elements_text(secured_request->'evidencePhotos')),
    secured_request
  )
  returning * into created_request;

  update public.orders
  set
    return_request = secured_request,
    payload = jsonb_set(payload, '{returnRequest}', secured_request, true),
    updated_at = now()
  where id = target_order.id;

  return created_request;
end;
$$;

revoke all on function public.place_order(text, text, jsonb) from public, anon;
revoke all on function public.complete_order(text) from public, anon;
revoke all on function public.submit_return_request(text, jsonb) from public, anon;

grant execute on function public.place_order(text, text, jsonb) to authenticated;
grant execute on function public.complete_order(text) to authenticated;
grant execute on function public.submit_return_request(text, jsonb) to authenticated;
