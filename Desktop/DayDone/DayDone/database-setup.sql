-- DayDone Database Setup Script
-- Run this in your Supabase SQL Editor

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    email text UNIQUE NOT NULL,
    avatar_url text,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create work_logs table
CREATE TABLE IF NOT EXISTS public.work_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    date date NOT NULL,
    hours_worked decimal(5,2) DEFAULT 0 NOT NULL,
    notes text,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    UNIQUE(user_id, date)
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    work_log_id uuid REFERENCES public.work_logs(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    task_name text NOT NULL,
    description text,
    status text CHECK (status IN ('Started', 'In Progress', 'Finished', 'Pending', 'On Hold')) DEFAULT 'Started',
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_work_logs_user_id_date ON public.work_logs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_tasks_work_log_id ON public.tasks(work_log_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
-- Allow anonymous users to read all users (for user selection)
CREATE POLICY "Allow anonymous read access to users" ON public.users
    FOR SELECT TO anon USING (true);

-- Allow anonymous users to create new users
CREATE POLICY "Allow anonymous insert access to users" ON public.users
    FOR INSERT TO anon WITH CHECK (true);

-- Allow anonymous users to update users
CREATE POLICY "Allow anonymous update access to users" ON public.users
    FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- RLS Policies for work_logs table
-- Allow anonymous users full access to work logs
CREATE POLICY "Allow anonymous read access to work_logs" ON public.work_logs
    FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anonymous insert access to work_logs" ON public.work_logs
    FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anonymous update access to work_logs" ON public.work_logs
    FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow anonymous delete access to work_logs" ON public.work_logs
    FOR DELETE TO anon USING (true);

-- RLS Policies for tasks table
-- Allow anonymous users full access to tasks
CREATE POLICY "Allow anonymous read access to tasks" ON public.tasks
    FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anonymous insert access to tasks" ON public.tasks
    FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anonymous update access to tasks" ON public.tasks
    FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow anonymous delete access to tasks" ON public.tasks
    FOR DELETE TO anon USING (true);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER handle_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_work_logs_updated_at BEFORE UPDATE ON public.work_logs
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_tasks_updated_at BEFORE UPDATE ON public.tasks
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Insert some sample data for testing
INSERT INTO public.users (name, email) VALUES 
    ('John Doe', 'john.doe@example.com'),
    ('Jane Smith', 'jane.smith@example.com'),
    ('Alice Johnson', 'alice.johnson@example.com')
ON CONFLICT (email) DO NOTHING;

-- Add some sample work logs
INSERT INTO public.work_logs (user_id, date, hours_worked, notes)
SELECT 
    u.id, 
    CURRENT_DATE - INTERVAL '1 day', 
    8.0, 
    'Sample work log for ' || u.name
FROM public.users u
ON CONFLICT (user_id, date) DO NOTHING;

-- Add some sample tasks
INSERT INTO public.tasks (work_log_id, user_id, task_name, description, status)
SELECT 
    wl.id,
    wl.user_id,
    'Sample Task for ' || u.name,
    'This is a sample task to test the system',
    'In Progress'
FROM public.work_logs wl
JOIN public.users u ON wl.user_id = u.id
LIMIT 3;