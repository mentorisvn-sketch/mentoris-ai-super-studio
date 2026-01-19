-- 1. PROFILES TABLE
-- Extends the default auth.users table with application specific data
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  role text default 'customer' check (role in ('admin', 'customer')),
  credits int default 500, -- Default free credits
  tier text default 'free' check (tier in ('free', 'basic', 'pro', 'enterprise')),
  is_active boolean default true,
  created_at timestamptz default now(),
  
  primary key (id)
);

-- 2. GENERATIONS TABLE
-- Stores the history of AI generated images
create table public.generations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  image_url text not null, -- Path in Supabase Storage or external URL
  prompt text,
  model_name text,
  type text check (type in ('sketch', 'lookbook', 'try-on', 'design', 'concept-product')),
  resolution text,
  cost int, -- Credits cost at the time of generation
  created_at timestamptz default now()
);

-- 3. CREDIT TRANSACTIONS TABLE
-- Ledger for all credit movements (top-ups, usage, refunds)
create table public.credit_transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  amount int not null, -- Negative for usage, Positive for top-up
  action_type text not null, -- e.g., 'GENERATE_IMAGE', 'ADMIN_TOPUP', 'SUBSCRIPTION_RENEWAL'
  description text,
  created_at timestamptz default now()
);

-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- Enable RLS
alter table public.profiles enable row level security;
alter table public.generations enable row level security;
alter table public.credit_transactions enable row level security;

-- PROFILES Policies
create policy "Public profiles are viewable by everyone"
  on profiles for select
  using ( true );

create policy "Users can update own profile"
  on profiles for update
  using ( auth.uid() = id );

-- GENERATIONS Policies
create policy "Users can view own generations"
  on generations for select
  using ( auth.uid() = user_id );

create policy "Users can insert own generations"
  on generations for insert
  with check ( auth.uid() = user_id );

-- 5. AUTOMATION TRIGGERS

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

-- Trigger to execute the function
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to deduct credits safely
-- Can be called via RPC from the client/server
create or replace function deduct_credits(
  p_user_id uuid,
  p_amount int,
  p_description text
)
returns void
language plpgsql
security definer
as $$
declare
  current_credits int;
begin
  -- Check balance
  select credits into current_credits from profiles where id = p_user_id;
  
  if current_credits < p_amount then
    raise exception 'Insufficient credits';
  end if;

  -- Update Profile
  update profiles 
  set credits = credits - p_amount 
  where id = p_user_id;

  -- Log Transaction
  insert into credit_transactions (user_id, amount, action_type, description)
  values (p_user_id, -p_amount, 'USAGE', p_description);
end;
$$;
