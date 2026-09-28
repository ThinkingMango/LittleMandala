-- Billing moves from Paddle to Stripe. The three billing tables held no rows when this ran (nothing
-- could be bought yet), so they are rebuilt with Stripe ids rather than renamed. Entitlements are
-- untouched: for a purchase, entitlements.source_id is now the Stripe Checkout Session id.
-- Everything here is still written only by the verified billing server with the service role.

drop table public.transactions;
drop table public.subscriptions;
drop table public.billing_customers;

create table public.billing_customers (
  parent_id uuid primary key references auth.users (id) on delete cascade,
  stripe_customer_id text not null unique check (stripe_customer_id ~ '^cus_[A-Za-z0-9]+$'),
  created_at timestamptz not null default now()
);

-- Unused today: every purchase is one-time. Kept so a subscription could come back later.
create table public.subscriptions (
  stripe_subscription_id text primary key check (stripe_subscription_id ~ '^sub_[A-Za-z0-9]+$'),
  stripe_customer_id text not null references public.billing_customers (stripe_customer_id) on delete cascade,
  status text not null check (status in ('incomplete', 'incomplete_expired', 'trialing', 'active', 'past_due', 'unpaid', 'paused', 'canceled')),
  price_id text not null check (price_id ~ '^price_[A-Za-z0-9]+$'),
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  last_event_at timestamptz not null,
  updated_at timestamptz not null default now()
);

create index subscriptions_customer_idx on public.subscriptions (stripe_customer_id);

-- One row per paid Checkout Session. Deleting a parent unlinks the row instead of deleting it:
-- what stays is the session and payment ids, the packs, amount, currency, date and status.
create table public.transactions (
  stripe_checkout_session_id text primary key check (stripe_checkout_session_id ~ '^cs_(test|live)_[A-Za-z0-9]+$'),
  stripe_payment_intent_id text unique check (stripe_payment_intent_id ~ '^pi_[A-Za-z0-9]+$'),
  stripe_customer_id text references public.billing_customers (stripe_customer_id) on delete set null,
  pack_ids text[] not null check (cardinality(pack_ids) between 1 and 40),
  amount_minor bigint not null check (amount_minor >= 0),
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  status text not null check (status in ('paid', 'refunded')),
  occurred_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index transactions_customer_idx on public.transactions (stripe_customer_id);

comment on column public.transactions.stripe_customer_id is
  'Null once the parent account is deleted. The payment record itself is kept for accounting.';

alter table public.billing_customers enable row level security;
alter table public.subscriptions enable row level security;
alter table public.transactions enable row level security;

revoke all on public.billing_customers, public.subscriptions, public.transactions from anon, authenticated;
grant select on public.billing_customers, public.subscriptions, public.transactions to authenticated;

create policy billing_customers_select_own on public.billing_customers
  for select to authenticated using ((select auth.uid()) = parent_id);

create policy subscriptions_select_own on public.subscriptions
  for select to authenticated using (
    exists (select 1 from public.billing_customers b
            where b.stripe_customer_id = subscriptions.stripe_customer_id
              and b.parent_id = (select auth.uid()))
  );

create policy transactions_select_own on public.transactions
  for select to authenticated using (
    exists (select 1 from public.billing_customers b
            where b.stripe_customer_id = transactions.stripe_customer_id
              and b.parent_id = (select auth.uid()))
  );
