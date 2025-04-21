
-- Create users_history table to store analysis history
create table public.users_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  image_url text,
  image_type text not null,
  result jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.users_history enable row level security;

-- Create RLS policies
create policy "Users can view their own history"
  on public.users_history
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their own history"
  on public.users_history
  for insert
  with check (auth.uid() = user_id);
